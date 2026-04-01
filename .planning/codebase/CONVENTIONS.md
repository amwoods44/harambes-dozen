# Coding Conventions

**Analysis Date:** 2026-03-31

## Code Style

**Formatting:**
- Minified CSS and HTML inline within `<style>` tags
- JavaScript is formatted with minimal whitespace (semi-colon terminated statements)
- 2-space indentation in readable sections; no tabs
- Lines are kept compact — CSS class selectors chain without spaces

**Linting:**
- No formal linter configured
- Console warnings used for data validation failures (`console.warn()`)
- Console errors for init failures (`console.error()`)
- Console info for cache operations (`console.info()`)

**Line Length:**
- Inline styles in HTML strings are very long (200+ chars common in render functions)
- CSS selectors and property chains acceptable at any length
- JavaScript function chains acceptable if single-line

## Naming Patterns

**Files:**
- Single file: `index.html` contains all app code
- Configuration: `manifest.json` (PWA manifest), `sw.js` (service worker)
- Assets: Lowercase with hyphens: `harambe-logo.png`

**Functions:**
- camelCase: `renderPower()`, `buildCurrentSeasonData()`, `findAcquisition()`
- Utility functions often short: `av()` (avatar), `tn()` (team name), `PI()` (player image), `TL()` (team logo)
- Event handlers: `filterTradeYear()`, `toggleTradeShowAll()`, `showShareCard()`
- Render functions: `render[TabName]()` pattern — `renderTrophies()`, `renderDraft()`, `renderAge()`

**Variables:**
- camelCase for local/module scope: `D` (global state object), `CFG` (configuration), `TC` (team colors), `TABS` (tab list)
- UPPER_SNAKE_CASE for constants: `SEASON_YEARS`, `CURRENT_YEAR`, `FIRST_YEAR`, `YEAR_RANGE`, `NUM_SEASONS`, `CUR_STANDINGS`, `TOTAL_GAMES`, `CACHE_QUOTA_WARN`
- Short single-letter in hot loops: `h` (HTML accumulator), `i` (iteration), `r` (roster), `p` (player), `t` (team), `c` (color)
- Collections plural: `teams`, `players`, `trades`, `moves`
- State variables prefixed with `sel` (selected): `selGM`, `selWk`, `aTab`, `selConTeam`, `selMoveTeam`

**Types/Objects:**
- No TypeScript — vanilla JavaScript only
- Objects use lowercase property keys: `{roster_id, owner_id, team_name, wins, losses}`
- Sleeper API keys preserved as-is: `fpts_decimal`, `user_id`, `owner_id`
- Contract objects: `{nm, yrs, tag, exm, ktc, contracted}` (custom shape)
- Team colors object: `TC[roster_id] = {p: '#HEX', s: '#HEX', i: 'ABBR'}`

## Comment Style

**Inline Comments:**
- Section headers use bold dividers: `/* ═══ HEADER ═══ */`
- Subsections use em-dash: `/* -- Typography -- */`
- Functional comments minimal — mostly in data transformation sections

**Documentation:**
- No JSDoc or TypeScript comments
- Function purpose inferred from name and parameter types
- Complex logic has inline explanations in string concatenation (render functions)

**CSS Comments:**
- Every major section has a comment: `/* ═══ BROADCAST HEADERS ═══ */`
- System design documented at root: `/* === PALETTE === */`, `/* === SPACING ===`
- Utility classes self-documenting: `.u-label`, `.u-flex-center`, `.u-stat`

## Import Organization

**No imports — single file architecture.**

URLs/paths hardcoded as constants:
- `PI()` → Sleeper CDN player thumbs: `sleepercdn.com/content/nfl/players/thumb/`
- `PIF()` → Sleeper CDN full images: `sleepercdn.com/content/nfl/players/`
- `TL()` → Sleeper CDN team logos: `sleepercdn.com/images/team_logos/nfl/`
- Google Fonts linked via `<link rel="stylesheet">` in head
- `html2canvas` loaded via CDN when needed (share cards)

**Path aliases:** None — all references inline or via constants at top of script.

## Function Design

**Size:**
- Render functions are intentionally large (200-400+ lines) — they build full HTML strings
- Helper functions are small and focused: `icon()`, `dtierTag()`, `cpill()`, `tcInit()` (20-40 lines)
- Data transformation functions medium-sized: `buildCurrentSeasonData()` (260+ lines due to nested team/player loops)

**Parameters:**
- Minimal parameters preferred — most functions read global `D` object
- Common pattern: no params for top-level render: `renderPower()` reads `D.teams`, `D.records`, etc.
- Utility helpers take single object: `icon(name, sz, color)`
- Helper factories return functions: cache utilities return `get()`, `set()`, `has()`

**Return Values:**
- Render functions: return nothing, modify DOM via `innerHTML` assignment
- Data builders: return transformed data objects
- Helpers: return HTML strings, CSS values, or computed values

**Arrow Functions vs Function Declarations:**
- Arrow functions (`const f = () => {}`) used for small utilities and callbacks
- `function` declarations used for larger, named functions
- Mixed style — no strict preference observed

**Error Handling:**
- Try-catch blocks around async operations and data parsing
- `.catch()` handlers return fallback values (empty arrays, etc.)
- `if(!data) throw new Error('message')` for validation
- `console.warn()` for non-fatal issues (missing roster IDs)
- `console.error()` for caught exceptions in initialization

