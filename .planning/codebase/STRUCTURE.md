# Codebase Structure

**Analysis Date:** 2026-03-31

## Directory Layout

```
harambes-dozen-repo/
├── index.html                         # The entire app (5,631 lines: HTML + CSS + JS)
├── sw.js                              # Service worker (offline caching, cache-first strategy)
├── manifest.json                      # PWA manifest (app name, icons, theme color)
├── harambe-logo.png                   # App logo (192x192, 512x512 variants)
├── assets/
│   └── avatars/
│       ├── Kevin.png                  # Custom avatar override for roster_id=10
│       └── Chuck.png                  # Custom avatar override (if used)
├── data/
│   ├── sheets-setup.js                # Documentation/setup helper (not loaded in app)
│   └── contracts.csv                  # Local copy of contract data (reference, not used in app)
├── docs/
│   ├── FEATURES.md                    # Feature inventory and status
│   ├── plans/                         # Historical implementation plans
│   └── superpowers/
│       ├── plans/                     # Current phase plans
│       └── specs/                     # Design specifications
├── docs/screenshots/                  # Documentation screenshots (not app assets)
├── Harambe's Dozen FF 2025 (AW Version).xlsx  # Master contract data (source, not loaded)
├── features.html                      # Marketing/status page (separate from app)
├── index.html.backup                  # Pre-refactor snapshot
└── .planning/codebase/                # Codebase mapping documents (this file goes here)
```

## Directory Purposes

**Root:**
- `index.html` is the app — all logic, all markup, all styles
- No build step: served as-is to browser
- Single file keeps scope tight, dependencies zero, PWA installability simple

**assets/avatars/:**
- Custom manager avatar images referenced in `CFG.avatarOverrides`
- Pattern: `CFG.avatarOverrides = {10: 'assets/avatars/Kevin.png'}`
- Falls back to Sleeper CDN avatars if not overridden
- Format: PNG, square aspect ratio (ideally 192x192+)

**data/:**
- `sheets-setup.js` — helper script showing how to convert contracts.csv to Google Sheets
- `contracts.csv` — local reference copy (not loaded by app)
- App loads contracts from public Google Sheet (CFG.sheetCsvUrl), not from this directory

**docs/:**
- `FEATURES.md` — inventory of all app features (tabs, cards, calculations)
- `plans/` — historical implementation plans from earlier phases
- `superpowers/plans/` — current phase implementation plans
- `superpowers/specs/` — design specifications and mockups
- `screenshots/` — documentation only (not served to users)

**Root loose files:**
- `manifest.json` — PWA metadata (app name "Harambe's Dozen", icons, theme)
- `sw.js` — service worker registration and offline caching strategy
- `harambe-logo.png` — app icon (referenced in manifest and index.html)
- `features.html` — marketing page showing features/status (not the app itself)
- `index.html.backup` — snapshot before major refactor (version control)

## Key File Locations

**Entry Points:**

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Single-file app; loaded by browser | 1–5631 |
| `sw.js` | Service worker; handles offline, caching | 1–51 |
| `manifest.json` | PWA manifest; app name, icons, display mode | 1–16 |

**Configuration (in index.html):**

| Code | Purpose | Lines |
|------|---------|-------|
| `CFG` object | API endpoints, user ID, league name, avatars, Sleeper base URL, KTC URL | 1411–1418 |
| CSS custom properties (`:root`) | Design tokens (colors, spacing, fonts, shadows) | 39–72 |
| `TC` (Team Colors) | Roster ID → hex color mapping (CP, AW, PB, SL, etc.) | 69 (inline in :root) |

**Core Logic (in index.html):**

| Code | Purpose | Lines |
|------|---------|-------|
| `esc()` function | XSS prevention; escapes HTML entities | 1408 |
| `cache` object | localStorage wrapper with TTL + quota pruning | 1461–1518 |
| `fetchJSON()` | Network fetch with retry + backoff | 1423–1434 |
| `fetchAll()` | Batch fetch with concurrency control | 1436–1443 |
| `fetchCSV()` | Google Sheets CSV fetch with error handling | 1445–1457 |
| `discoverLeague()` | Find league ID and build historical season chain | 1523–1537 |
| `fetchCurrentSeason()` | Fetch rosters, matchups, transactions, draft | 1539–1565 |
| `fetchPlayerDB()` | Fetch ~20K NFL players, cache 24h | 1567–1585 |
| `fetchDynastyValues()` | Fetch KTC values from FantasyCalc API, cache 12h | 1587–1603 |
| `fetchContracts()` | Fetch Google Sheets CSV, parse contracts, cache 2h | 1605–1614 |
| `parseContractCSV()` | Parse contract CSV into lookup objects | 1616–1666 |
| `buildCurrentSeasonData()` | Assemble all data into `D` object | 1765–2037 |
| `mergeHistoricalData()` | Merge historical seasons into D, re-render tabs | 2039–2300+ |

