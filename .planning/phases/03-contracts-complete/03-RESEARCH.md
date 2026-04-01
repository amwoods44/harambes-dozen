# Phase 3: Contracts Complete - Research

**Researched:** 2026-03-31
**Domain:** Contract data pipeline, Google Sheets CSV parsing, UI distribution across tabs
**Confidence:** HIGH

## Summary

Phase 3 brings the contracts system from 95% built to fully functional. The codebase audit reveals the infrastructure is remarkably complete: `parseContractCSV()` already auto-detects all required columns, `cpill()` renders correctly, `renderContracts()` has ~200 lines of broadcast-quality UI including stat cards, team filters, tagged/expiring strips, health bars, dynasty values, cliff heatmap, top assets, and exemption timeline + ROI sections. The Google Sheets CSV is live and populated with 307 player rows across 12 teams, including real contract years, tag statuses, and exemption years.

The work divides into three categories: (1) **fixing the exemption pipeline** — the parser correctly reads `exm` per player but hardcodes `exemptions: {}` instead of aggregating, (2) **distributing contract visibility** — `cpill()` is only called in one location (Power Rankings starters at line 2987) despite being needed in 3-4 more render functions, and (3) **building the sortable keeper sheet** — a new data-dense reference table at the bottom of the Contracts tab.

**Primary recommendation:** Work sequentially through the data pipeline first (exemption aggregation, waiver auto-assignment), then distribute UI (cpill across tabs, release badge), then build the keeper sheet last. Pipeline fixes affect all downstream rendering; UI distribution is surgical insertion at known lines; the keeper sheet is additive new code.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** The CSV parser (`parseContractCSV`) currently returns `exemptions: {}` always. Fix: parse exemption data from the Google Sheets CSV. The Excel source contains exemption records -- these need to be in the published Google Sheet.
- **D-02:** The parser already detects `exm` per player row. The missing piece is aggregating these into the `{year: [{player, owner, had, added, new_yrs, ...}]}` shape that `D.exemption_history` expects. Build this aggregation inside `parseContractCSV` or as a post-processing step in `buildCurrentSeasonData`.
- **D-03:** `cpill()` currently appears ONLY in `renderRosters()` starters (line 2987). Extend to: bench players in Rosters, GM Dashboard player listings, Trade History trade cards, and Player Profile modal. This satisfies CONT-03, CONT-04, CONT-05.
- **D-04:** `cpill(playerName)` already handles the lookup via `D.contracts[name]` -- no API change needed, just insert `cpill(p.name)` at more render sites.
- **D-05:** The current contract cliff uses heatmap cards per team. Keep the existing heatmap card approach -- it's already broadcast-quality. Enhance if needed but don't replace with a stacked area chart.
- **D-06:** Add a master player table below the existing visual sections in the Contracts tab. Columns: Player, Team, Pos, Years, Tag, Exemption, KTC Value. Sortable by clicking column headers.
- **D-07:** Default sort: by KTC value descending (most valuable assets first). Secondary sorts available on all columns.
- **D-08:** Players with exactly 1 year remaining show a "RELEASABLE" indicator -- either as a badge next to cpill or as a distinct visual state in the expiring section (CONT-06).
- **D-09:** Waiver wire pickups without a contract entry auto-display as 1-year contracts. Implementation: in `buildCurrentSeasonData` post-processing, check transactions for waiver adds and create synthetic 1-year contract entries (CONT-08).
- **D-10:** Before any implementation, verify the live Google Sheets CSV format against the parser's expected columns.

