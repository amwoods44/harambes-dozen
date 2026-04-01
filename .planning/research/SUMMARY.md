# Research Summary

**Project:** Harambe's Dozen — Dynasty HQ
**Domain:** Dynasty fantasy football league companion app (single-file vanilla JS, Sleeper API, GitHub Pages)
**Researched:** 2026-03-31
**Confidence:** HIGH (architecture from direct codebase analysis; stack and pitfalls verified against official docs)

---

## Stack Recommendations

The app's zero-dependency identity is correct and should not change. The tech stack needs three CDN-loaded additions to support the roadmap without compromising the vanilla constraint:

**Chart.js 4.5.1** (`cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js`) covers every chart type the roadmap requires — radar, stacked area, line, and animated horizontal bar — in 64KB gzipped. Do not add D3 or Plotly. Lazy-load on first chart tab activation only.

**CountUp.js 2.10.0** (`cdn.jsdelivr.net/npm/countup.js@2.10.0/dist/countUp.umd.js`) replaces hand-rolled requestAnimationFrame counters for the 10-20 stat strip animations the roadmap introduces. 6.8KB. Lazy-load on first stat-strip tab.

**html-to-image 1.11.13** (`cdn.jsdelivr.net/npm/html-to-image@1.11.13/dist/html-to-image.js`) replaces html2canvas for new share card work. html2canvas handles modern CSS (clip-path, CSS grid, backdrop-filter) poorly; html-to-image is the actively maintained successor. Keep html2canvas in place for any share cards that currently work. Load only when user triggers a share action.

Everything else the roadmap needs — modals, scroll animation, share sheet — is covered by native browser APIs: `<dialog>` + `@starting-style`, IntersectionObserver, and the Web Share API. No additional libraries.

The FantasyCalc API (already in use for pick values) needs to be extended to cover all rostered players, not just draft picks. The Sleeper player stats endpoint (`/stats/nfl/<season>/<week>`) is unverified — LOW confidence it's accessible. Do not build any features that depend on per-player weekly scoring until this endpoint is confirmed against production.

---

## Feature Landscape

### Table Stakes (missing, high urgency)

| Feature | Why It Blocks | Dependency |
|---------|---------------|------------|
| Contracts fully functional | Core contract-league identity — currently placeholder data | Google Sheets CSV pipeline (code exists, sheet needs correct data) |
| Roster Value Score (FantasyCalc) | Every major dynasty tool surfaces this; absence makes the app feel incomplete | FantasyCalc API extension to player values |
| Roster Value Positional Breakdown | Expected companion to roster value — where is the value concentrated? | Roster Value Score |
| Player Card Modal (full) | Currently exists as `openPP()` slide-in; incomplete — no KTC value, exemption history broken | Roster Value Score + Contracts |
| Trade Fairness Score | Users want to know retroactively who won each trade | FantasyCalc player values |

### Differentiators (build these to be "best in world")

These features don't exist in any competitor in combination:

- **Contract Cliff Chart** — stacked area showing when contracted talent expires per team. No competitor does this as a multi-team comparative visualization.
- **Animated Season Standings Race** — week-by-week bar chart race. All data exists; pure canvas animation problem.
- **Trade Winner Retrospective** — for every historical trade: value at trade time, value today, points scored since. Unique in scope.
- **"This Week in League History"** — lowest complexity, highest weekly engagement. Data fully loaded. Build this early.
- **Achievements & Milestones badge system** — no competitor offers this. Drives re-engagement.
- **Season Narrative / Power Moves Feed** — auto-generated weekly storylines. Possible without per-player stats.
- **Roster Composition Radar** — spider chart per team across QB/RB/WR/TE/age/capital. Data exists.
- **Dynasty Value Stock Market** — roster value trend line per team across the season. Requires forward-caching values going forward; past seasons use trade timestamps as anchors.

### Anti-Features (explicitly do not build)

Live scoreboard, commissioner admin panel, trade simulator, playoff simulator, player news feed, IDP, devy, light mode, framework migration, multi-league support.

### Feature Build Order (from research consensus)

