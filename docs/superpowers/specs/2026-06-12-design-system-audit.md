# Design System Audit — Harambe's Dozen Dynasty HQ

**Date:** 2026-06-12 · **Source of truth:** `index.html` `<style>` block (~1,150 lines) · **Status:** Complete inventory

This is the canonical reference for the app's design system. It exists so any
tool or session (including a tokens-only export to claude.ai/design) can work
from a faithful extraction instead of re-reading the app. The app itself has
**no component library** — the system is CSS custom properties + class
families + broadcast patterns, all inline in the single file.

## 1. Design tokens (verbatim from `:root`, line ~38)

### Palette
| Token | Value | Role |
|---|---|---|
| `--a` / `--ad` / `--ab` | `#cc0000` / `#990000` / `#e60000` | Accent red (base / dark / bright) — the broadcast signature |
| `--y` / `--yd` | `#ffcc00` / `#d4a017` | Gold (champions, featured) / dark gold |
| `--g1`…`--g6` | `#120e0c → #504038` | Warm dark neutrals: page base → raised surfaces → borders |
| `--t1`…`--t4` | `#fff → #6b6158` | Text: primary → faint |
| `--grn`/`--grn-bg` | `#17b169` / 12% rgba | Positive |
| `--red-t`/`--red-bg` | `#ff4444` / 12% rgba | Negative/alert (distinct from accent red) |
| `--blu` / `--pur` | `#3b82f6` / `#8b5cf6` | Info / special (exemptions, draft) |

### Typography
- `--fd` **Oswald** (display: headings, labels, buttons — weights 300–900 loaded; 600–900 used; heavy weights are intentional broadcast identity)
- `--fb` **Inter** (body — 400–900)
- `--fm` **JetBrains Mono** (stats/numbers — 500–800, always `tabular-nums` for scores)
- Loaded via Google Fonts `@import` at the top of the style block (line ~23)
- Type scale, 1.25 ratio off 14px: `--text-2xs:10 · xs:11 · sm:12 · base:14 · md:16 · lg:20 · xl:26 · 2xl:34 · 3xl:44 · 4xl:56`
- Display sizes above the scale use `clamp()` (hero headline 52–88px)
- Labels/eyebrows: Oswald 9–12px, 700–800, `letter-spacing: 1.5–3px`, uppercase

### Spacing, radius, elevation, surfaces, motion
- Spacing: 4px base — `--sp-1:4 · 2:8 · 3:12 · 4:16 · 5:20 · 6:24 · 7:32 · 8:40 · 9:48 · 10:64`
- Radius: `--radius-sm:4 · md:8 · lg:12 · xl:16 · full:50%`
- Shadows: `--shadow-sm/md/lg` (stacked rgba black), plus `--shadow-glow-gold` and `--shadow-glow-red` (15% color glows)
- Surfaces: `--surface-1` flat `--g2`; `--surface-2/3` vertical gradients one step lighter → darker
- Motion: `--ease-out: cubic-bezier(.16,1,.3,1)`; `--transition-fast:150ms` / `--transition-base:250ms`; a global `*` rule transitions background/border/shadow/opacity at fast speed
- Team identity: `--team-XX` hex per franchise (12), mirrored in the JS `TC` object keyed by roster_id — every team-colored element (accent bars, gradients, avatars) derives from these

## 2. Breakpoints

`max-width: 900 / 768 / 600 / 480 / 380` — desktop-first overrides; 768 and 600 carry most of the mobile adaptation (single-column grids, hidden decorations like `.roster-faces`, reduced paddings).

## 3. Signature broadcast patterns

These are the identity; any new UI should compose from them:

1. **Broadcast header `.bh`** — angled clip-path red tag (`.bh-tag`), accent notch (`.bh-acc`), rule line with right-aligned subtitle (`.bh-sub`). Every section opens with one.
2. **Footer ticker `.bl`** — fixed bottom marquee, angled red `DYNASTY` tag, `blScroll` keyframe loop, fade mask edges.
3. **Tale-of-the-tape split card `.rvq-*`** — team-color gradient halves facing off, center score block, gold corner ribbon (`.rvq-rank`, clip-path), chip row of facts. Used by Rivals marquee + Matchups finale recap.
4. **Power card `.pcard`** — rank circle, 3–5px team/tier color bar (`.pcbar`), conic-gradient power gauge, expandable `.pdet` body; open state persisted via `UI_OPEN`/`data-okey`.
5. **Championship banners `.banner-*`** — 3D pennant scene: metal mount + rivets, V-cut clip-path cloth in team colors, gold foil edge, felt texture, SVG trophy; latest champ gets a glow.
6. **Trade flip card `.tc-*`** — 1200px perspective, `rotateY` front/back, full-bleed player-photo hero sides with gradient fades, grade pills (`.tc-gp`, `.grade-circle` ga→gf gradient fills).
7. **Featured/lede card `.pulse-feature`** — gold-tinted gradient field, oversized uppercase headline; one per feed.
8. **Count-up stats `.count-up`** — `data-target`/`data-decimals` spans animated by `animateCounters(scope)`; **re-render rule: any innerHTML rewrite must re-call it** or values stick at 0.
9. **Stagger reveal `.stagger`** — children animate in with per-index delay; `showTab` resets via the reflow trick (`animation:'none'; offsetHeight;`).

