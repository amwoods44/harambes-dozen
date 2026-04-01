# Architecture

**Analysis Date:** 2026-03-31

## Pattern Overview

**Overall:** Single-file monolith with layered data flow.

**Key Characteristics:**
- All code (HTML structure, CSS, JavaScript) in one 5,631-line `index.html` file
- Configuration → Network layer → Data pipeline → Helpers → 18 render functions
- Global mutable state: single `D` object holds all application data
- No framework, no build step, no dependencies (PWA-capable)
- Immediate-mode rendering: innerHTML destructively replaces tab contents on updates

## Layers

**Configuration & Globals:**
- Purpose: Store app settings, API endpoints, cache config, singleton functions
- Location: Lines 1405–1520 in `index.html`
- Contains: `CFG` object (user ID, league name, avatars, API URLs), `cache` helper with localStorage TTL logic, `esc()` XSS prevention function
- Depends on: None
- Used by: Network layer, data pipeline, all render functions

**Network & Caching:**
- Purpose: Fetch JSON from APIs with retries, batch requests, cache results with TTL to localStorage
- Location: Lines 1420–1520 in `index.html` (`fetchJSON`, `fetchAll`, `fetchCSV`, `cache` object)
- Contains: `fetchJSON()` with exponential backoff (max 2 retries), `fetchAll()` with concurrency control (8 concurrent), `fetchCSV()` for Google Sheets CSV, cache helpers with quota pruning
- Depends on: Browser fetch API, localStorage
- Used by: Data pipeline

**Data Pipeline (Three Tiers):**
- Purpose: Discover league, fetch current season, fetch historical seasons, assemble into global `D` object
- Location: Lines 1520–2300+ in `index.html`
  - `discoverLeague()`: Lines 1522–1537
  - `fetchCurrentSeason()`: Lines 1539–1565
  - `fetchPlayerDB()`: Lines 1567–1585
  - `fetchDynastyValues()`: Lines 1587–1603 (KTC/FantasyCalc API)
  - `fetchContracts()`: Lines 1605–1614 (Google Sheets CSV)
  - `fetchHistoricalSeason()`: Lines 1668–1702
  - `buildCurrentSeasonData()`: Lines 1765–2037 (assembles D object)
  - `mergeHistoricalData()`: Lines 2039–2300+ (progressive historical merge)

**Helpers & Formatters:**
- Purpose: Convert data to display-ready format (URLs, HTML snippets, colors, icons)
- Location: Lines 2300–2520 in `index.html` (approximate)
- Contains:
  - `PI()` — player thumbnail image URL from Sleeper CDN
  - `PIF()` — full player image URL
  - `TL()` — team logo URL
  - `pimg()` — HTML img tag for player
  - `av()` — avatar HTML with team color circle
  - `tcInit()` — gradient circle with team initials
  - `cpill()` — contract pill HTML
  - `dtierTag()` — dynasty tier badge
  - `tn()` — team name from roster ID
  - `cn()` — coach/manager name from roster ID
  - Position color map, grade gradient map
- Depends on: `D` object, `CFG` (URLs)
- Used by: All render functions

**Render Layer (18 Tab Panels):**
- Purpose: Build HTML strings and inject into panel sections via innerHTML
- Location: Lines 2824–5200+ in `index.html`
- Functions (in order of appearance):
  - `renderPower()` (power rankings, tier system)
  - `renderRosters()` (team rosters with contract pills)
  - `renderTrophies()` (championship history)
  - `renderTrades()` (trade history with grade cards, collapsible sections)
  - `renderMatchups()` (H2H matchup matrix)
  - `renderDraft()` (draft picks with round-based cards, memory lane)
  - `renderAge()` (age distribution, dynasty scatter plot canvas)
  - `renderScoring()` (weekly scoring breakdown, league trends)
  - `renderAwards()` (seasonal awards by category)
  - `renderAnalytics()` (luck analysis, heat maps)
  - `renderMoves()` (transaction feed)
  - `renderGM()` (general manager/owner cards with stats)
  - `renderRivals()` (rivalry breakdowns)
  - `renderContracts()` (keeper/contract sheet view)
  - `renderConstitution()` (league constitution)
  - `renderWarRoom()` (draft board with picks)
  - `renderPulse()` (real-time league activity)
  - `renderChronicle()` (year-over-year history)