## Module & File Organization

**No modules — single monolithic file structure:**

```
index.html
├── <head> — meta, fonts, styles
├── <body> — HTML structure (18 tab panels)
└── <script>
    ├── Global state (D, CFG, TC, TABS)
    ├── Cache utilities
    ├── Data fetching & transformation
    ├── Render functions (per tab)
    ├── Event handlers
    └── Initialization & PWA
```

**Global State Pattern:**
- Single mutable object `D = {}` holds all app data
- Initialized by `buildCurrentSeasonData()`, expanded by `mergeHistoricalData()`
- All render functions read from `D` — no dependency injection
- Dirty flag pattern via `dirtyTabs` Set to batch re-renders

**No barrel files or re-exports** — no module system.

## Error Handling

**Strategy:** Graceful degradation with console logging.

**Patterns:**

1. **Fetch failures:**
```javascript
const data = await fetchJSON(url).catch(() => []);
```
Returns empty array, rendering continues with empty state.

2. **Validation:**
```javascript
if (!league || typeof league !== 'object') throw new Error('Invalid league data');
rosters.forEach((r, i) => {
  if (!r.roster_id) console.warn('Roster missing roster_id at index', i);
});
```
Throws on critical failures, warns on minor issues.

3. **Render errors:**
```javascript
function safeRender(tabId, tabName, renderFn) {
  try {
    renderFn();
  } catch (e) {
    console.error('[' + tabName + ']', e);
    if (el) el.innerHTML = tabError(tabName, tabId);
  }
}
```
Catches render function exceptions, displays error state in UI.

4. **Cache failures:**
```javascript
try {
  localStorage.setItem(key, val);
} catch (e2) {
  console.warn('Cache write failed after prune:', key);
}
```
Warns on cache quota exceeded, continues without caching.

5. **Image onerror:**
```javascript
<img ... onerror="this.style.display='none'">
```
Silently hides broken images — fallback logos handled inline.

## Logging

**Framework:** No logging library — direct `console` usage only.

**Patterns:**

- `console.log()` — NOT USED (per CLAUDE.md prohibition)
- `console.warn()` — validation failures, recoverable issues
- `console.error()` — initialization failures, uncaught exceptions
- `console.info()` — cache operations (`'Cache pruned:'`, `'SW registered'`)

**When to Log:**
- Invalid data received from API
- Cache operations (prune events)
- Service worker registration results
- Render function exceptions

**No context wrapping** — log directly with simple strings.

## Data Patterns

**Global `D` Object Structure:**
```javascript
D = {
  // Teams & rosters
  teams: [{roster_id, team_name, players: [{id, name, pos, age, ...}]}],
  rosters: [{roster_id, owner_id, ...}],
  users: [{user_id, display_name, metadata: {team_name}}],

  // Standings (per season)
  standings_2025: [{roster_id, team_name, wins, losses, fpts}],
  standings_2024: [...],
  standings_2023: [...],

  // Matchups & scoring
  matchup_weeks: {1: [{team_a, team_b, winner, loser, diff}]},
  weekly_scores: {roster_id: [pts, pts, ...]},

  // Transactions & trades
  trades: [{yr, wk, rids, adds, drops, draft_picks}],
  moves: [{yr, wk, tp, rid, add, aid, drop, did}],

  // Draft & picks
  draft_picks: {2025: [{round, pick_no, player_id, nm, pos, tm}]},
  pick_trades: [{...}],

  // Championships
  champions: [{year, champion, runner_up, champ_rid, week}],

  // Computed
  records: {biggest_blowout, closest_game, highest_score, lowest_score},
  franchise: [{name, total_wins, total_losses, win_pct, championships}],
  luck: {rid: {team_name, luck, expected_wins, actual_wins}},
  activity: {name: {trades, moves, draft_picks}},

  // ID mappings
  rid_to_name: {1: 'Team Name', ...},

  // Time-series
  h2h: {'rid1-rid2': {w, l, total}},
  alltime_standings: [{...}]
}
```

**No TypeScript interfaces** — object shapes inferred from usage.

**Derived state avoided:**
- Franchise stats computed fresh each render
- Records recomputed from matchup data
- No caching of computed values in `D`

## String Building

**All HTML via string concatenation:**
```javascript
let h = '';
h += '<div class="card">';
h += '<span>' + escapeHtml(playerName) + '</span>';
h += '</div>';
document.getElementById('tab-rosters').innerHTML = h;
```

**Escaping:**
```javascript
const esc = s => typeof s === 'string'
  ? s.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;')
  : s;
```
Not consistently applied — XSS surface exists for user-supplied data.

**Template literals NOT used** — concatenation only, even for long strings.

## Styling Approach

**CSS Custom Properties only — no hardcoded colors:**
```javascript
// Every color is a CSS var:
'<span style="color: var(--a)">Red</span>'
'<span style="background: var(--g2)">Background</span>'
```

**Inline styles in render functions:**
```javascript
'<div style="font-family:var(--fd);font-size:16px;font-weight:700">'
```
Used extensively for dynamic styling (positioning, sizing, colors based on data).

**No class concatenation** — classes static in render, styles dynamic inline.

---

*Convention analysis: 2026-03-31*
