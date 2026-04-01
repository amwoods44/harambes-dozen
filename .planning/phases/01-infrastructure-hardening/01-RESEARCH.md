# Phase 1: Infrastructure Hardening - Research

**Researched:** 2026-03-31
**Domain:** Vanilla JS PWA — service worker lifecycle, localStorage caching, XSS prevention, render-state preservation
**Confidence:** HIGH — all findings verified directly from `index.html`, `sw.js`, `manifest.json`, and `.gitignore`

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Google Sheets CSV failure displays as an inline warning banner at the top of the Contracts tab — not a modal, not a toast. Non-intrusive, contextual, visible only where contract data matters.
- **D-02:** The warning banner should match the broadcast aesthetic (use accent red with muted background, not a jarring alert style).
- **D-03:** Render functions with missing `D` keys should silently skip rendering (return early) rather than showing spinners or error states. The data pipeline will populate keys and dirty-flag the tab for re-render. This matches the existing progressive-load pattern.
- **D-04:** Guard clauses go at the top of each render function: `if (!D.rosters) return;` style — simple, flat, one-line.
- **D-05:** In this phase, preserve scroll position and open/collapsed state for: Trades tab (year filter changes trigger re-render) and any collapsible card sections. Other tabs addressed as they're polished in later phases.
- **D-06:** Use the scroll-snapshot pattern: capture `scrollTop` before innerHTML write, restore after. For open/collapsed state, capture `.open` class presence before render, restore after.
- **D-07:** Apply `esc()` to ALL dynamic text interpolations from external sources (player names, team names, manager names) across all 18 render functions. Not just the player profile modal — comprehensive.
- **D-08:** Fix paths to be relative to GitHub Pages subdirectory (`/harambes-dozen/`). Add `skipWaiting()` + `clients.claim()` so updates propagate immediately. Increment cache version name.

### Claude's Discretion

- Specific .gitignore patterns (what to exclude beyond Excel/backups/PNGs)
- Exact localStorage cache pruning throttle implementation (timestamp-based, at most once per minute)
- Whether to extract the NFL kickoff date comment into a more visible location (top of CFG vs inline)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Service worker and manifest paths resolve correctly on GitHub Pages subdirectory | SW registration at line 5324 uses relative `'sw.js'` — correct. Manifest link at line 11 uses relative `manifest.json` — correct. `manifest.json` `start_url` is `"."` — correct. Primary issue is the aggressive unregister-all pattern at lines 5320-5322 that clears any working SW before re-registering. Cache version is `harambes-dozen-v5`. |
| INFRA-02 | .gitignore excludes Excel files, backups, and unnecessary PNGs | `.gitignore` already exists and excludes `*.xlsx` and `*.backup`. Problem: `docs/screenshots/*.png` (12 files) and `harambe-logo.png` are tracked. Avatar PNGs (`assets/avatars/`) are needed by the app. Decision needed on docs/screenshots. |
| INFRA-03 | All dynamic text from APIs escaped via `esc()` across all render functions | `esc()` is called only 6 times in the entire file (lines 1577, 1579, 1639, 1657, 1780, 1793). There are 109+ raw `p.name`, `p.nm`, `player.name`, `t.name`, `owner_name`, `team_name` interpolations across all render functions. Scope is large but mechanical. |
| INFRA-04 | Loading screen displays Harambe logo instead of ESPN base64 image | **Already done.** Line 1348 shows `<img src="./harambe-logo.png" ...>` in the loading screen. The ESPN base64 documented in CLAUDE.md is no longer present. Verify visually but this may require no code change. |
| INFRA-05 | NFL kickoff date moved to CFG object with comment requiring annual update | Hardcoded at two locations: line 2676 (`'2026-09-10T20:20:00'` in `updateCD()`) and line 5045 (`'2026-09-10'` in War Room events array). Both must move to `CFG.nflKickoff`. |
| INFRA-06 | Service worker uses `skipWaiting()` and versioned cache names to prevent stale caches | `sw.js` already has `self.skipWaiting()` in the install handler (line 8) and `self.clients.claim()` in activate (line 17). Cache is named `harambes-dozen-v5`. The stale-cache issue is solved. However the index.html SW registration aggressively unregisters ALL service workers on every load (lines 5320-5322) — this defeats offline capability and should be removed or replaced with a cleaner update check. |
| INFRA-07 | Render state preservation — scroll position and open/collapsed state survive re-renders | No scroll-snapshot pattern exists anywhere in the codebase. `loadHistory()` re-renders affected tabs via `safeRender()` without preserving scroll. The `filterTradeYear()` function correctly uses DOM show/hide (not re-render) — this pattern is the model for filters. Scope: Trades tab scroll + collapsible `.open` states. |
| INFRA-08 | Guard clauses at top of render functions verify required `D` keys before rendering | Mixed state: `renderContracts()` has a guard (`if(!D.contracts)` at line 4781). `renderPower()` (line 2824) directly accesses `D.teams` and `D.pick_trades` with no guard. `renderRosters()` (line 2994) directly accesses `D.teams` with no guard. `renderMatchups()` (line 3698) directly accesses `D.matchup_weeks` with no guard. `renderTrades()` uses `D.unified_trades||[]` fallback pattern — softer guard, acceptable. All 18 render functions need audit. |
| INFRA-09 | Google Sheets CSV fetch includes explicit error handling with visible warning banner on failure | `fetchContracts()` (line 1606) catches errors silently and returns `{contracts:{},exemptions:{}}` with no user notification. No warning banner exists. The Contracts tab has no empty-state feedback. This is a straightforward addition. |
| INFRA-10 | localStorage cache pruning throttled to run at most once per minute | `cache._prune()` (line 1492) has no throttle mechanism. It runs synchronously every time `cache.set()` throws a `QuotaExceededError`. Implementation: add `_lastPrune: 0` to the cache object; in `_prune()`, check `Date.now() - this._lastPrune < 60000` and return early if so; set `this._lastPrune = Date.now()` after pruning. |

