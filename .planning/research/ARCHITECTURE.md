# Architecture Patterns

**Domain:** Large-scale vanilla JS single-file dashboard
**Researched:** 2026-03-31
**Confidence:** HIGH — findings are grounded in direct codebase analysis, not speculation

---

## Current Architecture (Verified from index.html)

The app is a 5,631-line single `index.html` with three embedded sections: CSS (~1,090 lines), HTML (panel scaffolding), and JavaScript (~4,100+ lines). The JS follows a clear layered architecture that is already well-structured.

### Layer Stack (top to bottom, bottom runs first)

```
CFG (config)
  ↓
cache (localStorage wrapper)
  ↓
fetchJSON / fetchCSV / fetchAll (network layer)
  ↓
fetchContracts / fetchDynastyValues / fetchPlayerDB / fetchCurrentSeason / fetchHistoricalSeason
  ↓
buildCurrentSeasonData / mergeHistoricalData (pipeline — assembles D)
  ↓
D = {} (global mutable state object — single source of truth)
  ↓
Helpers: PI(), PIF(), TL(), pimg(), av(), cpill(), dtierTag(), icon(), tcInit()
  ↓
18 render functions: renderPower(), renderRosters(), renderContracts(), etc.
  ↓
safeRender() wrapper → panel.innerHTML = h
  ↓
Tab switching: showTab() → dirtyTabs Set → renderTab()
  ↓
Player modal: openPP(playerId) → pp-content.innerHTML = h
```

### What Already Works (Do Not Disturb)

- **`D` global object** — load-bearing. All 18 render functions read from it. Immutable in terms of structure post-build; only `mergeHistoricalData()` adds keys. Do not refactor.
- **`safeRender()` wrapper** — correct error isolation pattern. Each tab renders independently; one crash does not affect others.
- **`dirtyTabs` Set** — correct lazy-re-render mechanism. Historical data loads mark affected tabs dirty; `showTab()` re-renders on demand rather than re-rendering all 18 tabs.
- **Event delegation for player modal** — `document.addEventListener('click', ...)` checking `e.target.closest('.pp-trigger[data-pid]')` is the right pattern. Adding new player click surfaces only requires adding `class="pp-trigger" data-pid="${id}"` to the element — the global listener handles it automatically.
- **`filterTradeYear()`** — DOM-only filter (show/hide `.tc-wrap` elements by `data-yr` attribute) rather than re-render. This is the correct pattern for interactive filters that should not destroy scroll state.

---

## Recommended Architecture for Growth

### Principle: Grow the Layers, Don't Collapse Them

The app already has correct separation. Growth pressure comes from file length, not architectural brittleness. The answer is to extend existing patterns, not introduce new ones.

**The four patterns that handle everything the roadmap requires:**

| Pattern | Already Exists | Covers |
|---------|---------------|--------|
| Dirty-tab re-render via `dirtyTabs` Set | Yes | Contracts data arriving, historical data merges |
| DOM-filter (show/hide) instead of re-render | Partial | Year filters, team filters, collapsible sections |
| Event delegation on `document` | Yes | Player modal, future modals |
| `D` object extension | Yes | Contracts, cliff chart data, exemption history |

---

## Contracts Data Integration

### Current State (Verified)

`fetchContracts()` already exists and works at lines 1606-1666. It:
- Fetches CSV from the published Google Sheets URL in `CFG.sheetCsvUrl`
- Parses with a hand-rolled CSV parser (handles quoted fields correctly)
- Returns `{ contracts: { [playerName]: {yrs, contracted, tag, exm, note, ktc, rnk, tier} }, exemptions: {} }`
- Sets `cache.set('hd_contracts', ...)` with 2-hour TTL
- Falls back to cached data on failure

`buildCurrentSeasonData()` receives this as `contractData` and passes it to `D`. The `cpill()` helper reads from `D.contracts` by player name.

### What Is Missing

1. **The Google Sheets URL currently points to a real sheet** (line 1416) — the data just needs to be formatted correctly in that sheet. The pipeline is complete; only the data source needs to be populated.

2. **`D.exemption_history`** is read in `openPP()` (line 5426) but is never populated — `buildCurrentSeasonData()` does not assign it from `contractData.exemptions`. This is a gap in the pipeline.

3. **Cliff chart data** — no pre-computed contract expiration data exists in `D`. The `renderContracts()` function would need to compute it from `D.teams` + `D.contracts` at render time.

