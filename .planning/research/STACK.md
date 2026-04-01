# Technology Stack

**Project:** Harambe's Dozen — Dynasty HQ
**Researched:** 2026-03-31
**Constraint:** Vanilla HTML/CSS/JS only. CDN-loadable libraries only. No npm, no build tools, no framework.

---

## Current Stack (Already Deployed)

These are working and should not be changed.

| Technology | Version | Purpose |
|------------|---------|---------|
| Vanilla JS (ES6+) | Browser-native | All runtime logic |
| CSS3 custom properties | Browser-native | Design tokens, theming |
| Canvas 2D API | Browser-native | Custom charting (consistency scatter, sparklines) |
| Fetch API | Browser-native | All HTTP requests |
| LocalStorage | Browser-native | TTL-based caching |
| Service Worker | Browser-native | PWA, offline caching |
| html2canvas | 1.4.1 via jsDelivr | Share card / screenshot export (already loaded) |
| Google Fonts (Oswald, Inter, JetBrains Mono) | CDN | Typography |

---

## Recommended Additions

### Charting: Chart.js

**Why:** The app already uses hand-rolled Canvas 2D for charts. The upcoming features — Roster Composition Radar Chart, Contract Cliff (stacked area), Dynasty Value Stock Market (line), Animated Season Standings Race (racing bar) — are complex enough that custom Canvas code will take 10x longer to write and maintain than Chart.js. Chart.js covers every required chart type natively, ships as a single UMD file, and costs 12KB extra on the wire (gzipped). It does not conflict with existing hand-rolled canvas code.

**Confidence:** HIGH — verified on official docs and jsDelivr CDN.

| Property | Value |
|----------|-------|
| Version | 4.5.0 (latest stable, released June 2024; 4.5.1 released October 2024 — both available) |
| CDN (recommended) | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js` |
| CDN (alternate) | `https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js` |
| Load strategy | Lazy-load on first tab activation that needs a chart — not in `<head>` |
| UMD global | `window.Chart` — accessible immediately after script loads |
| Gzip size | ~64KB (full library, all chart types) |

**Chart types this enables (all needed for roadmap):**

| Feature | Chart.js Type |
|---------|---------------|
| Roster Composition Radar | `radar` |
| Contract Cliff (talent expiration) | `line` with `fill: true`, stacked |
| Dynasty Value Stock Market | `line` |
| Animated Season Standings Race | `bar` (horizontal), animated per-frame |

**Usage pattern (consistent with existing app style):**

```javascript
// Lazy-load, then initialize
function loadChartJs(cb) {
  if (window.Chart) return cb();
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js';
  s.onload = cb;
  document.head.appendChild(s);
}
```

**What NOT to do:** Do not use Chart.js for the existing consistency scatter plot or sparklines — those are already shipping and re-implementing them creates churn with zero user value.

---

### Number Animations: CountUp.js

**Why:** The "number counter animations on stat strips" requirement means animating scores, win totals, point rankings — the kind of numbers that broadcast dashboards run up from zero when a panel loads. Writing requestAnimationFrame loops from scratch is ~40 lines per counter; CountUp.js is 3 lines and handles easing, decimals, separators, and IntersectionObserver auto-start. The UMD build is 6.8KB unzipped.

**Confidence:** HIGH — verified on jsDelivr CDN directory listing.

| Property | Value |
|----------|-------|
| Version | 2.10.0 (latest, released March 2024) |
| CDN | `https://cdn.jsdelivr.net/npm/countup.js@2.10.0/dist/countUp.umd.js` |
| UMD global | `window.countUp.CountUp` |
| Size | 6.8KB unzipped |

**Usage pattern:**

```javascript
// Load once, reuse across all stat strips
var c = new countUp.CountUp('el-id', 2847, { duration: 1.5, separator: ',' });
c.start();
```

**When to use:** Stat strips, award card numbers, franchise total points, win/loss totals. Not for score cells in tables (too many DOM nodes).

**Alternative considered:** Rolling the animation by hand. Viable for 1-2 counters, but the app will have 10-20 animated stat values across multiple tabs. Library wins here.

---

### Screenshot / Share Cards: html-to-image (replace html2canvas)

**Why:** html2canvas v1.4.1 is already loaded. However, it has known issues with modern CSS — clip-path (used heavily for `.bh` broadcast headers), CSS grid, and backdrop-filter all fail silently or render incorrectly. html-to-image v1.11.13 is the actively maintained successor, works via SVG foreignObject rather than canvas re-rendering, and handles modern CSS correctly. It also supports `toBlob()` directly, which is required for the Web Share API file sharing path.