### Claude's Discretion
- Exact sort implementation (in-memory array sort vs DOM manipulation)
- Whether to add a search/filter to the keeper sheet
- Column header styling for sort indicators (arrows, color change)
- How to detect waiver pickups from transaction types in D.transactions

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | Contract data flows reliably from Google Sheets CSV into D.contracts | CSV is live (307 rows), parser auto-detects all 6 columns correctly. Pipeline already works end-to-end for contracts -- verified by inspecting column matching against live headers. |
| CONT-02 | D.exemption_history populated from contract data | Parser reads `exm` per row but hardcodes `exemptions: {}` at line 1711-1712. CSV has 18 players with exemption years (2023: 1, 2024: 5, 2025: 12). Need aggregation logic. |
| CONT-03 | Contract pills visible on player cards in Rosters tab | `cpill()` exists at line 2520. Power Rankings calls it at line 2987. Rosters has inline contract display (lines 3127-3136) but uses custom bars, not cpill. Also needs cpill on the position-grouped view. |
| CONT-04 | Contract pills visible in GM Dashboard player listings | renderGM (line 4708) has no cpill calls. Player listings in franchise deep dive section (trade history, roster comp) need injection. |
| CONT-05 | Contract years visible in Trade History cards | renderTrades (line 3410) has player names in heroSide/listSide/gridSide helpers but no cpill. Need insertion at player name render sites. |
| CONT-06 | Release eligibility indicator on players with 1 year remaining | No existing indicator. CONTEXT says badge next to cpill or distinct visual in expiring section. |
| CONT-07 | Annual exemption tracking displayed in Contracts tab | Exemption timeline UI exists in renderContracts (lines 5058-5098) -- fully styled with HAD/ADDED/NEW flow, badges, year tabs. Just needs D.exemption_history data. |
| CONT-08 | Waiver pickups display as 1-year auto-assigned contracts | Waiver detection exists via `txn.type==='waiver'` and `player.acq==='waiver'`. Synthetic contract entries already created for uncontracted players (lines 1914-1921) -- just need to set yrs=1 for waiver acq. |
| CONT-09 | Contract Cliff Chart | Already built at lines 5131-5150 as heatmap cards per team with 6-year projection. CONTEXT says keep as-is, enhance if needed. |
| CONT-10 | Contracts tab fully functional with sortable keeper sheet | renderContracts exists with stat cards, filters, strips, health bars, dynasty values, cliff, top assets, exemption ROI. Missing: sortable master table. |
</phase_requirements>

## Standard Stack

This phase requires NO new libraries or dependencies. Everything is vanilla JS within the existing single-file architecture.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS | ES6+ | All implementation | Project constraint: zero dependencies |

### Supporting
No supporting libraries needed. All work is within `index.html`.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled sort | DataTables.js or similar | Adds dependency -- violates project constraint. In-memory array sort with innerHTML re-render is the established pattern. |
| Hand-rolled CSV parse | Papa Parse | Already have a working parser. Adding CDN dependency for something that works is unnecessary. |

## Architecture Patterns

### Relevant Existing Patterns

**Pattern 1: CSV Column Auto-Detection**
**What:** `parseContractCSV` at line 1663 auto-detects column indices from header row using substring matching
**Verified against live CSV:** Headers are `Player Name,POS,NFL Team,Fantasy Team,Sleeper ID,Contract Years,Tag Status,Exemption,Notes` (emoji prefixes stripped by `.toLowerCase().replace(/[^\w]/g,'')`)
- `nameIdx` matches on 'playername' (contains 'player') -- CONFIRMED
- `idIdx` matches on 'sleeperid' (contains 'sleeper') -- CONFIRMED
- `yrsIdx` matches on 'contractyears' (contains 'contract') -- CONFIRMED
- `tagIdx` matches on 'tagstatus' (contains 'tag') -- CONFIRMED
- `exIdx` matches on 'exemption' (contains 'exemp') -- CONFIRMED
- `noteIdx` matches on 'notes' (contains 'note') -- CONFIRMED

**Pattern 2: Synthetic Contract Entries**
**What:** `buildCurrentSeasonData` lines 1914-1921 creates entries for rostered players not in the CSV
**Current behavior:** Sets `contracted: false`, `yrs: null` for all unmatched players
**Waiver modification point:** After this loop, check `player.acq === 'waiver'` and set `yrs: 1, contracted: true` for those

**Pattern 3: cpill() Helper**
**What:** Takes player name, looks up `D.contracts[nm]`, returns styled HTML span
**Current classes:** `.cpill-4` (4+ years, green), `.cpill-23` (2-3 years, amber), `.cpill-1` (1 year, red), `.cpill-0` (expired, red pulsing)
**Tag indicator:** Prepends `T` for tagged, `X` for exempted
**Insertion pattern:** `cpill(p.name)` or `cpill(p.nm)` depending on data shape at injection site

