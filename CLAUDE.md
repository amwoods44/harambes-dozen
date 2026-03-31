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

Every visual element must feel like a broadcast graphic or magazine editorial — not data in styled containers.

- **Lead with composition, not components.** Ask "what should dominate this space?" before "what elements go inside this container?" Start with the dominant element, the visual hierarchy, where the eye goes — then break it into parts
- Use real broadcast patterns: angled header bars, red dividers, clip-path accents, full-bleed hero images, gradient fades, overlay text
- When proposing options, each must be a genuinely different creative direction — not variations on the same structure
- If a design looks like "a styled div with smaller styled divs inside it," it's not done
- Go bold first, pull back if needed — don't iterate timidly

After any UI change, run `/visual-verify` before considering the task done.

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