**Confidence:** MEDIUM — version verified on jsDelivr. CSS compatibility is based on community reports and the library's active maintenance status vs. html2canvas's near-zero maintenance since 2022.

| Property | Value |
|----------|-------|
| Version | 1.11.13 (released February 2025, latest) |
| CDN | `https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/dist/html-to-image.js` |
| UMD global | `window.htmlToImage` — exposes `.toPng()`, `.toBlob()`, `.toSvg()`, `.toCanvas()` |
| Size | 20KB unzipped |

**Transition plan:** Keep html2canvas as the existing loaded script for any share cards already working. Add html-to-image alongside it for new share card work. If html-to-image proves more reliable in practice, swap fully.

**Critical limitation — cross-origin images:** Both libraries are blocked by the browser's canvas taint security model when images come from a different origin. Sleeper CDN images (`sleepercdn.com`) will taint the canvas unless they return `Access-Control-Allow-Origin: *` headers AND the `<img>` elements use `crossOrigin="anonymous"`. This is the same constraint html2canvas faces. The share card implementation must either:
1. Render headshots as CSS background-image (skipped in capture), or
2. Pre-fetch player images as base64 data URIs before capture, or
3. Omit player headshots from share cards entirely and rely on gradient avatar circles (already implemented via `tcInit()`)

Option 3 is lowest risk. Option 2 requires a fetch-to-blob conversion step before capture.

**What NOT to do:** Do not load html-to-image in the critical path — lazy-load it only when a user triggers a share action.

---

### Sharing: Web Share API (browser-native, no library)

**Why:** The Web Share API (`navigator.share()`) is the correct way to trigger OS-level share sheets on iOS and Android. It requires no library — just a button click handler and a `navigator.canShare()` guard. Combined with html-to-image's `toBlob()` output, this enables native share-to-Messages, AirDrop, Instagram Stories, etc. on mobile without any server infrastructure.

**Confidence:** HIGH — MDN documented, available since Safari 12.1 on iOS, Chrome 61 desktop.

**Support (2025):** ~88% global browser support. Falls back gracefully: desktop browsers that don't support file sharing still get the download path.

**Pattern:**

```javascript
async function shareCard(blob) {
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
    await navigator.share({ files: [...], title: "Harambe's Dozen" });
  } else {
    // Fallback: download link
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'card.png'; a.click();
    URL.revokeObjectURL(url);
  }
}
```

**What NOT to use:** Third-party sharing SDKs (AddThis, ShareThis) — they add trackers, require accounts, and don't integrate with native OS share sheets.

---

### Modal Dialogs: Native `<dialog>` element + CSS `@starting-style`

**Why:** Player Card Modal requires an accessible, keyboard-dismissible, focus-trapped overlay. The native `<dialog>` element handles all of this — `showModal()` traps focus, `Escape` closes it, backdrop click can close it with one listener. No library needed. For entry/exit animation, CSS `@starting-style` (now Baseline 2024, ~86% browser support as of late 2025) enables `opacity` and `transform` transitions on open/close without JavaScript animation logic.

**Confidence:** HIGH for `<dialog>` behavior. MEDIUM for `@starting-style` (86% support is good but not universal — fallback is instant-show without animation, which is acceptable).

**Pattern:**

```javascript
// Open
document.getElementById('player-modal').showModal();
// Close on backdrop click
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
```

```css
dialog {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 200ms ease, transform 200ms ease, display 200ms allow-discrete;
}
dialog[open] {
  opacity: 1;
  transform: translateY(0);
}
@starting-style {
  dialog[open] { opacity: 0; transform: translateY(12px); }
}
```

**What NOT to use:** A JavaScript modal library (micromodal, etc.) — they add weight and an abstraction layer on top of a native browser primitive that now does the job well.

---

### Scroll-Triggered Entry: IntersectionObserver (browser-native, no library)

**Why:** Stat strips and achievement badges should animate into view when the user scrolls to them. IntersectionObserver is the correct, performant, zero-library approach — it runs off the main thread and avoids scroll event polling. All modern browsers support it. A single shared observer instance can watch every animatable element in the document.

**Confidence:** HIGH — native browser API, universally supported.

**Pattern (minimal):**

```javascript
var io = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
  });
}, { threshold: 0.2 });
document.querySelectorAll('[data-animate]').forEach(function(el) { io.observe(el); });
```

**What NOT to use:** ScrollReveal, AOS, or any scroll animation library — they add overhead for something a 10-line observer handles perfectly.

---

## Data APIs (External Services, Not Libraries)

