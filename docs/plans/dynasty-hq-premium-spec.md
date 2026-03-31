# Dynasty HQ Premium Spec — From 44/100 to 98/100

> **Date:** 2026-03-27
> **Status:** Design Complete — Ready for Implementation
> **File:** `/Users/aaronwoods/harambes-dozen-repo/harambes-dozen-repo/index.html`
> **Reference app:** `/Users/aaronwoods/Desktop/wins-pool-site/index.html` (WINS Pool)
> **Design inspiration:** [440andfriends.com](https://440andfriends.com), reference screenshots in `~/Desktop/harambes-dozen/`

---

## Vision

Harambe's Dozen should be the #1 dynasty fantasy football league companion in the world. Not the biggest — the BEST. The kind of site that makes league members check it 10 times a day, screenshot it for the group chat, and show it off to friends in other leagues who wish they had something like it.

The ESPN broadcast visual system is locked in. This spec is about dialing in **every detail** — tables, modals, cards, buttons, fonts, alignment, data visualization, dynasty-specific features, and shareability — to take the experience from functional to addictive.

---

## Design Decisions (Aaron's Input)

| Decision | Answer | Notes |
|----------|--------|-------|
| Team colors | Custom per-manager based on real fandom | Full map below |
| Avatars | Custom illustrated characters (440-style) long-term | Gradient initials as temporary fallback |
| html2canvas | YES — adding one dependency is OK | ~40KB, enables real image generation for share cards |
| Share branding | Text-only watermark | `HARAMBE'S DOZEN · DYNASTY HQ · 2026` |
| Dynasty value thresholds | Baked in from current data distribution | Elite 8000+, Star 6000+, Starter 4000+, Depth 1500+, Dart <1500 |

---

## Team Identity Map

| Roster ID | Person | Team Name | Fandom | Primary | Secondary |
|-----------|--------|-----------|--------|---------|-----------|
| 1 | Charlie | Commissioner of Power | Michigan | `#FFCB05` | `#00274C` |
| 2 | Aaron | A.Woods | Texas | `#BF5700` | `#FFFFFF` |
| 3 | Shotty | Proud Boys | Wisconsin | `#C5050C` | `#FFFFFF` |
| 4 | Perry | Slippery007 | Rams | `#003594` | `#FFD100` |
| 5 | Kaz | Marginally Alpha | Purple/White | `#512888` | `#FFFFFF` |
| 6 | TME | TME | Lions | `#0076B6` | `#000000` |
| 7 | Linsmeier | Hillschmeier Farms | Cowboys | `#003594` | `#869397` |
| 8 | Benson | Epstein's Client List | Raiders | `#A5ACAF` | `#000000` |
| 9 | Chad | Amon-Ra Doggin | Packers | `#203731` | `#FFB612` |
| 10 | Kevin | The Dak Night Rises! | Browns | `#311D00` | `#FF3C00` |
| 11 | Keefer | Coach | Maroon/Gold | `#7A0019` | `#FFCC33` |
| 12 | Price | TylerPrice12 | Ravens | `#241773` | `#9E7C0C` |

**Implementation:** Store as a `TEAM_COLORS` constant in JS, keyed by `roster_id`. Used for: cast strip avatar fallbacks, matchup card dividers, avatar border tints, power card accent bars, trade card side tints, share card branding.

---

## Priority Tiers

### Tier 1 — Quick Wins (Low effort, high impact — do first)

| # | Item | Effort | Files |
|---|------|--------|-------|
| 3 | Tab transition animation | Trivial | 1 |
| 4 | Auto-fade data status badge | Trivial | 1 |
| 5 | Consistent card padding | Low | 1 |
| 6 | Alternating row shading | Low | 1 |
| 7 | Trade bars green/red fix | Low | 1 |
| 13 | Championship stat strip gold shimmer | Low | 1 |

### Tier 2 — Visual Polish (Medium effort, big visual upgrade)

| # | Item | Effort | Files |
|---|------|--------|-------|
| 2 | Cast strip avatar fallbacks | Medium | 1 |
| 8 | Heat map color legend | Medium | 1 |
| 9 | H2H matrix header rotation | Medium | 1 |
| 10 | 2-column trade card grid | Low | 1 |
| 11 | Sparkline average reference line | Medium | 1 |
| 12 | Winner emphasis on matchup cards | Medium | 1 |
| 14 | Empty state treatment | Medium | 1 |
| 15 | Nav scroll indicators | Medium | 1 |
| 17 | Team-colored matchup dividers | Medium | 1 |

### Tier 3 — Dynasty Features (Medium-high effort, massive dynasty value)

| # | Item | Effort | Files |
|---|------|--------|-------|
| 1 | Contracts surfaced everywhere | Medium | 1 |
| 16 | Dynasty value tier tags | Medium | 1 |
| 18 | Dynasty window scatter plot | High | 1 |
| 19 | Manager stat cards | High | 1 |

### Tier 4 — Share System (High effort, viral potential)

| # | Item | Effort | Files |
|---|------|--------|-------|
| 20 | Share card image generation | High | 1 (+1 dependency) |

---

## Detailed Specs

---

### ITEM 1: Surface Contracts Everywhere

**Current state:** Contract data exists in `D.contracts` (315 entries with `yrs`, `exp`, `cut`, `tag`, `exm`, `ktc`, `rnk`) but only appears in the Rosters tab and the dedicated Contracts tab. Power Rankings expandable rows, trade cards, and GM mode show zero contract info.

**Target:** Every player name in the app has a compact contract pill next to it — Power Rankings, Trade cards, Rosters, GM mode. Dynasty players evaluate every player through a dual lens: talent AND contract control.

#### Contract Pill Component

```
Layout: inline-flex, gap 3px, vertical-align middle
Height: 16px
Border-radius: 4px
Padding: 1px 5px
Font: JetBrains Mono (var(--fm)), 9px, weight 700, letter-spacing 0.5px
```

**Color tiers:**

| Years | Background | Text | Label |
|-------|-----------|------|-------|
| 4+ | `rgba(23,177,105,.12)` | `#17b169` | `4yr` |
| 2-3 | `rgba(245,158,11,.12)` | `#ffcc00` | `2yr`, `3yr` |
| 1 | `rgba(239,68,68,.12)` | `#ff4444` | `1yr` |
| 0 (expiring) | `rgba(239,68,68,.20)` | `#ff4444` | `EXP` + pulse border |
| No contract | — | — | Not rendered |

**Special status icons inside pill:**
- Franchise tag (`tag: true`): gold tag icon before year text
- Cuttable (`cut: true`): scissors icon in `var(--t4)`
- Exemption used (`exm` non-empty): lock icon

#### Placement A — Power Rankings expandable rows (line ~938)

Current: `[POS] [Name] [NFL] [Age]`
Target: `[POS] [Name] [NFL] [Age] [CONTRACT-PILL]`

#### Placement B — Trade cards (lines ~1315-1336)

Current: `[Headshot 28px] [Player Name]`
Target: `[Headshot 28px] [Player Name] [CONTRACT-PILL]`

Add secondary metadata line below:
```
Font: Inter, 10px, weight 500, color var(--t4)
Content: "3yr control · 7,258 KTC · WR14"
```

Add net contract years in trade header: `"Net yrs control: +8"` in JetBrains Mono 9px.

#### Placement C — Power Rankings subtitle (line ~926)

Current: `"20-8 · 1811.32 PF · Age 25.2"`
Target: `"20-8 · 1811.32 PF · Age 25.2 · 3 EXP"` (red when > 0)

#### Impact Maximizer

**"Contract Cliff Alert"** on trade cards when a traded player has 0-1 years remaining:
```
Background: linear-gradient(90deg, rgba(239,68,68,.08), transparent)
Left border: 2px solid var(--red-t)
Font: Oswald 9px, weight 700, letter-spacing 2px, uppercase
Text: "EXPIRES 2027 — KEEPER DECISION REQUIRED"
Color: var(--red-t)
Padding: 4px 8px
```

**Data requirements:** All fields exist in `D.contracts`. Zero new data needed.

---

### ITEM 2: Fix Cast Strip Avatar Fallbacks

**Current state:** `buildCast()` (line ~863) uses Sleeper CDN avatar URLs. Several teams share identical green robot default avatars (`/avatars/thumbs/` path). When the URL resolves successfully (as Sleeper defaults do), the fallback never triggers. Result: 4-5 of 12 cast circles look identical.

**Long-term vision:** Custom illustrated character avatars for all 12 managers (440 & Friends style — see `~/Desktop/harambes-dozen/Avatars.png`). Characters in rounded-rect frames with names below.

**Temporary solution (until custom illustrations are ready):** Team-colored gradient backgrounds with 2-letter initials.

#### Detection Logic

Any avatar URL matching `/avatars/thumbs/` (not `/uploads/`) is a Sleeper default → replace with generated avatar. Also handle `null` avatars.

#### Per-Team Gradient Palette

Uses the Team Identity Map colors above. Each team gets `linear-gradient(135deg, primary, darken(primary, 20%))` as background.

#### Initials Styling

```css
font-family: var(--fd);    /* Oswald */
font-size: 26px;
font-weight: 800;
color: #ffffff;
text-shadow: 0 1px 3px rgba(0,0,0,0.3);
letter-spacing: -0.5px;
```

Content: first two characters of team name, uppercased. "CO" for Commissioner, "SL" for Slippery007, etc.

#### Container Styling (generated avatars)

```css
background: linear-gradient(135deg, <team-primary>, <team-primary-darkened>);
border: 2px solid rgba(<team-primary>, 0.4);
```

Hover: `border-color: rgba(<team-primary>, 0.8); box-shadow: 0 0 20px rgba(<team-primary>, 0.25)`

#### Impact Maximizer

Apply the same gradient avatar system to `.p-avatar-init` (power ranking cards) and `.gm-btn` (GM dashboard selector). Creates a de facto team branding system — every team has a consistent identity color throughout the entire app.

---

### ITEM 3: Tab Transition Animation

**Current state:** Two competing systems:
1. Lines 634-635: `opacity/transform/position:absolute` transition (causes layout jump)
2. Line 115: `@keyframes wipeIn` clip-path animation (exists but never triggered)

JS (line ~855) only toggles `active` class — never adds `wipe-in`.

**Target:** WINS-style left-to-right screen wipe on tab switch.

#### CSS Changes

Replace lines 634-635 with:
```css
.panel { display: none; padding-bottom: 32px; }
.panel.active { display: block; }
.panel.wipe-in { animation: wipeIn 0.4s ease-out; }
```

Keep existing `@keyframes wipeIn` at line 115 as-is.

#### JS Changes (line ~855)

Match WINS pattern:
```js
document.querySelectorAll('.panel').forEach(p => {
  p.classList.remove('active', 'wipe-in');
});
const target = document.getElementById('tab-' + aTab);
target.classList.add('active', 'wipe-in');
```

#### Impact Maximizer

After wipe completes (400ms), fire `.stagger` class on the panel's first child container. Creates two-phase reveal: panel wipes in → content cards cascade. The stagger animation already exists (lines 333-347).

---

### ITEM 4: Auto-Fade Data Status Badge

**Current state:** `<div class="data-status ok" id="ds">DYNASTY DATA LOADED</div>` sits at `opacity: 0.7` permanently. Looks like a debug artifact.

#### CSS Addition

```css
.data-status.fade-away {
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.data-status.fade-away:hover {
  opacity: 0.7;
  pointer-events: auto;
  transform: translateY(0);
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
```

#### JS Addition (in `init()`)

```js
setTimeout(() => document.getElementById('ds').classList.add('fade-away'), 4000);
```

#### Impact Maximizer

At 3500ms, briefly flash badge to `opacity: 1.0` with `box-shadow: 0 0 12px rgba(23,177,105,0.3)` for 300ms before beginning fade. Creates a "confirmation pulse" — iOS notification banner pattern.

---

### ITEM 5: Consistent Card Padding

**Current state:** 9 different padding values across card types (12px, 12px 16px, 14px, 14px 16px, 16px, 16px 20px, 20px, 24px, 10px 14px).

#### Two Tiers Only

**Standard cards** (top-level, standalone): `padding: 16px 20px`
Apply to: `.trade-side`, `.trade-hdr`, `.mu-top`, `.award-card`, `.gm-card`, `.rival-card`, `.sc-card`, `.pk-card`, `.narrative`, `.trophy-card`, `.const-section`, `.wr-timer`, `.chronicle-event`

**Compact cards** (nested, dense data): `padding: 12px 16px`
Apply to: `.luck-card`, `.move-card`, `.bracket-slot`, `.hm-wrap`, `.wr-team-row`

**Card headers** (internal): `padding: 12px 20px`
Apply to: `.trade-hdr`, `.mu-top`, `.luck-hdr`, `.rival-hdr`

**Mobile** (`@media max-width: 600px`): Standard → `12px 14px`, Compact → `10px 12px`

#### Impact Maximizer

Also normalize `margin-bottom` between cards: `12px` for standard, `8px` for compact. Currently varies from 8px to 12px across types. Consistent padding + consistent spacing = "grid snap" feeling.

---

### ITEM 6: Alternating Row Shading

**Current state:** Franchise rows and history rows have alternating + hover. Player rows, GM stat rows, constitution list, war room rows do NOT.

#### Universal Values (locked across all components)

```css
/* Even rows */
:nth-child(even) { background: rgba(255,255,255,0.02); }

/* Hover */
:hover {
  background: rgba(204,0,0,0.04);
  box-shadow: inset 3px 0 0 var(--a);  /* red left-edge accent */
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
```

#### Selectors to Add

| Selector | Currently Missing |
|----------|------------------|
| `.pl-row:nth-child(even)` | Alternating |
| `.pl-row:hover` | Change from white `.03` to red `.04` + left accent |
| `.gm-stat-row:nth-child(even)` | Both |
| `.gm-stat-row:hover` | Both |
| `.const-list li:nth-child(even)` | Both |
| `.const-list li:hover` | Both |
| `.wr-team-row:nth-child(even)` | Both |
| `.wr-team-row:hover` | Exists but needs red tint + left accent |

**H2H matrix:** No row alternating (cell colors are semantic). Add `filter: brightness(1.3); transition: filter 0.15s` on `.h2h-cell:hover`.

---

### ITEM 7: Trade Record Bars — Green/Red Fix

**Current state:** The `col` variable (line ~1286) computes `var(--a)` for positive values. Since `--a` is now `#cc0000`, positive AND negative bars both appear red. There is no green.

#### Fix

```js
// Change from:
var col = net > 0 ? 'var(--a)' : net < 0 ? 'var(--red-t)' : 'var(--t4)';

// To:
var col = net > 0 ? 'var(--grn)' : net < 0 ? 'var(--red-t)' : 'var(--t4)';
```

#### Impact Maximizer

Add `border-left: 2px solid` to each trade record row: `#17b169` for positive, `#ff4444` for negative. Creates a financial P&L ledger-line effect.

---

### ITEM 8: Heat Map Color Legend

**Current state:** Basic legend with 4 Unicode dots and text labels (line ~1655). No point values, wrong colors, nearly unreadable at 9px.

#### Target: Gradient Legend Bar

```
Position: centered below heat map, margin 12px auto, max-width 400px

[Category labels: LOW | MID | GOOD | ELITE]
[4-segment gradient bar, 14px tall, border-radius 4px]
[Tick labels: 72 | 95 | 118 | 141 | 164]
```

**Gradient segments (25% width each, continuous strip):**
- LOW: `rgba(239,68,68, 0.3→0.45)` — red
- MID: `rgba(245,158,11, 0.45→0.6)` — yellow
- GOOD: `rgba(59,130,246, 0.6→0.75)` — blue
- ELITE: `rgba(16,185,129, 0.75→0.9)` — green

**Tick values:** Dynamically computed from `gMin` and `gMax` at 0%, 25%, 50%, 75%, 100%.

**Category labels:** Oswald 9px, weight 700, letter-spacing 2px, colored to match their segment.

#### Impact Maximizer

Add a league average marker — small white CSS triangle pointing down at the average position on the gradient. Label with value in JetBrains Mono 9px. Anchors the entire heatmap: every cell is instantly "above or below average."

---

### ITEM 9: H2H Matrix Headers

**Current state:** Team names truncated to 6 chars (`substring(0,6)`) → "COMMIS", "A.WOOD", "SLIPPE". Unreadable.

#### Solution: Rotate Column Headers 45 Degrees

```css
/* Column header cells */
writing-mode: vertical-lr;
transform: rotate(-45deg);
transform-origin: bottom left;
white-space: nowrap;
overflow: visible;
font-size: 10px;
height: 80px;
```

**JS changes:**
- Column truncation: `substring(0,6)` → `substring(0,12)`
- Row truncation: `substring(0,10)` → `substring(0,14)`

**Grid adjustment:** Add `padding-top: 60px` to `.h2h-matrix`. Change first column to `110px` (from `90px`).

#### Impact Maximizer

Styled tooltips on column header hover (not browser `title`):
```css
background: var(--g3);
border: 1px solid var(--g5);
padding: 4px 10px;
border-radius: 4px;
font-family: Oswald;
font-size: 12px;
font-weight: 700;
color: #fff;
```

---

### ITEM 10: 2-Column Trade Card Grid

**Current state:** Trade cards stack vertically with no grid wrapper. Each card takes 100% width.

#### New CSS

```css
.trade-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
  align-items: start;  /* masonry density */
}

@media (max-width: 900px) {
  .trade-grid { grid-template-columns: 1fr; gap: 12px; }
}
```

**JS change:** Wrap trade card output in `<div class="trade-grid">...</div>`.

**Card adjustments in 2-col context:**
- `.trade-card` loses `margin-bottom: 12px` (gap handles it)
- `.trade-side` padding: `10px 12px` (tighter for narrower column)
- `.trade-team` font: `13px` (down from 14px)

#### Impact Maximizer

`align-items: start` so short trades (1 player) and tall trades (3 players + picks + exemptions) don't stretch to match. Creates natural masonry density.

---

### ITEM 11: Sparkline Average Reference Line

**Current state:** Weekly bars with no reference point. Color thresholds are absolute (160+ red, 130+ blue, etc.) and self-normalized per team.

#### Team Average Line

```
Position: absolute inside .spark container
Height: 1px
Style: dashed rgba(255,255,255,0.25)
Bottom: (team_avg / team_max) * 36px, clamped 2-34px
z-index: 1
```

Small "AVG" label at right end: JetBrains Mono 7px, weight 700, `rgba(255,255,255,0.4)`.

#### League Average Line (second reference)

```
Style: solid rgba(204,0,0,0.3)
Bottom: (league_avg / team_max) * 36px
```

**Dual-reference system:** White dashed = "Am I above MY average?" Red solid = "Am I above THE LEAGUE?" When white is below red, team is below-average overall.

---

### ITEM 12: Winner Emphasis on Matchup Cards

**Current state:** Both scores at 28px/900 weight. Only difference is color (green vs gray). Crown emoji embedded inline at 12px in team name.

#### Winner Score

```css
font-size: 40px;
font-weight: 900;
color: var(--grn);
text-shadow: 0 0 20px rgba(23,177,105,0.25);
```

#### Loser Score

```css
font-size: 24px;
font-weight: 700;
color: var(--t4);
opacity: 0.7;
```

#### Crown Element (separate from team name)

```html
<span class="mu-crown">👑</span>
```

```css
.mu-crown {
  display: block;
  font-size: 20px;
  filter: drop-shadow(0 2px 8px rgba(255,204,0,0.4));
  margin-bottom: 2px;
  text-align: center;
}
```

#### Margin Badge Enhancement

- THRILLER (< 5pt): `background: rgba(255,204,0,.08); color: var(--y)` with fire emoji
- BLOWOUT (> 40pt): `background: rgba(255,68,68,.08); color: var(--red-t)` with bomb emoji

---

### ITEM 13: Championship Stat Strip — Gold Shimmer

**Current state:** JS applies `ss feat` (red treatment). The `ss champ` class exists with gold gradient text but is never used. Even if it were, the styling is minimal.

#### Step 1: Change JS class

In `buildStats()`: change `ss feat` to `ss champ` on the champion cell.

#### Step 2: New `.ss.champ` CSS

```css
.ss.champ {
  background: linear-gradient(180deg, rgba(245,158,11,.10), rgba(251,191,36,.04) 40%, var(--g2) 80%);
  border-left: 2px solid rgba(245,158,11,.25);
  border-right: 2px solid rgba(245,158,11,.25);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(245,158,11,.03), 0 0 20px rgba(245,158,11,.05);
}
.ss.champ::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #F59E0B 30%, #FBBF24 50%, #F59E0B 70%, transparent);
}
.ss.champ::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 25%, rgba(251,191,36,.06) 45%, rgba(245,158,11,.08) 50%, rgba(251,191,36,.06) 55%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 4s ease-in-out infinite;
  pointer-events: none;
}
.ss.champ .ss-l { color: #FBBF24; font-weight: 700; }
.ss.champ .ss-v {
  background: linear-gradient(135deg, #F59E0B, #FBBF24, #F59E0B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 2px 8px rgba(245,158,11,.25));
}
.ss.champ .ss-sub { color: rgba(251,191,36,.5); }
```

#### Impact Maximizer

Entrance animation on page load — golden flash that settles into steady shimmer:

```css
@keyframes champReveal {
  0% { opacity: .5; filter: brightness(1.5) saturate(1.5); }
  100% { opacity: 1; filter: brightness(1) saturate(1); }
}
.ss.champ { animation: champReveal 1.2s cubic-bezier(.22,1,.36,1) 0.5s both; }
```

The 0.5s delay lets the stat strip count up before the crown jewel gets its spotlight.

---

### ITEM 14: Empty State Treatment

**Current state:** Empty panels show a black void. The `.empty-state` CSS class exists (lines 749-751) but is never used.

#### Enhanced CSS

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  min-height: 200px;
}
.empty-state-icon {
  font-size: 48px;
  opacity: 0.4;
  margin-bottom: 16px;
  animation: emptyFloat 3s ease-in-out infinite;
}
@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.empty-state-text {
  font-family: var(--fd);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--t4);
}
.empty-state-sub {
  font-family: var(--fb);
  font-size: 12px;
  color: var(--t4);
  opacity: 0.6;
  margin-top: 4px;
}
```

Plus 3 descending skeleton bars using existing `@keyframes skeletonPulse` (line 428).

#### Per-Tab Content Map

| Tab | Icon | Title |
|-----|------|-------|
| power | trophy | POWER RANKINGS |
| rosters | gorilla | ROSTERS |
| trophies | medal | TROPHY CASE |
| trades | handshake | TRADE CENTER |
| matchups | boxing glove | MATCHUPS |
| draft | clipboard | DRAFT BOARD |
| age | hourglass | AGE MAP |
| scoring | bar chart | SCORING |
| awards | star | AWARDS |
| analytics | chart | ANALYTICS |
| moves | arrows | TRANSACTIONS |
| gm | briefcase | GM PROFILE |
| rivals | swords | RIVALRIES |
| contracts | scroll | CONTRACTS |
| constitution | scales | RULES |
| warroom | target | WAR ROOM |
| pulse | heartbeat | LEAGUE PULSE |
| chronicle | book | CHRONICLE |

**Implementation:** Inject empty state HTML into each panel on `init()` before render functions run. Render functions replace it automatically.

---

### ITEM 15: Nav Scroll Indicators

**Current state:** Right-side fade gradient exists (line 105) but is static. No left gradient. No scroll arrows. 18 tabs overflow on most screens.

#### Left Fade Gradient (new `::before`)

```css
.nav-bar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 32px;
  background: linear-gradient(90deg, var(--g2), transparent);
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.nav-bar.scrolled-right::before { opacity: 1; }
```

Make right gradient dynamic: `.nav-bar.scrolled-end::after { opacity: 0; }`

#### Scroll Arrow Buttons

```css
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--g3);
  border: 1px solid var(--g5);
  color: var(--t3);
  font-size: 14px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}
