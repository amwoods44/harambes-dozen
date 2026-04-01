# Domain Pitfalls

**Domain:** Dynasty fantasy football companion app — single-file vanilla JS, Google Sheets CSV contracts, Sleeper API, localStorage caching, innerHTML rendering
**Researched:** 2026-03-31
**Confidence:** HIGH (most pitfalls verified from project's own CONCERNS.md + official docs + multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken features, or data corruption.

---

### Pitfall 1: Google Sheets CSV URL Is a Single Point of Failure With No Error Visibility

**What goes wrong:** The app fetches contract data from a published Google Sheets CSV URL. If that fetch fails silently (wrong URL, Google outage, CORS redirect issue, or the sheet owner changes sharing settings), the app loads with zero contract data — no error shown, no warning banner, contracts simply absent. Users see blank contract pills and assume the feature is broken, not that the data source is down.

**Why it happens:** The current architecture treats a failed contract fetch as a no-op. The CORS behavior of published Google Sheets is also non-obvious: the correct URL format is `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?output=csv` (the `/d/e/` path). Using the normal spreadsheet URL (`/d/${SHEET_ID}/`) does not support CORS and will fail from a browser context. Google also changed the published web export behavior in August 2025, breaking some downstream integrations.

**Consequences:** Contract pills are empty. Contract Cliff Chart shows no data. GM Dashboard contract summaries are zero. Releases and exemption tracking are invisible. The feature ships but appears completely non-functional.

**Prevention:**
- Wrap the CSV fetch in explicit try/catch and display a visible warning banner if it fails or returns zero rows
- Validate the response: if parsed rows === 0, treat as failure, not empty data
- Use the `/d/e/` published URL format exclusively — never the raw spreadsheet URL
- Log the fetch result (row count, first row) to a debug flag so issues are diagnosable without opening DevTools
- Document the URL format requirement and what "Publish to the web" settings are required (CSV output, not HTML)

**Warning signs:** Contract pill count is 0. `D.contracts` is empty or undefined. No console errors (silent failure is the danger).

**Phase:** Contracts Integration phase — must be addressed before any contract feature ships.

---

### Pitfall 2: Destructive innerHTML Rendering Kills Interactive State Mid-Session

**What goes wrong:** Every render function (18+ in this app) sets `container.innerHTML = [big string]`. Any time a dirty flag flushes, a filter changes, or `mergeHistoricalData()` runs, the entire panel is rebuilt. DOM state accumulated since the last render — `.open` collapse states, scroll position, active filter values, animation progress — is silently wiped. The user is interacting with the panel when it resets around them.

**Why it happens:** This is the foundational architectural pattern of the app. It's not a bug — it's the intended rendering model. The risk emerges as more interactive elements are added: collapsible player rows in Rosters, year filters in Trades, scroll position in Power Rankings, open/closed player modals.

**Consequences:**
- Scroll position lost on historical data merge (~10 seconds after load). User must re-scroll.
- Collapsible sections in Rosters/GM reset to closed state mid-interaction.
- Year filter in Trades triggers re-render that can scroll user away from context.
- CSS animations (counter animations, stat strip reveals) don't restart on re-render without explicit reflow reset.
- Event listeners added post-render (inside `openPP()`, modal close button) must be re-attached after every render — missing this causes silent listener leaks.

**Prevention:**
- Before any re-render that affects an interactive panel, snapshot state: `const scrollY = panel.scrollTop; const openSections = [...panel.querySelectorAll('.open')].map(el => el.dataset.id);`
- After innerHTML assignment, restore: `panel.scrollTop = scrollY; openSections.forEach(id => panel.querySelector('[data-id="${id}"]')?.classList.add('open'));`
- For CSS animations that must survive re-render: force reflow reset (`el.style.animation='none'; el.offsetHeight; el.style.animation=''`)
- Use event delegation anchored to the static panel container, not elements inside it — this survives innerHTML replacement
- Before shipping any interactive element, explicitly ask: "what happens to this element when this panel's render function runs again?"

**Warning signs:** User reports that filter changes reset their scroll position. Collapsibles close themselves unexpectedly. Animations only play on first load.

**Phase:** Every phase that adds interactive UI. Establish the scroll-snapshot pattern in Phase 1 so later phases inherit it automatically.

---

### Pitfall 3: Player Image Requests Taint the Canvas for html2canvas Share Cards

**What goes wrong:** Share card export uses html2canvas to screenshot a panel containing player headshots served from `sleepercdn.com`. The Sleeper CDN does not return CORS headers that allow `canvas.toDataURL()`. When html2canvas tries to render cross-origin images, the canvas is marked "tainted" and `toDataURL()` throws `DOMException: Tainted canvases may not be exported`. The share card generation fails silently or produces a blank image.

**Why it happens:** The browser's security model prevents reading pixel data from canvases that contain cross-origin images unless the server explicitly allows it via `Access-Control-Allow-Origin`. Sleeper CDN does not do this. html2canvas's `useCORS: true` option only works if the server sends CORS headers — setting the option doesn't bypass the restriction.

**Consequences:** Share card generation fails or exports a card with blank player headshot areas. The feature ships but produces unusable output for any roster-heavy share card.

**Prevention:**
- Do not rely on `useCORS: true` alone — confirm that `sleepercdn.com` sends CORS headers before shipping
- If CDN doesn't support CORS: proxy player images through a base64 conversion before rendering the share card target element. Fetch each image, convert to data URL, set as `<img src="data:...">` before calling html2canvas
- Alternatively: build share cards using only elements with no cross-origin images (text stats, team colors, initials circles via `tcInit()`), which don't taint the canvas
- Test share card export with actual player headshots in place — not a mockup — before considering the feature done

**Warning signs:** `DOMException: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported` in console. Share card renders blank headshot areas.

**Phase:** Share Card phase. Must be investigated before writing share card layout code — the proxy/base64 approach requires design accommodation.

---

### Pitfall 4: Service Worker Serves Stale App After Deployment — Users Never See Updates

**What goes wrong:** The current service worker caches `index.html` and assets. When a new version of the app is deployed to GitHub Pages, users who have visited before are served the old cached version. The service worker enters "waiting" state (new SW detected but old one still active) and the update is only applied after the user closes all tabs — which most users never do deliberately. They continue using an outdated version for days.

**Why it happens:** GitHub Pages sets `Cache-Control: max-age=600` (10 minutes) for static assets. The service worker itself can be cached by the browser's HTTP cache, creating a circular dependency where the old SW checks for updates using cached metadata. The default lifecycle (install → wait → activate) is designed to avoid version conflicts, but in practice means no one sees updates.

**Consequences:** Bug fixes and new features are invisible to returning users. Contract data format changes break against an old parser. The app appears frozen at a past version.

**Prevention:**
- Register the service worker with `{ updateViaCache: 'none' }` to prevent the SW script itself from being HTTP-cached
- Implement `skipWaiting()` in the service worker's install handler so new versions activate immediately
- Add a version constant in the SW cache name (e.g., `cache-v3`) and delete old caches on activate
- For this static app: consider whether the service worker is providing real value vs. causing update headaches — if offline support is not needed, disabling the SW may be simpler than fixing its update strategy
- Fix the hardcoded paths (`/sw.js`, `/manifest.json`) to use relative paths or the `/harambes-dozen/` base path — the current paths don't resolve on GitHub Pages subdirectory and the SW may not even be registering correctly

**Warning signs:** Users report seeing old UI after a deploy. DevTools Application tab shows service worker in "waiting" state. Deployed changes take 24+ hours to reach users.

**Phase:** Infrastructure phase. Fix before adding any new features so feature deployment is reliable.

---

## Moderate Pitfalls

Problems that ship broken features or cause user-visible degradation.

---

### Pitfall 5: localStorage Quota Exhaustion Throws Silently and Corrupts Cache State

**What goes wrong:** localStorage is limited to approximately 5MB per origin. The app stores the full 20K+ player database (significant), historical season data (per-season matchups, rosters, transactions, picks), and the current season. As historical seasons accumulate and new data sources (contract data) are added, the quota fills. When a `localStorage.setItem()` call hits the quota, it throws a `QuotaExceededError`. If this isn't caught, subsequent reads return `null` (the set failed), the cache layer serves stale data without knowing it, and the app silently operates on incomplete state.

**Why it happens:** The app's cache layer has a `_prune()` method that removes old entries when near 4MB, but the prune runs after the write fails — the failing write itself is not caught inside `cache.set()`. Also, Safari on iOS has historically enforced a 2.5MB limit (varies by iOS version), meaning iOS users hit the wall earlier.

**Consequences:** Player database gets partially written. Historical season data disappears between sessions. Contract data cache entry fails to write. Users on iOS see the app behave differently from desktop.

**Prevention:**
- Wrap every `localStorage.setItem()` in try/catch and handle `QuotaExceededError` explicitly: run prune, then retry once, then log failure and continue without caching
- Add size estimation before writes: `JSON.stringify(data).length * 2` (UTF-16 bytes) gives approximate byte size — if estimated size + current usage > 4MB, prune before attempting write
- Track actual cache contents with a lightweight manifest entry so the prune removes logically oldest data, not just first-iterated entries
- Test on Safari/iOS explicitly — the quota is more restrictive and the failure mode is the same

**Warning signs:** App fetches fresh data on every session for some users (cache writes failing silently). `QuotaExceededError` in console. iOS users report app feels slow or loses data.

**Phase:** Infrastructure phase. The prune logic exists but the write-failure handling doesn't. Fix before adding new cached data sources.

---

### Pitfall 6: Sleeper Player Database Fetch Blocks Every Session Without Caching

**What goes wrong:** The `/nfl/players` endpoint returns approximately 5MB of JSON (~20K players). Sleeper's own documentation says this endpoint should be called "once per day at most." Without proper caching, this blocks the loading sequence on every session. If the TTL check fails (localStorage cleared, incognito mode, iOS private browsing), this 5MB fetch happens on every page load.

**Why it happens:** The 24-hour cache TTL is implemented but doesn't account for private/incognito browsing where localStorage is wiped per session. The fetch also happens serially before the app renders anything useful.

**Consequences:** 1-3 second loading delay on every session for users without cached player data. In incognito or private browsing, every session pays this cost. Fetching this endpoint too frequently risks IP-level rate limiting (Sleeper's documented limit is 1000 calls/minute across all users of the shared endpoint).

**Prevention:**
- Cache player data for 24 hours as currently intended — verify the TTL check is actually working end-to-end (it's a reported concern in CONCERNS.md)
- Separate the player DB fetch from the loading sequence: show the app with roster data first, then hydrate player names/headshots after
- Fall back to a minimal embedded player map (just rostered players) if the full DB is unavailable, rather than blocking render

**Warning signs:** App takes 3+ seconds to load even on return visits. Network tab shows `/nfl/players` fetching on every load.

**Phase:** Infrastructure phase. Validate cache is working before relying on it.

---

### Pitfall 7: CSV Manual Entry Errors Break Contract Data Parsing

**What goes wrong:** Contract data is manually entered in Google Sheets by the commissioner. Any formatting deviation from what the parser expects — extra spaces, a comma inside a player name, an apostrophe in a team name, a stray empty row — causes silent parse failures. The affected player's contract disappears from the UI with no diagnostic output.

**Why it happens:** CSV parsing is brittle. Fields containing commas must be quoted per RFC 4180, but a commissioner entering data in Google Sheets may not know this. Player names like "D'Andre Swift" contain apostrophes that can confuse parsers. An empty last row is common in Sheets exports and trips up parsers expecting N rows to equal N contracts.

**Consequences:** Individual player contracts go missing while others load correctly. Years-remaining counter is wrong for specific players. Release eligibility is incorrect. Hard to diagnose without row-by-row inspection.

**Prevention:**
- After CSV parsing, log a summary: "Parsed N contracts covering M unique players across P teams" — any deviation from expected totals is immediately visible
- Validate every parsed row: does it have a roster_id, a player identifier, and a valid year count (1-7)? Log and skip malformed rows rather than crashing or silently omitting
- Document exact required column names and format in a header row in the sheet itself (the parser should skip the header but the sheet should explain itself to human editors)
- Test parsing with edge-case names: apostrophes, periods, commas-in-quotes, trailing whitespace

**Warning signs:** Contract count in UI doesn't match expected total. Specific well-known players show no contract when they should. Parser returns no errors but contract list is incomplete.

**Phase:** Contracts Integration phase. Write the parser defensively from the start — retrofitting validation is harder.

---

### Pitfall 8: Global `D` Object Mutation Order Determines Rendering Correctness

**What goes wrong:** All 18+ render functions read from the global `D` object. If a render function fires before its required data keys are populated (out of order in `init()` or `mergeHistoricalData()`), it reads `undefined` and renders empty panels without any error. The bug looks identical to a data source failure — silent empty state with no indication of why.

**Why it happens:** As new features are added, new keys are added to `D` and new render functions are written. The call order in `init()` and `mergeHistoricalData()` must be updated to match. Forgetting to update this order — or updating it in the wrong place — causes renders to fire before their data exists.

**Consequences:** A new contract-dependent render function fires before `D.contracts` is populated. Roster composition radar chart fires before player values are loaded. Silently empty panels that require data archaeology to diagnose.

**Prevention:**
- Before writing any new render function, document which `D` keys it requires. Check `init()` and `mergeHistoricalData()` call sequences and verify the render fires after all dependencies are populated
- Add a guard at the top of each render function: `if (!D.contracts || !D.rosters) return;` — this makes the dependency explicit and prevents silent partial renders
- When adding a new data key to `D`, grep for every render function that will use it and verify the render-after-data ordering

**Warning signs:** New feature panel is blank immediately after implementing it despite data appearing correct. Removing the render call from a specific location and moving it 10 lines down in `init()` suddenly fixes the blank state.

**Phase:** Every phase that adds new data to `D`. Establish the guard pattern in Phase 1.

---

## Minor Pitfalls

Nuisances that degrade quality but don't break features.

---

### Pitfall 9: CSS Animation State Lost on Re-Render Requires Explicit Reflow Reset

**What goes wrong:** Number counter animations, stat strip reveals, and transition effects are CSS-driven. When a panel's `innerHTML` is replaced, CSS animations don't re-trigger automatically — the browser doesn't perceive the new element as "entering" the animation. Elements that should animate on reveal are static.

**Prevention:**
- After innerHTML reassignment: `el.style.animation = 'none'; void el.offsetHeight; el.style.animation = '';`
- Or use a brief setTimeout (0ms is sufficient) to allow the browser to register the element as newly inserted before starting animation

**Phase:** Any phase adding animated stats or reveal effects.

---

### Pitfall 10: Tooltip Positioning Breaks Inside Overflow-Hidden Ancestors

**What goes wrong:** Tooltips using `position: fixed` or `position: absolute` get clipped by ancestor elements with `overflow: hidden` or `overflow: scroll`. The draft timeline tooltip flickering (documented in CONCERNS.md) is caused by exactly this. As more data-dense views are added, more tooltips will hit this issue.

**Prevention:**
- Use `position: fixed` with coordinates relative to `viewport` for all tooltips, but ensure the positioned ancestor is `document.body`, not a scrollable container
- Or portal tooltips by appending them directly to `document.body` with JS positioning, then removing on mouseleave

**Phase:** Any phase adding tooltips or hover-reveal data (Player Card Modal, Roster Radar, Value Stock Market).

---

### Pitfall 11: The NFL Kickoff Date Hardcode Will Silently Corrupt the Countdown Each Season

**What goes wrong:** The countdown timer uses a hardcoded date literal `new Date('2026-09-10T20:20:00')`. After kickoff, the countdown shows "NFL IN SEASON" correctly. After the season ends, the countdown permanently shows "NFL IN SEASON" until someone manually updates the date and deploys.

**Prevention:**
- Move the date to `CFG.kickoffDate` (documented as a known issue, just needs to be done)
- Add a prominent comment: `// UPDATE BEFORE EACH SEASON — check NFL schedule in July`

**Phase:** Infrastructure phase. One-line fix that should be done before any new season-sensitive features ship.

---

### Pitfall 12: `esc()` / XSS Coverage Gaps Will Expand as More Player-Surface Features Are Added

**What goes wrong:** Player names are escaped at data load via `esc()`, but the Player Card Modal (`openPP()`), trade cards, and scatter plot labels inject player data through template literals. As new views are added (Player Journey timelines, Trade Chain visualizations), new injection sites are created. Each one that doesn't use `esc()` is an XSS surface.

**Prevention:**
- Before shipping any render function that uses player names or team names in template literals, grep for every `p.nm`, `player.name`, `t.name`, `roster.owner_name` interpolation in the function and verify each is wrapped in `esc()`
- Add a lint-style comment convention: `// XSS: esc() applied` on each template literal line that injects user data

**Phase:** Every phase. Most critical in Player Card Modal phase and Trade Chain phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Contracts Integration | Silent CSV fetch failure shows no error | Validate row count, show banner if zero contracts parsed |
| Contracts Integration | Manual entry errors corrupt individual player data | Defensive per-row validation with logging |
| Player Card Modal | html2canvas canvas taint from Sleeper CDN images | Test cross-origin headshot export before writing layout code |
| Player Card Modal | New XSS injection sites in modal template | Apply esc() to every p.nm / player.name in openPP() |
| Share Cards | Canvas taint from cross-origin player images | Proxy images to base64 or build cards without headshots |
| Roster Radar Chart | Canvas element not clearing between re-renders | Always call ctx.clearRect(0, 0, width, height) before redraw |
| Animated Standings Race | CSS animation lost on re-render | Implement reflow reset pattern from day one |
| Trade Chains / Player Journey | New XSS surface from player name timeline rendering | esc() on every injected string |
| PWA Fix | SW serves stale app after deploy | Add skipWaiting() + versioned cache names before fixing paths |
| localStorage expansion | Adding contracts cache pushes toward 5MB quota | Add write-failure catch and prune-before-write size check |
| Any new tab | Render fires before D keys populated | Add data guard at top of every new render function |

---

## Sources

- Project's own `CONCERNS.md` (2026-03-31 audit) — HIGH confidence, project-specific
- [Sleeper API official documentation](https://docs.sleeper.com/) — rate limits, player endpoint guidance — HIGH confidence
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — localStorage limits — HIGH confidence
- [html2canvas FAQ and cross-origin taint issues](http://html2canvas.hertzen.com/faq.html) — canvas taint behavior — HIGH confidence
- [MDN: CORS enabled images in canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image) — canvas taint mechanism — HIGH confidence
- [Infinity Interactive: Taming PWA Cache Behavior](https://iinteractive.com/resources/blog/taming-pwa-cache-behavior) — service worker update pitfalls — MEDIUM confidence
- [web.dev: Improving HTML5 Canvas performance](https://web.dev/articles/canvas-performance) — canvas rendering — HIGH confidence
- [Google Workspace Status Dashboard](https://www.google.com/appsstatus/dashboard/) — Sheets outage history — MEDIUM confidence
- [RFC 4180 CSV special character handling](https://inventivehq.com/blog/how-do-i-handle-csv-files-with-special-characters-and-delimiters) — CSV parsing edge cases — MEDIUM confidence
- Community reports on Google Sheets published CSV URL changes (August 2025) — MEDIUM confidence (single source)
