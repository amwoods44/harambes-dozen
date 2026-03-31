# Trades Screen Redesign — Design Spec

## Overview

Complete redesign of the trades tab (`renderTrades()`) from a data-table-with-cards layout to a broadcast-quality, photo-forward trade card system with adaptive layouts, dual grades, pick/exemption assets, and a flippable card back showing the KTC breakdown.

## Design Decisions Made

### Primary Trade Card: #5 Broadcast + Grid
- Red gradient header bar (`linear-gradient(90deg, #cc0000, #8b0000)`) with "TRADE" left, "WEEK X · YEAR" right
- Left/right split with red `FOR` divider (3px gradient line + 30px circle badge)
- Dual grade pills (pill-shaped, not circles): grade letter + team abbreviation, positioned top-left and top-right of each side
- Split bottom accent bar: winner's grade color left, loser's grade color right (4px)

### Alternate Layouts (selected as fallbacks)
- **#1 Clean Editorial Enhanced** — Clip-path header variant, hero + list right
- **#2 Broadcast + Position Accents** — Red bar + FOR divider, position-colored left border per player row

### Adaptive Layout Rules

The trade card layout adapts based on player count per side:

| Players per side | Layout |
|-----------------|--------|
| 1 player | **Hero** — full bleed photo, name + position overlay at bottom |
| 2+ players | **Photo grid** — equal-sized 3:4 aspect photos, name + position overlay on each |
| Both sides 1 | **Dual hero** — magazine split, both get full bleed |
| Asymmetric (e.g. 1 vs 3) | Hero side gets flex:1, grid side gets flex:1.4 (wider) |
| 5+ per side | Grid wraps: row of 3 on top, remainder below |

### Hero Photo Treatment
- Full bleed to card edges (no padding on the image)
- Horizontal gradient fade: `transparent 25-28%` → dark at right edge
- Vertical gradient fade: `transparent 35%` → dark at bottom
- Name in 28px Oswald 900, uppercase, overlaid at bottom-left
- Position badge (colored pill) + team name below the name
- Grade pill overlaid at top-left

### Photo Grid Treatment
- 3:4 aspect ratio, 8px border-radius
- 4px gap between photos
- Name overlay at bottom with gradient fade (10px Oswald 800, uppercase)
- Position badge (colored pill, 6px font) overlaid in the gradient

