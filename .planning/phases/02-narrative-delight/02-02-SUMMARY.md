---
phase: 02-narrative-delight
plan: "02"
subsystem: ui
tags: [vanilla-js, css, hero, broadcast, history, week-matching]

# Dependency graph
requires:
  - phase: 02-01
    provides: mergeHistoricalData persisting D['matchup_weeks_YEAR'] and D['weekly_scores_YEAR']
provides:
  - getCurrentNFLWeek() helper for determining current NFL week from calendar
  - Vintage ESPN "This Week in League History" hero card with week-matched highest score
  - Graceful fallback rotating lore ticker when no historical week match exists
  - hero-hist-vintage CSS classes for broadcast card treatment
affects:
  - Any future plan touching hero area or weekly contextual callouts

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Vintage broadcast card pattern: dark gradient + red top bar + Oswald eyebrow + bold red stat"
    - "Week-matched data lookup: getCurrentNFLWeek() → D['matchup_weeks_'+yr][week]"
    - "Progressive upgrade: function renders fallback on first call, upgrades to full card after loadHistory() fires"

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "buildHeroHist() added to loadHistory() merge cycle — card upgrades from fallback ticker to vintage fact after historical data arrives, no separate re-render trigger needed"
  - "week key access uses number matching number (weekNums are integers; getCurrentNFLWeek returns integer) — JS coerces both to string for object lookup, safe"
  - "esc(bestFact.team) applied at injection site — team names from ridToNameForSeason are raw Sleeper API strings, not pre-escaped"

patterns-established:
  - "Progressive hero card: fallback-first render → upgrade when historical data loads (safe for all load states)"
  - "Vintage broadcast card: .hero-hist-vintage with ::before top gradient bar, eyebrow label in rgba(204,0,0,.6), pts in var(--a)"

requirements-completed:
  - NARR-01

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 02 Plan 02: This Week in League History Summary

**getCurrentNFLWeek() + week-matched vintage ESPN hero card showing highest score from same NFL week in prior seasons, with rotating lore fallback**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-01T04:41:44Z
- **Completed:** 2026-04-01T04:44:36Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Added `getCurrentNFLWeek()` helper using first-Thursday-of-September kickoff algorithm to map calendar date to NFL week 1-18
- Replaced hardcoded rotating ticker in `buildHeroHist()` with week-matched lookup across all historical seasons
- Vintage broadcast card treatment: dark gradient background, red top accent bar (::before), small eyebrow label in muted red, team name in white, pts callout in accent red
- Graceful fallback to rotating league lore ticker when no historical data matches (offseason, cold load before history arrives)
- `buildHeroHist()` added to `loadHistory()` merge cycle so card upgrades progressively as each historical season loads

## Task Commits

1. **Task 1: getCurrentNFLWeek + vintage buildHeroHist** - `6ffac12` (feat)

## Files Created/Modified
- `index.html` - Added getCurrentNFLWeek() helper, replaced buildHeroHist() rotating ticker with week-matched vintage card, added hero-hist-vintage CSS classes, added buildHeroHist() to loadHistory() merge cycle

## Decisions Made
- `buildHeroHist()` called in `loadHistory()` merge cycle (line 2671) — this is the correct hook because `D['matchup_weeks_'+season]` is populated by `mergeHistoricalData()` immediately before that call. On first init load, card shows fallback. After each historical season loads, the function re-fires and upgrades to the vintage fact card if a week match is found.
- Kept `esc(bestFact.team)` at the HTML injection site — team names in `matchup_weeks_*` come from `ridToNameForSeason()` which reads raw Sleeper API metadata, not pre-escaped at pipeline.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added buildHeroHist() to loadHistory() merge cycle**
- **Found during:** Task 1 — implementation self-review
- **Issue:** Plan did not include wiring buildHeroHist() to fire after mergeHistoricalData(). Without this, the card would always show the fallback ticker because `D['matchup_weeks_*']` is empty at initial render time; historical data loads in the background after init completes.
- **Fix:** Added `buildHeroHist()` to the `buildStats();buildTicker();` line in `loadHistory()` at line 2671
- **Files modified:** index.html
- **Verification:** Call pattern matches existing buildStats()/buildTicker() progressive update pattern
- **Committed in:** 6ffac12 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical wiring)
**Impact on plan:** Essential for the feature to ever show the vintage card in practice. Without this fix, week-matching logic would run on empty data and always fall back to the rotating ticker.

## Issues Encountered
None — function name discrepancy between plan (`buildHistoryFacts`) and actual codebase (`buildHeroHist`) was a plan artifact, not a blocking issue. Used the actual function name.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Vintage broadcast card pattern (`.hero-hist-vintage` + eyebrow + red accent bar) is established as a reusable visual language for Phase 2 callout cards
- `getCurrentNFLWeek()` is available as a global helper for any future week-contextual features
- Phase 02-03 can proceed: counter animations, stat strip, additional narrative elements

---
*Phase: 02-narrative-delight*
*Completed: 2026-04-01*
