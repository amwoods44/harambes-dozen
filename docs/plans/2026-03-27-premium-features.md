# Premium Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 premium features to the Harambe's Dozen dynasty dashboard that make it feel like a professional sports app, not a hobby project.

**Architecture:** All features are added to the single `index.html` file. New CSS goes before `</style>` (line 626). New HTML panels go after the last `<section>` (line 664). New JS render functions go before `window.addEventListener('DOMContentLoaded',init)` (line 1961). New tabs get added to the `TABS` array (line 671) and `init()` (line 692). Every interactive element must be fully styled — no browser defaults.

**Tech Stack:** Vanilla JS, CSS custom properties, HTML5 Canvas (for animations), Oswald/Inter/JetBrains Mono fonts. Zero external dependencies.

**File:** `index.html` (single file, currently 2046 lines)

**CSS insertion point:** Before `</style>` at line 626
**HTML panel insertion point:** After `<section class="panel" id="tab-contracts"></section>` at line 664
**TABS array:** Line 671-685
**init() function:** Line 692-706
**JS function insertion point:** Before `window.addEventListener('DOMContentLoaded',init)` at line 1961

---

### Task 1: Smooth Page Transitions + Animated Counters (CSS/JS polish)

**Why first:** This upgrades the FEEL of everything else. Build the animation foundation before adding new content.

**Files:**
- Modify: `index.html` — CSS section (before `</style>`), JS `init()`, `buildStats()`, `buildNav()`, `renderPower()`

- [ ] **Step 1: Add animation CSS before `</style>`**

Insert before the closing `</style>` tag:

```css
/* ═══ ANIMATIONS & TRANSITIONS ═══ */
.panel{opacity:0;transform:translateY(12px);transition:opacity .35s ease,transform .35s ease;pointer-events:none;position:absolute;width:100%}
.panel.active{opacity:1;transform:translateY(0);pointer-events:auto;position:relative}
.stagger>*{opacity:0;transform:translateY(10px);animation:staggerIn .4s ease forwards}
@keyframes staggerIn{to{opacity:1;transform:translateY(0)}}
.stagger>*:nth-child(1){animation-delay:.03s}.stagger>*:nth-child(2){animation-delay:.06s}.stagger>*:nth-child(3){animation-delay:.09s}.stagger>*:nth-child(4){animation-delay:.12s}.stagger>*:nth-child(5){animation-delay:.15s}.stagger>*:nth-child(6){animation-delay:.18s}.stagger>*:nth-child(7){animation-delay:.21s}.stagger>*:nth-child(8){animation-delay:.24s}.stagger>*:nth-child(9){animation-delay:.27s}.stagger>*:nth-child(10){animation-delay:.3s}.stagger>*:nth-child(11){animation-delay:.33s}.stagger>*:nth-child(12){animation-delay:.36s}
.count-up{display:inline-block}
.tilt-card{transition:transform .2s ease;transform-style:preserve-3d}
.tilt-card:hover{transform:perspective(800px) rotateX(2deg) rotateY(-2deg) scale(1.01)}
.hero-parallax{transition:transform .3s ease}
```

- [ ] **Step 2: Add animated counter JS function before `window.addEventListener`**

```javascript
function animateCounters(){
  document.querySelectorAll('.count-up').forEach(function(el){
    var target=parseFloat(el.getAttribute('data-target'));
    var suffix=el.getAttribute('data-suffix')||'';
    var decimals=el.getAttribute('data-decimals')||0;
    var duration=800;
    var start=0;
    var startTime=null;
    function step(timestamp){
      if(!startTime)startTime=timestamp;
      var progress=Math.min((timestamp-startTime)/duration,1);
      var eased=1-Math.pow(1-progress,3);
      var current=start+eased*(target-start);
      el.textContent=decimals>0?current.toFixed(decimals):Math.round(current).toLocaleString();
      el.textContent+=suffix;
      if(progress<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
```

- [ ] **Step 3: Update `buildStats()` to use animated counters**

