# Phase 3: Contracts Complete - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

The contracts system becomes fully functional — data flows reliably from Google Sheets, contract pills appear across all relevant tabs (Rosters, GM Dashboard, Trade History), the cliff chart visualizes expiration risk, exemption history is populated and displayed, and the Contracts tab is the definitive keeper-league reference with a sortable master sheet.

Key insight from codebase scout: The contracts tab and pipeline are FAR more built-out than the roadmap's "TBD" suggests. `renderContracts()` already has ~200 lines with stat cards, team filters, tagged/expiring sections, exemption timeline UI, team health bars, dynasty value rankings, contract cliff heatmap, and exemption ROI. The work is completing gaps and distributing contract visibility across other tabs — not building from scratch.

</domain>

<decisions>
## Implementation Decisions

### Exemption Data Pipeline
- **D-01:** The CSV parser (`parseContractCSV`) currently returns `exemptions: {}` always — `D.exemption_history` is never populated from actual data. The exemption timeline UI in renderContracts exists but renders nothing. Fix: parse exemption data from the Google Sheets CSV. The Excel source (`Harambe's Dozen FF 2025 (AW Version).xlsx`) contains exemption records — these need to be in the published Google Sheet.
- **D-02:** The parser already detects `exm` (exemption) per player row. The missing piece is aggregating these into the `{year: [{player, owner, had, added, new_yrs, ...}]}` shape that `D.exemption_history` expects. Build this aggregation inside `parseContractCSV` or as a post-processing step in `buildCurrentSeasonData`.

### Contract Pill Distribution
- **D-03:** `cpill()` currently appears ONLY in `renderRosters()` starters (line 2987). Extend to: bench players in Rosters, GM Dashboard player listings, Trade History trade cards, and Player Profile modal. This satisfies CONT-03, CONT-04, CONT-05.
- **D-04:** `cpill(playerName)` already handles the lookup via `D.contracts[name]` — no API change needed, just insert `cpill(p.name)` at more render sites.

### Contract Cliff Visualization
- **D-05:** The current contract cliff uses heatmap cards per team (grid of colored cells per year). CONT-09 says "stacked area." Keep the existing heatmap card approach — it's already broadcast-quality and more visually distinctive than a generic stacked area chart. Enhance if needed (add tooltips, bigger cells) but don't replace with a charting pattern.

### Sortable Keeper Sheet
- **D-06:** Add a master player table below the existing visual sections in the Contracts tab. Columns: Player, Team, Pos, Years, Tag, Exemption, KTC Value. Sortable by clicking column headers. This is the "keeper sheet" — the data-dense reference view.
- **D-07:** Default sort: by KTC value descending (most valuable assets first). Secondary sorts available on all columns.

### Release Eligibility
- **D-08:** Players with exactly 1 year remaining show a "RELEASABLE" indicator — either as a badge next to cpill or as a distinct visual state in the expiring section. This is CONT-06.

### Waiver Auto-Assignment
- **D-09:** Players acquired via waiver wire (detectable from `D.transactions` move type) who don't have a contract entry in the sheet should auto-display as 1-year contracts. This is CONT-08. Implementation: in `buildCurrentSeasonData` post-processing, check transactions for waiver adds and create synthetic 1-year contract entries.

### CSV Schema Verification
- **D-10:** Before any implementation, verify the live Google Sheets CSV format against the parser's expected columns. The parser looks for columns containing: 'player'/'name', 'sleeper'/'id', 'contract'/'years', 'tag', 'exemp', 'note'. If the live sheet diverges, fix the parser to match.

### Claude's Discretion
- Exact sort implementation (in-memory array sort vs DOM manipulation)
- Whether to add a search/filter to the keeper sheet
- Column header styling for sort indicators (arrows, color change)
- How to detect waiver pickups from transaction types in D.transactions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, broadcast quality bar
- `.planning/REQUIREMENTS.md` — CONT-01 through CONT-10 acceptance criteria
- `CLAUDE.md` — Design quality bar, re-render safety rules, code conventions

### Codebase Architecture
- `.planning/codebase/ARCHITECTURE.md` — Data pipeline, render function patterns, D object structure
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, HTML string building, cpill/dtierTag helpers
- `.planning/codebase/STACK.md` — Caching strategy, CDN patterns, localStorage limits

### Prior Phase Context
- `.planning/phases/01-infrastructure-hardening/01-CONTEXT.md` — CSV failure warning banner (D-01), guard clauses (D-03/D-04), esc() coverage (D-07)
- `.planning/phases/02-narrative-delight/02-CONTEXT.md` — Badge/icon patterns, broadcast header conventions

### Data Source
- `Harambe's Dozen FF 2025 (AW Version).xlsx` — Source contract and exemption data (for verifying Google Sheets schema)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `cpill(playerName)` at line 2520 — contract pill helper, already styled with 4 color tiers, handles tag/exemption indicators
- `conCard(player, opts)` — contract player card builder used in renderContracts strips
- `cbadge(text, color)` — small badge helper used for TRADED, EARLY EXT, EXPIRING SAVE labels
- `stripWrap(labelBg, tag, num, numCol, sub, cards)` — horizontal scrollable card strip builder
- `dtierTag(rank)` — dynasty tier badge (Elite/Starter/Depth/Dart) already on player names
- `fetchCSV(url)` at line 1487 — CSV fetcher, working
- `parseContractCSV(csv, ktcMap)` at line 1663 — CSV parser with column auto-detection

### Established Patterns
- Contract data flows: `fetchContracts()` → `parseContractCSV()` → `buildCurrentSeasonData()` assigns `D.contracts` and `D.exemption_history`
- Synthetic entries: `buildCurrentSeasonData()` already creates `D.contracts` entries for rostered players not in the sheet (uncontracted, with KTC backfill)
- Team filter pills: `selConTeam` variable + `renderContracts()` re-render pattern (established, works)
- Player profile modal (`openPP()`) already has a `.pp-contract-block` section — contracts are shown if data exists

### Integration Points
- `renderRosters()` line 2987 — existing cpill call (starters only, needs bench expansion)
- `renderGM()` — player listings need cpill insertion
- `renderTrades()` — trade cards need cpill on player names
- `openPP()` — player profile already shows contract block, verify it reads D.contracts correctly
- `buildCurrentSeasonData()` line 1896 — where D.contracts is assigned, add exemption aggregation
- `parseContractCSV()` line 1711 — where `exemptions: {}` is hardcoded, needs real data

### What Already Works (Do Not Rebuild)
- renderContracts() stat cards, team filter pills, tagged/expiring sections
- Contract cliff heatmap cards
- Team health bars, dynasty value rankings
- Exemption timeline UI (just needs data)
- Exemption ROI section (just needs data)
- cpill() styling and logic
- CSV parser column auto-detection

</code_context>

<specifics>
## Specific Ideas

- The exemption timeline cards in renderContracts are already broadcast-quality (colored borders, flow diagrams showing HAD → ADDED → NEW). They just need data.
- The contract cliff heatmap is more visually distinctive than a generic stacked area chart — keep it.
- cpill distribution should be surgical — add to existing render sites, don't restructure the render functions.
- The sortable keeper sheet should feel like a sports reference table (pro-football-reference style) not a spreadsheet.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-contracts-complete*
*Context gathered: 2026-04-01*