</phase_requirements>

---

## Summary

Phase 1 is a mechanical hardening pass — no new features, no architectural changes. The app's infrastructure is mostly sound but has several gaps that will silently break features built in later phases.

The most impactful single change is XSS coverage (INFRA-03): `esc()` is currently called only 6 times against 109+ raw API string interpolations. This is the largest scope item in the phase. The fix is repetitive but requires touching all 18 render functions and the player profile modal systematically.

Second in scope is render guard clauses (INFRA-08): most render functions access `D.teams` or other critical keys without checking they exist. With Phase 2 (Narrative) adding new data keys and re-render triggers, render functions that crash on missing keys will cause silent empty panels that are hard to diagnose.

INFRA-04 (loading screen logo) appears already resolved — the loading screen at line 1348 already references `./harambe-logo.png`. This requires verification but may be a no-op task.

INFRA-06 (service worker stale cache) is also partially resolved: `sw.js` already has `skipWaiting()` and `clients.claim()`. The primary remaining issue is the aggressive "unregister all SWs on every load" pattern in `index.html` lines 5320-5322, which is counterproductive.

**Primary recommendation:** Execute tasks in pipeline order — INFRA-10 and INFRA-05 first (isolated, low-risk), then INFRA-08 (guards, enables safe re-renders), then INFRA-07 (scroll preservation, depends on understanding which render functions re-fire), then INFRA-03 (XSS, large but mechanical), then INFRA-09 (CSV banner, requires new HTML/CSS), then INFRA-01/INFRA-06 (SW cleanup), then INFRA-02/INFRA-04 (config/gitignore).

---

## Standard Stack

This is a zero-dependency vanilla JS project. No libraries are added in this phase.

### Core — No Changes
| Tool | Version | Purpose |
|------|---------|---------|
| Vanilla JS | ES6+ | Runtime — no framework |
| Service Worker API | Browser native | PWA/offline |
| localStorage | Browser native | TTL caching |
| `esc()` (existing) | Line 1408 | XSS prevention — extend coverage, do not rewrite |