.nav-arrow.left { left: 4px; }
.nav-arrow.right { right: 4px; }
.nav-bar.scrolled-right .nav-arrow.left { opacity: 0.8; pointer-events: auto; }
.nav-bar:not(.scrolled-end) .nav-arrow.right { opacity: 0.8; pointer-events: auto; }
```

#### JS Logic

On `.nav-in` scroll: check `scrollLeft > 10` → add `.scrolled-right`. Check `scrollLeft + clientWidth >= scrollWidth - 10` → add `.scrolled-end`. Arrow click scrolls 200px smooth.

**Mobile (< 480px):** Hide arrows, keep gradients. Touch scrolling is native.

---

### ITEM 16: Dynasty Value Tier Tags

**Current state:** `D.contracts` has `ktc` (0-9999) and `rnk` per player. Only used in Contracts tab and trade KTC calculations. No visual tier indicators on roster rows.

#### Tier Definitions

| Tier | KTC Range | Label | Background | Text |
|------|-----------|-------|-----------|------|
| Elite | 8000+ | `ELITE` | `rgba(204,0,0,.10)` | `#cc0000` |
| Star | 6000-7999 | `STAR` | `rgba(245,158,11,.10)` | `#ffcc00` |
| Starter | 4000-5999 | `STARTER` | `rgba(59,130,246,.10)` | `#3b82f6` |
| Depth | 1500-3999 | `DEPTH` | `rgba(255,255,255,.04)` | `#999` |
| Dart | 1-1499 | `DART` | `rgba(255,255,255,.02)` | `#666` |
| Unranked | 0 | — | — | Not rendered |