**Pattern 4: Sortable Table (new, no existing precedent)**
**What:** Column header click re-sorts array, re-renders table body
**Recommended approach:** Store sort state in a module-level variable (`let conSortCol='ktc', conSortDir=-1`), re-render only the table body on sort click (not entire renderContracts). Use `renderContractsTable()` as a sub-render to avoid full tab re-render on sort.
**Why sub-render:** Full `renderContracts()` re-render on sort would lose team filter state and scroll position. Isolate the table in a `<div id="con-table-wrap">` and only replace that innerHTML.

**Pattern 5: Re-render Safety**
**Critical:** renderContracts uses `selConTeam` for team filtering with re-render on filter click. Sort state must survive `renderContracts()` calls. Solution: module-level sort variables (like `selConTeam` pattern at line 2524).

### Anti-Patterns to Avoid
- **DOM manipulation sort:** Do NOT sort by moving DOM elements. The codebase pattern is always array-sort-then-innerHTML. Follow it.
- **Full re-render on sort:** Do NOT call `renderContracts()` on sort click. That would reset team filters and scroll. Isolate table rendering.
- **Modifying cpill signature:** Do NOT change `cpill(nm)` to take additional params. The function already looks up everything it needs from `D.contracts`. Just call it at new sites.
- **Adding new CSS classes for existing patterns:** The release badge should use the existing `cbadge()` helper (line 2527) which already handles styled micro-badges.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Contract pill rendering | New styled spans per site | `cpill(name)` at line 2520 | Already handles all cases: 4+yr, 2-3yr, 1yr, expired, tagged, exempted |
| Sort direction indicators | Custom SVG arrows | Unicode arrows in `cbadge` or inline span | Minimal code, consistent with broadcast aesthetic |
| Exemption badges | New badge system | `cbadge(text, color)` at line 2527 | Existing helper with 5 color presets |
| Contract card rendering | New card pattern | `conCard(p, opts)` at line 2528 | Already used in tagged/expiring/top asset strips |

## Common Pitfalls

### Pitfall 1: Exemption Data Shape Mismatch
**What goes wrong:** The exemption timeline UI expects `{year: [{p, o, pos, had, added, new_yrs, from, note}]}` but the CSV only provides exemption year per player -- NOT the `had`, `added`, `new_yrs` fields.
**Why it happens:** The CSV column `Exemption` contains just a year string (e.g., "2024"). There is no column for "years had before exemption" or "years added by exemption."
**How to avoid:** Compute `had` and `new_yrs` from the contract data: if a player has exemption year X and current contract years Y, and was tagged (tag=TRUE alongside exemption), then we can infer the exemption added years. But `had` (years remaining BEFORE exemption) is unknowable from the current CSV schema alone.
**Recommendation:** For the initial implementation, populate what we CAN from the CSV (player, owner, year, current yrs, tag status) and use `null` for `had` and `added` -- the timeline UI already handles nulls with `'--'` display (line 5081). The Exemption ROI section uses only `ktc`, `yrs`, and `note` -- all available. Long-term: add columns to the Google Sheet for pre-exemption years.
**Warning signs:** Cards showing `-- -> -- -> 5` instead of `3 -> +2 -> 5`. Functional but incomplete.

### Pitfall 2: Player Name Matching Between CSV and Sleeper API
**What goes wrong:** `cpill(p.name)` fails silently if the CSV player name doesn't exactly match the Sleeper API player name.
**Why it happens:** Sleeper might use "A.J. Brown" while the CSV has "AJ Brown" or "A.J. Brown" (with different punctuation). The parser stores by `esc(name)` which HTML-encodes special chars.
**How to avoid:** The parser already creates dual keys: `contracts[name]` and `contracts['_id_'+sleeperId]`. The `cpill()` function only checks name. For more robust matching, `cpill` could also check `D.contracts['_id_'+playerId]` -- but this requires passing player ID, which changes the signature.
**Better approach:** Leave `cpill(nm)` as-is for now. The CSV already includes Sleeper IDs, and `buildCurrentSeasonData` line 1898 creates `_id_` entries. Where cpill fails on name, the inline contract display in Rosters (lines 3127-3136) already uses `D.contracts[p.name]` which succeeds because names come from Sleeper's own player DB.
**Warning signs:** Some players show no pill in one tab but contract info in another.