In `buildStats()`, replace the stat value spans with `count-up` class elements that have `data-target` attributes. The stat strip shows league stats — wrap each numeric value in `<span class="count-up" data-target="VALUE">0</span>`.

- [ ] **Step 4: Call `animateCounters()` in `init()` after rendering**

Add `setTimeout(animateCounters,600);` at the end of `init()`, after the loading screen fade.

- [ ] **Step 5: Add `tilt-card` class to power ranking cards and trade cards**

In `renderPower()`, add `tilt-card` to `.pcard` elements. In `renderTrades()`, add `tilt-card` to `.trade-card` elements.

- [ ] **Step 6: Verify and commit**

```bash
node -c <(sed -n '669,LINEp' index.html) # verify JS syntax
git add index.html && git commit -m "feat: add smooth transitions, animated counters, 3D card tilt"
```

---

### Task 2: League Constitution Tab

**Why second:** Pure content, no data computation. Establishes a "this is serious" tone.

**Files:**
- Modify: `index.html` — HTML panels, TABS array, init(), new CSS, new `renderConstitution()` function

- [ ] **Step 1: Add Constitution CSS before `</style>`**

```css
/* ═══ CONSTITUTION ═══ */
.const-section{margin:20px 0;padding:20px;background:var(--g2);border:1px solid var(--g4);border-radius:12px;border-left:3px solid var(--a)}
.const-num{font-family:var(--fd);font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--a);margin-bottom:8px}
.const-title{font-family:var(--fd);font-size:18px;font-weight:800;color:var(--t1);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px}
.const-body{font-family:var(--fb);font-size:13px;color:var(--t2);line-height:1.7}
.const-body b{color:var(--t1)}
.const-body .const-highlight{color:var(--a);font-weight:700}
.const-list{list-style:none;padding:0;margin:8px 0}
.const-list li{padding:6px 0;border-bottom:1px solid var(--g3);display:flex;justify-content:space-between}
.const-list li:last-child{border-bottom:none}
.const-list .cl-label{color:var(--t3);font-size:12px}
.const-list .cl-value{font-family:var(--fm);font-weight:700;color:var(--t1);font-size:13px}
```

- [ ] **Step 2: Add panel HTML, TABS entry, init() call**

Add `<section class="panel" id="tab-constitution"></section>` after the contracts panel.
Add `{id:'constitution',label:'Rules'}` to TABS array.
Add `renderConstitution();` to init().

- [ ] **Step 3: Write `renderConstitution()` function**

Build a beautifully formatted rules page with sections:
- Article I: League Overview (name, type, teams, platform)
- Article II: Roster Configuration (starters, bench, IR from D.league)
- Article III: Scoring (PPR, passing/rushing/receiving/bonus from D.league)
- Article IV: Contracts (15-keeper dynasty, contract years assigned at draft, 1-7 year terms)
- Article V: Exemptions (1 per team per year, tradeable like draft picks, can extend ANY contract not just expiring, deadline is Memorial Day)
- Article VI: Draft (rookie draft, pick order, pick trading enabled, rounds from D.league)
- Article VII: Trading (deadline Week 12, picks tradeable, exemptions tradeable)
- Article VIII: Waivers (rolling waivers, Wednesday clear, 2-day window)
- Article IX: Playoffs (6 teams, starts Week 15)
- Article X: Championship History (list D.champions)

Each section uses the `.const-section` card with `.const-num` for "ARTICLE I", `.const-title` for the title, and `.const-body` for content. Use `.const-list` for key-value pairs like scoring settings.

- [ ] **Step 4: Verify and commit**

```bash
git add index.html && git commit -m "feat: add League Constitution tab with full rules reference"
```

---

### Task 3: Offseason War Room Tab

**Files:**
- Modify: `index.html` — HTML panels, TABS, init(), CSS, new `renderWarRoom()` function

- [ ] **Step 1: Add War Room CSS**