**Helper Functions (in index.html):**

| Code | Purpose | Lines |
|------|---------|-------|
| `PI(playerId, size)` | Player thumbnail image URL | ~2400s |
| `PIF(playerId)` | Player full-size image URL | ~2400s |
| `TL(team)` | Team logo URL | ~2400s |
| `pimg(playerId, size)` | HTML img tag for player | ~2400s |
| `av(rosterId, size)` | Avatar circle HTML (team color, initials) | ~2400s |
| `tcInit(rid)` | Team-colored gradient circle | ~2400s |
| `cpill(years, tag)` | Contract pill HTML | ~2400s |
| `dtierTag(rank)` | Dynasty tier badge HTML | ~2400s |
| `tn(rosterId)` | Team name lookup | ~2400s |

**Render Functions (18 tabs, in index.html):**

| Function | Panel ID | Purpose | Lines |
|----------|----------|---------|-------|
| `renderPower()` | `#tab-power` | Power rankings, tier breakdown | 2824+ |
| `renderRosters()` | `#tab-rosters` | Team rosters with player cards, contracts | 2994+ |
| `renderTrophies()` | `#tab-trophies` | Championship history, banners, years | 3042+ |
| `renderTrades()` | `#tab-trades` | Trade history with grade cards, collapsible | 3248+ |
| `renderMatchups()` | `#tab-matchups` | H2H matchup matrix, records | 3697+ |
| `renderDraft()` | `#tab-draft` | Draft picks by round, memory lane | 3919+ |
| `renderAge()` | `#tab-age` | Age distribution, dynasty scatter plot | 4086+ |
| `renderScoring()` | `#tab-scoring` | Scoring breakdown, trends | 4165+ |
| `renderAwards()` | `#tab-awards` | Seasonal awards (MVP, Waiver Wizard) | 4252+ |
| `renderAnalytics()` | `#tab-analytics` | Luck analysis, heat maps | 4318+ |
| `renderMoves()` | `#tab-moves` | Transaction feed (waiver, FA, trades) | 4464+ |
| `renderGM()` | `#tab-gm` | General manager/owner cards | 4522+ |
| `renderRivals()` | `#tab-rivals` | Rivalry H2H records | 4751+ |
| `renderContracts()` | `#tab-contracts` | Contract/keeper sheet view | 4780+ |
| `renderConstitution()` | `#tab-constitution` | League rules, settings | 5004+ |
| `renderWarRoom()` | `#tab-warroom` | Draft board visualization | 5036+ |
| `renderPulse()` | `#tab-pulse` | Real-time league activity | 5140+ |
| `renderChronicle()` | `#tab-chronicle` | Year-over-year comparison | 5226+ |

**Initialization & UI Logic (in index.html):**

| Code | Purpose | Lines |
|------|---------|-------|
| `init()` | Main entry point; orchestrates data load, renders all tabs | 2526–2633 |
| `showTab(id)` | Switch visible panel, manage nav scroll | 2691–2750 |
| `openPP(playerId)` | Open player profile modal | 5407+ |
| `openShareModal()` | Open share/export dialog | 5200+ |
| Player modal HTML | Profile, contract, trades, acquisition | 1228–1276 (CSS) |

**Styles (CSS in index.html):**

| Section | Purpose | Lines |
|---------|---------|-------|
| Loading screen | Spinner, loading status | 24–38 |
| Design tokens (`:root`) | Colors, spacing, fonts, shadows | 39–72 |
| Utility classes | Typography, layout, spacing | 75–99 |
| Component styles | Cards, pills, badges, tables | 100–1200 |
| Card elevation/hover | Box shadows, transforms | 1156–1178 |
| Trade cards | Flip animation, grade circles, hero image | 564–635 |
| Player modal | Overlay, backdrop, modal panel | 1227–1276 |
| Responsive | Media queries for mobile | 545–550, 693–700, etc. |

**Browser APIs (in index.html):**

| API | Purpose | Lines |
|-----|---------|-------|
| Service Worker registration | Offline caching, app lifecycle | 5318–5328 |
| PWA install banner | iOS + Chrome install prompts | 5331–5402 |
| html2canvas (CDN) | Screenshot export for share cards | 5300–5312 |