### Pitfall 3: Waiver Auto-Assignment Ordering
**What goes wrong:** Synthetic 1-year contract for waiver players gets overwritten or never created.
**Why it happens:** `buildCurrentSeasonData` creates synthetic entries at lines 1914-1921 for players NOT in the contract sheet. But it only creates them as `contracted: false`. The waiver check must happen AFTER this loop, or the entry already exists as uncontracted.
**How to avoid:** Two approaches: (a) modify the synthetic entry creation to check `player.acq` at creation time, or (b) add a post-processing pass after acquisition tracking (line 2048-2055) that upgrades waiver players to 1-year contracts. Option (b) is safer because acquisition tracking happens after synthetic entry creation.
**Warning signs:** Waiver players still showing "NO CONTRACT" in the player profile.

### Pitfall 4: renderContracts Sort State vs Team Filter
**What goes wrong:** Clicking a team filter calls `renderContracts()` which rebuilds the entire tab, losing sort state on the keeper sheet.
**Why it happens:** `selConTeam` triggers full re-render. Sort state stored in a local variable would be lost.
**How to avoid:** Store sort state in module-level variables (same pattern as `selConTeam`). When `renderContracts()` fires, it reads both `selConTeam` and sort state to produce consistent output.
**Warning signs:** Sort resets to default every time a team filter pill is clicked.

### Pitfall 5: cpill in Trade Cards -- Wrong Name Shape
**What goes wrong:** `cpill(p.nm)` vs `cpill(p.name)` -- trade player objects use `.nm` not `.name`.
**Why it happens:** Trade objects come from `D.unified_trades` which uses `.nm` for player names (line 3455), while roster player objects use `.name`.
**How to avoid:** Check the data shape at each injection site. In trade card helpers (`heroSide`, `listSide`, `gridSide`), player objects have `.nm`. Use `cpill(player.nm)` there.
**Warning signs:** Pills render in Rosters but not in Trade History.

### Pitfall 6: Empty Contract Data Handling
**What goes wrong:** If Google Sheets fetch fails, `D.contracts` is empty `{}` or potentially undefined.
**Why it happens:** `fetchContracts` returns `{contracts:{},exemptions:{}}` on failure. Guard clauses exist but cpill relies on `D.contracts` being populated.
**How to avoid:** `cpill()` already handles this -- line 2520 starts with `if(!D.contracts)return'';`. The existing contract warning banner (Phase 1, INFRA-09) displays when `D.contractsFailed` is true. No additional guards needed.

## Code Examples

### Exemption Aggregation (recommended approach)
```javascript
// Inside parseContractCSV, after the main loop, before return:
// Also need Fantasy Team column for owner mapping
const teamIdx = hdr.findIndex(h => h.includes('fantasy') || h.includes('team'));
const exemptions = {};
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r[nameIdx]) continue;
  const name = esc(r[nameIdx]);
  const rawExm = (r[exIdx] || '').trim().toLowerCase();
  if (rawExm === '' || rawExm === 'none') continue;
  const yr = r[exIdx].trim(); // "2024", "2025"
  const owner = r[teamIdx] ? esc(r[teamIdx].trim()) : '?';
  // Can't know had/added from CSV alone -- use null
  const cEntry = contracts[name];
  if (!exemptions[yr]) exemptions[yr] = [];
  exemptions[yr].push({
    p: name,
    o: owner,
    pos: (r[1] || '').trim(), // POS column is index 1
    had: null,
    added: null,
    new_yrs: cEntry ? cEntry.yrs : null,
    from: null,
    note: cEntry && cEntry.tag ? 'Tagged extension' : null
  });
}
// Replace hardcoded empty return:
cache.set('hd_contracts', {contracts, exemptions}, 2*60*60*1000);
return {contracts, exemptions};
```

