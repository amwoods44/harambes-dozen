# Championship Banner Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current rectangular championship banners with V-cut pennant-shaped banners featuring gold trim, a metallic gold trophy SVG, and modern broadcast-quality typography.

**Architecture:** Single-file change to `index.html`. Replace ~23 CSS class definitions (lines 340-362) with new pennant styles, and rewrite the JS banner render loop (lines 2604-2664) with the new HTML structure and inline SVG trophy. No new files, no dependencies.

**Tech Stack:** Vanilla CSS, vanilla JS, inline SVG

**Model: Sonnet** — design is fully decided, this is straight execution from the locked mockup.

---

### Task 1: Replace Banner CSS

**Files:**
- Modify: `index.html:340-362` (CSS section)

- [ ] **Step 1: Replace the old banner CSS classes with new pennant styles**

Replace everything from `.rafters-beam` through `.rafter-latest-glow` (lines 340-362) with:

```css
.rafters-beam{width:100%;height:12px;background:linear-gradient(180deg,#5a5a5a,#2a2a2a,#3a3a3a);border-radius:3px;box-shadow:0 8px 30px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.08)}
.rafters-row{display:flex;gap:14px;padding:0;justify-content:center;flex-wrap:wrap;align-items:flex-start}
.rafter-banner{display:flex;flex-direction:column;align-items:center;transition:transform .3s}
.rafter-banner:hover{transform:translateY(-3px)}
.banner-mount{width:186px;height:9px;background:linear-gradient(180deg,#5a5a5a,#2a2a2a,#3a3a3a);border-radius:2px;position:relative;z-index:2;box-shadow:0 5px 18px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.06);margin-top:7px}
.banner-rivet{position:absolute;top:-3px;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#aaa,#555);border:1px solid #666;box-shadow:0 2px 6px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.2)}
.banner-rivet-l{left:8px}
.banner-rivet-r{right:8px}
.banner-pn-wrap{width:174px;margin-top:-1px;position:relative;filter:drop-shadow(0 14px 40px rgba(0,0,0,.7))}
.banner-pn-outer{width:174px;clip-path:polygon(0 0,100% 0,100% 88%,50% 100%,0 88%);position:relative;display:flex;flex-direction:column}
.banner-gold{height:5px;flex-shrink:0;background:linear-gradient(90deg,#a07828,#e8c65a,#d4a843,#e8c65a,#a07828)}
.banner-accent{height:3px;flex-shrink:0}
.banner-panel{min-height:440px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;padding:24px 14px 52px}
.banner-fold-l{position:absolute;top:0;left:0;width:14px;height:100%;background:linear-gradient(90deg,rgba(0,0,0,.2),transparent);pointer-events:none;z-index:2}
.banner-fold-r{position:absolute;top:0;right:0;width:14px;height:100%;background:linear-gradient(-90deg,rgba(0,0,0,.2),transparent);pointer-events:none;z-index:2}
.banner-felt{position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 1px,rgba(0,0,0,.015) 1px,rgba(0,0,0,.015) 2px);pointer-events:none}
.banner-label{font-family:var(--fd);font-size:10px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;position:relative;z-index:3}
.banner-year{font-family:var(--fd);font-size:74px;font-weight:900;line-height:.88;margin-top:12px;position:relative;z-index:3;text-shadow:0 2px 0 rgba(0,0,0,.3),0 -1px 0 rgba(255,255,255,.08),0 4px 10px rgba(0,0,0,.35)}
.banner-trophy{margin:22px 0 20px;position:relative;z-index:3}
.banner-trophy svg{display:block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))}
.banner-name{font-family:var(--fd);font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;line-height:1.2;word-break:break-word;max-width:150px;color:#fff;position:relative;z-index:3;text-shadow:0 2px 4px rgba(0,0,0,.35)}
.banner-divider{width:40px;height:1px;margin:12px auto;position:relative;z-index:3}
.banner-defeated{font-family:var(--fd);font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;position:relative;z-index:3}
.rafter-latest-glow{position:absolute;top:-16px;left:50%;transform:translateX(-50%);width:200px;height:500px;background:radial-gradient(ellipse at top,rgba(255,204,0,.06),transparent 50%);pointer-events:none}
```

- [ ] **Step 2: Verify no leftover old class references**