**First — data exists today:**
1. "This Week in League History" (zero new dependencies)
2. Achievements & Milestones (zero new dependencies)
3. Animated Season Standings Race (zero new dependencies)
4. Season Narrative / Power Moves Feed (no per-player stats needed)
5. Roster Value Score + Positional Breakdown (FantasyCalc API)
6. Trade Fairness Score / Trade Winner Retrospective (requires #5)

**Second — requires contracts data completing:**
7. Contract Cliff Chart
8. Player Card Modal (full) with contract + KTC value

**Third — blocked on Sleeper stats endpoint verification:**
9. Optimal Lineup / Bench Efficiency
10. Waiver Wire Value Score

**Defer:**
- Player Journey / Trade Chain (parsing complexity, medium effort)
- Dynasty Value Stock Market (requires forward-caching)
- Full Leaguemate Comparison (builds on everything above)

---

## Architecture Guidance

### How to Scale the Existing Architecture

The architecture is already correct. The layer stack (Config → Cache → Network → Pipeline → D → Helpers → Render → Tab switching) is clean and should not be restructured. Growth pressure comes from file length (~5,631 lines today, projected ~6,500 after roadmap Phase 1-2), not architectural brittleness.

**Four patterns cover everything the roadmap requires:**

| Pattern | Status | Covers |
|---------|--------|--------|
| `dirtyTabs` Set for lazy re-render | Exists | Contracts arriving, history merges |
| DOM-filter (show/hide) instead of re-render | Partial | Year filters, team selects — extend this pattern to every new interactive control |
| Event delegation on `document` | Exists | Player modal, all future click-triggered interactions |
| `D` object extension | Exists | Contracts, cliff data, dynasty values, roster scores |

**For every new render function:** Add a guard at the top checking that required `D` keys are populated before rendering. This prevents silent empty panels when data hasn't loaded yet.

**Render function size limit:** 200 lines. When a render function exceeds that, extract named sub-functions at the same scope level (not nested closures). Example: `renderContractsCliffChart()` extracted from `renderContracts()`.

### Contracts Integration Path

The fetch and parse pipeline is complete. The sheet just needs correct data. One known gap: `D.exemption_history` is read by `openPP()` but never populated in `buildCurrentSeasonData()`. The fix is one line:

```js
D.exemption_history = contractData.exemptions || {};
```

Add this before any contracts-dependent feature ships.

The Google Sheets URL must use the `/d/e/` published format: `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?output=csv`. The normal spreadsheet URL does not support browser CORS fetches.

### Key Patterns to Follow

- **DOM-filter over re-render** for all interactive controls (year filters, team selects, collapsible sections). `filterTradeYear()` is the reference implementation.
- **Scroll-position save/restore** around re-renders triggered by `loadHistory()` when the affected tab is currently active.
- **Inline `onclick` or event delegation** for all new interactive elements — post-render event listeners die on the next `innerHTML` replacement.
- **`trades_by_player` reverse index** in `D` — build at pipeline completion, not on every modal open. O(1) vs O(n) lookup at 500+ trades.
- **Section delimiters** (`// ═══ FEATURE NAME ═══`) for every new section added to the file.

### File Size Projection

| Milestone | Estimated Lines |
|-----------|----------------|
| Current | 5,631 |
| After Phase 1 (quick wins + FantasyCalc) | ~6,000 |
| After Phase 2 (contracts full + modals) | ~6,500 |
| After Phase 3 (charts + differentiators) | ~7,200 |
| Flag for review | 7,500 |

---

## Critical Pitfalls

Ranked by risk level (rewrite risk first):

**1. Google Sheets CSV fails silently — contracts appear non-functional (CRITICAL)**
The contract fetch failing shows no error; the app loads with zero contract data and users assume the feature is broken. Must add: visible warning banner when row count = 0, per-row validation logging, and use only the `/d/e/` published URL format. Check this before any contract feature ships.

**2. `innerHTML` re-renders destroy interactive state mid-session (CRITICAL)**
Historical data merge fires ~10s after load and re-renders the active tab, wiping scroll position, open collapsibles, and animation state. Fix: scroll-position save/restore wrapper for `loadHistory()` re-renders. Establish this pattern in the first phase that adds interactive UI so all subsequent phases inherit it.

**3. Render fires before `D` keys are populated — silent empty panels (CRITICAL)**
New features added to `D` must be populated in `buildCurrentSeasonData()` before any render function reads them. Guard pattern: `if (!D.contracts) return;` at the top of each new render function. This makes the dependency explicit and prevents silent partial renders that look identical to data failures.

**4. Service worker serves stale app — users never see updates (HIGH)**
The SW is likely not even registering correctly (hardcoded `/sw.js` path doesn't resolve on the `/harambes-dozen/` GitHub Pages subdirectory). Fix: correct the paths, add `skipWaiting()`, use versioned cache names. Do this before new features ship so deployment is reliable.

**5. Canvas taint from Sleeper CDN images breaks share card export (HIGH)**
`sleepercdn.com` does not send CORS headers. html2canvas (and html-to-image) cannot export canvases containing these images. Design share cards to use gradient avatar circles (`tcInit()`) rather than player headshots, OR pre-fetch images as base64 data URIs before capture. Do not test with placeholder images — test with actual Sleeper headshots.

**Moderate pitfalls (address in-phase):**

- **localStorage quota exhaustion** — adding contracts cache and dynasty values pushes toward the 5MB limit (2.5MB on iOS Safari). Wrap every `setItem` in try/catch with explicit `QuotaExceededError` handling.
- **CSV manual entry errors** — apostrophes, commas in names, stray empty rows cause silent per-player parse failures. Add row count logging and per-row validation from day one.
- **D mutation order** — new `D` keys must be populated before render functions fire. Grep `init()` and `mergeHistoricalData()` call sequences whenever adding a new data key.
- **XSS gaps** — `openPP()` and trade history already inject unescaped player names. Apply `esc()` to every `p.nm`, `player.name`, `mySide.name` in every render function before shipping.

---

## Open Questions

These are unresolved across all research files and need answers before or during the relevant phase:

1. **Does the Sleeper stats endpoint work?** `api.sleeper.com/stats/nfl/<season>/<week>` — multiple sources indicate it may have been deprecated or rate-limited. Verify against production before committing to Optimal Lineup or Waiver Wire features. LOW confidence. Test with a direct fetch before planning these features.

2. **Does `sleepercdn.com` send CORS headers?** Determines whether base64 pre-fetching is required for share cards (Option 2) or whether using gradient circles is the only viable path (Option 3). Check response headers in DevTools before designing any share card with player headshots.

3. **Is the FantasyCalc API stable enough to rely on?** The app already uses it for pick values. MEDIUM confidence on stability — no official SLA. If it goes down, Roster Value Score and Trade Fairness features break. Should cache values aggressively (24h TTL) and degrade gracefully when the endpoint is unavailable.

4. **What is the current Google Sheets URL in CFG?** Architecture research confirms a real sheet URL is present (not PLACEHOLDER) at line 1416 — but the sheet data format may not match what the parser expects. Needs a test parse against the live sheet before the contracts phase begins.

5. **Is the service worker currently registering at all?** The hardcoded `/sw.js` path may be a 404 on GitHub Pages. If the SW isn't registering, the PWA offline capability is broken. Verify in DevTools Application tab before any SW work.

6. **At what line count does the single-file approach become unworkable?** Architecture research flags 7,500 as the review point and 8,000 as genuinely degraded. This informs how aggressively to consolidate helpers and extract sub-functions as phases ship.

---

## Roadmap Implications

### Suggested Phase Structure

**Phase 1: Infrastructure Hardening**
Rationale: Four infrastructure gaps (service worker paths, localStorage error handling, `D.exemption_history` missing line, NFLkickoff date in CFG) will silently break features built on top of them. Fix the foundation before building.
Delivers: Reliable deployment, correct cache behavior, accurate countdown, contracts pipeline complete.
Pitfalls addressed: #4 (SW stale), #5 (localStorage quota), contracts pipeline gap.
Research flag: Standard patterns — no additional research needed.

**Phase 2: Zero-Dependency Quick Wins**
Rationale: Five differentiator features require zero new data sources and zero new libraries. They deliver immediate user value, prove the broadcast aesthetic works for new feature types, and build momentum before the harder FantasyCalc integration work.
Delivers: "This Week in League History", Achievements & Milestones badges, Animated Season Standings Race, Season Narrative / Power Moves Feed, XSS hardening across all render functions.
Pitfalls addressed: #2 (re-render state), XSS gaps (Pitfall 12).
Research flag: Standard patterns — all data exists, canvas animation is well-documented.

**Phase 3: Contracts Complete**
Rationale: Contracts are the single most requested dynasty-specific feature and the app's core identity differentiator in the contract-league space. Google Sheets URL already in CFG, pipeline already written, one pipeline bug to fix. Completes the feature that's been "in progress."
Delivers: Fully functional contracts tab, Contract Cliff Chart, contract display in Player Card Modal, contract pills working across all tabs.
Pitfalls addressed: #1 (CSV silent failure), Pitfall 7 (CSV parsing errors).
Research flag: Needs validation of live sheet data format before building the cliff chart visualization.

**Phase 4: FantasyCalc Integration (Roster Value)**
Rationale: Roster Value Score is the table-stakes feature most visibly missing. Extending the existing FantasyCalc call from picks-only to all players unlocks four subsequent features. Do this as a foundation phase, not per-feature.
Delivers: Roster Value Score per team, Roster Value Positional Breakdown, Trade Fairness Score, dynasty values in Player Card Modal.
Pitfalls addressed: FantasyCalc stability (cache aggressively, degrade gracefully).
Research flag: Verify FantasyCalc endpoint returns player values (not just pick values) before designing the integration.

**Phase 5: Player Card Modal (Full)**
Rationale: Depends on Phase 3 (contracts) and Phase 4 (dynasty values). Once those data sources are in `D`, the modal upgrade is a render problem — no new data pipelines required.
Delivers: Full player modal with KTC value, contract years, trade history timeline (visual), exemption history, acquisition chain.
Pitfalls addressed: XSS in `openPP()`, canvas taint (if headshots in modal), `trades_by_player` index.
Research flag: Share card from modal will need the canvas-taint investigation resolved first.

**Phase 6: Chart Library Features**
Rationale: Adds Chart.js (lazy-loaded) for the features that need it: Roster Composition Radar, Contract Cliff Chart (if not done as canvas in Phase 3), Dynasty Value Stock Market. Groups the CDN dependency introduction.
Delivers: Radar charts per team, value stock chart, enhanced cliff visualization.
Pitfalls addressed: Canvas context not clearing between re-renders (Pitfall — always `clearRect` before redraw).
Research flag: Chart.js 4.5.1 is verified on CDN — standard implementation, no additional research needed.

**Phase 7: Share Cards**
Rationale: Share card work depends on knowing which player image strategy to use (canvas taint resolution). Defer until after the CORS check on `sleepercdn.com` is resolved. Adds html-to-image.
Delivers: Shareable broadcast-quality stat cards, Web Share API mobile integration.
Pitfalls addressed: #3 (canvas taint) — design must accommodate the chosen image strategy.
Research flag: Confirm Sleeper CDN CORS headers before designing layouts.

### Phase Ordering Rationale

- Infrastructure first because SW and localStorage bugs will silently break features in every subsequent phase
- Quick wins second because they build the broadcast pattern vocabulary for new features (animations, scroll state, re-render safety) without data complexity
- Contracts third because it's the highest-identity incomplete feature and the pipeline is 95% done
- FantasyCalc fourth because it unlocks the most downstream features (4+) and is a data-layer concern that should precede the render-layer features it enables
- Player modal fifth because it legitimately depends on both contracts and dynasty values
- Charts sixth because Chart.js is the only new CDN dependency and grouping chart features together contains the integration surface
- Share cards last because they have the most unresolved dependency (canvas taint) and are the most self-contained

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All CDN URLs verified. Chart.js, CountUp.js, html-to-image confirmed on jsDelivr. Native APIs (dialog, IntersectionObserver, Web Share) MDN-documented. |
| Features | HIGH (table stakes), MEDIUM (differentiators) | Table stakes based on direct competitor analysis. Differentiator value proposition is well-reasoned but unvalidated by actual users of this league. |
| Architecture | HIGH | Based on direct analysis of the 5,631-line codebase, not speculation. Every pattern recommendation is grounded in existing code. |
| Pitfalls | HIGH | Most critical pitfalls verified against official docs (MDN, Sleeper API, html2canvas FAQ, RFC 4180) or the project's own CONCERNS.md. |

**Overall confidence: HIGH**

### Gaps to Address

- **Sleeper stats endpoint** — LOW confidence. Do not plan features around it until verified with a live fetch. If unavailable, Optimal Lineup and Waiver Wire features are off the table.
- **FantasyCalc player values endpoint** — MEDIUM confidence. The pick-value endpoint works; the all-players endpoint is untested in this app. Verify before Phase 4 begins.
- **Sleeper CDN CORS headers** — MEDIUM confidence. CORS behavior reported in community sources but not directly verified. Must check before Share Cards phase.
- **Live Google Sheets data format** — the pipeline is written against an expected column schema. The actual sheet may have different column names. Verify a live parse before Phase 3 cliff chart work.

---

## Sources

### Primary (HIGH confidence)
- Direct analysis of `/Users/aaronwoods/harambes-dozen-repo/index.html` (5,631 lines, 2026-03-31)
- [Sleeper API docs](https://docs.sleeper.com/) — rate limits, endpoint reference
- [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [MDN Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [MDN CORS enabled images](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image)
- [html2canvas FAQ](http://html2canvas.hertzen.com/faq.html)
- [Chart.js 4.5.1 release](https://github.com/chartjs/Chart.js/releases)
- Project's own CONCERNS.md (2026-03-31 audit)

### Secondary (MEDIUM confidence)
- [jsDelivr CDN](https://www.jsdelivr.com/) — CountUp.js 2.10.0, html-to-image 1.11.13 versions verified
- [Dynasty Daddy](https://dynasty-daddy.com/), [KeepTradeCut](https://keeptradecut.com/), [My Fantasy Analyzer](https://myfantasyanalyzer.com/), [League Tycoon](https://leaguetycoon.com/features/) — competitive feature landscape
- [Google Sheets CORS thread](https://support.google.com/docs/thread/56845119) — docs.google.com export URL confirmed CORS-safe
- [FantasyCalc endpoint](https://www.fantasydatapros.com/fantasyfootball/blog/fantasycalc/1) — endpoint pattern confirmed, stability unverified

### Tertiary (LOW confidence)
- Sleeper player stats endpoint availability — community reports conflict; needs direct verification
- Google Sheets August 2025 breaking change — single source, unverified

---

*Research completed: 2026-03-31*
*Ready for roadmap: yes*
