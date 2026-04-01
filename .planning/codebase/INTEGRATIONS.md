# External Integrations

**Analysis Date:** 2026-03-31

## APIs & External Services

**Sleeper.app REST API:**
- **Service:** Fantasy football league management and player data
- **What it's used for:** Live league data (rosters, users, matchups, transactions, draft picks, historical seasons)
- **Base URL:** `https://api.sleeper.app/v1` (defined in `CFG.sleeperBase`, `index.html` line 1415)
- **Auth:** None required (public API)
- **Endpoints used:**
  - `GET /state/nfl` — Get current NFL season state
  - `GET /user/{userId}/leagues/nfl/{season}` — Discover league for a season
  - `GET /league/{leagueId}` — Fetch league metadata (settings, name, playoff week)
  - `GET /league/{leagueId}/rosters` — All rosters with player holdings and wins/losses
  - `GET /league/{leagueId}/users` — Manager profiles and avatars
  - `GET /league/{leagueId}/matchups/{week}` — Head-to-head matchup results per week (concurrent requests)
  - `GET /league/{leagueId}/transactions/{week}` — Waiver and FA moves per week (concurrent requests)
  - `GET /league/{leagueId}/traded_picks` — Traded future draft picks
  - `GET /league/{leagueId}/winners_bracket` — Championship bracket (if available)
  - `GET /league/{leagueId}/drafts` — Draft metadata
  - `GET /draft/{draftId}/picks` — Draft picks with round, pick, player selected
  - `GET /players/nfl` — Full player database (~20K players) with position, age, team, injury status
- **Data fetching:**
  - Initial load: `discoverLeague()` + `fetchCurrentSeason()` in `index.html` line 1523
  - Matchups and transactions: Fetched concurrently with `fetchAll()` (8-concurrent batches)
  - Retry logic: Up to 2 retries with exponential backoff (1s, 2s delays) via `fetchJSON()` at line 1423
  - Player DB: Fetched once, cached 24 hours in localStorage
- **Rate limiting:** No explicit rate limiting enforced; batching used to reduce concurrent requests

**FantasyCalc API (KTC):**
- **Service:** Dynasty trade value rankings and tier classifications
- **What it's used for:** Player dynasty values, overall rank, tier assignment (Elite, Star, Starter, Depth, Dart)
- **URL:** `https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=12&ppr=1` (line 1417)
- **Auth:** None required (public API)
- **Response format:** JSON array of player objects with `sleeperId`, `value`, `overallRank`, `maybeTier`
- **Caching:** 12-hour TTL in localStorage (key `hd_ktc`)
- **Error handling:** Gracefully degrades if API fails — app continues without tier data
- **Called by:** `fetchDynastyValues()` at line 1588

**Google Sheets (CSV Export):**
- **Service:** Contract and player exemption data (placeholder, not yet implemented)
- **What it's used for:** Player contract years, exemption status (proposed feature)
- **URL:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vTrwFZSQor9KOXxYX9CGxX8uyPTzRdahn2Pch_uLjQFe0YUSoUuoQ7n7akevWWB9dfgVl2wIeZOeEim/pub?output=csv` (line 1416)
- **Auth:** Public link sharing (no authentication required)
- **Status:** Currently returns empty/placeholder data
- **Integration point:** `fetchCSV()` function at line 1445, called in data pipeline (commented out or non-functional)
- **Note:** Manual source file exists: `Harambe's Dozen FF 2025 (AW Version).xlsx` (not auto-synced)

**Sleeper CDN (Asset Delivery):**
- **Service:** Static image hosting for player headshots, team logos, manager avatars
- **Player Images:**
  - Thumbnail: `https://sleepercdn.com/content/nfl/players/thumb/{playerId}.jpg`
  - Full: `https://sleepercdn.com/content/nfl/players/{playerId}.jpg`
- **Team Logos:** `https://sleepercdn.com/images/team_logos/nfl/{team}.png` (lowercase)
- **Manager Avatars:** `https://sleepercdn.com/avatars/thumbs/{avatarHash}` (from Sleeper user object)
- **URL builders:** `PI()` and `PIF()` functions at line 2389-2390; `TL()` at line 2391

**ESPN College Logos (Fallback):**
- **Service:** College team logos for draft analysis
- **URL pattern:** `https://a.espncdn.com/i/teamlogos/ncaa/500-dark/{espnTeamId}.png`
- **College ID mapping:** `COLLEGE_ESPN` object at line ~3915 (151 colleges mapped)
- **Builder:** `collegeLogoUrl()` function at line 3917