Search for any CSS classes that were removed but might still be referenced elsewhere (these were all only used in the banner render loop, which gets replaced in Task 2):
- `.banner-top` — removed (was the top section wrapper)
- `.banner-cloth` — removed (replaced by `.banner-pn-wrap` + `.banner-pn-outer`)
- `.banner-dynasty` — removed (replaced by `.banner-label`)
- `.banner-champ` — removed (was "CHAMPION" text)
- `.banner-seam` — removed
- `.banner-bottom` — removed
- `.banner-av` — removed (avatar circle)
- `.banner-sub` — removed (replaced by `.banner-defeated`)
- `.banner-fringe` — removed (V-cut replaces fringe)

All of these were only generated by `renderTrophies()` which gets rewritten in Task 2. No other code references them.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(rafters): replace banner CSS with V-cut pennant styles"
```

---

### Task 2: Rewrite Banner Render Loop

**Files:**
- Modify: `index.html:2604-2664` (JS inside `renderTrophies()`)

- [ ] **Step 1: Replace the banner render loop**

Replace everything from line 2604 (`function hexLum`) through line 2664 (closing `});` of `champs.forEach`) with the following. Keep line 2602 (`const champs=[...D.champions].reverse();`) and line 2603 (blank) intact.

```js
  // ── Trophy SVG (always gold) ──
  function trophySvg(id){
    return '<svg width="68" height="76" viewBox="0 0 68 76" fill="none" xmlns="http://www.w3.org/2000/svg">'
      +'<defs>'
      +'<linearGradient id="gc'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8c65a" stop-opacity=".85"/><stop offset="35%" stop-color="#d4a843" stop-opacity=".7"/><stop offset="60%" stop-color="#a07828" stop-opacity=".8"/><stop offset="100%" stop-color="#e8c65a" stop-opacity=".6"/></linearGradient>'
      +'<linearGradient id="gh'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8c65a" stop-opacity=".65"/><stop offset="100%" stop-color="#a07828" stop-opacity=".4"/></linearGradient>'
      +'<linearGradient id="gb'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8c65a" stop-opacity=".75"/><stop offset="100%" stop-color="#8a6420" stop-opacity=".9"/></linearGradient>'
      +'</defs>'
      +'<rect x="16" y="5" width="36" height="5" rx="2.5" fill="url(#gc'+id+')"/>'
      +'<path d="M18 10 L50 10 L47 36 C45 44 40 48 34 48 C28 48 23 44 21 36 Z" fill="url(#gc'+id+')"/>'
      +'<path d="M18 16 C18 16,5 16,5 28 C5 38,15 40,20 35" stroke="url(#gh'+id+')" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
      +'<path d="M50 16 C50 16,63 16,63 28 C63 38,53 40,48 35" stroke="url(#gh'+id+')" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
      +'<rect x="30" y="48" width="8" height="10" rx="2" fill="url(#gb'+id+')"/>'
      +'<rect x="24" y="58" width="20" height="4" rx="2" fill="url(#gb'+id+')"/>'
      +'<rect x="17" y="62" width="34" height="8" rx="2.5" fill="url(#gb'+id+')"/>'
      +'<path d="M27 14 C27 20,27 32,29 40 C30 44,32 46,34 46" stroke="#e8c65a" stroke-opacity=".2" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
      +'<path d="M34 22 L36 28 L42 28 L37 32 L38.5 38 L34 35 L29.5 38 L31 32 L26 28 L32 28 Z" fill="#e8c65a" fill-opacity=".2"/>'
      +'</svg>';
  }
  // ── Darken hex helper ──
  function darken(hex,amt){var h=hex.replace('#','');var r=Math.max(0,parseInt(h.substring(0,2),16)-amt),g=Math.max(0,parseInt(h.substring(2,4),16)-amt),b=Math.max(0,parseInt(h.substring(4,6),16)-amt);return'#'+[r,g,b].map(function(v){return v.toString(16).padStart(2,'0')}).join('');}

  h+='<div class="rafters-scene">';
  h+='<div class="rafters-beam"></div>';
  h+='<div class="rafters-row">';
  champs.forEach(function(c,ci){
    var isLatest=ci===champs.length-1;
    var tc=TC[c.champ_rid]||{p:'#cc0000',s:'#fff',i:'??'};
    var pri=tc.p, sec=tc.s;
    var clothDark=darken(pri,60);
    var isWhite=sec==='#fff'||sec==='#FFFFFF'||sec==='#ffffff';
    // Label + defeated colors
    var lblCol=isWhite?'rgba(255,255,255,.65)':sec;
    var lblOp=isWhite?'1':'.7';
    var defCol=isWhite?'rgba(255,255,255,.55)':sec;
    var defOp=isWhite?'1':'.6';
    var divBg=isWhite?'rgba(255,255,255,.15)':sec+'33';

    h+='<div class="rafter-banner" style="position:relative">';
    if(isLatest) h+='<div class="rafter-latest-glow"></div>';
    // Mount + rivets
    h+='<div class="banner-mount"><div class="banner-rivet banner-rivet-l"></div><div class="banner-rivet banner-rivet-r"></div></div>';
    // V-cut pennant
    h+='<div class="banner-pn-wrap">';
    h+='<div class="banner-pn-outer">';
    h+='<div class="banner-gold"></div>';
    h+='<div class="banner-accent" style="background:'+sec+'"></div>';
    h+='<div class="banner-panel" style="background:linear-gradient(175deg,'+pri+','+clothDark+')">';
    h+='<div class="banner-fold-l"></div><div class="banner-fold-r"></div><div class="banner-felt"></div>';
    h+='<div class="banner-label" style="color:'+lblCol+';opacity:'+lblOp+'">DYNASTY CHAMPS</div>';
    h+='<div class="banner-year" style="color:'+sec+'">'+c.year+'</div>';
    h+='<div class="banner-trophy">'+trophySvg(ci)+'</div>';
    h+='<div class="banner-name">'+c.champion+'</div>';
    h+='<div class="banner-divider" style="background:'+divBg+'"></div>';
    h+='<div class="banner-defeated" style="color:'+defCol+';opacity:'+defOp+'">DEF. '+c.runner_up+'</div>';
    h+='</div>';
    h+='</div>';
    h+='</div>';
    h+='</div>';
  });
