# Harambe's Dozen — Dynasty HQ

## Project Overview

Fantasy football dynasty league dashboard for a 12-team PPR league. Single-file vanilla app pulling live data from the Sleeper API. Deployed on GitHub Pages at `amwoods44.github.io/harambes-dozen/`.

## Tech Stack

- **Frontend:** Vanilla HTML + CSS + JS in a single `index.html` (~4,500 lines)
- **Data:** Sleeper.app REST API (live), Google Sheets CSV (contracts — currently placeholder)
- **Storage:** Browser localStorage with TTL-based cache
- **PWA:** Service worker (`sw.js`) + manifest for installable app
- **Charts:** Custom canvas rendering (no D3, no charting library)
- **Dependencies:** Zero runtime. html2canvas loaded via CDN for share cards only
- **Build:** None. Ship `index.html` as-is
- **Hosting:** GitHub Pages (static)

## Architecture

```
index.html
├── <style> — ~1,090 lines of CSS (design tokens, components, responsive)
├── <body>  — Loading screen, header, hero, cast strip, nav, 18 tab panels, footer
└── <script>
    ├── Config (CFG) + fetch utilities + cache helpers
    ├── Data pipeline: discoverLeague → fetchCurrentSeason → fetchPlayerDB → buildCurrentSeasonData
    ├── Historical: loadHistory → mergeHistoricalData (background, progressive re-render)
    ├── Global state: let D = {} (single mutable object holds all app data)
    ├── 18 render functions: renderPower(), renderRosters(), renderTrades(), etc.
    ├── URL builders: PI() (player thumb), PIF() (player full), TL() (team logo)
    ├── Helpers: pimg() (player img HTML), av() (avatar → tcInit), tcInit() (gradient circle), cpill() (contract pill), dtierTag() (tier badge)
    └── PWA install banner + service worker registration
```

**Key patterns:**

- Configuration lives in the `CFG` object (~line 1141): `userId`, `leagueName`, `sheetId`, `avatarOverrides`, API base URLs
- Caching via the `cache` object (~line 1188): `get(key)`, `set(key, data, ttl)`, `has(key)` wrapping localStorage
- Each tab has a `renderX()` function that builds HTML via string concatenation and sets `innerHTML`
- Tab switching calls `showTab(id)` which toggles `.active` class on panels
- Team identity colors live in the `TC` object (keyed by roster_id)
- Player images come from Sleeper CDN: `sleepercdn.com/content/nfl/players/`
- Avatar fallbacks use gradient circles with team-colored initials via `tcInit()`

## Design Quality Bar (MANDATORY)

The bar: a leaguemate opens this and says "one person built this? It's the best fantasy app I've ever seen." Not compared to side projects — compared to ESPN, compared to any fantasy app that exists. That feeling comes from obsessive attention to every detail.

- **Lead with composition, not components.** Ask "what should dominate this space?" before "what elements go inside this container?" Start with the dominant element, the visual hierarchy, where the eye goes — then break it into parts
- **One dominant element per screen.** Every tab needs ONE thing that's significantly larger than everything else — a number, a name, a stat. Everything else serves that element. If everything speaks at the same volume, nothing speaks.
- **Draft board cards are the visual gold standard.** The teal/dark gradient backgrounds, position badges, headshots with college logos, round/pick numbers — this is the level of craft every card in the app should match.
- **Beat ESPN, don't just parody it.** The broadcast aesthetic is the foundation but we're not constrained to looking like ESPN. If we can be cleaner, more modern, more refined — do it.
- **Developer labels are not broadcast copy.** "COMPOSITE SCORE * 2026 OFFSEASON" reads like a developer subtitle. "SEASON RANKINGS" reads like a broadcast graphic. Every label should be punchy and confident, not descriptive and technical.
- **Empty space is a design element.** Let things breathe. A section with room around it feels more important than one crammed between two others.
- **Depth, not flatness.** Use gradients, subtle shadows, and layering to create dimension. Flat colored text on dark backgrounds feels cheap. Layered, dimensional surfaces feel premium.
- **Interactions should reward you.** Every click, hover, and transition should feel satisfying. Tab switches should feel like a camera cut. Expanding a card should feel like opening something. Sorting should feel responsive.
- If a design looks like "a styled div with smaller styled divs inside it," it's not done
- Go bold first, pull back if needed — don't iterate timidly

