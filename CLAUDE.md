# Harambe's Dozen — Dynasty HQ

## Project Overview

Fantasy football dynasty league dashboard for a 12-team PPR league. Single-file vanilla app pulling live data from the Sleeper API. Deployed on GitHub Pages at `amwoods44.github.io/harambes-dozen/`.

## Tech Stack

- **Frontend:** Vanilla HTML + CSS + JS in a single `index.html` (~5,300 lines)
- **Data:** Sleeper.app REST API (live), Google Sheets CSV (contracts — live published sheet), FantasyCalc API (dynasty values)
- **Storage:** Browser localStorage with TTL-based cache
- **PWA:** Service worker (`sw.js`) + manifest for installable app
- **Charts:** Custom canvas rendering (no D3, no charting library)
- **Dependencies:** Zero runtime. html2canvas loaded from cdn.jsdelivr.net for share cards only
- **Build:** None. Ship `index.html` as-is
- **Hosting:** GitHub Pages (static)

## Architecture

```
index.html
├── <style> — ~1,090 lines of CSS (design tokens, components, responsive)
├── <body>  — Loading screen, header, hero, cast strip, nav, 19 tab panels (incl. home front page), footer
└── <script>
    ├── Config (CFG) + fetch utilities + cache helpers
    ├── Data pipeline: discoverLeague → fetchCurrentSeason → fetchPlayerDB → buildCurrentSeasonData
    ├── Historical: loadHistory → mergeHistoricalData (background, progressive re-render)
    ├── Global state: let D = {} (single mutable object holds all app data)
    ├── 19 render functions in TAB_RENDERERS: renderHome(), renderPower(), renderRosters(), etc.
    ├── URL builders: PI() (player thumb), PIF() (player full), TL() (team logo)
    ├── Helpers: pimg() (player img HTML), av() (avatar → tcInit), tcInit() (gradient circle), cpill() (contract pill), dtierTag() (tier badge)
    └── PWA install banner + service worker registration
```

**Key patterns:**

- Configuration lives in the `CFG` object (~line 1271): `userId`, `leagueName`, `sheetCsvUrl`, `ktcUrl`, `avatarOverrides`, API base URLs; annual dates live in `SEASON_DATES` just below it
- Caching via the `cache` object (~line 1337): `get(key)`, `set(key, data, ttl)`, `has(key)` wrapping localStorage
- External strings are HTML-escaped once at ingestion via `esc()` — never insert raw API/sheet strings into `D`
- Expanded/open UI state is keyed in the `UI_OPEN` set (`data-okey` attrs + `uiToggle()`/`secOpen()`) so it survives destructive re-renders
- Each tab has a `renderX()` function that builds HTML via string concatenation and sets `innerHTML`
- Tab switching calls `showTab(id)` which toggles `.active` class on panels, sets `body.compact` (interior tabs hide the hero/cast/stat masthead), and updates `document.title`
- "My team" is `myTeamRid()`: localStorage `hd_my_team`, falling back to the roster owned by `CFG.userId`; `.gm-link` + `data-rid` makes any team name open its GM profile via a delegated handler
- Team identity colors live in the `TC` object (keyed by roster_id)
- Player images come from Sleeper CDN: `sleepercdn.com/content/nfl/players/`
- Avatar fallbacks use gradient circles with team-colored initials via `tcInit()`

## Design Quality Bar (MANDATORY)

Every visual element must feel like a broadcast graphic or magazine editorial — not data in styled containers.

- **Lead with composition, not components.** Ask "what should dominate this space?" before "what elements go inside this container?" Start with the dominant element, the visual hierarchy, where the eye goes — then break it into parts
- Use real broadcast patterns: angled header bars, red dividers, clip-path accents, full-bleed hero images, gradient fades, overlay text
- When proposing options, each must be a genuinely different creative direction — not variations on the same structure
- If a design looks like "a styled div with smaller styled divs inside it," it's not done
- Go bold first, pull back if needed — don't iterate timidly

After any UI change, run `/visual-verify` before considering the task done. In remote sessions where the network policy blocks the live APIs, use the mock-API harness instead: `dev/audit/` (see its README) screenshots every tab against generated fixture data in offseason and midseason states.

## Design System

**Palette:** Dark warm theme. Base `#120e0c`, accent red `#cc0000`, gold `#ffcc00`
**Fonts:** Oswald (display/headings), Inter (body), JetBrains Mono (stats/numbers)
**Font weights:** 600-900 on headings is intentional — broadcast aesthetic, not a bug
**Spacing:** 4px base unit (`--sp-1` through `--sp-10`)
**Component identity:** Broadcast headers (`.bh`) with angled clip-path, team-colored accents throughout

## Code Conventions

- Vanilla JS only. No framework, no build tools, no npm
- CSS custom properties for all colors, spacing, typography, shadows
- Inline styles in render functions are common (tech debt, not preference)
- Global `D` object is the single source of truth for all data. It's declared with `let`, so it is a global lexical binding, NOT `window.D` — probe it from devtools/Playwright with `typeof D!=='undefined'`
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

1. `init()` starts the player-DB/values/contracts fetches immediately, then discovers the league via Sleeper API (user ID + league name; the previous-league chain is cached permanently)
2. Fetches current season: rosters, users, matchups (per week), transactions, draft picks
3. Fetches full NFL player database (~20K players, pruned to active + rostered)
4. Fetches dynasty values from FantasyCalc, then contracts from the published Google Sheets CSV (`CFG.sheetCsvUrl`)
5. `buildCurrentSeasonData()` assembles everything into `D`
6. Only the landing tab renders at init; the other tabs are marked dirty and render on first visit (`dirtyTabs` + `showTab`)
7. Background: historical seasons load and `mergeHistoricalData()` progressively re-renders affected tabs

**Cache strategy:** localStorage with TTL. Player DB cached 24hrs. If API fails, falls back to cached `D`.

## Known Issues & Debt

- **Annual date maintenance:** `SEASON_DATES` (exemption deadline, NFL kickoff — near the top of the script next to `CFG`) must be updated once each offseason. Everything else derives the season dynamically from the Sleeper API
- **Chronicle start year:** the "League History • 2016–…" label hardcodes the league's 2016 founding (pre-Sleeper era); the end year is dynamic
- **Exemption history:** `D.exemption_history` is never populated from the sheet — the War Room exemption board only reflects current-season exemptions

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
| `docs/FEATURES.md` | Feature inventory and status |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (cache strategy) |
| `harambe-logo.png` | App logo (also favicon, touch icon, PWA icon) |
| `assets/avatars/Kevin.png`, `Chuck.png` | Custom manager avatar overrides (`CFG.avatarOverrides`) |
| `features.html` | Marketing/status page (not the app) |
| `data/contracts.csv` | Contract source material — NOT read by the app at runtime (app reads the published Google Sheet) |
| `data/sheets-setup.js` | Google Sheets formatting helper, not app code |
| `docs/superpowers/` | Implementation plans and design specs |
