# Codebase Concerns

**Analysis Date:** 2026-03-31

## Security

**XSS via player names in player profile modal:**
- Risk: Player names from Sleeper API are injected directly into `innerHTML` in the player profile modal without escaping
- Files: `index.html` lines 5502, 5506, 5552 (and scattered throughout render functions)
- Current mitigation: Player names are escaped once at data load (`esc()` at line 1408), but only in the initial data pipeline
- Problem: The app uses unescaped player objects throughout rendering. Template literals in `openPP()` inject `player.name`, `p.nm` directly
- Recommendation: Create a helper function `escapeHTML()` (currently named `esc()`) and apply it to ALL player name injections in render functions, especially in modal content at lines 5502, 5506, 5552

**Input validation on player names:**
- Problem: No validation that player names are safe strings before injection
- Files: `index.html` lines 3323, 3362, 3993, 4240, 5502, 5506, 5552
- Recommendation: Apply `esc()` to all `p.nm` and `player.name` interpolations in template literals

**Hardcoded Google Sheets URL:**
- Files: `index.html` line 1416 — `sheetCsvUrl` in CFG
- Risk: If contract data fetch fails silently, app loads with incomplete data; no validation that CSV parsing succeeded
- Recommendation: Add error logging and user notification if contract sheet fetch fails

## Performance

**Large single HTML file (4,500+ lines):**
- Files: `index.html`
- Problem: All CSS, JS, HTML in one file makes caching inefficient and difficult to maintain
- Impact: Any change requires cache-busting the entire file; can't selectively load/unload modules
- Scaling path: At 5,000+ lines, consider breaking into separate `index.css` and `app.js` even without a build tool