After any UI change, run `/visual-verify` before considering the task done.

## Design System

**Palette:** Dark warm theme. Base `#120e0c`, accent red `#cc0000`, gold `#ffcc00`
**Fonts:** Space Grotesk (display/headings — modern geometric, authoritative), Inter (body text), DM Sans (stats/numbers — clean geometric, sharp for data without monospace "code editor" feel). Oswald and JetBrains Mono are being phased out — Oswald is too "free sports template," JetBrains Mono feels too "developer tool."
**Font weights:** 600-800 on headings is intentional — authority and confidence, not decoration
**Spacing:** 4px base unit (`--sp-1` through `--sp-10`). Strict rhythm: 24px between major sections, 12px within sections, 8px between tight elements.
**Card system:** ONE visual language with variants. Draft board cards are the reference standard — gradient backgrounds, position badges, headshots, layered information. All other card types should share this DNA.
**Component identity:** Broadcast headers (`.bh`) with angled clip-path, team-colored accents throughout

## Code Conventions

- Vanilla JS only. No framework, no build tools, no npm
- CSS custom properties for all colors, spacing, typography, shadows
- Inline styles in render functions are common (tech debt, not preference)
- Global `D` object is the single source of truth for all data
- Functions are flat — no classes, no modules, no imports
- `var` and `function` declarations mixed with `const`/`let` — legacy from iterative development

## Implementation Self-Review (MANDATORY)

After completing any multi-step implementation, before declaring it done, run this check on every item delivered:

1. **Does it actually work end-to-end?** Not "the code looks right" — trace the full execution path. Does data flow all the way through? Does the UI update correctly?
2. **Is there a subtle bug or gap I glossed over?** Only works on first load, or only in the happy path, or only when a certain condition is true?
3. **Could this be done more correctly?** Not more cleverly — more correctly. Is there a browser API, CSS behavior, or JS pattern that would make this more robust?

If yes to any — surface it unprompted before declaring done.

### Re-render safety (this app specifically)

Every render function is destructive — it overwrites `innerHTML` entirely. Before shipping any interactive UI pattern, answer: "what happens when this panel's render function runs again while the user is looking at it?" That happens on dirty flag flushes, filter changes (year selects in Trades/Draft), GM selects, and historical data merges. Three things die silently:

1. **CSS animation state** — won't restart without a reflow reset (`el.style.animation='none'; el.offsetHeight; el.style.animation=''`)
2. **DOM state** — `.open` classes, scroll positions, user selections are wiped
3. **Post-render event listeners** — any listener added after `innerHTML` needs re-attachment after every render

### Data → rendering claims

When claiming a data change affects rendering, verify two things: (1) **render order** — does the render function fire after the data is populated? Check `init()` and `loadHistory()` call sequences. (2) **Conditional display guards** — `if(p.ktc)` treats 0 as falsy, so a successful data fix and a broken pipeline look identical from the outside. Grep for the actual read sites, don't reason about them.

## Git

- Commit format: `type(scope): description`
- Types: `feat`, `fix`, `deploy`
- Scopes: `nav`, `design`, `a11y`, `ui`, `player`, `layout`, `js`, `visual`, `analytics`
- Push only when explicitly asked
- Atomic commits — one logical change per commit

## Data Flow

1. `init()` discovers the league via Sleeper API (user ID + league name)
2. Fetches current season: rosters, users, matchups (per week), transactions, draft picks
3. Fetches full NFL player database (~20K players, pruned to active + rostered)
4. Fetches contracts from Google Sheets CSV (currently `PLACEHOLDER_SHEET_ID` — returns empty)
5. `buildCurrentSeasonData()` assembles everything into `D`
6. All 16+ render functions fire, populating tab panels
7. Background: historical seasons load and `mergeHistoricalData()` progressively re-renders affected tabs

