# Foundation Fixes — PWA, Git Hygiene, XSS, KTC Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the four foundational issues that affect every user of the app before building new features on top of them — broken PWA, uncommitted gitignore, XSS vulnerability in innerHTML rendering, and hollow KTC data layer.

**Architecture:** All changes are in `index.html` (JS + HTML), `.gitignore`, `sw.js`, and `manifest.json`. No new files created. Each task is fully independent — no shared state between tasks. The KTC data pipeline already exists and works (`fetchDynastyValues()` pulls from FantasyCalc API) — the contract CSV parser just needs to wire it through correctly, and the sheet URL is already live (not a placeholder).

**Tech Stack:** Vanilla HTML/CSS/JS, Sleeper API, FantasyCalc API, Google Sheets CSV, GitHub Pages

---

## Task 1: Fix PWA for GitHub Pages subdirectory **Model: Sonnet**

The app is deployed at `amwoods44.github.io/harambes-dozen/` but the PWA install banner references `/apple-touch-icon.png` (absolute root path — resolves to `amwoods44.github.io/apple-touch-icon.png`, which 404s). The service worker registration and manifest use relative paths that happen to work, but the manifest icon files (`icon-192.png`, `icon-512.png`) don't exist on disk, and the install banner icon doesn't exist either.

**Files:**
- Modify: `index.html:4577`, `index.html:4590`, `index.html:4598` (install banner icon paths)
- Modify: `sw.js:2` (cache asset list)
- Modify: `manifest.json:11-12` (icon paths)

- [ ] **Step 1: Fix the install banner icon paths**

The three `showBanner()` branches all reference `/apple-touch-icon.png` which 404s on GitHub Pages. Change to the logo file that actually exists on disk (`harambe-logo.png`), using a relative path.

In `index.html`, find all three occurrences of:
```
src="/apple-touch-icon.png"
```
Replace each with:
```
src="harambe-logo.png"
```

Lines: 4577, 4590, 4598

- [ ] **Step 2: Fix manifest icons to use existing logo**

The manifest references `icon-192.png` and `icon-512.png` — neither file exists. Point both to the actual logo file.

In `manifest.json`, replace:
```json
"icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```
With:
```json
"icons": [
    { "src": "harambe-logo.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "harambe-logo.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
]
```

Note: Using one image for both sizes works — the browser scales it. A proper icon set can be generated later.

- [ ] **Step 3: Add index.html to service worker cache list**

In `sw.js` line 2, the ASSETS array caches `'./'` and `'manifest.json'` but not the main file explicitly. Add `harambe-logo.png` so the PWA icon works offline:

Replace:
```js
const ASSETS = ['./', 'manifest.json'];
```
With:
```js
const ASSETS = ['./', 'manifest.json', 'harambe-logo.png'];
```

- [ ] **Step 4: Verify — check all paths resolve**

Run this from the repo root to confirm every referenced asset exists:
```bash
# Check manifest icons
grep -o '"src": "[^"]*"' manifest.json | sed 's/"src": "//;s/"//' | while read f; do [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"; done

# Check install banner icon
grep -o 'src="[^"]*"' index.html | grep -i 'install-banner-icon' | head -3

# Check SW cached assets
echo "SW caches: $(grep 'ASSETS' sw.js)"
```

Expected: All files reference `harambe-logo.png` which exists on disk.

- [ ] **Step 5: Commit**

```bash
git add index.html sw.js manifest.json
git commit -m "fix(pwa): use existing harambe-logo.png for all PWA icon references"
```

---

## Task 2: Commit .gitignore and clean repo root **Model: Sonnet**

`.gitignore` exists but is untracked — protecting nothing. Meanwhile 13 documentation screenshots sit in the repo root alongside app files, and an Excel source file could get committed.

**Files:**
- Stage: `.gitignore` (already written, just needs committing)

- [ ] **Step 1: Verify .gitignore contents are correct**

Read `.gitignore` and confirm it covers:
```
node_modules/
*.backup
*.xlsx
.playwright-mcp/
.superpowers/
.DS_Store
Thumbs.db
```

This already handles the big risks (Excel, backups, tool dirs). No changes needed to the file itself.

- [ ] **Step 2: Add docs screenshots to .gitignore**

The 13 PNGs in `docs/screenshots/` are documentation assets and SHOULD be tracked if they're useful. But the loose PNGs at root level (Avatars.png, ChampionExample.png, PlayerProfile.png, etc.) are documentation screenshots that shouldn't clutter the root.

Append to `.gitignore`:
```

# Documentation screenshots (live in docs/screenshots/)
/Avatars.png
/ChampionExample.png
/cloth-v2-check.png
/expanded-card.png
/my-banners-current.png
/page-loaded.png
/player-profile.png
/PlayerProfile.png
/power-rankings.png
/rosters-contracts.png
/trade-cards.png
/trade-record.png
/trades-grades.png
```