#### Tag Component

```css
display: inline-block;
font-family: var(--fd);
font-size: 7px;
font-weight: 700;
letter-spacing: 1.5px;
text-transform: uppercase;
padding: 1px 4px;
border-radius: 3px;
margin-left: 6px;
```

#### Roster Composition Bar (per team)

```
Height: 6px, border-radius 3px, overflow hidden
Segments: ELITE | STAR | STARTER | DEPTH | DART (proportional width)
Colors match tier definitions
Below bar: "3 Elite · 4 Star · 6 Starter" in JetBrains Mono 9px
```

Placed at top of each team's expanded roster panel.

#### Impact Maximizer — "DHQ Score"

Composite number per team: `Sum(tier_weight * count)` where Elite=5, Star=4, Starter=3, Depth=1, Dart=0. Normalized 0-100.

Display in power ranking subtitle: `"20-8 · 1811.32 PF · Age 25.2 · DHQ 84"`

Color: 80+ red (elite), 60-79 gold, 40-59 white, <40 red-t (danger).

---

### ITEM 17: Team-Colored Matchup Dividers

**Current state:** All matchup cards use `border-bottom: 2px solid var(--a)` (static red). No team identity.

#### Border Treatment

Replace static border with split-gradient:

```css
border-bottom: 3px solid transparent;
border-image: linear-gradient(90deg,
  <teamA_primary> 0%, <teamA_primary> 40%,
  var(--g4) 50%,
  <teamB_primary> 60%, <teamB_primary> 100%
) 1;
```