### Waiver Auto-Assignment (recommended approach)
```javascript
// In buildCurrentSeasonData, AFTER acquisition tracking (after line 2055):
// Auto-assign 1-year contracts to waiver/FA pickups not in contract sheet
d.teams.forEach(t => t.players.forEach(p => {
  if ((p.acq === 'waiver' || p.acq === 'free_agent') 
      && d.contracts[p.name] 
      && !d.contracts[p.name].contracted) {
    d.contracts[p.name].yrs = 1;
    d.contracts[p.name].contracted = true;
    if (d.contracts['_id_' + p.id]) {
      d.contracts['_id_' + p.id].yrs = 1;
      d.contracts['_id_' + p.id].contracted = true;
    }
  }
}));
```

### cpill Injection Sites
```javascript
// renderGM trade history (line 4878) -- after s.assets.join(', '):
// Player names here are in assets array as strings, cpill needs exact name match

// renderTrades heroSide (line 3456) -- after player.nm:
h += '<div class="tc-hero-nm">' + player.nm + cpill(player.nm) + '</div>';

// renderTrades listSide (line 3485) -- after p.nm:
h += '<div class="tc-ln">' + p.nm + cpill(p.nm) + '</div>';

// renderTrades gridSide (line 3524) -- after p.nm:
h += '<div class="tc-gi-nm">' + p.nm + cpill(p.nm) + '</div>';
```

### Sortable Table Pattern
```javascript
// Module-level state (near selConTeam at line 2524):
let conSortCol = 'ktc', conSortDir = -1;

// Sort handler (added as global function):
function sortKeeperSheet(col) {
  conSortDir = conSortCol === col ? -conSortDir : -1;
  conSortCol = col;
  renderKeeperTable();
}

// Sub-render for table only (does NOT re-render full contracts tab):
function renderKeeperTable() {
  var wrap = document.getElementById('con-table-wrap');
  if (!wrap) return;
  // ... build and sort allPlayers array ...
  // ... render table HTML ...
  wrap.innerHTML = tableHtml;
}
```

### Release Badge Pattern
```javascript
// Using existing cbadge helper:
const releaseBadge = (yrs) => yrs === 1 ? cbadge('RELEASABLE', 'red') : '';
// Insert after cpill in relevant locations
```

## CSV Schema Verification (CONT-01 / D-10)

**Status: VERIFIED** -- Live Google Sheets CSV fetched and cross-referenced against parser.

| CSV Column | Header (raw) | Header (cleaned) | Parser Match | Working |
|-----------|-------------|-------------------|-------------|---------|
| Player Name | `Player Name` | `playername` | `includes('player')` | YES |
| Sleeper ID | `Sleeper ID` | `sleeperid` | `includes('sleeper')` | YES |
| Contract Years | `Contract Years` | `contractyears` | `includes('contract')` | YES |
| Tag Status | `Tag Status` | `tagstatus` | `includes('tag')` | YES |
| Exemption | `Exemption` | `exemption` | `includes('exemp')` | YES |
| Notes | `Notes` | `notes` | `includes('note')` | YES |

**Data distribution (307 player rows):**
- Contract years: 120 blank (uncontracted), 65x 1yr, 56x 2yr, 32x 3yr, 15x 4yr, 13x 5yr, 7x 6yr
- Tag status: 12 players tagged (`TRUE`)
- Exemptions: 18 players with exemption years (1x 2023, 5x 2024, 12x 2025)
- All 12 fantasy teams represented

**Not in parser but available in CSV:** POS (index 1), NFL Team (index 2), Fantasy Team (index 3). These would be useful for exemption aggregation (owner mapping) and the keeper sheet (position column).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `exemptions: {}` hardcoded | Aggregate from per-row exemption data | This phase | Enables exemption timeline + ROI sections |
| cpill only in Power Rankings | cpill across Rosters, GM, Trades, Player Profile | This phase | Contract visibility everywhere |
| All waiver players show uncontracted | Waiver = 1-year synthetic contract | This phase | Accurate representation of league rules |