```css
/* ═══ WAR ROOM ═══ */
.wr-countdown{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin:16px 0}
.wr-timer{background:var(--g2);border:1px solid var(--g4);border-radius:12px;padding:20px;text-align:center;position:relative;overflow:hidden}
.wr-timer::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.wr-timer.urgent::before{background:var(--red-t);animation:pulse 1.4s infinite}
.wr-timer.soon::before{background:var(--y)}
.wr-timer.future::before{background:var(--a)}
.wr-timer-label{font-family:var(--fd);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--t3);margin-bottom:8px}
.wr-timer-val{font-family:var(--fm);font-size:36px;font-weight:800;color:var(--t1);line-height:1}
.wr-timer-unit{font-family:var(--fd);font-size:10px;font-weight:700;letter-spacing:2px;color:var(--t4);margin-top:4px;text-transform:uppercase}
.wr-timer-date{font-family:var(--fb);font-size:11px;color:var(--t4);margin-top:8px}
.wr-checklist{margin:16px 0}
.wr-team-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--g2);border:1px solid var(--g4);border-radius:10px;margin-bottom:8px;transition:border-color .2s}
.wr-team-row:hover{border-color:var(--g5)}
.wr-indicators{display:flex;gap:6px;margin-left:auto;flex-shrink:0}
.wr-ind{width:10px;height:10px;border-radius:50%}
.wr-ind.green{background:var(--a);box-shadow:0 0 6px rgba(16,185,129,.4)}
.wr-ind.yellow{background:var(--y);box-shadow:0 0 6px rgba(245,158,11,.4)}
.wr-ind.red{background:var(--red-t);box-shadow:0 0 6px rgba(239,68,68,.4)}
```

- [ ] **Step 2: Add panel, TABS entry, init() call**

- [ ] **Step 3: Write `renderWarRoom()` function**

Sections:
1. **Countdown timers** — 3 cards: Memorial Day Exemption Deadline (May 26, 2026), Rookie Draft (TBD — show "Date Not Set"), NFL Kickoff (Sep 10, 2026). Each shows days remaining, urgency color (red <14 days, yellow <60, green otherwise).

2. **Exemption Status Board** — Each team: name, avatar, how many 2026 exemptions they own (from D.exemption_history ownership data), traffic light indicator (green=has exemption, red=traded away, yellow=has 2+). Teams with 0 exemptions highlighted.

3. **Expiring Contracts Alert** — Per team: count of players at 0yr, list their names. Sorted by most expiring. These are the players teams must decide on before the season.

4. **Draft Capital Overview** — Per team: how many future picks they own vs traded away (from D.pick_trades). Net capital score.

- [ ] **Step 4: Verify and commit**

---

### Task 4: League Pulse Feed Tab

**Files:**
- Modify: `index.html` — HTML, TABS, init(), CSS, new `renderPulse()` function

- [ ] **Step 1: Add Pulse CSS**

```css
/* ═══ PULSE FEED ═══ */
.pulse-card{background:var(--g2);border:1px solid var(--g4);border-radius:12px;padding:16px 20px;margin-bottom:12px;border-left:3px solid var(--a);transition:border-color .2s}
.pulse-card:hover{border-color:var(--a)}
.pulse-card.trade{border-left-color:var(--y)}
.pulse-card.record{border-left-color:var(--red-t)}
.pulse-card.exemption{border-left-color:var(--pur)}
.pulse-card.power{border-left-color:var(--blu)}
.pulse-tag{font-family:var(--fd);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:8px}
.pulse-tag.trade{background:rgba(245,158,11,.12);color:var(--y)}
.pulse-tag.record{background:rgba(239,68,68,.12);color:var(--red-t)}
.pulse-tag.exemption{background:rgba(139,92,246,.12);color:var(--pur)}
.pulse-tag.power{background:rgba(59,130,246,.12);color:var(--blu)}
.pulse-tag.draft{background:rgba(16,185,129,.12);color:var(--a)}
.pulse-headline{font-family:var(--fd);font-size:18px;font-weight:800;color:var(--t1);line-height:1.2;margin-bottom:6px}
.pulse-body{font-family:var(--fb);font-size:13px;color:var(--t3);line-height:1.5}
.pulse-meta{font-family:var(--fm);font-size:10px;color:var(--t4);margin-top:8px;letter-spacing:1px}
```