Uses `TEAM_COLORS` constant. Applied via inline style in `renderMatchups()`.

#### Avatar Ring Tints

Change avatar border from `var(--g5)` to `rgba(<teamColor>, 0.4)` within matchup cards.

#### THRILLER/BLOWOUT Override

Outer card border takes precedence (gold for thriller, red for blowout). Inner `.mu-top` border still shows team colors.

---

### ITEM 18: Dynasty Window Scatter Plot

**Current state:** Age Map tab shows stacked horizontal bars and text labels. No relationship between age and competitive strength.

#### Canvas Scatter Plot

```
Element: <canvas class="dynasty-scatter">
Size: width 100%, height 340px
Background: var(--g2), border-radius 12px, border 1px solid var(--g4)
Position: Age Map tab, between stacked bars and window labels
Broadcast header: "DYNASTY SCATTER" / "Age vs Power — Where Every Team Sits"
```

**Axes:**
- X: average roster age (range: `floor(minAge)-0.5` to `ceil(maxAge)+0.5`)
- Y: power score (range: 0 to `ceil(maxPw/10)*10 + 5`)
- Labels: Oswald 10px, weight 700, letter-spacing 2px, `#666`
- Ticks: JetBrains Mono 9px, weight 600, `#444`

**Quadrants** (divided at median age / median power):
- Top-left: "DYNASTY GOLD" in `rgba(23,177,105,.5)`
- Top-right: "WIN NOW" in `rgba(255,204,0,.5)`
- Bottom-left: "REBUILDING" in `rgba(59,130,246,.5)`
- Bottom-right: "DANGER ZONE" in `rgba(255,68,68,.5)`
- Divider lines: `rgba(255,255,255,.08)`, dashed `[4,4]`