**Multiple render functions with destructive innerHTML rewrites:**
- Files: 44 calls to `.innerHTML =` across `index.html` (lines 2466, 2659, 2677, 2680, 2717, 2750, 2771, 2779, 2793, 2819, 2900, 2936, 2963, 3039, 3245, 3637, 3814, 3928, 4051, 4107, etc.)
- Problem: Every tab switch/re-render destroys and rebuilds entire DOM sections, losing:
  - Animation state (CSS animations won't restart without reflow reset)
  - DOM state (scroll positions, `.open` classes on collapsible cards)
  - Event listeners attached after render (must be re-attached after every render)
- Impact: If render fires again while user is interacting with a panel, state is lost
- Example fragility: Year filter in Trades (`filterTradeYear()`) may cause re-render during filter — scroll position lost
- Recommendation: Identify critical interactive elements (Trades year filter, Rosters collapsibles) and preserve their state across renders

**Inefficient historical data loading:**
- Files: `index.html` ~line 1640-1660
- Problem: Historical seasons load in background with no progress feedback; each season fires full re-render of 16+ tabs
- Impact: Unnecessary paints during `mergeHistoricalData()`; especially slow on first load with multiple seasons
- Improvement path: Load historical data only for tabs that use it (Power Rankings, Trophies, Analytics), not entire app

**localStorage quota management with brute-force pruning:**
- Files: `index.html` lines 1492-1517 (cache._prune)
- Problem: When cache quota exceeded, prune loop removes entries until under 4MB soft limit — but no throttling on how often this runs
- Risk: If user visits app with ~5MB of other data in localStorage, every cache write triggers expensive iteration
- Recommendation: Add timestamp throttling so prune only runs once per minute

## Technical Debt

**Global mutable state object (D):**
- Files: `index.html` line 1405 — `let D = {}`
- Problem: All app state lives in a single mutable object; no immutability guarantees, no change tracking
- Impact: Difficult to debug data mutations; easy to accidentally corrupt state; render functions depend on D implicitly
- Trade-off: Changing this requires refactoring all 18 render functions and the data pipeline
- Status: Load-bearing architectural decision per project CLAUDE.md — not a candidate for immediate refactor
- Recommendation: Document D structure (keys, shapes, update order) in a comment block to help future editors

**Hardcoded NFL kickoff date:**
- Files: `index.html` line 2676 — `new Date('2026-09-10T20:20:00')`
- Problem: Date is hardcoded; must be manually updated each NFL season
- Impact: After 2026 season ends, countdown will show "NFL IN SEASON" permanently
- Fix approach: Move date to CFG object and add comment requiring update before each season

**Mixed var/let/const declarations:**
- Files: Throughout `index.html` script section
- Problem: Legacy var declarations mixed with let/const from iterative development
- Impact: Slightly affects readability and hoisting behavior
- Fix approach: Not urgent; consolidate to const/let over time as code is touched

**No input sanitization for team names or user input:**
- Files: Various render functions
- Problem: Team names from Sleeper API are injected without escaping (though less risky than player names)
- Recommendation: Apply `esc()` to all dynamic text interpolations, not just players

**Contracts sheet currently returns empty data:**
- Files: `index.html` line 1416 — `sheetCsvUrl` points to placeholder
- Problem: Contract data fetch succeeds but returns no contracts; app loads successfully with missing data
- Impact: Contract pills, years remaining, exemption tracking all non-functional
- Recommendation: Add error/warning banner if contract data is empty, or document contract sheet requirement

## Fragile Areas

**Tab rendering during filter state changes:**
- Files: `index.html` lines 3256-3258 (Trades year filter), lines 2965-2966 (Matchups comparison selector)
- Problem: Filter change (`filterTradeYear()`, `updateCmp()`) updates `D` then re-renders entire panel
- Fragility: If user scrolls to position in filtered view, then filter changes, scroll position lost
- Safe modification: Cache scroll position before innerHTML assignment, restore after
- Test coverage: No tests for filter + scroll interaction

**Player profile modal with nested event listeners:**
- Files: `index.html` lines 5407-5620
- Problem: Modal content is built via template literal and inserted with `innerHTML`; event listeners are delegated globally (line 5615-5617)
- Fragility: If modal rendering changes, event delegation may break silently
- Safe modification: Maintain `.pp-trigger` class and `data-pid` attribute contract
- Test coverage: No automated tests for modal interaction

**Game classification (Thriller/Blowout) based on point differential:**
- Files: Likely in matchups/H2H rendering; classification rules hardcoded
- Problem: Rules for "thriller" (close game) vs "blowout" vs "normal" not centralized
- Fragility: If rules change, multiple render functions must be updated
- Safe modification: Extract to single `classifyGame(pointDiff)` function
- Test coverage: No unit tests for classification logic

**Team color mapping (TC object):**
- Files: `index.html` lines 68-71 (CSS variables in :root), likely lines 2700+ (TC object initialization)
- Problem: Team colors are set via CSS custom properties and also built into JS at runtime
- Fragility: If a team is renamed or colors change, both CSS and JS must be updated
- Recommendation: Single source of truth for team identity (roster_id → color, name mapping)

**PWA manifest and service worker paths hardcoded:**
- Files: `index.html` line 11 (manifest.json), line 5325 (sw.js registration)
- Problem: Paths are absolute `/manifest.json` and `/sw.js`; won't work on GitHub Pages subdirectory `/harambes-dozen/`
- Impact: PWA installation and offline support don't work on deployed site
- Fix approach: Rewrite paths to use relative URLs or detect base path from location.origin

**cache.usage() called on every write; iterates localStorage:**
- Files: `index.html` lines 1483-1489, called from line 1512 in _prune loop
- Problem: Loop iterates localStorage.length on every quota check; O(n) operation
- Risk: If localStorage has 100+ entries, this becomes slow
- Recommendation: Cache the total size in a module variable, update only on set/remove

## Known Bugs

**Draft timeline tooltip flickering:**
- Symptom: Tooltip at line 3979 may not track cursor correctly
- Files: `index.html` line 3979, CSS class `.draft-hist-tip` at line 1340
- Cause: Tooltip positioned with `position:fixed` but may be clipped by parent scroll
- Workaround: Hover over draft timeline dots works, but tooltip may lag
- Fix approach: Switch tooltip to `position:absolute` relative to parent and use Portal-like pattern

**Empty state icons animate indefinitely:**
- Symptom: "Loading data..." message shows floating icon animation even after data loads
- Files: `index.html` line 1109 (`.emptyFloat` animation), line 2466 (injectEmptyStates)
- Cause: Empty states are injected once but never cleared; animation continues
- Impact: Visual noise, minor; doesn't affect functionality
- Fix approach: Clear empty states after first successful render, or hide animation on populated tabs

**Scroll position lost on historical data merge:**
- Symptom: User scrolls to view in Power Rankings, historical data loads and merges, scroll jumps to top
- Files: `index.html` ~line 1640-1660 (loadHistory), line 1764+ (mergeHistoricalData)
- Cause: `renderPower()` re-runs without preserving scroll position
- Impact: User must re-scroll after ~10 seconds when historical data arrives
- Fix approach: Cache scroll position before merge, restore after render

**contract.tag rendering without quotes in template literal:**
- Symptom: Contract tags render but may break if tag contains special characters
- Files: `index.html` line 5469 — `con.tag.toUpperCase()` injected directly
- Risk: Low (tag is unlikely to contain quotes), but should be escaped
- Fix approach: Wrap with `esc()`: `esc(con.tag.toUpperCase())`

## Performance Bottlenecks

**FantasyCalc KTC API called every session:**
- Files: `index.html` line 1417 — `ktcUrl` in CFG
- Problem: No caching; 20K+ player database fetched every app load
- Impact: ~1-2 second API call on every session; can exceed in slow network
- Improvement path: Cache for 24 hours; only refresh if user explicitly requests

**Concurrent fetch limit hardcoded to 8:**
- Files: `index.html` line 1436 — `fetchAll(urls, concurrency=8)`
- Problem: 8-concurrent limit may be too aggressive on slow networks, too conservative on fast
- Recommendation: Detect network speed and adjust, or increase to 16 (modern browsers handle this fine)

**Player profile modal renders full trade history on every open:**
- Files: `index.html` lines 5420-5530 (openPP function)
- Problem: Filters entire `D.unified_trades` array on every modal open
- Impact: Negligible for current data size, but scales poorly if trade history grows
- Improvement path: Index trades by player_id at data load time

## Scaling Limits

**localStorage capacity (5MB total):**
- Current usage: Player DB (24hr TTL), all seasons' rosters, users, matchups, transactions, drafts
- Limit: Browser localStorage max is ~5MB
- Scaling path: If adding new data sources or more historical seasons, will hit quota
- Recommendation: Implement data prioritization in _prune (already done — historical goes first)

**20K+ player database in memory:**
- Current: ~20K active NFL players + roster players
- Scaling limit: If app grows to include practice squad, draft board, or free agent tiers, memory grows linearly
- Recommendation: Lazy-load player DB if size exceeds 50MB

## Scaling Concerns

**19 tab panels (16+ render functions) in single script:**
- Files: `index.html` — one 4,500-line file
- Problem: Tab switching is instant (already rendered), but initial load renders all tabs even if user never views them
- Scaling path: Lazy-render tabs on demand (first click loads render, caches result)
- Current impact: Negligible for 19 tabs; becomes problem with 30+

## Missing Critical Features / Data Validation

**No contract data fallback:**
- Files: `index.html` line 1416 (sheetCsvUrl) — returns empty
- Problem: Contract pill system depends on Google Sheets import, which currently doesn't work
- Impact: Contract count, years remaining, exemption status all missing
- Blocking: Can't fully evaluate league constitution or GM strength without contracts
- Fix approach: Implement CSV parsing from Sheets, or provide manual contract entry UI

**No error recovery for partial API failures:**
- Files: `index.html` ~line 1540-1560 (fetchCurrentSeason)
- Problem: If one API call fails (e.g., traded_picks), whole season load fails
- Impact: App shows loading spinner indefinitely if any endpoint times out
- Recommendation: Load what succeeds, show banner if partial data

**No validation of Sleeper API response structure:**
- Files: Throughout data pipeline (lines 1520-1800)
- Problem: If Sleeper API changes response shape, app silently receives undefined
- Impact: Example: If `rosters[i].roster_id` is missing, roster association breaks
- Recommendation: Add schema validation or at least null checks on critical fields (already done for roster_id at line 1775)

---

*Concerns audit: 2026-03-31*