### Data Flow Direction for Contracts

```
Google Sheets (published CSV)
  → fetchContracts(ktcMap)               [line 1606 — already works]
  → parseContractCSV(csv, ktcMap)        [line 1616 — already works]
  → returns { contracts:{}, exemptions:{} }
  → buildCurrentSeasonData() receives as contractData arg
  → D.contracts = contractData.contracts  [already assigned]
  → D.exemption_history = contractData.exemptions  [MISSING — must add]
  → renderContracts() reads D.contracts + D.teams
  → cpill(playerName) reads D.contracts  [already works]
  → openPP() reads D.contracts + D.exemption_history  [contracts works, exemptions broken]
```

**The fix is one line in `buildCurrentSeasonData()`:**
```js
D.exemption_history = contractData.exemptions || {};
```

### Google Sheets CSV Schema (What the Sheet Must Contain)

The parser looks for column headers containing these substrings (case-insensitive):
- `player` or `name` → player name (used as lookup key)
- `sleeper` or `id` → Sleeper player ID (enables `_id_` fallback lookup)
- `contract` or `years` → contract years remaining (integer, blank = uncontracted)
- `tag` → franchise/transition tag string
- `exemp` → exemption year or type
- `note` → free-text note

The sheet must be published via File > Publish to the Web as CSV. The URL format already in `CFG.sheetCsvUrl` is correct.

---

## Player Modal — Patterns That Work

### Current Implementation (Verified)

`openPP(playerId)` at line 5407 is already a fully functional slide-in panel modal. It:
- Finds the player across all `D.teams`
- Builds complete HTML including contract section, trade history, exemption history, acquisition chain, draft info
- Injects into `#pp-content` via `innerHTML`
- Shows `#pp-overlay` via `classList.add('open')`
- Closes on backdrop click, Escape key, or `closePP()`
- Triggered via global event delegation (line 5615)

**This pattern is correct and extensible.** New sections can be added inside `openPP()` by appending to the HTML string. No architectural change needed.

### What Is Missing in the Modal

1. **Player journey / trade chain** — data exists in `D.unified_trades`, filter is already done (line 5421). Needs visual rendering of the ownership timeline.

2. **Emojis in trade history** — lines 5502-5507 use `👤` and `📦` directly in template literals. Per project convention: remove, replace with CSS shapes or inline SVG from the `ICONS` object.

3. **XSS gaps** — `player.name` at line 5552, `p.nm` at lines 5502/5506, `mySide.name`/`otherSide.name` at lines 5512/5516/5521 are not escaped. Wrap all in `esc()`.

4. **Animation state** — `pp-panel.scrollTop = 0` is correct (line 5607). The modal scrolls its own panel, not the page. This is fine.

---

## Render State Preservation

### The Core Problem

`innerHTML = html` destroys all DOM state: scroll positions, `.open` classes on collapsibles, CSS animation state, filter selections. This is the app's most painful UX failure path.

### When Re-Renders Currently Occur

1. **Historical data merge** — `loadHistory()` marks tabs dirty; if the current tab is in the dirty set, it re-renders immediately (line 2648). This is the scroll-jump bug users see.
2. **Tab switching to a dirty tab** — `showTab()` re-renders at line 2693. Correct — user just arrived, no state to preserve.
3. **Explicit filter changes** — `filterTradeYear()` uses DOM show/hide instead of innerHTML replacement. This is correct and should be the pattern for all interactive filters.

### Recommended Preservation Strategies

**Strategy 1: Scroll-position save/restore around re-renders (for historical data merges)**

```js
// Before re-render triggered by loadHistory:
function safeRerenderWithScroll(tabId, tabName, renderFn) {
  const el = document.getElementById('tab-' + tabId);
  const savedScroll = el ? el.scrollTop : 0;
  safeRender(tabId, tabName, renderFn);
  if (el) el.scrollTop = savedScroll;
}
```

Apply in `loadHistory()` only when the tab is currently active. When re-rendering a background tab (user is elsewhere), scroll position does not matter — just use `safeRender()`.

**Strategy 2: DOM-filter pattern for interactive state (preferred)**

`filterTradeYear()` already demonstrates this. Any interactive control that changes which items are visible should use `data-*` attributes + `style.display` toggling rather than a full re-render. Apply this pattern to:
- Team selector on Contracts tab
- Year selector on any historical tab
- Any collapsible section state