### Draft Pick Treatment
- Gold-themed blocks sitting below the player photos in the same row
- Round number ("1st", "2nd", "3rd") in 15px Oswald 900
- Year below in 8px Oswald 700
- Value gradient: 1st round is bright gold (#ffcc00), later rounds progressively dimmer
- Pick block styling: `background: rgba(255,204,0,.07)`, `border: 1px solid rgba(255,204,0,.2)` for 1st; opacity scales down for later rounds

### Exemption Treatment
- Red-themed block, same size/weight as a pick block
- "EXEMPT" text (not abbreviated) in 13px Oswald 900, red (#ef4444)
- Year below in 8px
- Block styling: `background: rgba(239,68,68,.08)`, `border: 1px solid rgba(239,68,68,.25)`
- Detail strip below the trade card: red dashed border-top, shows year, from → to teams, "Used on: player name"

### Grade System
- Dual grades — each side of the trade gets their own grade
- Pill-shaped badges: grade letter (18-20px) + team abbreviation (8-9px)
- Grade colors:
  - A/A+: `linear-gradient(135deg, rgba(34,197,94,.9), rgba(21,128,61,.95))` + green shadow
  - B: `linear-gradient(135deg, rgba(59,130,246,.9), rgba(37,99,235,.95))` + blue shadow
  - C: `linear-gradient(135deg, rgba(245,158,11,.9), rgba(217,119,6,.95))` + amber shadow
  - D: `linear-gradient(135deg, rgba(249,115,22,.9), rgba(234,88,12,.95))` + orange shadow
  - F: `linear-gradient(135deg, rgba(239,68,68,.9), rgba(220,38,38,.95))` + red shadow
- Bottom accent bar splits at 50%: left side's grade color → right side's grade color

### Card Flip (Back Side)
- Click anywhere on the card or the ↻ button (30px circle, bottom-right) to flip
- 3D CSS flip animation: `transform: rotateY(180deg)`, 0.6s cubic-bezier
- Card height auto-sizes to whichever side (front/back) needs more space; front hero photo stretches to fill
- Same dark theme as the front — no light mode / cream / Topps break

**Back layout for multi-player trades:**
- Same red header bar: "BREAKDOWN" + date
- Comparison header: both teams with grade pills + total KTC values (18px), side by side
- Split comparison bar (6px): proportional green vs orange fill
- Net difference centered below bar: "+X,XXX → Team" in 10px green
- Two-column asset list below divider:
  - Left column: winning side's assets
  - Right column (flex:1.3): losing side's assets
  - Each row: 36px headshot + 12px Oswald name + position badge + 12px KTC value right-aligned
  - Pick rows: gold block thumbnail + pick name + KTC value

**Back layout for 1-for-1 trades:**
- Same red header
- Two columns, each centered vertically
- Blurred hero background at 4% opacity per side
- 60px headshot with grade-colored border
- 15px name, position badge, team
- 30px KTC number in grade color
- Slim split bar + net at bottom

### Position Colors (unchanged from draft page)
- QB: `rgb(239,68,68)` / `rgba(239,68,68,.3)` background
- RB: `rgb(16,185,129)` / `rgba(16,185,129,.3)` background
- WR: `rgb(59,130,246)` / `rgba(59,130,246,.3)` background
- TE: `rgb(245,158,11)` / `rgba(245,158,11,.3)` background
- DEF: `rgb(139,92,246)` / `rgba(139,92,246,.3)` background

### Typography
- All player names: Oswald, 900 weight, uppercase
- Hero names: 28px (24px on 2-for-2 with supporting bars)
- Grid overlay names: 10px
- List row names: 12-16px depending on context
- Position badges: 6-8px, 700 weight, colored pill
- Team names: Oswald, 10-11px, rgba(255,255,255,.4)
- Pick round: Oswald 900
- All text must be readable — minimum effective size is 10px for names, 8px for metadata

### Picks-Only Side

When one side of the trade has no players (only picks/exemptions), that side uses a dark panel with picks stacked vertically as gold text lines (no grid, no hero). The other side still gets its appropriate layout.

### Defense Players

DEF players use NFL team logos instead of headshots (existing `isDEF()` check). Logo displayed with `object-fit: contain; padding: 6px` inside the same photo container. Position badge shows "DEF" in purple.

### Mobile Responsiveness

- Below 900px: trade cards go full-width, single column
- Below 600px: the left/right split stacks vertically — left side on top, FOR divider becomes a horizontal line, right side below
- Hero photos maintain min-height:140px when stacked
- Photo grids maintain 3:4 aspect ratio at any width
- Card flip works on touch (tap to flip)

### Player Images
- Source: Sleeper CDN `https://sleepercdn.com/content/nfl/players/thumb/{id}.jpg`
- All images: `object-fit: cover; object-position: top`
- Fallback: existing `tcInit()` gradient circle with initials

### Narrative Sections (from original brief, retained)
- "Hot Commodities" — players traded 2+ times
- Add: "Best Trade of the Season", "Worst Fleece", "Most Active Trader" callout cards
- Draft Retention stats

### Existing Features Retained
- Trade count header
- Trade grade leaderboard
- Head-to-head rivalries
- Capital inventory + trade partner matrix
- Share functionality

## What Changes
- `renderTrades()` function (~lines 2807-3025): complete rewrite of HTML generation
- Trade card CSS: new classes replacing `.trade-card`, `.trade-grid`, `.trade-body`, `.trade-side`
- Grade badge CSS: enhanced from plain circles to gradient pills with team names
- New: card flip CSS + JS (3D transform, height matching)
- New: adaptive layout logic (player count → layout selection)

## What Doesn't Change
- Data pipeline: `D.unified_trades`, `D.most_traded`, `D.pick_trades`, `D.rivalries` unchanged
- KTC valuation functions: `ktcVal()`, `gradeLabel()`, `gradeCls()` unchanged
- Share card functionality
- Tab switching via `showTab()`

## Mockups
All mockups preserved in `.superpowers/brainstorm/` directories from this session.