**Dots:**
- Radius: 8px
- Colors: age <= 25 green, <= 26.5 blue, <= 27.5 gold, > 27.5 red
- Stroke: `rgba(255,255,255,.15)`, 2px
- Labels: Oswald 10px weight 700, centered 12px above dot
- Hover: dot expands to 11px with colored glow ring, styled tooltip

**Animation:** Dots animate from center to final position on tab load (600ms, cubic-bezier(.22,1,.36,1)).

#### Impact Maximizer — "3-Year Projection" Toggle

Button below chart: "SHOW PROJECTION" (Oswald 11px, weight 700).

When toggled:
- Each dot grows a directional arrow to projected position
- Projected age: `current + 3`
- Projected power: attenuated by age penalty
- Arrow: `rgba(255,255,255,.3)`, 1.5px, dashed `[3,3]`
- Ghost dot at projected position: same color, 5px radius, 25% alpha

---

### ITEM 19: Manager Stat Cards

**Current state:** Basic `calcBadges()` output as 8px micro-labels below team names. GM Mode has functional but clinical select-a-team dropdown view.

**Inspiration:** 440 & Friends player profiles (see `~/Desktop/harambes-dozen/PlayerProfile.png`) — avatar at top, stat boxes, season history, award icons, H2H records. But in our ESPN dark broadcast aesthetic.