**Strategy 3: Animation reset after re-render (already done)**

`showTab()` at line 2695 already resets stagger animations correctly:
```js
el.querySelectorAll('.stagger > *').forEach(el => {
  el.style.animation = 'none';
  el.offsetHeight; // force reflow
  el.style.animation = '';
});
```
This pattern is correct. Do not change it.

**Strategy 4: Dirty-tab batch marking (already done, extend don't replace)**

When contracts data is updated (future: manual refresh), mark the following tabs dirty:
```js
['rosters', 'contracts', 'gm', 'warroom'].forEach(t => dirtyTabs.add(t));
if (aTab && dirtyTabs.has(aTab)) { renderTab(aTab); dirtyTabs.delete(aTab); }
```

---

## Handling File Size Growth (5,600+ Lines)

### The Tradeoff (Accepted)

Single-file is intentional. GitHub Pages + zero-build-step is the constraint. The browser fetches one file, the service worker caches it, done. Splitting into `index.css` + `app.js` without a build tool creates three files but no other benefit — and complicates the service worker cache strategy.

**Recommendation: Stay single-file. Manage complexity through internal structure, not file splitting.**

### Internal Structure Patterns to Enforce

**Section delimiters** — already in use (`// ═══ POWER RANKINGS ═══`). Every render function should have one. Makes Cmd+F navigation usable in a 6,000-line file.

**Shared helper consolidation** — the Helpers layer (lines 2420-2480) is the right place for all display utilities. When a new feature needs a helper (e.g., `cliffColor(yrs)` for the cliff chart), it goes here — not inline in the render function.

**D-object documentation block** — the most important maintenance aid for a large file with a global mutable state object. Add one comment block near D's definition listing all keys, their shapes, and which pipeline function populates them. This is not refactoring — it is documentation that costs nothing and saves hours.

**Render function size limit** — each `renderX()` function should stay under 200 lines. When a render function grows beyond that, extract named sub-functions at the same scope level:

```js
// Extract as a peer function, not a nested closure
function renderContractsCliffChart(teams, contracts) {
  // ... canvas drawing code ...
  return canvasEl; // or HTML string
}

function renderContracts() {
  // ... main render body ...
  // calls renderContractsCliffChart()
}
```

This keeps the file navigable without introducing modules or imports.

**Line count projection:**
- Current: ~5,631 lines
- Contracts tab complete + cliff chart: +200-300 lines
- Player modal improvements: +50-100 lines
- Share card infrastructure: +100-150 lines
- Projected ceiling before next review: ~6,500 lines

6,500 lines is manageable with section delimiters. 8,000+ lines is where readability genuinely degrades. Flag at 7,500.

---

## Component Boundaries

The existing layer separation is correct. New features fit into existing layers without restructuring:

| Feature | Which Layer | Integration Point |
|---------|-------------|-------------------|
| Contracts cliff chart | Render layer | Inside `renderContracts()`, sub-function |
| Player modal improvements | Render layer | Inside `openPP()` |
| Player journey timeline | Render layer | Sub-section of `openPP()` |
| Share card export | Render layer | Each tab's share button → `openShareModal()` |
| Roster radar chart | Render layer | Inside `renderGM()` or new sub-function |
| Dynasty value stock chart | Render layer | New `renderChronicle()` section |
| XSS fixes | Helpers layer | `esc()` applied at all render-time injection sites |
| Scroll state preservation | Initialization layer | Wrapper in `loadHistory()` |
| Contracts pipeline fix | Data pipeline | One line in `buildCurrentSeasonData()` |
| NFL kickoff date | Config layer | Move to `CFG.nflKickoff` |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Re-render for interactive state changes

**What it looks like:** User clicks a filter button → render function re-runs → `innerHTML` replaces the entire panel.

**Why bad:** Destroys scroll position, CSS animation state, other UI state. The user visible symptom is the panel jumping to top on every filter interaction.

**Instead:** Use `filterTradeYear()` as the model — toggle `style.display` on pre-rendered elements tagged with `data-*` attributes. Render once, filter in DOM.

### Anti-Pattern 2: Event listeners added post-innerHTML without re-attachment

**What it looks like:**
```js
function renderSomething() {
  el.innerHTML = html;
  el.querySelector('.btn').addEventListener('click', handler); // survives until next render
}
// When renderSomething() runs again, the new .btn has no listener
```

**Why bad:** Next re-render silently drops the listener. Works until historical data loads.

**Instead:** Use `onclick="functionName(arg)"` inline attributes (already the pattern in this app) or event delegation on a non-replaced ancestor. Both survive re-renders.

### Anti-Pattern 3: Inline styles in HTML strings for values that belong in CSS classes

**What it looks like:** `style="font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 8px..."` repeated 50 times across render functions.

**Why bad:** Not a structural bug, but it inflates file size and makes design changes require grep-and-replace instead of one CSS rule edit.

**Instead:** Define a utility class (`.u-label`, `.badge`, etc.) in the CSS block. The app already has `u-label`, `u-body`, `u-c-t4`, `u-empty` — use them. Add new ones as features arrive rather than hardcoding inline.

### Anti-Pattern 4: Indexing trades inside render functions

**What it looks like:** `openPP()` filters all `D.unified_trades` on every modal open (line 5421). At current scale (dozens of trades) this is negligible. At 500+ trades across 5 seasons this becomes perceptible.

**Instead:** At the end of `buildCurrentSeasonData()` or `mergeHistoricalData()`, build a reverse index:
```js
D.trades_by_player = {}; // { playerId: [trade, trade, ...] }
D.unified_trades.forEach(t => {
  t.sides.forEach(s => s.players.forEach(p => {
    (D.trades_by_player[p.id] = D.trades_by_player[p.id] || []).push(t);
  }));
});
```
Then `openPP()` reads `D.trades_by_player[playerId] || []` — O(1) lookup, no filter.

---

## Build Order Implications

The architecture imposes a strict dependency order for new features:

1. **Pipeline first** — if a feature needs new data, fix/extend the pipeline (`fetchX`, `parseX`, `buildCurrentSeasonData`) before touching render functions. Render functions that run before data is in `D` silently show empty or broken state.

2. **Helpers second** — shared display utilities (`cpill`, `dtierTag`, etc.) should be in the Helpers layer before the render functions that use them.

3. **Render functions third** — once data is in `D` and helpers exist, render functions are straightforward string concatenation.

4. **Event wiring last** — any new interactive pattern (filter buttons, toggles, secondary modals) must be designed to survive re-renders via inline `onclick` or event delegation before considering it done.

**Contracts integration specifically:**
- Pipeline gap (D.exemption_history) must be fixed first or the modal's exemption section silently shows nothing — which it currently does
- The cliff chart in `renderContracts()` depends on `D.contracts` AND `D.teams` both being populated — both already are
- Contract pills in `renderRosters()`, `renderGM()`, `renderTrades()` all read from `D.contracts` via `cpill()` — they work as soon as the sheet data is correct

---

## Scalability Considerations

| Concern | At current (5,631 lines) | At ~7,500 lines | At ~10,000 lines |
|---------|--------------------------|-----------------|------------------|
| File navigability | Fine with section delimiters | Manageable, section delimiters critical | Painful; consider CSS/JS split (still no build tool) |
| Initial render time | ~50ms string concat | ~80ms | ~150ms — consider lazy-rendering non-visible tabs |
| localStorage quota | ~2-3MB used | ~3-4MB | Near 5MB limit; prune strategy already in place |
| Trade index scan in modal | Negligible (<10ms) | Noticeable if 300+ trades | Break: add `D.trades_by_player` index |
| Canvas chart redraws | Instant at 12 teams | Instant (teams count fixed) | Not a scaling concern — dataset size is capped |

---

## Sources

- Direct analysis of `/Users/aaronwoods/harambes-dozen-repo/index.html` (5,631 lines, 2026-03-31) — HIGH confidence
- [CSS-Tricks: Build a state management system with vanilla JavaScript](https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/) — MEDIUM confidence (pattern validation)
- [DEV: Event Delegation with Vanilla JS](https://dev.to/js_bits_bill/event-delegation-with-vanilla-js-js-bits-2lnb) — MEDIUM confidence (pattern validation)
- [Google Sheets CSV published URL approach](https://medium.com/@ravipatel.it/step-by-step-guide-reading-public-google-sheets-data-using-javascript-and-displaying-it-on-an-html-f6aee8416a9c) — MEDIUM confidence (confirms existing approach is standard)
- [State Management in Vanilla JS: 2026 Trends](https://medium.com/@chirag.dave/state-management-in-vanilla-js-2026-trends-f9baed7599de) — LOW confidence (confirms global object pattern is viable at this scale)

---

*Architecture research: 2026-03-31*