- Each function: Builds HTML via string concatenation, sets `document.getElementById('tab-X').innerHTML=h`, attaches event listeners post-render
- Depends on: `D`, all helpers, CSS classes
- Used by: Tab switching logic

**Initialization & Lifecycle:**
- Purpose: Orchestrate data load sequence, render initial UI, bind nav/interaction handlers
- Location: Lines 2526–2700+ in `index.html` (`init()` function)
- Sequence:
  1. Show loading screen
  2. `discoverLeague()` → get current league ID
  3. `fetchCurrentSeason()` → rosters, matchups, transactions, draft
  4. `fetchPlayerDB()` → all NFL players (cached 24h)
  5. `fetchDynastyValues()` → KTC/FantasyCalc (cached 12h)
  6. `fetchContracts()` → Google Sheets (cached 2h)
  7. `buildCurrentSeasonData()` → assemble into `D`
  8. Render all 18 tabs (renderPower, renderRosters, etc.)
  9. Build nav bar and tab switching
  10. Background: Load historical seasons progressively, `mergeHistoricalData()` on each, re-render affected tabs
  11. Fade loading screen
- Depends on: Data pipeline, render layer, DOM
- Used by: Browser (window.DOMContentLoaded)

**Tab Switching & Navigation:**
- Purpose: Switch visible panel, manage scroll, nav bar arrow state
- Location: Lines 2691–2750 in `index.html` (`showTab()`, nav scroll listeners)
- Pattern: Find panel by ID, remove `.active` from all, add `.active` to target, scroll nav bar if needed
- Depends on: DOM, CSS classes
- Used by: Nav buttons, browser history (implied)

**Player Profile Modal:**
- Purpose: Display detailed player info, contract, trades, acquisition
- Location: Lines 5406–5600+ in `index.html` (`openPP()` function)
- Contains: Modal overlay, player stats, contract/KTC section, trade history, acquisition chain
- Depends on: `D.teams`, `D.contracts`, `D.unified_trades`, `D.exemption_history`
- Triggered by: Click on player name/image (listeners added in render functions)

**Lazy-Loaded Modules:**
- html2canvas (share card export): Lines 5300–5312, loaded via CDN for screenshot generation
- Service Worker: Lines 5318–5328 (registers `sw.js` for offline caching)
- PWA Install Banner: Lines 5331–5402 (Chrome + iOS install prompts)

## Data Flow

**Initialization Flow:**

```
Browser DOMContentLoaded
  → init()
    → Show loading screen
    → discoverLeague() [fetch Sleeper API state, user leagues, league chain]
    → fetchCurrentSeason(leagueId) [fetch rosters, users, matchups, transactions, draft]
    → fetchPlayerDB(playerIds) [fetch ~20K players, prune to active + rostered, cache 24h]
    → fetchDynastyValues() [fetch KTC/FantasyCalc, cache 12h]
    → fetchContracts(ktcMap) [fetch Google Sheets CSV, parse contracts, cache 2h]
    → buildCurrentSeasonData() [assemble rosters → teams[], trades, standings, records]
    → D = assembled data object
    → Render all 18 tabs
    → Build nav bar with tab switches
    → Fade loading screen
    → Background: Load historical seasons (2024, 2023, etc.)
      → For each season: fetchHistoricalSeason(leagueId, season)
      → mergeHistoricalData(D, historicalSeasons, playerDB)
      → Re-render affected tabs (Power, Trophies, Trades, etc.)
```

**Rendering Flow (Example: renderPower):**

```
showTab('power')
  → renderPower()
    → Iterate D.teams
    → Compute power score (wins, fpts, youth, pick trades)
    → Build HTML string via concatenation
    → Set document.getElementById('tab-power').innerHTML = html
    → Attach event listeners (collapsible sections, click handlers)
    → No re-fetch (all data in D)
```

**State Management:**