#### Card Grid (all 12 visible)

```css
display: grid;
grid-template-columns: repeat(3, 1fr);  /* 2 on tablet, 1 on mobile */
gap: 12px;
```

#### Individual Card (320px height)

**Header zone** (100px):
```
Background: linear-gradient(135deg, var(--g3), var(--g2))
Border-bottom: 2px solid <team-primary-color>
Layout: flex, align-items center, gap 12px, padding 16px
```

Champion teams: gold border + subtle `rgba(245,158,11,.04)` overlay.

Contents: `[Avatar 56px] [Team Name / Display Name / Tenure]`

**Archetype title** (absolute, top-right):
```
Oswald 9px, weight 700, letter-spacing 2px, uppercase
Padding: 3px 8px, border-radius 4px
```

| Archetype | Condition | Color |
|-----------|-----------|-------|
| THE DYNASTY | champs >= 1 AND win% >= .60 | gold |
| THE SHARK | trades >= 4 AND net KTC positive | red |
| THE ARCHITECT | avg_age <= 25.5 AND 0 champs | blue |
| THE GAMBLER | trades >= 4 AND luck >= 5 | purple |
| THE GHOST | total activity <= 8 | gray |
| THE GRINDER | win% >= .55 AND trades <= 2 | green |
| THE REBUILD | avg_age <= 24.5 AND win% < .45 | red-t |
| THE VETERAN | 3+ seasons AND avg_age >= 28 | gold |
| WILDCARD | default | gray |