### What NOT to Add
Per project CLAUDE.md: no npm, no frameworks, no TypeScript, no build tools. This phase ships zero new dependencies.

---

## Architecture Patterns

### Pattern 1: Guard Clause at Render Function Top

**What:** One-line early return if required `D` key is missing.

**When to use:** Every render function that reads from a `D` key that may not be populated yet.

```javascript
// Source: project codebase (renderContracts, line 4781 — existing model)
function renderPower() {
  if (!D.teams) return;  // Guard: data not yet populated
  // ... rest of function
}

function renderMatchups() {
  if (!D.matchup_weeks) return;
  // ...
}
```

**Key rule (D-04):** One-line, no spinner, no error state — just `return`. The dirty-flag system will re-render when data arrives.

### Pattern 2: Scroll-Snapshot Around Re-Renders

**What:** Capture scroll position before `innerHTML` write, restore after.

**When to use:** Any re-render triggered by background data load (historical data merge) while user may be actively viewing the panel.

```javascript
// Source: .planning/research/ARCHITECTURE.md (verified pattern)
function rerenderWithScrollPreserve(tabId, renderFn) {
  const el = document.getElementById('tab-' + tabId);
  const savedScroll = el ? el.scrollTop : 0;
  // Capture .open states
  const openIds = el ? [...el.querySelectorAll('[data-id].open')].map(e => e.dataset.id) : [];
  renderFn();
  if (el) {
    el.scrollTop = savedScroll;
    openIds.forEach(id => {
      const node = el.querySelector('[data-id="' + id + '"]');
      if (node) node.classList.add('open');
    });
  }
}
```

**Scope for this phase (D-05):** Trades tab only. Other tabs deferred.

### Pattern 3: CSV Warning Banner (Broadcast Aesthetic)

**What:** Inline warning at the top of Contracts tab when CSV fetch fails.

**Design spec (D-01, D-02):** Accent red with muted background, not a jarring alert. Match the existing `status-banner` pattern at line 1345 if possible, or add a tab-specific banner.

```javascript
// Pattern: insert at top of Contracts tab innerHTML before content
function renderContractsBanner(message) {
  return '<div class="contract-warn-banner" role="alert">'
    + '<span class="cwb-icon">!</span>'
    + '<span class="cwb-msg">' + message + '</span>'
    + '</div>';
}
```

CSS approach: dark red background with low opacity (`rgba(204,0,0,0.12)`), accent red border-left, Oswald font, compact height. Matches existing broadcast card aesthetic.

### Pattern 4: XSS Coverage — esc() at Render Time

**What:** Wrap every dynamic string from external sources in `esc()` at the point of HTML injection, not at data-load time.

**Current state:** `esc()` is applied at data load (pipeline) for some fields but not at render time. The 109+ raw interpolations in render functions are the XSS surface.

**Rule (D-07):** Apply at every template literal `${}` that injects player name, team name, manager name, or any API-sourced string.

```javascript
// BEFORE (vulnerable):
h += '<div class="player-name">' + p.name + '</div>';

// AFTER (safe):
h += '<div class="player-name">' + esc(p.name) + '</div>';
```

**Priority sites:** `openPP()` modal (lines 5502, 5506, 5552), all `renderX()` functions that display player/team names.

### Pattern 5: _prune() Throttle

**What:** Timestamp gate prevents prune from running more than once per minute.

```javascript
// Source: REQUIREMENTS.md INFRA-10 + direct codebase analysis
const cache = {
  _lastPrune: 0,  // Add this field
  // ...
  _prune() {
    if (Date.now() - this._lastPrune < 60000) return;  // throttle gate
    this._lastPrune = Date.now();
    // ... existing prune logic unchanged ...
  }
};
```

### Anti-Patterns to Avoid