## Open Questions

1. **Exemption HAD/ADDED fields**
   - What we know: The CSV provides only the exemption year per player, not the before/after contract years
   - What's unclear: Whether the Google Sheet can be extended with additional columns for `had_years` and `added_years`
   - Recommendation: Ship with null values (UI handles gracefully with `--`), then Aaron can add columns to the sheet later. The parser's column auto-detection will pick them up automatically if column names contain recognizable keywords.

2. **POS column not parsed**
   - What we know: CSV has POS at index 1, but the parser doesn't capture it since it wasn't needed for basic contract lookup
   - What's unclear: N/A -- straightforward to add
   - Recommendation: Add `posIdx` detection in parser. Needed for exemption data shape (`.pos` field) and keeper sheet (Position column).

3. **Fantasy Team column not parsed**
   - What we know: CSV has Fantasy Team at index 3, needed for exemption owner mapping
   - What's unclear: Whether "Fantasy Team" names in CSV match `D.teams[].team_name` exactly
   - Recommendation: Parse the column, but use Sleeper ID -> roster mapping as primary key for owner lookup. Fantasy Team column as fallback.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None -- vanilla JS, no test framework |
| Config file | None |
| Quick run command | Manual browser testing |
| Full suite command | Manual browser testing |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONT-01 | CSV data flows into D.contracts | manual | Open app, check D.contracts in console | N/A |
| CONT-02 | D.exemption_history populated | manual | `JSON.stringify(D.exemption_history)` in console | N/A |
| CONT-03 | Contract pills in Rosters tab | visual | Browse Rosters, verify pills on all players | N/A |
| CONT-04 | Contract pills in GM Dashboard | visual | Browse GM mode, verify pills in player listings | N/A |
| CONT-05 | Contract years in Trade History | visual | Browse Trades, verify pills on traded players | N/A |
| CONT-06 | Release eligibility indicator | visual | Check 1yr players show RELEASABLE badge | N/A |
| CONT-07 | Exemption tracking display | visual | Navigate Contracts tab, check exemption timeline | N/A |
| CONT-08 | Waiver pickups as 1yr contracts | manual | Find a known waiver player, verify 1yr pill | N/A |
| CONT-09 | Contract cliff chart enhanced | visual | Verify heatmap cards render with data | N/A |
| CONT-10 | Sortable keeper sheet | visual | Click column headers, verify sort changes | N/A |

### Sampling Rate
- **Per task commit:** Open app in browser, verify affected tab renders correctly
- **Per wave merge:** Full tab walkthrough: Contracts, Rosters, GM, Trades, Player Profile modal
- **Phase gate:** All 10 CONT requirements visually verified via browser console + UI inspection

### Wave 0 Gaps
- None -- no test infrastructure to set up for this vanilla JS project. Validation is browser-based.

## Sources

### Primary (HIGH confidence)
- Live Google Sheets CSV verified via `curl` -- column headers, data distribution, exemption values all confirmed
- Codebase analysis: `parseContractCSV` (line 1663), `cpill` (line 2520), `renderContracts` (line 4981), `buildCurrentSeasonData` (line 1812), `openPP` (line 5874)
- Sleeper API transaction types confirmed from existing code: `waiver`, `free_agent`, `commissioner`, `trade`

### Secondary (MEDIUM confidence)
- Exemption data shape inferred from renderContracts timeline UI code (lines 5058-5098) -- the expected properties are clear from the template expressions

### Tertiary (LOW confidence)
- Fantasy Team column name matching against D.teams[].team_name -- needs runtime verification (e.g., CSV says "A.Woods" but Sleeper might have different format)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing code
- Architecture: HIGH -- all patterns verified from codebase, CSV schema confirmed against live data
- Pitfalls: HIGH -- identified 6 concrete pitfalls from code analysis with specific line numbers
- Exemption data completeness: MEDIUM -- CSV lacks had/added fields, but UI handles nulls gracefully

**Research date:** 2026-03-31
**Valid until:** Indefinite for architecture patterns; re-verify CSV schema if Google Sheet structure changes
