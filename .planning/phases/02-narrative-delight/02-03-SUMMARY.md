---
phase: 02-narrative-delight
plan: "03"
subsystem: ui
tags: [badges, svg, gold-foil, hall-of-fame, lifetime-achievements, broadcast-aesthetic]

# Dependency graph
requires:
  - phase: 02-01
    provides: "weekly_scores per season (D['weekly_scores_YYYY']) for Century Club badge computation"
  - phase: 02-02
    provides: "This Week in League History pattern (broadcast vintage card design)"
provides:
  - "computeLifetimeBadges(rosterIdOrName) — 8 lifetime achievement badge types per team"
  - "badgeSvg(iconName, teamColor) — gold-foil metallic badge circle renderer"
  - "Per-team badge case in GM Dashboard manager cards"
  - "League-wide Hall of Fame section in Awards tab"
  - "CSS classes: badge-case, badge-case-hdr, badge-case-row, badge-item, hof-section, hof-row, hof-rank, hof-badges, hof-count"
affects: [player-modal, contracts, share-cards]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Gold-foil metallic radial gradient badge shell with team-color accent border", "Lifetime badge computation separated from seasonal calcBadges() — both coexist"]

key-files:
  created: []
  modified: ["index.html"]

key-decisions:
  - "badgeSvg uses div-overlay for icon centering (not foreignObject) — simpler and more browser-compatible"
  - "Lifetime badges coexist with seasonal calcBadges() — different scope, different render locations"
  - "8 badge types: Champion, Century Club, Wheeler-Dealer, Ghost, Point Machine, Dynasty Builder, Draft Guru, Iron Man"

patterns-established:
  - "computeLifetimeBadges() pattern: accepts both roster_id (number) and team name (string)"
  - "badgeSvg() gold-foil gradient: #f5e070 -> #d4a843 -> #8a6420 (radialGradient)"
  - "Badge case layout: .badge-case > .badge-case-hdr + .badge-case-row > .badge-item"

requirements-completed: [NARR-02]

# Metrics
duration: 25min
completed: 2026-04-01
---

# Phase 02 Plan 03: Lifetime Achievement Badges Summary

**Gold-foil lifetime achievement badge system with 8 badge types, per-team badge case in GM Dashboard, and league-wide Hall of Fame ranking in Awards tab**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-01T05:09:09Z
- **Completed:** 2026-04-01T05:35:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Built computeLifetimeBadges() with 8 distinct lifetime achievement categories computed from historical data
- badgeSvg() renders gold-foil metallic badge circles using same gradient palette as trophySvg()
- Per-team badge case appears in each GM Dashboard manager card under the seasonal badges
- Hall of Fame section in Awards tab ranks all 12 managers by total lifetime badge count

## Task Commits

Each task was committed atomically:

1. **Task 1: Build computeLifetimeBadges() and badgeSvg() helpers** - `39523c7` (feat)
2. **Task 2: Wire badge case into renderGM() and Hall of Fame into renderAwards()** - `4e49a96` (feat)

## Files Created/Modified
- `index.html` - Added badge-case/HOF CSS classes (~15 lines), computeLifetimeBadges() function (~70 lines), badgeSvg() function (~15 lines), badge case insertion in renderGM() (~13 lines), Hall of Fame section in renderAwards() (~17 lines)

## Decisions Made
- Used div-overlay approach for centering icon inside badge SVG (position:absolute + transform) rather than foreignObject -- more browser-compatible
- Kept computeLifetimeBadges() separate from calcBadges() -- lifetime vs seasonal are fundamentally different scopes
- Ghost badge uses top-2 threshold (myTotal <= allTotals[1]) so ties for fewest moves both qualify
- Point Machine badge uses 97% threshold of all-time leader to account for close races

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed icon embedding in badgeSvg()**
- **Found during:** Task 1
- **Issue:** Plan nested icon() SVG output directly inside the badge SVG element. Nested SVGs work but icon positioning requires explicit x/y coordinates which the icon() helper doesn't support
- **Fix:** Used a div wrapper with position:relative on the outer container and position:absolute + transform:translate(-50%,-50%) on the icon for reliable centering
- **Files modified:** index.html
- **Verification:** Icon centers correctly inside gold circle regardless of icon size
- **Committed in:** 39523c7

**2. [Rule 1 - Bug] Added null guards for D.rid_to_name and D.champions**
- **Found during:** Task 1
- **Issue:** computeLifetimeBadges() could fail if called before D.rid_to_name or D.champions are populated
- **Fix:** Added conditional checks: `D.rid_to_name?D.rid_to_name[rid]||'':''` and `D.champions&&D.champions.some(...)`
- **Files modified:** index.html
- **Verification:** Function returns empty array gracefully when data not yet loaded
- **Committed in:** 39523c7

---

**Total deviations:** 2 auto-fixed (2 bug fixes)
**Impact on plan:** Both fixes necessary for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all badge computations are wired to real data sources.

## Next Phase Readiness
- Badge system is extensible -- new badge types can be added to computeLifetimeBadges() by appending to the badges array
- badgeSvg() is reusable for any future badge/medal rendering needs
- Hall of Fame section establishes the broadcast header + ranked list pattern for future leaderboard-style views

---
*Phase: 02-narrative-delight*
*Completed: 2026-04-01*