```

Key differences from old code:
- No more `hexLum()` — white detection uses string comparison instead
- No more avatar/initials circle
- No more name truncation — `word-break: break-word` handles it in CSS
- No more top/bottom split — single panel
- No more fringe — V-cut clip-path on `.banner-pn-outer`
- Trophy is always gold — `trophySvg()` uses fixed gold gradient IDs
- Uses `c.champion` and `c.runner_up` directly (existing data properties) — no truncation

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat(rafters): rewrite banner render loop — V-cut pennants with gold trophy"
```

---

### Task 3: Verify and Fix Edge Cases

**Files:**
- Modify: `index.html` (if fixes needed)

- [ ] **Step 1: Open the app and navigate to The Rafters**

Open `index.html` in a browser. Scroll to The Rafters section. Verify:
- All championship banners render with V-cut pennant shape
- Gold trim strip visible at top of each banner
- Team accent color strip below gold
- "DYNASTY CHAMPS" label visible
- Year is large (74px) with emboss shadow
- Gold trophy visible on every banner
- Champion name readable (18px, white, word-wrapping)
- Divider line visible
- "DEF. {runner-up}" visible in accent color

- [ ] **Step 2: Check all team color combinations**

Verify contrast and readability for:
- Dark cloth + gold accent (e.g., Packers green + gold)
- Dark cloth + white accent (e.g., Texas burnt orange + white)
- Dark cloth + yellow accent (e.g., Maroon + gold, Blue + gold)

The trophy should be identical gold on all banners.

- [ ] **Step 3: Check responsive at 768px and 480px**

Resize browser to mobile widths. The banners should wrap naturally via `flex-wrap: wrap` on `.rafters-row`. No horizontal overflow. If banners are too wide for mobile, add this to the `@media(max-width:768px)` block:

```css
.banner-pn-wrap{width:140px}
.banner-pn-outer{width:140px}
.banner-mount{width:152px}
.banner-year{font-size:58px}
.banner-name{font-size:15px}
.banner-panel{min-height:360px;padding:20px 10px 44px}
```

- [ ] **Step 4: Check hover effect**

Hover over a banner — it should lift 3px via `transform:translateY(-3px)` on `.rafter-banner:hover`. The drop-shadow on `.banner-pn-wrap` should move with it.

- [ ] **Step 5: Commit any fixes**

```bash
git add index.html
git commit -m "fix(rafters): responsive and edge case fixes for pennant banners"
```

Only commit if changes were needed. If everything works, skip this step.