- [ ] **Step 2: Add panel, TABS entry, init() call**

- [ ] **Step 3: Write `renderPulse()` function**

Generate narrative cards from real data:
1. **Trade stories** — For each trade in D.unified_trades, generate a headline and analysis. Template: "{Team} acquires {player} from {Team} — {analysis based on age/contract}". If trade has exemption, mention it.
2. **Record alerts** — From D.records: "RECORD: {team} posts {pts} — highest single-week score in league history"
3. **Championship recaps** — From D.champions: "{champion} defeats {runner_up} for the {year} Dynasty Championship"
4. **Power movement** — "POWER SHIFT: {team1} rises to #1 with a {pw} power score, overtaking {team2}"
5. **Exemption news** — From D.exemption_history: "{team} uses exemption on {player} — locks up {years}yr deal"
6. **Draft highlights** — From D.draft_hits: "{drafter} hits on {player} (Rd{rd}) — now a starter worth {ktc} KTC"

Sort all cards by recency/importance. Each card gets a colored left border and tag (TRADE, RECORD, CHAMPIONSHIP, POWER, EXEMPTION, DRAFT).

- [ ] **Step 4: Verify and commit**

---

### Task 5: League Chronicle Timeline Tab

**Files:**
- Modify: `index.html` — HTML, TABS, init(), CSS, new `renderChronicle()` function

- [ ] **Step 1: Add Chronicle CSS**

```css
/* ═══ CHRONICLE TIMELINE ═══ */
.chronicle{position:relative;overflow-x:auto;overflow-y:hidden;padding:40px 20px 20px;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory}
.chronicle-track{display:flex;gap:0;min-width:max-content;position:relative}
.chronicle-year{scroll-snap-align:start;min-width:300px;padding:0 20px;position:relative}
.chronicle-year-label{font-family:var(--fd);font-size:48px;font-weight:900;color:var(--g4);position:sticky;left:20px;margin-bottom:16px;letter-spacing:-2px}
.chronicle-line{position:absolute;top:80px;left:0;right:0;height:2px;background:var(--g4)}
.chronicle-dot{width:12px;height:12px;border-radius:50%;position:absolute;top:75px;z-index:2;cursor:pointer;transition:transform .2s}
.chronicle-dot:hover{transform:scale(1.5)}
.chronicle-dot.champ{background:var(--y);box-shadow:0 0 12px rgba(245,158,11,.5)}
.chronicle-dot.trade{background:var(--a);box-shadow:0 0 8px rgba(16,185,129,.4)}
.chronicle-dot.record{background:var(--red-t);box-shadow:0 0 8px rgba(239,68,68,.4)}
.chronicle-dot.exemption{background:var(--pur);box-shadow:0 0 8px rgba(139,92,246,.4)}
.chronicle-event{background:var(--g2);border:1px solid var(--g4);border-radius:10px;padding:12px 16px;margin-top:100px;margin-bottom:12px;width:260px;transition:border-color .2s,transform .2s}
.chronicle-event:hover{border-color:var(--g5);transform:translateY(-2px)}
.chronicle-event-icon{font-size:24px;margin-bottom:6px}
.chronicle-event-title{font-family:var(--fd);font-size:14px;font-weight:700;color:var(--t1);margin-bottom:4px}
.chronicle-event-body{font-family:var(--fb);font-size:11px;color:var(--t3);line-height:1.4}
.chronicle-event-date{font-family:var(--fm);font-size:9px;color:var(--t4);margin-top:6px;letter-spacing:1px}
.chronicle-nav{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap}
```

- [ ] **Step 2: Add panel, TABS entry, init() call**

- [ ] **Step 3: Write `renderChronicle()` function**