## 4. Component class families (complete)

| Family | Prefix(es) | What it is |
|---|---|---|
| Broadcast headers | `bh-*` | Section headers (pattern #1) |
| Buttons | `btn-primary/accent/ghost`, `share-btn`, `wk-btn`, `tab-sub-btn`, `gm-btn`, `nav-*` | Pill/rect buttons; `wk-btn`+`tab-sub-btn` are the filter-row standards |
| Cards | `card-base/interactive/featured`, `pcard`, `mu-card`, `sc-card`, `award-card`, `gm-card`, `mgr-card`, `move-card`, `luck-card`, `scout-card`, `pulse-card`, `rival-card`, `wr-card`, `trophy-card`, `hit-card`, `draft-card` | Shared elevation/hover rules live in one grouped selector (~line 1075) |
| Tale of the tape | `rvq-*`, index `rvi-*` | Pattern #3 |
| Trade cards | `tc-*` (~40 classes) | Pattern #6 + collapsible `tc-section` |
| Banners/Rafters | `banner-*`, `bracket-*`, `fr-*` (franchise rows), `act-*` (activity bars) | Trophy room |
| Matchups | `mu-*` (card, tug-of-war bars, summary) | Scoreboard cards |
| Draft board | `draft-*` (cards, rounds, timeline, tooltip, flash) | War-room board |
| Tables/rows | `h-row/h-rk/h-team/h-rec/h-pts`, `ap-table`, `h2h-*`, `hm-*` (heat map) | Stat rows & matrices |
| Charts | `spark/spark-b`, `race-canvas`, `dynasty-scatter`, `consistency-chart`, `age-track/age-seg` | Canvas + flex-bar charts |
| Pills/badges | `cpill-0/1/23/4` (contract years), `dbadge`, `dtier`, `pos-*` (position), `mgr-badge`, `window-tag`, `rival-badge`, `rvq-chip` | Status chips; cpill-0 pulses (`cpillPulse`) |
| War room | `wr-*` (timers, status grid, indicator dots) | Command center |
| Pulse/Chronicle | `pulse-*`, `chronicle-*` | Feed + horizontal timeline (scroll-snap) |
| Chrome | `hdr`, `hero-*`, `cast-*` (avatar strip, fade-masked), `sstrip/ss-*` (stat strip), `bl-*` (ticker), `nfl-cd-*` (countdown), `skip-nav` | App shell |
| States | `skeleton`, `empty-state-*`, `data-status`, `loading-*` | Loading/empty |
| GM/compare | `gm-*`, `mgr-*`, `cmp-*`, `scout-*` | Dashboards |

## 5. Motion inventory (24 keyframes)

`arrowPulse, barGrow, blScroll, champReveal, chyronSlide, countUp, cpillPulse,
draftFlash, draftReveal, emptyFloat, fadeInArrow, heroAvatarIn, heroBarWipe,
heroSlideUp, loadPulse, posStamp, pulse, shimmer, skeletonPulse, slideUp,
spin, staggerIn, tugFill, wipeIn` — all enter/emphasis animations ≤700ms with
`--ease-out`; loops (ticker, shimmer, pulse) are slow and low-amplitude.

## 6. Accessibility & conventions

- `.skip-nav` focus-revealed skip link; `aria-label`s on nav/footer; `min-height:36px` global button floor
- Color is always paired with text/symbols (W badges, ★, EXP labels) — not color-alone
- Images get `onerror` fallbacks; avatars fall back to `tcInit()` gradient-initial circles
- Inline styles in render functions are accepted tech debt; new shared visuals should become classes

## 7. Export readiness (claude.ai/design)

A tokens-only sync would ship: `tokens/` (the `:root` block split into palette/type/spacing/elevation), `styles.css` (tokens + the pattern classes in §3–4 needed to reproduce the look), `fonts/` (Google Fonts import or self-hosted woff2), and `guidelines/` (CLAUDE.md's Design Quality Bar + §3 patterns). **No component bundle is possible** — there are no React components, and re-implementing them would violate ship-what-you-built. Decision on whether to create that project: pending user.