- **Never unregister all SWs on every page load.** Lines 5320-5322 call `r.unregister()` on every registration. This destroys offline capability and forces the SW to re-install from scratch every visit. Replace with a cleaner `reg.update()` call only.
- **Never re-render to implement a filter.** The `filterTradeYear()` function already uses DOM show/hide correctly. Do not convert it to a re-render pattern.
- **Never add a guard clause inside the function body.** Guard clauses belong at line 1 of the function, before any work starts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XSS escaping | Custom regex replacement | `esc()` at line 1408 | Already exists, already correct — extend coverage |
| SW update strategy | Complex version negotiation | `skipWaiting()` + versioned cache name | Already in `sw.js` — just fix the index.html unregister pattern |
| Cache quota management | Size-estimation libraries | Existing `cache._prune()` with timestamp throttle | The prune logic is correct, only needs throttling |
| CSV error feedback | Toast library, modal library | Inline HTML banner | Zero-dependency project; inline banner is the right pattern |

---

## Common Pitfalls

### Pitfall 1: Confusing Data-Load-Time esc() with Render-Time esc()

**What goes wrong:** `esc()` is called on player names when building `playerDB` (line 1577) and on user names in `buildCurrentSeasonData()` (line 1793). This creates a false sense of security. Render functions still inject the same strings via template literals — and those template literals are not wrapped in `esc()`. The data-load escape does not protect the render-time injection.

**How to avoid:** Treat every `${}` in a render function as potentially unescaped. The rule is: if it came from an API, wrap it in `esc()` at the injection site, regardless of whether it was escaped earlier.

**Warning signs:** `esc()` call count is 6. Render function template literal count is 109+. The gap is the XSS surface.

### Pitfall 2: The SW Unregister Pattern Defeats Offline Support

**What goes wrong:** Lines 5320-5322 call `r.unregister()` on all existing service workers before registering a new one. This means:
- On every page load, the service worker is unregistered and re-registered
- There is a window during re-registration where no SW is active
- Offline caching never actually accumulates between sessions

The intent was to force updates, but `sw.js` already handles this correctly via `skipWaiting()` and versioned cache names. The unregister logic is redundant and harmful.

**How to avoid:** Remove or disable lines 5320-5322. The SW lifecycle in `sw.js` is correct as-is.

### Pitfall 3: `D.exemption_history` Is Not Missing (Prior Research Was Wrong)

**What goes wrong:** The prior research document (`ARCHITECTURE.md`) stated that `D.exemption_history` is never populated — that `buildCurrentSeasonData()` does not assign it. This was incorrect. Line 1850 in `index.html` shows: `d.exemption_history = contractData.exemptions || {};`. The assignment exists.

**Implication:** INFRA-09 (contract CSV error handling) is the correct fix to make exemption data actually appear — not adding a missing assignment. If the CSV fetch fails silently, `contractData.exemptions` is `{}` and all exemption UI shows empty but no error is surfaced.

### Pitfall 4: Two Locations for the NFL Kickoff Date

**What goes wrong:** The kickoff date hardcode appears in two places, not one:
- Line 2676: `new Date('2026-09-10T20:20:00')` in `updateCD()` (the header countdown)
- Line 5045: `date:'2026-09-10'` in the War Room events array

Moving only the `updateCD()` date to `CFG` and leaving the War Room entry hardcoded means the countdown and the calendar event get out of sync next season.

**How to avoid:** Both references must point to `CFG.nflKickoff`. The War Room entry uses date string format (`'YYYY-MM-DD'`) while `updateCD()` uses datetime format (`'YYYY-MM-DDTHH:MM:SS'`). `CFG` can store just the date string; `updateCD()` appends `T20:20:00`.

### Pitfall 5: docs/screenshots PNGs Are Tracked but Not App Assets

**What goes wrong:** The `.gitignore` already excludes `*.xlsx` and `*.backup`. However, 12 `docs/screenshots/*.png` files are currently tracked in git. These are documentation images, not app assets. Adding `docs/screenshots/` to `.gitignore` will not untrack already-committed files — `git rm --cached docs/screenshots/` is needed to remove them from tracking without deleting them locally.

**How to avoid:** The `.gitignore` update must be paired with `git rm --cached` for any files that are already tracked.

### Pitfall 6: render() Functions May Fire Before `D` Is Populated