## Data Storage

**Databases:**
- None. This is a client-only app
- No backend database or API

**Browser Storage:**
- **localStorage** (~5MB limit per origin)
  - TTL-based cache system in `cache` object (line 1461)
  - Stores: NFL player DB, dynasty values, historical season data, current season data
  - Key patterns: `hd_players`, `hd_ktc`, `hd_hist_[season]`, `hd_[leagueId]_[season]`
  - Eviction: LRU-style pruning when quota exceeded (historical seasons pruned first)

**Service Worker Cache:**
- Cache name: `harambes-dozen-v5` (in `sw.js`)
- Stores static assets and HTML for offline access
- Strategy:
  - Static assets: Cache-first (use cached, fallback to network)
  - HTML: Network-first (use fresh, fallback to cache)
  - API calls: Network-only (always fetch fresh from Sleeper)

**File Storage:**
- None. No file upload or storage backend

**Caching:**
- localStorage for data cache (app-managed TTL)
- Service Worker cache for asset caching (version-based)
- HTTP cache: Not explicitly controlled (Service Worker bypasses with `cache: 'no-store'` for HTML)

## Authentication & Authorization

**Auth Provider:**
- None. Sleeper API is public, no authentication required
- No login, no user accounts, no sessions
- Access control: Reader-only (viewing league data, no write operations)

**User Identification:**
- Fixed Sleeper user ID in CFG: `userId: '393634863552425984'` (line 1412)
- League discovered by name: `leagueName: "Harambe's Dozen"` (line 1413)
- No per-user personalization or multi-user support

**Permissions & Scope:**
- Read-only access to public Sleeper league
- Cannot modify rosters, trades, or settings
- Cannot authenticate other users

## Monitoring & Observability

**Error Tracking:**
- None. No error reporting service (Sentry, Rollbar, etc.)
- Errors logged to browser console with `console.warn()` and `console.info()`
- Example: Line 1515 — `console.info('Cache pruned:', e.key)`

**Logs:**
- Browser console only
- No structured logging
- No remote log aggregation

**Performance Monitoring:**
- None. No analytics service
- No timing instrumentation

**Data Status Indicator:**
- Visual feedback: `.data-status` element shows "OK" or error state
- Updated via CSS class toggling: `.ok`, `.fade-away`
- Automatically hides after ~10 seconds

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (free static hosting at `amwoods44.github.io`)
- No custom domain configured
- HTTPS enforced by GitHub

**CI Pipeline:**
- None. No automated builds or tests
- Manual deployment: Git push to `main` branch triggers automatic GitHub Pages deployment
- No staging environment

**Build Process:**
- None. `index.html` ships as-is
- No minification, no bundling, no transpilation
- Single 395KB HTML file serves the entire app

**Deployment Steps:**
1. Edit `index.html` in development
2. `git add index.html`
3. `git commit -m "type(scope): description"`
4. `git push origin main`
5. GitHub Pages auto-deploys within ~60 seconds

## Environment Configuration

**Required Environment Variables:**
- None. All configuration hardcoded in CFG object

**Configuration Parameters (in CFG):**
- `userId`: Sleeper user ID (owner of league) — update to view different league
- `leagueName`: League identifier — must match exact name in Sleeper
- `sleeperBase`: API base URL — fixed, no reason to change
- `sheetCsvUrl`: Google Sheets CSV export link — update to pull contract data
- `ktcUrl`: FantasyCalc endpoint — fixed (parameterized for league size/settings)
- `avatarOverrides`: Object mapping roster IDs to local avatar image paths

**How to Reconfigure:**
- Edit `CFG` object in `index.html` (~line 1411)
- Push to GitHub to deploy
- Browser cache may need clearing for changes to take effect

**Secrets/Credentials Location:**
- None. No secrets in codebase
- No API keys, tokens, or credentials required
- `.env` file not needed

## Webhooks & Callbacks

**Incoming Webhooks:**
- None. This is a read-only client application
- No endpoints exposed

**Outgoing Webhooks:**
- None. No external systems are triggered by app state changes

**Event System:**
- None. No real-time event subscription
- Data fetched on-demand (one-time initial load + historical background loads)

**Polling Strategy:**
- Initial fetch: Single call to `discoverLeague()` → `fetchCurrentSeason()` on app launch
- Historical seasons: Background `loadHistory()` fired after main data loads (progressive)
- No polling loop — user must refresh browser to see live updates
- Ideal refresh frequency: 5-10 minutes (when matchup results come in)

---

*Integration audit: 2026-03-31*