Note: `harambe-logo.png`, `Kevin.png`, and `Chuck.png` are actual app assets used by the running code — do NOT ignore those.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore(git): commit .gitignore — excludes backups, xlsx, tool dirs, doc screenshots"
```

---

## Task 3: Fix XSS — sanitize API-sourced strings in innerHTML **Model: Sonnet**

Player names, team names, and other strings from the Sleeper API are injected directly into `innerHTML` across ~40 render functions. A malicious string in Sleeper's database (e.g., a player name like `<img onerror=alert(1) src=x>`) would execute JavaScript in every user's browser. The fix is a single escape function applied at the data ingestion boundary.

**Files:**
- Modify: `index.html` — add `esc()` helper (~line 2098, near other helpers), apply in `buildCurrentSeasonData()` and `parseContractCSV()`

- [ ] **Step 1: Add the escape helper**

Insert after the `isDefaultAvatar` helper (line 2097) in `index.html`:

```js
const esc=s=>typeof s==='string'?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'):s;
```

This is a standard HTML entity escape. Applied to strings before they enter the `D` object, it protects every downstream `innerHTML` without touching any render function.

- [ ] **Step 2: Sanitize player data at ingestion in buildCurrentSeasonData**

Find the `buildCurrentSeasonData` function. Locate where player objects are built from Sleeper API data — specifically where `p.name`, `p.team`, `p.college`, and team names are assigned.

In the player-building loop, wrap user-facing strings:
- `p.name` → `esc(p.name)` (or wherever `full_name`/`fn` is assigned to the player's display name)
- `p.team` → `esc(p.team)`
- `p.college` → `esc(p.college)` if present
- Team names (`team_name`, `display_name`) → `esc(...)`

The key locations are:
1. Where `fn` (full name) from `fetchPlayerDB()` result is mapped to display name
2. Where `userMap` team names from Sleeper API are assigned
3. Where `p.team` (NFL team abbreviation) is assigned

Search for these patterns in `buildCurrentSeasonData`:
```js
name:
team_name:
display_name:
```

Wrap each value with `esc()`.

- [ ] **Step 3: Sanitize contract player names at ingestion**

In `parseContractCSV` (line 1335), the player name comes from the Google Sheet CSV:

Find line 1358:
```js
const name=r[nameIdx];
```
Replace with:
```js
const name=esc(r[nameIdx]);
```

And the note field at line 1376:
```js
note:r[noteIdx]||'',
```
Replace with:
```js
note:esc(r[noteIdx]||''),
```

- [ ] **Step 4: Verify — check no raw API strings reach innerHTML**

Search for any remaining patterns where API data bypasses `esc()`:
```bash
# Look for .name being concatenated directly in render functions
# These should all be safe now since D.teams[].players[].name is already escaped at ingestion
grep -n '\.name\b' index.html | grep -v 'esc\|class\|\.name=\|indexOf\|findIndex\|team_name\|leagueName\|\.names\b' | head -20
```

The strategy is boundary sanitization: clean data once at entry, trust it everywhere after. All render functions reading from `D` are now safe without individual changes.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "fix(security): sanitize API strings at ingestion boundary — prevents XSS via innerHTML"
```

---

## Task 4: Fix KTC data pipeline — wire FantasyCalc values through contracts **Model: Sonnet**

The KTC data pipeline is NOT broken — `fetchDynastyValues()` (line 1307) successfully pulls values from the FantasyCalc API and returns a map keyed by Sleeper player ID. The issue is that `parseContractCSV()` can only attach KTC values to players that have a `sleeperId` column in the Google Sheet CSV. Players without a Sleeper ID in the sheet get `ktc:0`.

The real fix: for players in the contract sheet that DON'T have a Sleeper ID, look them up by name in the player database and get their Sleeper ID, then use that to pull KTC values. Additionally, for rostered players that aren't in the contract sheet at all, create synthetic contract entries with just their KTC values so trade grades, dynasty tiers, and the player profile popup all have data.

**Files:**
- Modify: `index.html` — update `buildCurrentSeasonData()` to backfill KTC for unmatched players

- [ ] **Step 1: Understand the current data flow**

Trace the pipeline to confirm the current state:

1. `fetchDynastyValues()` (line 1307) → returns `ktcMap` keyed by Sleeper player ID → `{sleeperId: {val, rnk, tier}}`
2. `fetchContracts(ktcMap)` (line 1325) → calls `parseContractCSV(csv, ktcMap)` → returns `{contracts, exemptions}`
3. `parseContractCSV` (line 1335) → for each row: looks up `sid` (Sleeper ID from CSV column), checks `ktcMap[sid]` → attaches `ktc`, `rnk`, `tier`
4. `buildCurrentSeasonData` (line ~2209) → stores `contractData.contracts` as `D.contracts`
5. All render functions read `D.contracts[playerName]` for KTC values