**Current state verified:** `renderPower()` (line 2824) calls `D.teams.map(...)` directly on line 2825 — if `D.teams` is undefined, this throws `TypeError: Cannot read properties of undefined`. Same for `renderRosters()` (line 2994) and `renderMatchups()` (line 3698). `renderContracts()` (line 4781) already has a guard and is the model.

**Impact:** If a dirty-tab flush fires during slow network conditions before data is assembled, the render function throws, `safeRender()` catches it silently, and the tab shows empty or stale content.

---

## Code Examples

### Verified: Current esc() definition (line 1408)
```javascript
// Source: index.html line 1408
const esc = s => typeof s === 'string'
  ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  : s;
```
This handles all five HTML entities correctly. No rewrite needed — extend usage.

### Verified: Current SW registration (lines 5318-5327)
```javascript
// Source: index.html lines 5318-5327
if ('serviceWorker' in navigator) {
  // PROBLEM: unregisters ALL SWs on every load — defeats offline
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then(reg => { console.log('SW registered'); reg.update(); })
      .catch(err => console.log('SW failed:', err));
  });
}
```

Fix: Remove the `getRegistrations().then(r.unregister())` block. `sw.js` already handles version transitions correctly via `skipWaiting()` and cache key deletion in the activate handler.

### Verified: Current cache._prune() (lines 1492-1517)
```javascript
// Source: index.html lines 1492-1517
_prune() {
  // No throttle — add _lastPrune check here
  const entries = [];
  for (let i = 0; i < localStorage.length; i++) {
    // ... builds entry list, sorts hd_hist_ first, removes until under 4MB
  }
}
```

### Verified: renderContracts() guard (line 4781) — the model
```javascript
// Source: index.html line 4781
function renderContracts() {
  if (!D.contracts) {
    document.getElementById('tab-contracts').innerHTML = '<div class="u-empty">No contract data</div>';
    return;
  }
  // ...
}
```
Per D-03/D-04, the other render functions should use `return;` only (no error state), unlike this existing one which renders an error string. The Contracts guard is appropriate because contracts tab has explicit content to show on failure; other tabs just wait for data.

### Verified: manifest.json — already relative paths
```json
// Source: manifest.json
{
  "start_url": ".",
  "icons": [
    { "src": "harambe-logo.png", ... }
  ]
}
```
Manifest paths are already relative. No change needed to `manifest.json`.

---

## State of the Art

| Old Understanding | Verified Reality | Impact |
|-------------------|------------------|--------|
| D.exemption_history not populated | Assigned at line 1850: `d.exemption_history = contractData.exemptions || {}` | INFRA fix is "show error when CSV fails", not "add missing assignment" |
| Loading screen has ESPN base64 | Loading screen at line 1348 already uses `./harambe-logo.png` | INFRA-04 may require no code change — verify visually |
| SW needs skipWaiting() added | `sw.js` already has skipWaiting() + clients.claim() | INFRA-06 fix is "remove harmful unregister pattern in index.html" |
| .gitignore doesn't exist | .gitignore exists, excludes xlsx/backup | INFRA-02 scope is: add docs/screenshots + run git rm --cached |
| Manifest paths need fixing | manifest.json uses relative `"."` for start_url | Manifest is already correct for GitHub Pages subdirectory |

---

## Open Questions

1. **INFRA-04: Loading screen logo — already fixed?**
   - What we know: Line 1348 shows `<img src="./harambe-logo.png">` in the loading screen. The `loading-gorilla` CSS class is defined (line 27) but the HTML uses `loading-logo` class, not `.loading-gorilla`. No base64 image found.
   - What's unclear: Whether the CLAUDE.md "Known Issues" entry for the ESPN base64 is stale (already fixed in a prior commit) or refers to something else in the file.
   - Recommendation: Planner should include a visual verification task that confirms the loading screen before marking INFRA-04 complete. If no base64 is present, mark as done with no code change.