Build a horizontal scrollable timeline:
1. Collect ALL events: championships (D.champions), trades (D.unified_trades with year/week), records (D.records), exemptions (D.exemption_history all years), all-time standings era markers (D.alltime_standings).
2. Group by year (2016-2026). For pre-Sleeper years (2016-2020), show what data we have (all-time standings, CBS era marker). For Sleeper years (2021-2026), show full event detail.
3. Year selector buttons at top (styled as `.tab-sub-btn`) to quick-scroll to that year.
4. Each event is a card hanging below the timeline line with a colored dot on the line.
5. Horizontal scroll with snap points per year.

- [ ] **Step 4: Verify and commit**

---

### Task 6: Trade Grades with KTC Win/Loss

**Files:**
- Modify: `index.html` — Add to `renderTrades()` function, add CSS

- [ ] **Step 1: Add Trade Grade CSS**

```css
/* ═══ TRADE GRADES ═══ */
.trade-grade{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;font-family:var(--fd);font-size:16px;font-weight:800;flex-shrink:0}
.trade-grade.a{background:rgba(16,185,129,.15);color:var(--a)}
.trade-grade.b{background:rgba(59,130,246,.15);color:var(--blu)}
.trade-grade.c{background:rgba(245,158,11,.15);color:var(--y)}
.trade-grade.d{background:rgba(239,68,68,.15);color:var(--red-t)}
.trade-grade.f{background:rgba(239,68,68,.25);color:var(--red-t)}
.trade-ktc{font-family:var(--fm);font-size:11px;font-weight:700}
.trade-ktc.pos{color:var(--a)}
.trade-ktc.neg{color:var(--red-t)}
```

- [ ] **Step 2: Add grade calculation and leaderboard to `renderTrades()`**

At the top of renderTrades(), after the narrative section:
1. Calculate KTC value per trade side: sum D.contracts[playerName].ktc for each player. For picks, assign estimated values (1st=5000, 2nd=2000, 3rd=500).
2. Grade: A+ (>3000 net), A (>1500), B (>500), C (>-500), D (>-1500), F (<-1500).
3. Add a "Trade Record" leaderboard: per manager, sum net KTC across all trades. Show as ranked bar chart.
4. On each trade card, show the grade badge and KTC differential for each side.

- [ ] **Step 3: Verify and commit**

---

### Task 7: Exemption ROI Dashboard

**Files:**
- Modify: `index.html` — Add to `renderContracts()` function after the exemption year tabs

- [ ] **Step 1: Add Exemption ROI section to `renderContracts()`**

After the exemption year tabs section, add:
1. For each exemption across all years, calculate: current KTC (from D.contracts), years remaining, value per year (KTC / years, or KTC if 0yr).
2. Rank all exemptions by total KTC value.
3. Display as premium cards: player photo, name, who used it, year, KTC value, years remaining, ROI grade.
4. Highlight "Best Exemption" and "Worst Exemption" with special styling.
5. Summary stats: average KTC of exempted players, total exemption value league-wide.

- [ ] **Step 2: Verify and commit**

---

### Task 8: Manager Scouting Reports (add to GM tab)

**Files:**
- Modify: `index.html` — Expand `renderGM()` function

- [ ] **Step 1: Add Scouting Report CSS**

```css
/* ═══ SCOUTING REPORTS ═══ */
.scout-card{background:var(--g2);border:1px solid var(--g4);border-radius:12px;padding:20px;margin-top:16px}
.scout-narrative{font-family:var(--fb);font-size:14px;color:var(--t2);line-height:1.7;padding:16px;background:var(--g3);border-radius:8px;border-left:3px solid var(--a);margin:12px 0;font-style:italic}
.scout-grades{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin:12px 0}
.scout-grade{text-align:center;padding:12px;background:var(--g3);border-radius:8px}
.scout-grade-val{font-family:var(--fd);font-size:24px;font-weight:800}
.scout-grade-label{font-family:var(--fd);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--t4);margin-top:4px}
```

- [ ] **Step 2: Add scouting report section to `renderGM()`**

