# Design Language — Harambe's Dozen

Established 2026-04-01 via brainstorm session with Aaron.

---

## Base Vibe

ESPN Broadcast Studio is the **floor**, not the ceiling. Layer in:
- **DraftKings / sports betting** energy for data-dense tabs (Analytics, Scoring, Contracts)
- **Apple Keynote** cleanliness for navigation and spacing
- **Magazine editorial** treatment for storytelling tabs (Pulse, Chronicle)

## Density: Hero + Drill Down

Each tab opens with ONE dominant element — a featured card spotlight. Everything else is behind scrolls or clicks. Clean first impression, depth on demand.

## Tab Hero Pattern: Featured Card Spotlight

Every tab leads with a premium card showcasing the #1 item (top-ranked team, biggest trade, best award winner). The card includes a medium headshot, key stats, and context. This is the "story" of the tab — what ESPN would show full-screen before the analysis.

## Section Separators: Clean Dividers + Whitespace

Apple-style spacing between sections. Subtle 1px lines, generous padding. The whitespace itself creates hierarchy — no need for heavy broadcast chyrons between every section.

## Card Style: Dark Glass Panels

- Background: `rgba(255,255,255,.03)` or similar semi-transparent
- Border: `1px solid` subtle (rgba white ~5-8%)
- `backdrop-filter: blur(12-16px)`
- Cards feel like frosted glass floating on the dark base
- Premium, minimal, not boxy

## Team Colors: Accent Only

Team colors appear as thin borders, small badges, or dot indicators. The app's own palette (red/gold/dark) dominates. Team colors become more prominent on team-specific views (Rosters, GM) but stay subtle on league-wide views.

## Headshots: Medium — Present but Not Dominant

40-60px thumbnails alongside names and stats. Recognizable but the data is the star, not the photo. Headshots do NOT carry the visual design — typography and layout do.

## Motion: Smooth and Cinematic

- Transitions: 300-400ms with `cubic-bezier(.22,1,.36,1)` ease-out
- Tab content fades/slides in on switch
- Cards lift gently on hover (translateY -2 to -4px)
- Interactions feel polished and intentional, not snappy or jarring

## Font

DM Sans — single-font stack. Geometric, clean, modern. Weights 400-900.

## Color Palette

- Base: `#120e0c` (warm dark)
- Accent red: `#cc0000`
- Accent gold: `#ffcc00`
- Champion gold: `#F59E0B`
- Blue (countdown/info): `#6ba3e8`
- Grayscale: `--g1` through `--g6`
- Text: `--t1` (white) through `--t4` (muted)

## Quality Bar

The draft board cards are the **floor**, not the ceiling. Every new design should aim to exceed them. "Best fantasy app in the world" — not compared to side projects, compared to ESPN.