2. **INFRA-02: Which PNGs to exclude from tracking?**
   - What we know: `docs/screenshots/*.png` (12 files) are tracked but are documentation artifacts. `assets/avatars/Kevin.png` and `Chuck.png` are tracked and ARE needed by the app (used as avatar overrides in `CFG.avatarOverrides`). `harambe-logo.png` is the app logo, must remain tracked.
   - What's unclear: Whether the `docs/screenshots/` directory should be removed from tracking or just excluded going forward.
   - Recommendation (Claude's Discretion): Add `docs/screenshots/` to `.gitignore` and run `git rm --cached docs/screenshots/*.png` to untrack existing files. Avatar PNGs and `harambe-logo.png` remain tracked (they are app assets).

3. **INFRA-03 XSS scope: where esc() must be applied**
   - What we know: 109+ raw name interpolations exist across 18 render functions + `openPP()`. Many are in string concatenation deep in loops.
   - What's unclear: Whether any `p.name` values at this point are already pre-escaped (double-escaping would show `&amp;` in the UI). Line 1577 applies `esc()` to `p.full_name` when building playerDB, so `p.fn` is already escaped. But `p.name` is set elsewhere in `buildCurrentSeasonData()` from `playerDB.fn` — need to confirm the chain.
   - Recommendation: Planner should include a search-before-wrapping step that traces whether `p.name` is sourced from `p.fn` (already escaped) or from the raw API. If `p.name` is already `esc()`d at assignment, wrapping again creates double-escape. The planner task should grep for where `p.name` (not `p.fn`) is assigned.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is code-only changes to `index.html`, `sw.js`, `manifest.json`, and `.gitignore`. No external tools, services, or runtimes beyond git and a browser are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — zero test infrastructure exists in this project |
| Config file | None |
| Quick run command | Manual browser verification only |
| Full suite command | Manual browser verification only |

This is a zero-dependency vanilla JS project with no `package.json`. No automated test framework is installed or appropriate for this phase. All validation is manual browser-based.

### Phase Requirements — Test Map

| Req ID | Behavior | Test Type | Verification Method | Automated? |
|--------|----------|-----------|---------------------|------------|
| INFRA-01 | SW registers on `/harambes-dozen/` subdirectory | manual | DevTools > Application > Service Workers on deployed URL | No — requires GitHub Pages deployment |
| INFRA-02 | Excel/backup/screenshot PNGs not in git | automated | `git ls-files | grep -E '\.png$'` — only app assets remain | Yes (git CLI) |
| INFRA-03 | No raw API strings in template literals | automated | `grep -n 'p\.name\|p\.nm\|player\.name' index.html | grep -v 'esc('` — zero results | Yes (grep) |
| INFRA-04 | Loading screen shows Harambe logo | manual | Load app in browser, observe loading screen | No |
| INFRA-05 | NFL kickoff date in CFG | automated | `grep '2026-09-10' index.html` — only one result in CFG definition | Yes (grep) |
| INFRA-06 | SW not unregistered on every load | automated | `grep 'unregister' index.html` — zero results | Yes (grep) |
| INFRA-07 | Scroll survives re-render in Trades tab | manual | Open Trades, scroll to middle, change year filter, verify position preserved | No |
| INFRA-08 | Guard clauses present in all render functions | automated | Grep for `function render` and check each has guard on next 3 lines | Partially (grep audit) |
| INFRA-09 | Warning banner appears when CSV fails | manual | Temporarily break the CSV URL, reload, verify banner in Contracts tab | No |
| INFRA-10 | _prune throttled | automated | `grep '_lastPrune' index.html` — exists | Yes (grep) |

### Wave 0 Gaps

No test files need to be created. The verification strategy is a mix of:
- **Grep checks** (INFRA-02, INFRA-03, INFRA-05, INFRA-06, INFRA-08, INFRA-10): Run as part of each task completion
- **Manual browser checks** (INFRA-01, INFRA-04, INFRA-07, INFRA-09): Documented in each task's verification step

**Phase gate:** All grep checks pass AND all manual checks verified before `/gsd:verify-work`.

---

## Project Constraints (from CLAUDE.md)

Enforced constraints that affect how each task must be implemented:

| Constraint | Source | Impact on This Phase |
|------------|--------|---------------------|
| Zero runtime dependencies | CLAUDE.md "What NOT to Do" | No npm packages for testing, linting, or error handling — all solutions must be in-file |
| No framework introduction | CLAUDE.md "What NOT to Do" | No React, Vue, etc. — all render patterns stay string concatenation |
| No build tools | CLAUDE.md "What NOT to Do" | No bundler, no transpiler — ships as-is |
| Vanilla JS only | CLAUDE.md "Code Conventions" | No TypeScript, no imports/exports |
| Font weights 600-900 on headings intentional | CLAUDE.md "Design System" | Warning banner CSS must not follow global CLAUDE.md font-weight rule of ≤500 |
| Broadcast aesthetic | CLAUDE.md "Design Quality Bar" | CSV warning banner must look like a broadcast alert, not an `alert()` or generic error div |
| Re-render safety | CLAUDE.md "Implementation Self-Review" | Every delivered interactive pattern must be tested against re-render scenarios |
| No console.log in production | Global CLAUDE.md "Code Standards" | Note: this project already uses `console.log/warn/info` in several places. For this phase, do not add new console.log calls; existing ones are acceptable technical debt. |

---

## Sources

### Primary (HIGH confidence — direct codebase analysis)
- `index.html` (5,631 lines, direct read) — lines 1408, 1577, 1793, 1850, 2676, 2824, 2994, 4781, 5045, 5318-5327 verified
- `sw.js` (direct read) — skipWaiting, clients.claim, cache strategy verified
- `manifest.json` (direct read) — start_url, icon paths verified
- `.gitignore` (direct read) — existing exclusion patterns verified
- `git ls-files` output — tracked PNGs verified

### Secondary (HIGH confidence — planning docs)
- `.planning/codebase/ARCHITECTURE.md` — layer map, data flow, integration points
- `.planning/codebase/CONCERNS.md` — XSS locations, performance issues, fragile areas
- `.planning/codebase/STACK.md` — caching strategy, service worker details
- `.planning/research/PITFALLS.md` — pitfalls 1-12 verified against codebase
- `.planning/research/ARCHITECTURE.md` — patterns, scroll preservation, anti-patterns

### Corrections to Prior Research

The following claims in `.planning/research/ARCHITECTURE.md` are contradicted by direct code inspection:

1. **"D.exemption_history is never populated"** — FALSE. Line 1850 assigns it. The field is empty because the CSV returns no exemption data (the sheet's exemption column is blank), not because of a missing assignment.
2. **"The fix is one line in buildCurrentSeasonData()"** — NOT NEEDED. The assignment already exists.

These do not affect the phase requirements — the correct fix is still INFRA-09 (CSV error visibility).

---

## Metadata

**Confidence breakdown:**
- INFRA-01 (SW paths): HIGH — direct file read of sw.js and manifest.json; registration code verified at line 5324
- INFRA-02 (.gitignore): HIGH — .gitignore read, git ls-files run, tracked PNGs enumerated
- INFRA-03 (XSS): HIGH — esc() usage count verified (6 calls), raw interpolation count verified (109+)
- INFRA-04 (logo): HIGH — loading screen HTML at line 1348 directly read; no base64 found
- INFRA-05 (kickoff date): HIGH — both hardcode locations found (line 2676, line 5045)
- INFRA-06 (SW updates): HIGH — skipWaiting() in sw.js verified; unregister problem at lines 5320-5322 verified
- INFRA-07 (scroll): HIGH — no scroll-snapshot pattern found anywhere; filterTradeYear DOM-filter pattern verified
- INFRA-08 (guards): HIGH — render function openings read; renderContracts guard is the only one present
- INFRA-09 (CSV banner): HIGH — fetchContracts silent failure verified at lines 1606-1613
- INFRA-10 (_prune throttle): HIGH — _prune code at lines 1492-1517 read; no throttle mechanism found

**Research date:** 2026-03-31
**Valid until:** 2026-05-01 (stable vanilla JS codebase, changes only from our own work)