- **Single Source of Truth:** `let D = {}` (global mutable object)
- **What lives in D:**
  - `D.league` — league metadata (name, season, scoring type)
  - `D.teams[]` — array of roster objects with players, stats, owner info
  - `D.rid_to_name` — lookup map (roster ID → team name)
  - `D.teams[].players[]` — player objects with age, KTC value, contract, acquisition
  - `D.contracts` — player name → {yrs, tag, ktc, note}
  - `D.unified_trades[]` — parsed trade objects with grades
  - `D.standings_YYYY` — standings for each historical season
  - `D.champions[]` — championship history
  - `D.trades[]`, `D.moves[]` — transaction logs
  - `D.h2h` — head-to-head matchup records (all-time)
  - `D.pick_trades[]` — traded draft picks
  - Canvas-drawn data: age scatter plots, luck bars, heat maps (computed fresh on render)

- **What does NOT live in D:**
  - Player database (cached separately as `hd_players` in localStorage, passed to helpers)
  - KTC values (cached separately as `hd_ktc`, merged into D during build)
  - HTML DOM (computed on-demand during render)
  - Animation state (lost on innerHTML refresh — design tradeoff)

**Data Mutations:**
- After initial `buildCurrentSeasonData()`, D is mutated progressively:
  - `mergeHistoricalData()` adds `D.standings_2024`, `D.standings_2023`, updates `D.champions[]`, `D.h2h`, `D.trades`
  - Render functions never mutate D (read-only)
  - XSS prevention: all API strings passed through `esc()` before HTML injection

## Key Abstractions

**Team Color Identity (`TC` object):**
- Purpose: Map roster ID → CSS color variable for team theming
- Pattern: Global lookup object with 12 hardcoded entries (one per team)
- Usage: Applied to cards, badges, gradients via `--team-CP`, `--team-AW`, etc. CSS vars
- Files: Inline in index.html (CSS variables defined ~line 69)

**Player Image Resolution:**
- Purpose: Abstract Sleeper CDN image paths
- Pattern: `PI(playerId, size)` returns URL, `PIF(playerId)` for full size
- Handles: Missing images (fallback to gradient circle via `tcInit()`)
- Usage: `<img src="${PI(p.id, 40)}">`

**Contract Pill Rendering (`cpill()`):**
- Purpose: Consistent visual representation of contract status
- Pattern: `cpill(years, tag)` returns HTML span with background color per years remaining
- Handles: Uncontracted (0 years), expiring, long-term, franchise tag
- Usage: Injected into roster rows, player profiles

**Dynasty Tier System:**
- Purpose: Classify players by KTC rank into Elite/Starter/Depth/Dart tiers
- Logic: KTC rank ≤24 (Elite), ≤60 (Starter), ≤120 (Depth), >120 (Dart)
- Implementation: `dtierTag(rnk)` helper
- Visual: Color-coded badges in rosters, contracts tab

**Trade Grades:**
- Purpose: Quantify trade fairness using KTC values
- Grades: A (green, both gain), B (blue, one gains), C (gold, slight edge), D (orange, bad edge), F (red, bad loss)
- Implementation: Computed from `(giving - receiving) / max` ratio, applied post-trade
- Visual: 40px gradient circles with letters, clickable for trade analysis

**Canvas-Based Visualizations:**
- Purpose: Render charts without D3/Chart.js library
- Examples:
  - Age distribution scatter plot (`renderAge()`, ~line 4108): custom canvas context with axis labels, quadrants
  - Luck heat map (`renderAnalytics()`, ~line ~): grid cells with color intensity for win/loss distribution
  - Weekly scoring trend (if rendered): bars drawn directly to canvas
- Pattern: Get canvas element, measure offsetWidth, compute pixel-to-data scale, use ctx.fillRect/fillText

**URL Builders:**
- `PI(playerId, size)` — `sleepercdn.com/content/nfl/players/{id}.png` (thumbnail)
- `TL(team)` — `nfl.com/logos/`-like (team logo)
- CFG-based URLs stored in config for flexibility

## Entry Points

**Primary Entry:**
- Location: `index.html` (browser loading)
- Trigger: Page load → `window.DOMContentLoaded` → `init()`
- Responsibilities: Coordinate all data fetching, build D, render initial state, bind handlers

