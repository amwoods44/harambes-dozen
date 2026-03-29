# Design Spec: Rafters Banners, Draft Board, Trade Grades

**Date:** 2026-03-29
**Status:** Approved (Rafters), Pending (Draft Board, Trade Grades)

---

## 1. Rafters Championship Banners

### Overview
Replace the current simple pennant banners with premium cloth banners hung from iron mounts. Every banner is identical in size and structure — the only distinction for the latest champion is a subtle gold spotlight glow behind it.

### Banner Structure (all banners identical)

```
┌─────── Iron Mount Bar (126px wide) ───────┐
│  [rivet]                        [rivet]    │  7px tall, steel gradient
└────────────────────────────────────────────┘
         ┌── Cloth Body (116px wide) ──┐
         │ ═══ Team color stripe ═══   │  3px, gradient team-primary
         │ ─── Secondary accent ───    │  2px, team secondary color
         │                             │
         │     D Y N A S T Y           │  8px Oswald 700, accent color ~65%
         │        2024                 │  42px Oswald 800, year color
         │     C H A M P I O N        │  8px Oswald 700, white/dark ~55%
         │                             │
         │ ─── seam divider ───        │  1px, subtle
         │                             │
         │        [avatar]             │  30px circle, team secondary bg
         │       OWNER NAME            │  11px Oswald 700, white/dark ~80%
         │     def. Runner Up          │  8px Inter, white/dark ~35%
         │                             │
         │ ─── Secondary accent ───    │  2px, team secondary color
         │ ═══ Team color stripe ═══   │  3px, gradient team-primary
         └─────────────────────────────┘
         ╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲  zigzag fringe, 8px
```

### Iron Mount Bar
- Width: 126px (wider than cloth body for overhang)
- Height: 7px
- Background: `linear-gradient(180deg, #3a3a3a, #1e1e1e, #2a2a2a)`
- Border-radius: 2px
- Shadow: `0 3px 10px rgba(0,0,0,.7)`
- Two rivets: 9px circles at left:5px and right:5px, offset top:-1px
- Rivet style: `radial-gradient(circle at 35% 35%, #555, #222)` with 1px #444 border

### Cloth Body
- Width: 116px
- Overflow: hidden
- Shadow: `0 16px 45px rgba(0,0,0,.7)`
- Margin-top: -1px (overlaps mount bar slightly)

### Textures & Effects
- Felt texture: `repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,.012) 1px, rgba(0,0,0,.012) 2px)` over top section
- Cloth fold shadows: 8px wide gradients on left and right edges, `rgba(0,0,0,.12)` to transparent
- Seam divider between sections: 1px line

### Typography Rules

**On dark cloth** (team primary is dark — green, navy, maroon, etc.):
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| DYNASTY | Oswald | 8px | 700 | Team secondary (accent) at ~65% opacity |
| Year | Oswald | 42px | 800 | Team secondary (accent) at full |
| CHAMPION | Oswald | 8px | 700 | White at 55% |
| Avatar initials | Oswald | 11px | 800 | Team secondary color |
| Owner name | Oswald | 11px | 700 | White at 80% |
| def. Runner Up | Inter | 8px | 400 | White at 35% |

**On light cloth** (team primary is bright — gold, orange, etc.):
| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| DYNASTY | Oswald | 8px | 700 | Team secondary (dark) at ~65% opacity |
| Year | Oswald | 42px | 800 | Team secondary (dark) |
| CHAMPION | Oswald | 8px | 700 | Dark at 50% |
| Avatar initials | Oswald | 11px | 800 | Team secondary color |
| Owner name | Oswald | 11px | 700 | Dark at 70% |
| def. Runner Up | Inter | 8px | 400 | Dark at 40% |

**Light vs dark detection:** Compare team primary color luminance. If `(R*0.299 + G*0.587 + B*0.114) > 140`, treat as light cloth.

### Stripe Accents
- Top: 3px team-primary gradient bar, then 2px secondary accent line
- Bottom: 2px secondary accent line, then 3px team-primary gradient bar
- Team-primary gradient format: `linear-gradient(90deg, #0a0a12, {team_primary}, #0a0a12)`
- Secondary accent: solid at ~55% opacity

### Avatar Circle
- Size: 30px
- Background: team secondary with 10-12% opacity
- Border: 2px solid team secondary at 25-30%
- Text: team secondary color, Oswald 11px 800

### Zigzag Fringe
- Height: 8px
- Background: bottom section color fading to transparent
- Clip-path: `polygon(0 0, 8% 100%, 16% 0, 24% 100%, ...)` alternating every 8%

### Latest Champion Glow (only distinction)
- Radial gradient behind banner: `radial-gradient(ellipse at top, rgba(255,204,0,.045), transparent 50%)`
- Width: 140px, height: 320px
- Positioned absolutely, centered above the banner
- Box-shadow on cloth body: `0 0 30px rgba(255,204,0,.04)` added

### Scene Container
- Background: `linear-gradient(180deg, #060608, #0c0c12 40%, #0f0f16)`
- Full-width steel beam across top (same gradient as mount bars but full width, 10px)
- Beam shadow: `0 6px 24px rgba(0,0,0,.9)`
- Banners row: flex, centered, gap 24px, wrap

### Data Source
- `D.champions` array (year, champion, runner_up, champ_rid, runner_up_rid)
- Team colors from `TC[champ_rid]` → `{p: primary, s: secondary, i: initials}`
- Reversed to show oldest→newest (left to right)

---

## 2. Draft Board (Pending Design)

To be designed next. Key goals:
- 40x better than current grid
- Better visual hierarchy for round importance
- Clearer hit/miss status indicators
- Better mobile experience
- Dynamic year tabs (not hardcoded)

---

## 3. Trade Grades (Pending Design)

To be designed next. Key goals:
- Clean, minimalistic grade display
- Clear justification for each grade visible on click
- Contract-adjusted KTC values factored in
- Algorithm transparency — user understands why A vs C