After the existing GM dashboard cards, add a "Scouting Report" section:
1. **Draft Tendencies** — Position breakdown from draft picks: % QB, RB, WR, TE. "WR-heavy drafter" or "balanced approach."
2. **Trade Style** — From D.activity: frequency, net trade count, most common trade partners. "Active trader" vs "hold and build."
3. **Contract Management** — Avg contract years on roster, exemption usage history, how many expiring.
4. **Roster Archetype** — Age profile (young/prime/vet split), position depth chart strength.
5. **Auto-generated narrative** — A paragraph combining all the above: "A.Woods is an aggressive manager who favors elite WR talent. Has used exemptions on high-value targets (Mahomes, A.J. Brown). Currently holds 5 players on expiring deals, suggesting a roster restructure is coming. Draft history skews WR-heavy with strong hit rate."

- [ ] **Step 3: Verify and commit**

---

### Task 9: Draft Memory Lane (enhance Draft tab)

**Files:**
- Modify: `index.html` — Expand `renderDraft()` function

- [ ] **Step 1: Add Draft Memory Lane section to `renderDraft()`**

After the existing draft board grid, add a "Memory Lane" section:
1. For each draft year (2025, 2024), create a visual results grid.
2. Each pick shows: player photo, name, position (color-coded), drafter name, current status from D.draft_hits (starter=green border, bench=yellow, cut=red with strikethrough).
3. If the player has KTC data in D.contracts, show it.
4. Per-team hit rate summary: "charlieklumb21: 4/8 starters (50% hit rate)".
5. "Biggest Steal" and "Biggest Bust" callouts per draft class.

- [ ] **Step 2: Verify and commit**

---

### Task 10: Social Share Cards + League Pulse in Hero

**Files:**
- Modify: `index.html` — CSS for share modal, JS for share functionality

- [ ] **Step 1: Add Share Card CSS**

```css
/* ═══ SHARE CARDS ═══ */
.share-btn{font-family:var(--fd);font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;border-radius:4px;border:1px solid var(--g4);background:var(--g2);color:var(--t3);cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:4px}
.share-btn:hover{border-color:var(--a);color:var(--a)}
.share-modal{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}
.share-modal.open{opacity:1;pointer-events:auto}
.share-preview{background:var(--g1);border:1px solid var(--g4);border-radius:16px;padding:24px;max-width:500px;width:90%;position:relative}
.share-watermark{font-family:var(--fd);font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--t4);text-align:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--g4)}
```

- [ ] **Step 2: Add share button helper function and modal**

Create a `showShareCard(title, content)` function that:
1. Creates/shows a modal overlay with the share content
2. Adds "Harambe's Dozen Dynasty HQ" watermark at bottom
3. Adds a "Copy Screenshot" hint text and close button
4. The modal content is styled for screenshots (clean borders, no overflow)

- [ ] **Step 3: Add share buttons to Power Rankings header and Trade cards**

Add a small share icon button next to the "Power Rankings" broadcast header and on each trade card. On click, call `showShareCard()` with a pre-formatted version of that content.

- [ ] **Step 4: Verify and commit**

---

## Execution Strategy

**Execution: Subagent-Driven** — All 10 tasks are independent with no shared state between them. Each task modifies different CSS/HTML/JS sections of the same file, but they don't overlap.

**Recommended order for sequential execution (to avoid merge conflicts in the single file):**
1. Task 1 (Animations) — CSS + small JS changes
2. Task 2 (Constitution) — New tab, pure content
3. Task 3 (War Room) — New tab, data computation
4. Task 4 (Pulse Feed) — New tab, narrative generation
5. Task 5 (Chronicle) — New tab, complex layout
6. Task 6 (Trade Grades) — Enhance existing tab
7. Task 7 (Exemption ROI) — Enhance existing tab
8. Task 8 (Scouting Reports) — Enhance existing tab
9. Task 9 (Draft Memory Lane) — Enhance existing tab
10. Task 10 (Share Cards) — Global feature

**Model summary:** All 10 tasks are Sonnet implementation work.

**Estimated blast radius:** Single file (index.html), ~800-1200 lines of additions across CSS/HTML/JS.
