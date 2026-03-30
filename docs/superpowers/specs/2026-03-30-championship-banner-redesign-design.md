# Championship Banner Redesign — Design Spec

## Problem

The current championship banners have unreadable text at the bottom — team names at 9px, "def." lines at 7px, low-contrast opacity against dark cloth backgrounds. The bottom-half layout (avatar circle + tiny name + tiny runner-up) wastes space and doesn't match the broadcast quality of the rest of the app.

## Solution

Replace the current rectangular banners with V-cut pennant-shaped championship banners. New design: gold trim, metallic gold trophy SVG, bold modern typography, team-colored cloth with clean hierarchy.

## Design Decisions

### Shape: V-Cut Pennant
- `clip-path: polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)` — pointed bottom
- No fringe — the V-cut silhouette itself communicates "championship"
- Cloth width: **174px** (up from 124px)
- Cloth min-height: **440px** (up from 210px)

### Top Trim
- **5px gold gradient strip** at top: `linear-gradient(90deg, #a07828, #e8c65a, #d4a843, #e8c65a, #a07828)`
- **3px team accent color strip** directly below gold

### Hardware (unchanged concept, slightly larger)
- Mount bar: 186px wide, 9px tall
- Rivets: 13px diameter with highlight inset shadow
- Same gradient/shadow treatment as current

### Cloth Body
- Background: `linear-gradient(175deg, teamPrimary, teamDarker)` — same concept, deeper darks
- Fold shadows on left/right edges (14px wide, rgba(0,0,0,.2))
- Felt texture overlay (45deg repeating gradient)

### Content Layout (top to bottom, centered)

1. **"DYNASTY CHAMPS"** — Oswald 10px/700, letter-spacing 3.5px, team accent color at .65-.7 opacity
2. **Year** — Oswald 74px/900, team accent color, embossed text-shadow stack:
   - `0 2px 0 rgba(0,0,0,.3)` (shadow below)
   - `0 -1px 0 rgba(255,255,255,.08)` (highlight above)
   - `0 4px 10px rgba(0,0,0,.35)` (depth glow)
   - 12px margin-top from label
3. **Trophy** — 68×76px inline SVG, **always gold** regardless of team colors
   - Metallic gradient using `#e8c65a`, `#d4a843`, `#a07828`, `#8a6420`
   - Cup body, rim, two curved handles, stem, two-tier pedestal base
   - Star engraving on cup face at .2 opacity
   - Highlight stroke at .2 opacity
   - `drop-shadow(0 4px 10px rgba(0,0,0,.5))`
   - 22px margin-top, 20px margin-bottom
4. **Champion name** — Oswald 18px/800, white (#fff), uppercase, letter-spacing 1.5px
   - `text-shadow: 0 2px 4px rgba(0,0,0,.35)`
   - `max-width: 150px`, `word-break: break-word` (handles long names like "AMON-RA DOGGIN")
5. **Divider** — 40px × 1px line, team accent color at ~20% opacity (`color + '33'`), 12px margin
6. **"DEF. {runner-up}"** — Oswald 9px/600, letter-spacing 2px, team accent color at .55-.6 opacity

### Color Handling
- **White-accent teams** (e.g., A.Woods `#BF5700`/`#FFFFFF`): label uses `rgba(255,255,255,.65)`, defeated uses `rgba(255,255,255,.55)`
- **Colored-accent teams** (e.g., Packers `#203731`/`#FFB612`): label uses accent color at .7, defeated at .6
- Trophy is always the same gold metallic gradient — never team-colored

### What Gets Removed
- Avatar/initials circle (`.banner-av`) — gone entirely
- Two-tone top/bottom split — single cloth field now
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` on names — replaced with word-wrap
- Fringe clip-path — replaced by V-cut on the whole cloth
- Top section "DYNASTY" / year / "CHAMPION" three-part layout — replaced with single flowing column

## Files to Modify

| File | What changes |
|------|-------------|
| `index.html` CSS (~line 340-362) | Replace `.banner-*` styles with new pennant styles |
| `index.html` JS (~line 2600-2664) | Rewrite banner render loop — new HTML structure, SVG trophy, V-cut shape |

## Verification

1. Open the app in browser, navigate to The Rafters section
2. Confirm all 5 (or more) championship banners render with V-cut shape
3. Confirm "DYNASTY CHAMPS" label, year, gold trophy, name, divider, "DEF." line are all visible and readable
4. Check contrast across all team color combinations (especially light vs dark cloths)
5. Confirm trophy is gold on every banner regardless of team colors
6. Check responsive behavior on mobile (768px breakpoint)
7. Verify no truncated/ellipsis names — long names should word-wrap