**Stat block** (2x4 grid):
- Left: RECORD, WIN%, PPG, TITLES
- Right: TRADES, LUCK, PICKS, AVG AGE
- Values color-coded by performance

**Badge row** (bottom, flex wrap)

**Expanded view** (on click, full-width):
- Season-by-season timeline (per year block: record + points)
- Signature moves (best/worst trade by KTC delta)
- Contract portfolio summary (tier composition bar)
- Scouting report headline (1 sentence narrative, italic, left-bordered)

**Data requirements:** ALL data exists across `D.franchise`, `D.activity`, `D.luck`, `D.champions`, `D.alltime_standings`, `D.unified_trades`, `D.contracts`. Zero new fields needed.

#### Impact Maximizer

**Manager Power Rankings** — rank cards by composite Manager Score (win% + trade efficiency + portfolio DHQ + championship weight). Display rank number Oswald 28px in top-left, styled like power ranking badges. Creates a meta-game: "Who's the best MANAGER?"

---

### ITEM 20: Share Card Image Generation System

**Current state:** Two share buttons exist (Power Rankings, Trade cards). Modal shows raw HTML dump with "Take a screenshot to share" text. No image generation.

#### Technical Approach: html2canvas

```html
<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
```

**Architecture:**
1. Hidden render target div: `position: fixed; left: -9999px; width: 1200px; height: 630px`
2. Populate with card-specific HTML template (inline styles for html2canvas compatibility)
3. `html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#0e0e0e' })`
4. `canvas.toBlob()` → `navigator.share({ files: [...] })` (native) → fallback: download via `<a download>`

