---
phase: 03-contracts-complete
plan: 01
subsystem: data-pipeline
tags: [csv-parsing, contracts, exemptions, waiver-detection, vanilla-js]

# Dependency graph
requires:
  - phase: 01-infrastructure-hardening
    provides: contract warning banner, esc() pipeline safety, contractsFailed flag
provides:
  - "D.exemption_history populated with year-keyed exemption arrays from live CSV data"
  - "POS and fantasy_team columns parsed and stored on each contract entry"
  - "Waiver/FA pickups auto-assigned 1-year contracts in buildCurrentSeasonData"
affects: [03-contracts-complete, contracts-tab-ui, exemption-timeline, exemption-roi, cpill-rendering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exemption aggregation: second pass over CSV rows after contract parsing to build year-keyed exemption arrays"
    - "Waiver auto-assignment: post-processing pass after acquisition tracking upgrades uncontracted waiver/FA entries to 1yr"

key-files:
  created: []
  modified:
    - "index.html (parseContractCSV + buildCurrentSeasonData)"

key-decisions:
  - "Exemption had/added fields set to null -- CSV lacks before/after data, timeline UI handles nulls with '--' display"
  - "Waiver auto-assignment placed AFTER acquisition tracking (option b from research) for correct data ordering"
  - "Fantasy Team column detection uses combined check: header matching + positional fallback at index 3"

patterns-established:
  - "Exemption aggregation pattern: iterate CSV rows, skip empty/none exm values, build {yr: [{p, o, pos, had, added, new_yrs, from, note}]}"
  - "Post-acquisition contract upgrade pattern: loop teams/players after acq tracking, upgrade synthetic entries based on acquisition type"

requirements-completed: [CONT-01, CONT-02, CONT-08]

# Metrics
duration: 2min
completed: 2026-04-01
---

# Phase 3 Plan 1: Contract Pipeline Fix Summary

**Exemption history aggregation from live CSV data, POS/Fantasy Team column parsing, and waiver/FA auto-assignment as 1-year contracts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-01T14:37:20Z
- **Completed:** 2026-04-01T14:39:46Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- parseContractCSV now returns real exemption data keyed by year (replacing hardcoded `exemptions:{}`)
- POS and Fantasy Team columns parsed from CSV and stored on each contract entry for downstream use
- Waiver and free agent pickups without contract sheet entries automatically get 1-year contracts, enabling cpill rendering

## Task Commits

Each task was committed atomically:

1. **Task 1: Parse POS and Fantasy Team columns + build exemption aggregation** - `9e28a6c` (feat)
2. **Task 2: Auto-assign 1-year contracts to waiver/FA pickups** - `a589f1c` (feat)

## Files Created/Modified
- `index.html` - parseContractCSV: added posIdx, fTeamIdx column detection, pos/fantasy_team properties on contract entries, exemption aggregation loop; buildCurrentSeasonData: waiver/FA auto-assignment post-processing pass

## Decisions Made
- Exemption `had` and `added` fields set to null since CSV only provides exemption year per player. Timeline UI already handles nulls gracefully with '--' display. Future enhancement: add columns to Google Sheet for pre-exemption years.
- Waiver auto-assignment placed after acquisition tracking (option b from research) -- safer ordering since `player.acq` is populated by that point.
- Fantasy Team column detection uses `hdr.findIndex` with 'fantasy'+'team' substring matching, falling back to positional index 3 if no match.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None. Both pipeline changes produce real data from the live CSV. No placeholder values or TODO markers.

## Next Phase Readiness
- D.exemption_history is populated: exemption timeline UI (renderContracts lines 5057-5098) and exemption ROI section (lines 5160-5183) will now render real data
- Waiver players show 1yr pills: cpill() will display red "1yr" pills for waiver/FA acquisitions across all tabs where cpill is called
- POS and fantasy_team available on contract entries for the keeper sheet (Plan 03-03) and any display needing position data

## Self-Check: PASSED

- FOUND: index.html
- FOUND: 9e28a6c (Task 1 commit)
- FOUND: a589f1c (Task 2 commit)
- FOUND: 03-01-SUMMARY.md

---
*Phase: 03-contracts-complete*
*Completed: 2026-04-01*