**Cache strategy:** localStorage with TTL. Player DB cached 24hrs. If API fails, falls back to cached `D`.

## Known Issues & Debt

- **ESPN logo in loading screen:** Base64-encoded ESPN image at line ~1096. Should be the Harambe logo
- **PWA paths hardcoded to root:** `/sw.js` and `/manifest.json` won't resolve on GitHub Pages subdirectory (`/harambes-dozen/`)
- **No input sanitization:** Player names from Sleeper API are injected directly into innerHTML (XSS surface)
- **No .gitignore:** Excel files, backup files, and PNGs are tracked that probably shouldn't be
- **Hardcoded NFL kickoff date:** `2026-09-10T20:20:00` in `updateCD()` — must be manually updated each year

## Session Start (This Project)

1. Check `docs/superpowers/plans/` — active implementation plans live here
2. Check `docs/superpowers/specs/` — design specs live here
3. Run `git log --oneline -5` — see what recently shipped
4. Run `git status` — check for untracked files that may be in-progress work
5. After any session where code changed, scan Known Issues, Architecture, Data Flow, and File Map for stale claims — remove or update inline, same commit

## What NOT to Do

- Don't introduce a framework (React, Vue, etc.) — the zero-dependency approach is intentional
- Don't add npm/node/build tools without discussing tradeoffs first
- Don't refactor the global `D` object into modules — the single-object pattern is load-bearing
- Don't change font weights to 500 max — the 700-900 weights are the broadcast identity
- Don't add TypeScript — this is a vanilla JS project
- Don't create `docs/handoff.md` or `docs/PROJECT-TRACKER.md` — those are Project Bridge conventions

## File Map

| File | Purpose |
|------|---------|
| `index.html` | The entire app — CSS + HTML + JS |
| `FEATURES.md` | Feature inventory and status |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (cache strategy) |
| `harambe-logo.png` | App logo |
| `Kevin.png`, `Chuck.png` | Custom manager avatar overrides |
| `features.html` | Marketing/status page (not the app) |
| `Harambe's Dozen FF 2025 (AW Version).xlsx` | Source contract/exemption data for Google Sheets import |
| `index.html.backup` | Pre-refactor snapshot |
| `*.png` (Avatars, ChampionExample, PlayerProfile) | Documentation screenshots, not app assets |

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Harambe's Dozen — Dynasty HQ**

The world's most polished dynasty fantasy football league companion app. An ESPN-level broadcast parody dashboard for the 12-team Harambe's Dozen PPR dynasty league, pulling live data from Sleeper API. Not replacing Sleeper — expanding it with deeper analytics, richer history, and presentation quality that makes 12 leaguemates feel like their league has its own media network. Single-file vanilla app deployed on GitHub Pages, designed to eventually be templatable for any Sleeper dynasty league.

**Core Value:** Every screen looks like it belongs on a broadcast — not a developer's side project. If it doesn't feel like ESPN's dynasty coverage, it's not done.

### Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only. No framework, no build tools, no npm. Zero runtime dependencies.
- **Architecture**: Single `index.html` file. Global `D` object is the data store. Not refactorable to modules without breaking everything.
- **Hosting**: GitHub Pages (static files only, no server-side logic).
- **Data**: Sleeper API (public, rate-limited by courtesy), Google Sheets CSV (manual contract data entry), FantasyCalc (public).
- **Timeline**: ASAP — no hard deadline, but urgency to ship.
- **File size**: Already at ~5,600 lines. Will grow. Accepted tradeoff of the single-file approach.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- **JavaScript** (Vanilla ES6+) — 100% of runtime code in `index.html` (~3,400 lines of script)
- **HTML5** — Document structure and semantic markup in `index.html`
- **CSS3** — Styling and design tokens (~1,090 lines of CSS in `index.html`)
- **JSON** — Configuration formats (`manifest.json`, `sw.js`)
## Runtime
- Browser-native JavaScript — no Node.js, no build tools, no transpilation
- Supported browsers: Modern evergreen (Chrome, Firefox, Safari, Edge)
- PWA-capable: Installable to home screen via `manifest.json`
- None. Zero npm dependencies
- No `package.json`, no lock files
- No node_modules directory
## Frameworks
- None. Vanilla HTML + CSS + JS
- No React, Vue, Svelte, or framework of any kind
- DOM manipulation via direct `innerHTML` string concatenation
- Native Service Worker API (`sw.js`) for offline caching and asset management
- Web App Manifest (`manifest.json`) for home screen installation
- Cache-first strategy for static assets, network-first for data
- Custom canvas rendering (no D3, Plotly, or charting library)
- Canvas 2D API for consistency scatter plot in `renderAnalytics()`
- SVG inline for icons (hand-written path data)
## Key Dependencies
- **html2canvas** `v1.4.1` — CDN-loaded only for player profile share cards
- Fetch API for HTTP requests
- LocalStorage for TTL-based caching
- Service Worker API for offline support
- Canvas 2D API for chart rendering
- Web App Manifest API for PWA installation
## Configuration
- Located at `~line 1411` in `index.html`, in `const CFG` object:
- None. All configuration is hardcoded in CFG object
- Secrets: None (Sleeper API is public, no auth required)
- No build step. `index.html` ships as-is to GitHub Pages
- No minification, bundling, or transpilation
- Hosted on GitHub Pages at `amwoods44.github.io/harambes-dozen/`
- Git repository: `harambes-dozen-repo`
- No CI/CD pipeline (manual push deploys)
## Caching Strategy
- LocalStorage (limit ~5MB per origin) with TTL-based invalidation
- Cache manager: `const cache` object at line 1461 in `index.html`
- `hd_players` — NFL player database, 24-hour TTL, ~1-2MB
- `hd_ktc` — FantasyCalc dynasty values, 12-hour TTL
- `hd_hist_[season]` — Historical season data, no TTL, pruned first if quota exceeded
- `hd_[leagueId]_[season]` — Current season data, persisted across sessions
- Cache name: 'harambes-dozen-v5' (see `sw.js`)
- Strategy: Cache-first for static assets, network-first for HTML, network-only for API calls
- Assets in cache: `./`, `manifest.json`, `harambe-logo.png`
## Web Fonts
- `Oswald` — Display/headings — weights 300, 400, 500, 600, 700, 800, 900
- `Inter` — Body text — weights 400, 500, 600, 700, 800, 900
- `JetBrains Mono` — Monospace/stats — weights 500, 600, 700, 800
- Load URL: `https://fonts.googleapis.com/css2?family=Oswald:wght@300..900&family=Inter:wght@400..900&family=JetBrains+Mono:wght@500..800&display=swap`
- Preconnect to `https://fonts.gstatic.com` for performance
## Icons & Assets
- `harambe-logo.png` — App logo, 192x192 and 512x512 (PWA), committed to repo
- Custom avatar images: `assets/avatars/*.png` (Kevin.png in avatarOverrides)
- Player headshots: Fetched from Sleeper CDN (`sleepercdn.com/content/nfl/players/`)
- Team logos: Fetched from Sleeper CDN (`sleepercdn.com/images/team_logos/nfl/`)
- Manager avatars: Fetched from Sleeper CDN (`sleepercdn.com/avatars/thumbs/`) or local overrides
- Hand-written path data in `icon()` helper function (line ~3850)
- Icons: trophy, crown, fire, target, bolt, dice, seedling, trade, ghost, draft, info, building, etc.
- Colors: Passed as parameter, not baked into SVG
## Static Files
- `index.html` — Complete app (395KB)
- `sw.js` — Service worker (1.4KB)
- `manifest.json` — PWA manifest (565B)
- `harambe-logo.png` — Logo asset (257KB)
- `assets/avatars/Kevin.png`, `Chuck.png` — Custom manager avatars
- `node_modules/` — N/A (no dependencies)
- Build artifacts — N/A (no build step)
- Cache: Generated at runtime in browser localStorage
## Platform Requirements
- Any text editor (no IDE required)
- Git for version control
- Browser DevTools for debugging (no build tools needed)
- Tested on: Chrome, Safari (macOS), Firefox
- Deployment: GitHub Pages (free static hosting)
- Origin: `amwoods44.github.io`
- Path: `/harambes-dozen/`
- HTTPS: Yes (GitHub Pages enforced)
- Custom domain: Not configured
- Storage limit: Browser localStorage ~5MB per origin (no server storage)
- Modern browser with ES6 support
- Service Worker support (for offline mode)
- LocalStorage enabled
- Cookies: Not required (no server sessions)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Code Style
- Minified CSS and HTML inline within `<style>` tags
- JavaScript is formatted with minimal whitespace (semi-colon terminated statements)
- 2-space indentation in readable sections; no tabs
- Lines are kept compact — CSS class selectors chain without spaces
- No formal linter configured
- Console warnings used for data validation failures (`console.warn()`)
- Console errors for init failures (`console.error()`)
- Console info for cache operations (`console.info()`)
- Inline styles in HTML strings are very long (200+ chars common in render functions)
- CSS selectors and property chains acceptable at any length
- JavaScript function chains acceptable if single-line
## Naming Patterns
- Single file: `index.html` contains all app code
- Configuration: `manifest.json` (PWA manifest), `sw.js` (service worker)
- Assets: Lowercase with hyphens: `harambe-logo.png`
- camelCase: `renderPower()`, `buildCurrentSeasonData()`, `findAcquisition()`
- Utility functions often short: `av()` (avatar), `tn()` (team name), `PI()` (player image), `TL()` (team logo)
- Event handlers: `filterTradeYear()`, `toggleTradeShowAll()`, `showShareCard()`
- Render functions: `render[TabName]()` pattern — `renderTrophies()`, `renderDraft()`, `renderAge()`
- camelCase for local/module scope: `D` (global state object), `CFG` (configuration), `TC` (team colors), `TABS` (tab list)
- UPPER_SNAKE_CASE for constants: `SEASON_YEARS`, `CURRENT_YEAR`, `FIRST_YEAR`, `YEAR_RANGE`, `NUM_SEASONS`, `CUR_STANDINGS`, `TOTAL_GAMES`, `CACHE_QUOTA_WARN`
- Short single-letter in hot loops: `h` (HTML accumulator), `i` (iteration), `r` (roster), `p` (player), `t` (team), `c` (color)
- Collections plural: `teams`, `players`, `trades`, `moves`
- State variables prefixed with `sel` (selected): `selGM`, `selWk`, `aTab`, `selConTeam`, `selMoveTeam`
- No TypeScript — vanilla JavaScript only
- Objects use lowercase property keys: `{roster_id, owner_id, team_name, wins, losses}`
- Sleeper API keys preserved as-is: `fpts_decimal`, `user_id`, `owner_id`
- Contract objects: `{nm, yrs, tag, exm, ktc, contracted}` (custom shape)
- Team colors object: `TC[roster_id] = {p: '#HEX', s: '#HEX', i: 'ABBR'}`
## Comment Style
- Section headers use bold dividers: `/* ═══ HEADER ═══ */`
- Subsections use em-dash: `/* -- Typography -- */`
- Functional comments minimal — mostly in data transformation sections
- No JSDoc or TypeScript comments
- Function purpose inferred from name and parameter types
- Complex logic has inline explanations in string concatenation (render functions)
- Every major section has a comment: `/* ═══ BROADCAST HEADERS ═══ */`
- System design documented at root: `/* === PALETTE === */`, `/* === SPACING ===`
- Utility classes self-documenting: `.u-label`, `.u-flex-center`, `.u-stat`
## Import Organization
- `PI()` → Sleeper CDN player thumbs: `sleepercdn.com/content/nfl/players/thumb/`
- `PIF()` → Sleeper CDN full images: `sleepercdn.com/content/nfl/players/`
- `TL()` → Sleeper CDN team logos: `sleepercdn.com/images/team_logos/nfl/`
- Google Fonts linked via `<link rel="stylesheet">` in head
- `html2canvas` loaded via CDN when needed (share cards)
## Function Design
- Render functions are intentionally large (200-400+ lines) — they build full HTML strings
- Helper functions are small and focused: `icon()`, `dtierTag()`, `cpill()`, `tcInit()` (20-40 lines)
- Data transformation functions medium-sized: `buildCurrentSeasonData()` (260+ lines due to nested team/player loops)
- Minimal parameters preferred — most functions read global `D` object
- Common pattern: no params for top-level render: `renderPower()` reads `D.teams`, `D.records`, etc.
- Utility helpers take single object: `icon(name, sz, color)`
- Helper factories return functions: cache utilities return `get()`, `set()`, `has()`
- Render functions: return nothing, modify DOM via `innerHTML` assignment
- Data builders: return transformed data objects
- Helpers: return HTML strings, CSS values, or computed values
- Arrow functions (`const f = () => {}`) used for small utilities and callbacks
- `function` declarations used for larger, named functions
- Mixed style — no strict preference observed
- Try-catch blocks around async operations and data parsing
- `.catch()` handlers return fallback values (empty arrays, etc.)
- `if(!data) throw new Error('message')` for validation
- `console.warn()` for non-fatal issues (missing roster IDs)
- `console.error()` for caught exceptions in initialization
## Module & File Organization
- Single mutable object `D = {}` holds all app data
- Initialized by `buildCurrentSeasonData()`, expanded by `mergeHistoricalData()`
- All render functions read from `D` — no dependency injection
- Dirty flag pattern via `dirtyTabs` Set to batch re-renders
## Error Handling
## Logging
- `console.log()` — NOT USED (per CLAUDE.md prohibition)
- `console.warn()` — validation failures, recoverable issues
- `console.error()` — initialization failures, uncaught exceptions
- `console.info()` — cache operations (`'Cache pruned:'`, `'SW registered'`)
- Invalid data received from API
- Cache operations (prune events)
- Service worker registration results
- Render function exceptions
## Data Patterns
- Franchise stats computed fresh each render
- Records recomputed from matchup data
- No caching of computed values in `D`
## String Building
## Styling Approach
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- All code (HTML structure, CSS, JavaScript) in one 5,631-line `index.html` file
- Configuration → Network layer → Data pipeline → Helpers → 18 render functions
- Global mutable state: single `D` object holds all application data
- No framework, no build step, no dependencies (PWA-capable)
- Immediate-mode rendering: innerHTML destructively replaces tab contents on updates
## Layers
- Purpose: Store app settings, API endpoints, cache config, singleton functions
- Location: Lines 1405–1520 in `index.html`
- Contains: `CFG` object (user ID, league name, avatars, API URLs), `cache` helper with localStorage TTL logic, `esc()` XSS prevention function
- Depends on: None
- Used by: Network layer, data pipeline, all render functions
- Purpose: Fetch JSON from APIs with retries, batch requests, cache results with TTL to localStorage
- Location: Lines 1420–1520 in `index.html` (`fetchJSON`, `fetchAll`, `fetchCSV`, `cache` object)
- Contains: `fetchJSON()` with exponential backoff (max 2 retries), `fetchAll()` with concurrency control (8 concurrent), `fetchCSV()` for Google Sheets CSV, cache helpers with quota pruning
- Depends on: Browser fetch API, localStorage
- Used by: Data pipeline
- Purpose: Discover league, fetch current season, fetch historical seasons, assemble into global `D` object
- Location: Lines 1520–2300+ in `index.html`
- Purpose: Convert data to display-ready format (URLs, HTML snippets, colors, icons)
- Location: Lines 2300–2520 in `index.html` (approximate)
- Contains:
- Depends on: `D` object, `CFG` (URLs)
- Used by: All render functions
- Purpose: Build HTML strings and inject into panel sections via innerHTML
- Location: Lines 2824–5200+ in `index.html`
- Functions (in order of appearance):
- Each function: Builds HTML via string concatenation, sets `document.getElementById('tab-X').innerHTML=h`, attaches event listeners post-render
- Depends on: `D`, all helpers, CSS classes
- Used by: Tab switching logic
- Purpose: Orchestrate data load sequence, render initial UI, bind nav/interaction handlers
- Location: Lines 2526–2700+ in `index.html` (`init()` function)
- Sequence:
- Depends on: Data pipeline, render layer, DOM
- Used by: Browser (window.DOMContentLoaded)
- Purpose: Switch visible panel, manage scroll, nav bar arrow state
- Location: Lines 2691–2750 in `index.html` (`showTab()`, nav scroll listeners)
- Pattern: Find panel by ID, remove `.active` from all, add `.active` to target, scroll nav bar if needed
- Depends on: DOM, CSS classes
- Used by: Nav buttons, browser history (implied)
- Purpose: Display detailed player info, contract, trades, acquisition
- Location: Lines 5406–5600+ in `index.html` (`openPP()` function)
- Contains: Modal overlay, player stats, contract/KTC section, trade history, acquisition chain
- Depends on: `D.teams`, `D.contracts`, `D.unified_trades`, `D.exemption_history`
- Triggered by: Click on player name/image (listeners added in render functions)
- html2canvas (share card export): Lines 5300–5312, loaded via CDN for screenshot generation
- Service Worker: Lines 5318–5328 (registers `sw.js` for offline caching)
- PWA Install Banner: Lines 5331–5402 (Chrome + iOS install prompts)
## Data Flow
```
```
```
```
- **Single Source of Truth:** `let D = {}` (global mutable object)
- **What lives in D:**
- **What does NOT live in D:**
- After initial `buildCurrentSeasonData()`, D is mutated progressively:
## Key Abstractions
- Purpose: Map roster ID → CSS color variable for team theming
- Pattern: Global lookup object with 12 hardcoded entries (one per team)
- Usage: Applied to cards, badges, gradients via `--team-CP`, `--team-AW`, etc. CSS vars
- Files: Inline in index.html (CSS variables defined ~line 69)
- Purpose: Abstract Sleeper CDN image paths
- Pattern: `PI(playerId, size)` returns URL, `PIF(playerId)` for full size
- Handles: Missing images (fallback to gradient circle via `tcInit()`)
- Usage: `<img src="${PI(p.id, 40)}">`
- Purpose: Consistent visual representation of contract status
- Pattern: `cpill(years, tag)` returns HTML span with background color per years remaining
- Handles: Uncontracted (0 years), expiring, long-term, franchise tag
- Usage: Injected into roster rows, player profiles
- Purpose: Classify players by KTC rank into Elite/Starter/Depth/Dart tiers
- Logic: KTC rank ≤24 (Elite), ≤60 (Starter), ≤120 (Depth), >120 (Dart)
- Implementation: `dtierTag(rnk)` helper
- Visual: Color-coded badges in rosters, contracts tab
- Purpose: Quantify trade fairness using KTC values
- Grades: A (green, both gain), B (blue, one gains), C (gold, slight edge), D (orange, bad edge), F (red, bad loss)
- Implementation: Computed from `(giving - receiving) / max` ratio, applied post-trade
- Visual: 40px gradient circles with letters, clickable for trade analysis
- Purpose: Render charts without D3/Chart.js library
- Examples:
- Pattern: Get canvas element, measure offsetWidth, compute pixel-to-data scale, use ctx.fillRect/fillText
- `PI(playerId, size)` — `sleepercdn.com/content/nfl/players/{id}.png` (thumbnail)
- `TL(team)` — `nfl.com/logos/`-like (team logo)
- CFG-based URLs stored in config for flexibility
## Entry Points
- Location: `index.html` (browser loading)
- Trigger: Page load → `window.DOMContentLoaded` → `init()`
- Responsibilities: Coordinate all data fetching, build D, render initial state, bind handlers
- Location: Nav bar buttons (HTML: `<button class="nav-btn" data-tab="power">POWER</button>`)
- Trigger: Click on nav button
- Responsibilities: `showTab(tabId)` switches visible panel, calls `renderX()` if not yet rendered
- Pattern: Event delegation on nav bar, `dataset.tab` read from button
- Location: Anywhere player name/image is clickable
- Trigger: Click on player element (listener attached in render functions via `onclick="openPP(playerId)"`)
- Responsibilities: `openPP(playerId)` builds modal HTML, opens overlay, binds close handler
- Location: `sw.js` (service worker file)
- Trigger: Browser registration on load
- Responsibilities: Cache static assets (index.html, manifest, logo), network-first HTML, network-only API
- Offline behavior: Serves cached index.html if network fails (limited functionality without fresh D)
- Location: Share buttons in various tabs
- Trigger: Click export button
- Responsibilities: `openShareModal()` captures tab content with html2canvas, generates PNG download
## Error Handling
- `fetchJSON()` retries twice with exponential backoff (1s, 2s delays)
- If all retries fail, throws error caught by `init()`
- `loadHistory()` catches failures per-season, continues loading others
- User sees: Loading message persists if critical fetch fails, data status badge shows error
- Player DB: 24h cache, returns cached if fetch fails
- KTC values: 12h cache, returns empty object `{}` if fetch fails (show "—" in UI)
- Contracts: 2h cache, returns empty if fetch fails (no KTC info displayed)
- Technique: `try/catch` in fetch, return `cache.get(key)` on error
- Triggered when cache.set() throws QuotaExceededError
- Handler: `cache._prune()` removes oldest historical season caches first, then oldest entries
- Soft limit: 4MB (localStorage max ~5MB)
- User impact: Minimal—historical data pruned before critical caches
- League not found: Throw error "League not found for season YYYY"
- Rosters array empty: Throw "No roster data"
- Invalid data types: Log warning, continue (e.g., roster missing roster_id)
- Missing player in DB: Use player ID as fallback name, continue
- All API strings (player names, team names, transactions) passed through `esc()` before HTML injection
- Function: Escapes `&`, `<`, `>`, `"`, `'` to HTML entities
- Applied at data ingestion time (lines 1577 for player names, 1780 for league name, etc.)
- If render function crashes (missing D field, invalid loop), error logged to console
- Panel shows partial/old content (innerHTML not replaced)
- Navigation still works (render errors isolated per function)
## Cross-Cutting Concerns
- Data shape validation in `buildCurrentSeasonData()` (check league, rosters, users exist)
- Player IDs validated as either Sleeper ID or 2-3 character DEF team code
- Contract years parsed as integers, invalid values default to 0 or null
- Sleeper API uses public endpoints (no auth needed)
- Google Sheets CSV uses publicly published file
- KTC API no auth required
- User identity: Stored in league metadata (team_name from Sleeper), not authenticated by app
- Network: Batch fetch with concurrency=8 (matchups, transactions)
- Rendering: Single-pass string concatenation (no DOM diffing)
- Cache: localStorage with 24h–2h TTLs
- Canvas: Drawn fresh on every render (no memoization)
- No lazy loading of tab panels (all 18 render on init)
- ES6 (async/await, arrow functions, const/let, template literals, spread operator)
- CSS Grid/Flexbox required
- localStorage required (PWA functionality depends on it)
- Service Worker registration with fallback to no-op if unsupported
- iOS PWA detection for custom install banner
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