These are fetched, not imported. All public, no auth required.

| API | Endpoint | Purpose | Notes |
|-----|----------|---------|-------|
| Sleeper | `https://api.sleeper.app/v1/...` | All league data: rosters, transactions, picks, matchups | Public, no auth. Courtesy rate limit: <1000 req/min. Already in use. |
| FantasyCalc (dynasty values) | `https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=12&ppr=1` | Player trade values | Public, no auth. Used as `ktcUrl` in existing CFG. MEDIUM confidence on stability — no official SLA. |
| Google Sheets CSV | `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}` | Contract data | Public published sheet. Browser fetch works (CORS headers present on `docs.google.com` export URLs). Currently `PLACEHOLDER_SHEET_ID`. |
| Sleeper CDN | `https://sleepercdn.com/content/nfl/players/{id}.jpg` | Player headshots | Image CDN. CORS: images are tagged cross-origin — do NOT set `crossOrigin="anonymous"` unless you have confirmed CORS headers; doing so incorrectly breaks image load. |

**Google Sheets CORS note:** There is a known distinction between two Google Sheets URL patterns. The `docs.google.com/spreadsheets` export URL does support CORS in browser fetch when the sheet is published to the web. The older `spreadsheets.google.com` URL does not. Use the `docs.google.com` export pattern.

---

## What NOT to Add

| Category | Rejected Option | Reason |
|----------|----------------|---------|
| Animation | GSAP / anime.js | 70-100KB for what CSS transitions + CountUp.js cover. Zero-dependency identity. |
| Charts | D3.js | 70KB+ library with steep learning curve for the author context. Chart.js covers all required types with a simpler API. |
| Charts | Plotly | 3MB bundle. Absolute non-starter for a CDN-loaded single-file app. |
| DOM screenshots | Puppeteer / Playwright | Server-side only. GitHub Pages is static — no server. |
| Utilities | Lodash | ES6 native methods (map, filter, find, Object.entries) cover all needed utility operations. |
| Data fetching | Axios | Fetch API is sufficient and native. |
| Modals | Micromodal / vanilla-modal | `<dialog>` is now the correct primitive. Library adds weight for no gain. |
| Scroll animation | AOS / ScrollReveal | IntersectionObserver does the same thing natively. |
| State management | Any reactive library | Global `D` object is load-bearing. Not replaceable without full rewrite. |

---

## CDN Load Order Recommendation

```html
<!-- In <head> — critical path, always loaded -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300..900&family=Inter:wght@400..900&family=JetBrains+Mono:wght@500..800&display=swap" rel="stylesheet">

<!-- Before closing </body> — deferred, non-critical -->
<!-- html2canvas — already present, keep for existing share card -->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" defer></script>
```

```javascript
// Lazy-loaded on demand — do not put in <script> tags
// Chart.js: loaded when first chart tab activates
// CountUp.js: loaded on first tab with stat strips
// html-to-image: loaded only when user triggers share
```

Lazy-loading keeps first paint fast. The existing app loads in ~1.2s on a 4G connection per the GitHub Pages deployment — we should not regress that.

---

## Sources

- Chart.js releases: https://github.com/chartjs/Chart.js/releases (verified v4.5.1, October 2024)
- Chart.js CDN: https://cdnjs.com/libraries/Chart.js/ (verified v4.5.0 available)
- Chart.js radar chart docs: https://www.chartjs.org/docs/latest/charts/radar.html
- CountUp.js releases: https://github.com/inorganik/countUp.js (verified v2.10.0, March 2024)
- CountUp.js CDN dist: https://cdn.jsdelivr.net/npm/countup.js@2.10.0/dist/ (verified `countUp.umd.js`)
- html-to-image CDN: https://www.jsdelivr.com/package/npm/html-to-image (verified v1.11.13, February 2025)
- html-to-image dist: https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/dist/ (verified `html-to-image.js`)
- Web Share API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- dialog + @starting-style: https://frontendmasters.com/blog/animating-dialog/ (86% browser support confirmed)
- IntersectionObserver: MDN, universally supported in evergreen browsers
- Sleeper API: https://docs.sleeper.com/ (rate limit: <1000 req/min)
- FantasyCalc API: https://www.fantasydatapros.com/fantasyfootball/blog/fantasycalc/1 (endpoint confirmed)
- Google Sheets CORS: https://support.google.com/docs/thread/56845119 (docs.google.com export URL confirmed CORS-safe in browser)
- Canvas taint / CORS: https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image
- html-to-image vs html2canvas comparison: https://npm-compare.com/dom-to-image,html-to-image,html2canvas
