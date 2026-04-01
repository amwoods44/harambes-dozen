---
phase: 02-narrative-delight
plan: "05"
subsystem: ui
tags: [canvas, animation, requestAnimationFrame, bar-chart-race, standings]

requires:
  - phase: 02-01
    provides: "matchup_weeks and weekly_scores persisted per season in D"
  - phase: 02-04
    provides: "power moves section pattern, broadcast header usage"
provides:
  - "computeWeeklyStandings() data helper for week-by-week cumulative standings"
  - "animateStandingsRace() DPR-aware canvas bar chart race animator"
  - "Standings Race UI section in Trophies tab with year selector and play button"
  - "_raceCancel module-scope RAF cleanup variable"
  - "'play' icon added to ICONS object"
affects: [trophies, analytics, canvas-patterns]

tech-stack:
  added: []
  patterns: [post-render-setTimeout-for-canvas, raf-cancel-on-rerender, dpr-aware-canvas]

key-files:
  created: []
  modified: [index.html]

key-decisions:
  - "Used ID selector (#standings-race-canvas) for CSS to avoid conflicting with existing .race-canvas rule used by Power Race chart"
  - "Added _raceCancel() call at top of renderTrophies() to prevent orphaned RAF loops on re-render"
  - "Added 'play' icon to ICONS object with filled polygon (not stroke) for visibility at small sizes"
  - "Play button wired via post-render setTimeout (not inline onclick string) for cleaner event binding"

patterns-established:
  - "RAF cleanup on re-render: cancel module-scope animation frame at top of render function before innerHTML replace"
  - "Canvas height set dynamically via JS (cvs.style.height) based on data count, not fixed CSS"

requirements-completed: [NARR-03]

duration: 3min
completed: 2026-04-01
---

# Phase 02 Plan 05: Standings Race Summary

**Week-by-week animated canvas bar chart race in Trophies tab with team-colored bars, eased transitions, year selector, and RAF cleanup**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-01T06:03:27Z
- **Completed:** 2026-04-01T06:07:11Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Built computeWeeklyStandings() that transforms per-season matchup data into cumulative week-by-week standings snapshots
- Built animateStandingsRace() DPR-aware canvas animator with team-colored bars, cubic ease-out transitions, 20 frames per week
- Wired Standings Race UI section into Trophies tab with year selector buttons and "Play Season" button
- Added re-render safety: RAF cancelled at top of renderTrophies() to prevent orphaned animation loops

## Task Commits

Each task was committed atomically:

1. **Task 1: Build computeWeeklyStandings() and animateStandingsRace() functions** - `c9e4600` (feat)
2. **Task 2: Wire Standings Race UI section into renderTrophies()** - `cb723df` (feat)

## Files Created/Modified
- `index.html` - Added computeWeeklyStandings(), animateStandingsRace(), _raceCancel variable, 'play' icon, Standings Race HTML section in renderTrophies(), year selector + play button event handlers, CSS for race controls and canvas

## Decisions Made
- Used ID selector (#standings-race-canvas) for canvas CSS instead of class to avoid conflicting with existing .race-canvas rule (line 908) used by the Power Race chart in a different tab
- Added _raceCancel() at the top of renderTrophies() for re-render safety -- when dirty flag flushes or historical data merges trigger re-render, any running animation is cancelled before the canvas element is replaced
- Added 'play' icon to ICONS as a filled polygon (not stroked path) because at 14px a stroked triangle would be hard to see
- Wired play button onclick via post-render setTimeout rather than inline onclick string attribute -- cleaner and consistent with how the year selector handlers are attached

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added 'play' icon to ICONS object**
- **Found during:** Task 1
- **Issue:** Plan references icon('play',...) but 'play' was not in the ICONS set -- would render as empty string
- **Fix:** Added play icon as filled polygon SVG path to ICONS object
- **Files modified:** index.html
- **Verification:** grep confirms play entry in ICONS
- **Committed in:** c9e4600 (Task 1 commit)

**2. [Rule 1 - Bug] Added RAF cleanup at top of renderTrophies()**
- **Found during:** Task 2 (implementation self-review)
- **Issue:** If animation is running when renderTrophies() re-renders (dirty flag flush, historical merge), RAF loop would write to a canvas element that no longer exists in the DOM
- **Fix:** Added if(_raceCancel){_raceCancel();_raceCancel=null;} at top of renderTrophies()
- **Files modified:** index.html
- **Verification:** Code inspection confirms cancellation before innerHTML replace
- **Committed in:** cb723df (Task 2 commit)

**3. [Rule 1 - Bug] Used ID selector for standings race canvas CSS**
- **Found during:** Task 2
- **Issue:** Existing .race-canvas rule at line 908 sets height:280px for Power Race chart; new .race-canvas with height:auto would break that canvas
- **Fix:** Used #standings-race-canvas (ID selector) instead of .race-canvas for the new rule
- **Files modified:** index.html
- **Verification:** grep confirms separate selectors for each canvas context
- **Committed in:** cb723df (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None

## Known Stubs
None - all data paths are wired through computeWeeklyStandings() which reads from D.matchup_weeks (current) and D['matchup_weeks_'+year] (historical, populated by Plan 01).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 02 (narrative-delight) is now complete with all 5 plans executed
- All narrative/animation features are built and wired
- Ready for Phase 03 (contracts integration)

---
*Phase: 02-narrative-delight*
*Completed: 2026-04-01*
