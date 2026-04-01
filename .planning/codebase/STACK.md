# Technology Stack

**Analysis Date:** 2026-03-31

## Languages

**Primary:**
- **JavaScript** (Vanilla ES6+) — 100% of runtime code in `index.html` (~3,400 lines of script)
- **HTML5** — Document structure and semantic markup in `index.html`
- **CSS3** — Styling and design tokens (~1,090 lines of CSS in `index.html`)

**Secondary:**
- **JSON** — Configuration formats (`manifest.json`, `sw.js`)

## Runtime

**Environment:**
- Browser-native JavaScript — no Node.js, no build tools, no transpilation
- Supported browsers: Modern evergreen (Chrome, Firefox, Safari, Edge)
- PWA-capable: Installable to home screen via `manifest.json`

**Package Manager:**
- None. Zero npm dependencies
- No `package.json`, no lock files
- No node_modules directory

## Frameworks

**Frontend:**
- None. Vanilla HTML + CSS + JS
- No React, Vue, Svelte, or framework of any kind
- DOM manipulation via direct `innerHTML` string concatenation

**Service Worker & PWA:**
- Native Service Worker API (`sw.js`) for offline caching and asset management
- Web App Manifest (`manifest.json`) for home screen installation
- Cache-first strategy for static assets, network-first for data

**Charting & Visualization:**
- Custom canvas rendering (no D3, Plotly, or charting library)
- Canvas 2D API for consistency scatter plot in `renderAnalytics()`
- SVG inline for icons (hand-written path data)

## Key Dependencies

**Runtime:** None

**External Services (fetched, not imported):**
- **html2canvas** `v1.4.1` — CDN-loaded only for player profile share cards
  - CDN: `https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js`
  - Loaded in `<script>` tag at bottom of `index.html` (line 5404)
  - Loaded on-demand for screenshot functionality, not in critical path

**Browser APIs:**
- Fetch API for HTTP requests
- LocalStorage for TTL-based caching
- Service Worker API for offline support
- Canvas 2D API for chart rendering
- Web App Manifest API for PWA installation

## Configuration

**Runtime Configuration:**
- Located at `~line 1411` in `index.html`, in `const CFG` object:
  - `userId`: '393634863552425984' — Sleeper API user ID
  - `leagueName`: "Harambe's Dozen" — League identifier
  - `sleeperBase`: 'https://api.sleeper.app/v1' — Sleeper API base URL
  - `sheetCsvUrl`: Google Sheets CSV export URL (public link) — currently returns empty/placeholder data
  - `ktcUrl`: FantasyCalc dynasty values API endpoint
  - `avatarOverrides`: Object keying roster IDs to custom avatar image paths (e.g., `{10:'assets/avatars/Kevin.png'}`)

**Environment Variables:**
- None. All configuration is hardcoded in CFG object
- Secrets: None (Sleeper API is public, no auth required)

**Build Configuration:**
- No build step. `index.html` ships as-is to GitHub Pages
- No minification, bundling, or transpilation

**Deployment Configuration:**
- Hosted on GitHub Pages at `amwoods44.github.io/harambes-dozen/`
- Git repository: `harambes-dozen-repo`
- No CI/CD pipeline (manual push deploys)

## Caching Strategy

**Browser Storage:**
- LocalStorage (limit ~5MB per origin) with TTL-based invalidation
- Cache manager: `const cache` object at line 1461 in `index.html`
  - `cache.get(key)` — retrieves with TTL expiration check
  - `cache.set(key, data, ttl)` — stores with millisecond TTL
  - `cache._prune()` — evicts oldest historical season caches when quota exceeded

**Cache Entries:**
- `hd_players` — NFL player database, 24-hour TTL, ~1-2MB
- `hd_ktc` — FantasyCalc dynasty values, 12-hour TTL
- `hd_hist_[season]` — Historical season data, no TTL, pruned first if quota exceeded
- `hd_[leagueId]_[season]` — Current season data, persisted across sessions

**Service Worker Cache:**
- Cache name: 'harambes-dozen-v5' (see `sw.js`)
- Strategy: Cache-first for static assets, network-first for HTML, network-only for API calls
- Assets in cache: `./`, `manifest.json`, `harambe-logo.png`

## Web Fonts

**Google Fonts (remote, not bundled):**
- `Oswald` — Display/headings — weights 300, 400, 500, 600, 700, 800, 900
  - Used for: Headers, labels, championships, standings
  - Preload: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `Inter` — Body text — weights 400, 500, 600, 700, 800, 900
  - Used for: Body copy, descriptions, stats detail
- `JetBrains Mono` — Monospace/stats — weights 500, 600, 700, 800
  - Used for: Numbers, scores, contract values, timestamps
- Load URL: `https://fonts.googleapis.com/css2?family=Oswald:wght@300..900&family=Inter:wght@400..900&family=JetBrains+Mono:wght@500..800&display=swap`
- Preconnect to `https://fonts.gstatic.com` for performance

## Icons & Assets

**Images:**
- `harambe-logo.png` — App logo, 192x192 and 512x512 (PWA), committed to repo
- Custom avatar images: `assets/avatars/*.png` (Kevin.png in avatarOverrides)
- Player headshots: Fetched from Sleeper CDN (`sleepercdn.com/content/nfl/players/`)
- Team logos: Fetched from Sleeper CDN (`sleepercdn.com/images/team_logos/nfl/`)
- Manager avatars: Fetched from Sleeper CDN (`sleepercdn.com/avatars/thumbs/`) or local overrides

**Icons (SVG inline):**
- Hand-written path data in `icon()` helper function (line ~3850)
- Icons: trophy, crown, fire, target, bolt, dice, seedling, trade, ghost, draft, info, building, etc.
- Colors: Passed as parameter, not baked into SVG

## Static Files

**Shipped with repo:**
- `index.html` — Complete app (395KB)
- `sw.js` — Service worker (1.4KB)
- `manifest.json` — PWA manifest (565B)
- `harambe-logo.png` — Logo asset (257KB)
- `assets/avatars/Kevin.png`, `Chuck.png` — Custom manager avatars

**Generated/Not shipped:**
- `node_modules/` — N/A (no dependencies)
- Build artifacts — N/A (no build step)
- Cache: Generated at runtime in browser localStorage

## Platform Requirements

**Development:**
- Any text editor (no IDE required)
- Git for version control
- Browser DevTools for debugging (no build tools needed)
- Tested on: Chrome, Safari (macOS), Firefox

**Production:**
- Deployment: GitHub Pages (free static hosting)
- Origin: `amwoods44.github.io`
- Path: `/harambes-dozen/`
- HTTPS: Yes (GitHub Pages enforced)
- Custom domain: Not configured
- Storage limit: Browser localStorage ~5MB per origin (no server storage)

**Client Requirements:**
- Modern browser with ES6 support
- Service Worker support (for offline mode)
- LocalStorage enabled
- Cookies: Not required (no server sessions)

---

*Stack analysis: 2026-03-31*