**Tab Navigation:**
- Location: Nav bar buttons (HTML: `<button class="nav-btn" data-tab="power">POWER</button>`)
- Trigger: Click on nav button
- Responsibilities: `showTab(tabId)` switches visible panel, calls `renderX()` if not yet rendered
- Pattern: Event delegation on nav bar, `dataset.tab` read from button

**Player Profile Modal:**
- Location: Anywhere player name/image is clickable
- Trigger: Click on player element (listener attached in render functions via `onclick="openPP(playerId)"`)
- Responsibilities: `openPP(playerId)` builds modal HTML, opens overlay, binds close handler

**PWA & Service Worker:**
- Location: `sw.js` (service worker file)
- Trigger: Browser registration on load
- Responsibilities: Cache static assets (index.html, manifest, logo), network-first HTML, network-only API
- Offline behavior: Serves cached index.html if network fails (limited functionality without fresh D)

**Share/Export:**
- Location: Share buttons in various tabs
- Trigger: Click export button
- Responsibilities: `openShareModal()` captures tab content with html2canvas, generates PNG download

## Error Handling

**Strategy:** Graceful degradation + fallback to cache + user-visible status updates.

**Patterns:**

**Network Errors:**
- `fetchJSON()` retries twice with exponential backoff (1s, 2s delays)
- If all retries fail, throws error caught by `init()`
- `loadHistory()` catches failures per-season, continues loading others
- User sees: Loading message persists if critical fetch fails, data status badge shows error

**Cache Fallback:**
- Player DB: 24h cache, returns cached if fetch fails
- KTC values: 12h cache, returns empty object `{}` if fetch fails (show "—" in UI)
- Contracts: 2h cache, returns empty if fetch fails (no KTC info displayed)
- Technique: `try/catch` in fetch, return `cache.get(key)` on error

**localStorage Quota Exceeded:**
- Triggered when cache.set() throws QuotaExceededError
- Handler: `cache._prune()` removes oldest historical season caches first, then oldest entries
- Soft limit: 4MB (localStorage max ~5MB)
- User impact: Minimal—historical data pruned before critical caches

**Missing Data Validation:**
- League not found: Throw error "League not found for season YYYY"
- Rosters array empty: Throw "No roster data"
- Invalid data types: Log warning, continue (e.g., roster missing roster_id)
- Missing player in DB: Use player ID as fallback name, continue

**XSS Prevention:**
- All API strings (player names, team names, transactions) passed through `esc()` before HTML injection
- Function: Escapes `&`, `<`, `>`, `"`, `'` to HTML entities
- Applied at data ingestion time (lines 1577 for player names, 1780 for league name, etc.)

**Render-Time Errors:**
- If render function crashes (missing D field, invalid loop), error logged to console
- Panel shows partial/old content (innerHTML not replaced)
- Navigation still works (render errors isolated per function)

## Cross-Cutting Concerns

**Logging:** No structured logging. Errors logged to console via `console.warn()`, `console.log()`, `console.info()`. No request/response logging.

**Validation:**
- Data shape validation in `buildCurrentSeasonData()` (check league, rosters, users exist)
- Player IDs validated as either Sleeper ID or 2-3 character DEF team code
- Contract years parsed as integers, invalid values default to 0 or null

**Authentication:**
- Sleeper API uses public endpoints (no auth needed)
- Google Sheets CSV uses publicly published file
- KTC API no auth required
- User identity: Stored in league metadata (team_name from Sleeper), not authenticated by app

**Performance:**
- Network: Batch fetch with concurrency=8 (matchups, transactions)
- Rendering: Single-pass string concatenation (no DOM diffing)
- Cache: localStorage with 24h–2h TTLs
- Canvas: Drawn fresh on every render (no memoization)
- No lazy loading of tab panels (all 18 render on init)

**Browser Compatibility:**
- ES6 (async/await, arrow functions, const/let, template literals, spread operator)
- CSS Grid/Flexbox required
- localStorage required (PWA functionality depends on it)
- Service Worker registration with fallback to no-op if unsupported
- iOS PWA detection for custom install banner

---

*Architecture analysis: 2026-03-31*
