---
phase: 02-narrative-delight
plan: "01"
subsystem: js
tags: [countup.js, animation, counter, lazy-loading, cdn, historical-data, matchup-pipeline]

# Dependency graph
requires: []
provides:
  - "loadCountUp() lazy CDN loader for countup.js@2.10.0"
  - "animateCounters() upgraded with CountUp.js 1.5s ease-out animation and NaN guard"
  - "D['matchup_weeks_YYYY'] and D['weekly_scores_YYYY'] populated by mergeHistoricalData()"
affects:
  - 02-narrative-delight (standings race, lifetime badges rely on weekly_scores_YYYY)
  - all future plans that need per-season historical weekly data

# Tech tracking
tech-stack:
  added:
    - "countup.js@2.10.0 (CDN, lazy-loaded from jsDelivr — not bundled)"
  patterns:
    - "Lazy CDN injection pattern: loadCountUp(cb) checks window.countUp, injects script, calls cb on onload"
    - "NaN guard on data-target before CountUp instantiation"
    - "Recursive retry inside animateCounters — if library not loaded yet, re-queues via loadCountUp"

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "CountUp.js loaded lazily on first call, not in <head> — preserves initial page load performance"
  - "Both init setTimeout sites pre-fetch CountUp library so it is ready before first tab switch"
  - "showTab() animateCounters(tp) call site left unchanged — NaN guard and lazy-load are inside animateCounters now"
  - "mergeHistoricalData(): 2-line pure insertion, no existing logic moved or renamed"

patterns-established:
  - "Lazy CDN loader pattern: check global namespace first, inject script, fire callback on onload"
  - "Historical data keyed by season string: D['matchup_weeks_'+season], D['weekly_scores_'+season]"

requirements-completed:
  - NARR-05

# Metrics
duration: 8min
completed: 2026-03-31
---

# Phase 02 Plan 01: Counter Animation + Historical Pipeline Summary

**CountUp.js 1.5s ease-out counter animation via lazy CDN load, plus per-season weekly matchup data persisted to D after mergeHistoricalData()**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-31
- **Completed:** 2026-03-31
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Historical data pipeline gap closed: D['matchup_weeks_2024'] and D['weekly_scores_2024'] (and all prior seasons) are now accessible after mergeHistoricalData() runs — unblocks standings race and lifetime badge plans
- Replaced hand-rolled rAF counter (800ms, no NaN guard) with CountUp.js constructor (1.5s, cubic ease-out, NaN-safe, suffix support)
- Added loadCountUp() lazy loader so countup.js@2.10.0 is fetched from jsDelivr CDN only when first needed, not blocking page load

## Task Commits

1. **Task 1: Fix historical data pipeline — persist matchup_weeks and weekly_scores per season** - `300c337` (feat)
2. **Task 2: Replace animateCounters() with CountUp.js + add loadCountUp() lazy loader** - `48d0191` (feat)

**Plan metadata:** (docs commit hash — see below)

## Files Created/Modified

- `/Users/aaronwoods/harambes-dozen-repo/index.html` — mergeHistoricalData() 2-line insertion + loadCountUp() + animateCounters() replacement

## Decisions Made

- CountUp.js fetched lazily (not in `<head>`) — avoids blocking initial render, library is only needed when a tab with `.count-up` elements is activated
- Both `setTimeout(animateCounters,600)` init call sites wrapped with `loadCountUp` pre-fetch so the library is ready before any tab switch fires
- The `animateCounters(tp)` call in `showTab()` was left unchanged — the lazy-load guard is now inside `animateCounters` itself, so all call sites work correctly regardless of load state
- Two-line insertion in `mergeHistoricalData()` is a pure addition with zero renames or moves — lowest possible risk to existing H2H and standings logic that reads `hsMatchupWeeks` after the insertion point

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — both changes are complete implementations with no placeholder values or TODO gates.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- D['matchup_weeks_YYYY'] and D['weekly_scores_YYYY'] are now available for standings race chart (02-02) and lifetime badges (02-03)
- animateCounters() is ready for any new stat strips added in subsequent plans
- No blockers for Phase 02 continuation

---
*Phase: 02-narrative-delight*
*Completed: 2026-03-31*