#### Card Dimensions

All cards: **1200 x 630px** (1.91:1 ratio — universal for iMessage, Discord, Slack, Twitter).
Render at 2x (2400x1260) for Retina.

#### Shared Visual Template

**Background:**
```
Base: #0e0e0e
Gradient: radial-gradient(ellipse 800px 400px at 50% 30%, rgba(204,0,0,.08), transparent)
Texture: repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,.012) 60px, rgba(255,255,255,.012) 61px)
Border: 2px solid #262626, border-radius 16px
```

**Top bar** (40px): ESPN broadcast header — red tag with clip-path + accent wedge + subtitle line.

**Bottom bar** (48px): Branding lockup:
```
[gorilla 24px]  HARAMBE'S DOZEN  [skewed divider]  DYNASTY HQ  [right] 2026
```

#### Five Card Types

**1. Power Rankings:** Top 5 teams with rank, avatar, name, power score, tier bar. Right column: scoring formula + tier breakdown.

**2. Trade:** Both sides with avatars, grades (A-F in colored boxes), traded assets with headshots, KTC values, net delta. "WHO WON?" provocation section at bottom.

**3. Matchup:** Side-by-side teams, 52px winner score vs 40px loser score, crown, differential bar, THRILLER/BLOWOUT badge.

**4. Season Recap:** Champion section (trophy + name + gold text), 3x2 mini-award cards (MVP, Scoring King, Boom Week, Thriller, Wheeler, Luckiest).

**5. My Team (Franchise):** Avatar 72px, team name, record, badges, 2x2 scouting grade boxes, top 5 starters with headshots, bottom stat bar.

#### Share Button Placement

| Location | Exists? |
|----------|---------|
| Power Rankings header | Yes (upgrade) |
| Each trade card | Yes (upgrade) |
| Each matchup card | **NEW** |
| Awards section header | **NEW** |
| GM Mode team header | **NEW** |

#### Impact Maximizer — Disagreement Fuel

Each card type includes a provocative element designed to start group chat arguments:

- **Trade:** "WHO WON? The algorithm says [Team A]. Your group chat says: ________"
- **Power Rankings:** "#1 and it's not close."
- **Matchup:** "MARGIN: 1.2 pts — ONE PLAYER DIFFERENT AND THIS FLIPS."
- **Season Recap:** "DYNASTY CHAMPION: [Name]. Again."
- **Franchise:** Overall GM grade (A-F) prominently displayed. Nobody scrolls past their own grade.

---

## Implementation Strategy

**Execution: Sequential by tier, Sonnet sessions.**

| Batch | Items | Estimated Scope | Model |
|-------|-------|-----------------|-------|
| Batch 1 | 3, 4, 5, 6, 7, 13 | ~200 lines CSS/JS | Sonnet |
| Batch 2 | 2, 10, 12, 15, 17 | ~300 lines CSS/JS | Sonnet |
| Batch 3 | 8, 9, 11, 14 | ~250 lines CSS/JS | Sonnet |
| Batch 4 | 1, 16 | ~200 lines JS + CSS | Sonnet |
| Batch 5 | 18 | ~150 lines Canvas JS | Sonnet |
| Batch 6 | 19 | ~300 lines JS + CSS | Sonnet |
| Batch 7 | 20 | ~500 lines + dependency | Sonnet |

**Total estimated additions:** ~1,900 lines across 7 sessions.

**Blast radius:** 1 file (`index.html`) for all 7 batches.

**Verification after each batch:** Open in browser, screenshot every tab, compare against this spec.

---

## Avatar Roadmap

**Phase 1 (now):** Team-colored gradient backgrounds with 2-letter initials. Uses `TEAM_COLORS` constant.

**Phase 2 (future):** Commission custom illustrated character avatars for all 12 managers (440 & Friends style). Rounded-rect frames, cartoon/caricature art. Store as PNGs in GitHub repo `img/` directory. Reference images: `~/Desktop/harambes-dozen/Avatars.png`, `~/Desktop/harambes-dozen/Chuck.png`.

---

*Last updated: 2026-03-27*
*Author: Claude (Opus) + Expert Panel*
*Approved by: Aaron Woods*