**Gap:** If the CSV row has no `sleeperId` column value, or the player isn't in the CSV at all, `ktc` stays 0.

- [ ] **Step 2: Add KTC backfill after building D**

After `D` is built in the `init()` function (after line 2211 `D=buildCurrentSeasonData(...)`), add a backfill pass. Find this block in `init()`:

```js
D=buildCurrentSeasonData(cur,playerDB,contractData,disc.state);
D._loaded=new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
```

Insert immediately after `D._loaded=...`:

```js
// Backfill KTC values for all rostered players
if(ktcMap&&D.contracts&&D.teams){
  // Build name→sleeperId lookup from playerDB
  const nameToId={};
  Object.entries(playerDB).forEach(([sid,p])=>{if(p.fn)nameToId[p.fn.toLowerCase()]=sid;});
  // Fix contract entries missing sleeperId/KTC
  Object.entries(D.contracts).forEach(([name,c])=>{
    if(name.startsWith('_id_'))return;
    if(c.ktc>0)return;
    const sid=c.sleeperId||(nameToId[name.toLowerCase()]||null);
    if(sid&&ktcMap[sid]){
      c.ktc=ktcMap[sid].val||0;
      c.rnk=ktcMap[sid].rnk||0;
      c.tier=ktcMap[sid].tier||0;
      if(!c.sleeperId)c.sleeperId=sid;
    }
  });
  // Create synthetic entries for rostered players not in contract sheet
  D.teams.forEach(t=>t.players.forEach(p=>{
    if(D.contracts[p.name])return;
    const sid=p.id;
    const ktcEntry=ktcMap[sid]||{};
    if(!ktcEntry.val)return;
    const entry={sleeperId:sid,yrs:null,contracted:false,tag:null,exm:null,note:'',ktc:ktcEntry.val||0,rnk:ktcEntry.rnk||0,tier:ktcEntry.tier||0};
    D.contracts[p.name]=entry;
    D.contracts['_id_'+sid]=entry;
  }));
}
```

This does two things:
1. For contract entries with `ktc:0`, tries to find their Sleeper ID by name and backfill KTC
2. For rostered players with no contract entry at all, creates a minimal entry with KTC data

- [ ] **Step 3: Initialize D.contracts if it doesn't exist**

If the Google Sheet fetch fails entirely, `D.contracts` may be empty/undefined, and the backfill would skip all rostered players. Ensure `D.contracts` always exists.

Find where `contractData` is used in `buildCurrentSeasonData`. If it sets `contracts: contractData.contracts`, confirm that a fallback `{}` is in place. If not, add one.

In the `init()` function, before the backfill block, add a safety net:

```js
if(!D.contracts)D.contracts={};
```

- [ ] **Step 4: Verify — check KTC values populate**

Open the app in a browser and check:
1. Open browser DevTools console
2. After load, run: `Object.values(D.contracts).filter(c=>!c.sleeperId).slice(0,5)` — should be empty or near-empty (most should have Sleeper IDs now)
3. Run: `Object.values(D.contracts).filter(c=>c.ktc>0).length` — should be significantly more than 0
4. Check the Player Profile popup — KTC Value should show actual numbers instead of dashes
5. Check the Trades tab — trade grades should show +/- KTC values
6. Check the Contracts tab — dynasty tier badges (ELITE, STAR, etc.) should appear on player rows

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "fix(data): backfill KTC values for all rostered players — enables trade grades and tier badges"
```

---

## Execution Summary

| Task | Model | Files Changed | Independent? |
|------|-------|--------------|-------------|
| 1. PWA fix | Sonnet | `index.html`, `sw.js`, `manifest.json` | Yes |
| 2. .gitignore | Sonnet | `.gitignore` | Yes |
| 3. XSS fix | Sonnet | `index.html` (add helper + 2 ingestion points) | Yes* |
| 4. KTC backfill | Sonnet | `index.html` (init function) | Yes* |

*Tasks 3 and 4 both modify `index.html` but in completely different sections (Task 3: line ~2097 + line ~1358; Task 4: line ~2213). They can run in parallel if using worktrees, or sequentially in the same session without conflict.

**Model summary:** 4 tasks on Sonnet, 0 on Opus. All implementation with clear specs.

**Execution: Parallel subagents in worktrees** — Tasks 1+2 are in different files so zero conflict. Tasks 3+4 touch different sections of `index.html`. Worktree isolation eliminates merge risk.

**Blast radius:** 4 files — `index.html` (3 insertion points totaling ~25 lines), `sw.js` (1 line), `manifest.json` (2 lines), `.gitignore` (15 lines appended). No render function changes, no CSS changes, no API changes.