## Naming Conventions

**Files:**
- Lowercase with hyphens: `harambe-logo.png`, `sw.js`, `index.html`
- Descriptive: `FEATURES.md` (feature inventory), `STRUCTURE.md` (this file)
- Backups: `index.html.backup` (pre-refactor snapshot)

**Directories:**
- Lowercase with no hyphens: `assets`, `data`, `docs`
- Functional: `avatars` (custom images), `screenshots` (docs), `plans` (phases), `specs` (design)

**JavaScript:**
- Functions: camelCase, descriptive action verbs
  - Data fetchers: `fetch*` (`fetchJSON`, `fetchCurrentSeason`, `fetchPlayerDB`)
  - Builders: `build*` (`buildCurrentSeasonData`), `merge*` (`mergeHistoricalData`)
  - Renderers: `render*` (`renderPower`, `renderTrades`)
  - Helpers: action verbs (`esc`, `pimg`, `av`, `openPP`)
  - UI: `showTab`, `openShareModal`

- Objects: PascalCase or ALL_CAPS
  - `D` — global data object (single letter for brevity)
  - `CFG` — config object (all caps)
  - `TC` — team colors (all caps, lookup table)
  - `cache` — localStorage wrapper (camelCase, instance-like)

- DOM elements: Kebab-case (CSS convention)
  - `#tab-power`, `#tab-rosters` — panel sections
  - `.nav-btn`, `.card`, `.trophy-card` — component classes
  - `data-tab="power"` — data attributes for selectors

- CSS variables: Double-dashed, descriptive
  - Colors: `--a` (accent red), `--y` (gold), `--g1` to `--g6` (grays), `--t1` to `--t4` (text)
  - Spacing: `--sp-1` to `--sp-10` (4px base unit)
  - Fonts: `--fd` (display/Oswald), `--fb` (body/Inter), `--fm` (mono/JetBrains)
  - Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  - Team colors: `--team-CP`, `--team-AW`, `--team-PB` (per team)

- HTML structure: Semantic + data attributes
  - Panels: `<section class="panel" id="tab-X">`
  - Cards: `<div class="X-card">` (X = component type)
  - Images: Sleeper CDN URLs in `src` attribute

## Where to Add New Code

**New Feature (Tab):**
- Implementation: Add new `render*()` function in main script (lines 2800+)
- HTML: Add `<section class="panel" id="tab-X"></section>` to main (line 1368+)
- Nav: Add button to nav bar (generated in `init()`, line ~2700)
- Data: If needs new D field, compute in `buildCurrentSeasonData()` (lines 1765–2037) or `mergeHistoricalData()` (lines 2039+)
- Styles: Add CSS classes for new components inline in `<style>` (top of file)

**New Component/Card Type:**
- Implementation: Create helper function (e.g., `renderXCard()`) or inline in parent render function
- Styles: Add `.x-card` and related classes to `<style>` section
- Pattern: Follow existing card patterns (example: `.trade-grid` with `.tc-wrap` containers)

**New Helper/Formatter:**
- Implementation: Add function near other helpers (lines 2300–2500)
- Example: `function formatPlayerName(player) { return player.fn || player.id; }`
- Usage: Call from render functions to format data for display

**New Data Field:**
- Computation: Add to `buildCurrentSeasonData()` (lines 1765–2037) for current season, or `mergeHistoricalData()` (lines 2039+) for historical
- Storage: Assign to `D.newField = [...]` or `D.newField = {...}`
- Access: Read from any render function via `D.newField`

**Utilities/Shared:**
- Path: `data/` directory (reference only, not loaded), or inline in index.html
- Example: `parseContractCSV()` is inline (line 1616) because it's single-use; `cache` object is inline (line 1461) because it's core

## Special Directories

**assets/avatars/:**
- Purpose: Custom manager avatars (small PNG files)
- Usage: `CFG.avatarOverrides[rosterId] = 'assets/avatars/Name.png'`
- Behavior: If not found, falls back to Sleeper CDN avatar
- Not generated, manually committed

**docs/superpowers/:**
- Purpose: Current project work (plans, specs, designs)
- Plans: Implementation roadmaps with tasks and milestones
- Specs: Design specifications with visual mockups (Figma links)
- Not loaded by app, reference only

**docs/screenshots/:**
- Purpose: Documentation and marketing (feature showcases)
- Committed to git (documentation)
- Not served to app users

**.planning/codebase/:**
- Purpose: GSD codebase analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Not part of app; metadata for developers
- Generated by `/gsd:map-codebase` command

---

*Structure analysis: 2026-03-31*
