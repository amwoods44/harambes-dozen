---
phase: 01-infrastructure-hardening
plan: 01
subsystem: infra
tags: [cache, config, gitignore, vanilla-js, localStorage]

# Dependency graph
requires: []
provides:
  - CFG.nflKickoff drives both countdown timer and War Room calendar (no hardcoded dates in logic)
  - cache._prune() throttled with 60-second gate (no tight-loop grinding under quota pressure)
  - docs/screenshots/ excluded from git tracking (13 PNGs untracked)
  - Loading screen confirmed using Harambe logo (no ESPN regression)
affects: [all-phases, war-room, cache-layer]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Season config pattern: single-value dates live in CFG with annual update comments"
    - "Cache throttle pattern: _lastPrune timestamp gate prevents back-to-back prune loops"

key-files:
  created: []
  modified:
    - index.html
    - .gitignore

key-decisions:
  - "Hardcoded NFL kickoff date centralized to CFG.nflKickoff — single edit point for annual season update"
  - "docs/screenshots/ excluded via .gitignore rather than *.png glob to preserve app asset PNGs"
  - "cache._prune() throttled at 60 seconds — chosen to match typical QuotaExceededError retry window"

patterns-established:
  - "Season dates pattern: YYYY-MM-DD strings live in CFG with // UPDATE EACH SEASON comment"
  - "Screenshot exclusion: docs/screenshots/ in .gitignore, not global *.png"

requirements-completed: [INFRA-02, INFRA-04, INFRA-05, INFRA-10]

# Metrics
duration: 3min
completed: 2026-04-01
---

# Phase 01 Plan 01: Infrastructure Hardening — Config, Cache, Git Summary

**NFL kickoff date centralized to CFG.nflKickoff (drives countdown + War Room), cache._prune throttled with 60s gate, and 13 docs/screenshots PNGs untracked from git**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-01T03:17:54Z
- **Completed:** 2026-04-01T03:19:56Z
- **Tasks:** 3 (2 auto, 1 human-verify auto-approved)
- **Files modified:** 2

## Accomplishments

- `CFG.nflKickoff:'2026-09-10'` with annual update comment — one edit point for every new season
- `updateCD()` and War Room events array both use `CFG.nflKickoff` — no more hardcoded date strings in logic
- `cache._lastPrune:0` field added + 60-second throttle gate at top of `_prune()` — prevents tight-loop grinding under localStorage quota pressure
- `.gitignore` updated with `docs/screenshots/` exclusion — 13 documentation PNGs untracked (harambe-logo.png, Kevin.png, Chuck.png preserved)
- Loading screen confirmed using `./harambe-logo.png` at line 1348 — no ESPN regression (INFRA-04)

## Task Commits

Each task was committed atomically:

1. **Task 1: Move NFL kickoff to CFG and add _prune throttle** — `db07365` (feat)
2. **Task 2: Update .gitignore and untrack docs/screenshots PNGs** — `90142f8` (chore)
3. **Task 3: Loading screen logo verification (INFRA-04)** — Auto-approved, no commit needed (code already correct)

## Files Created/Modified

- `index.html` — CFG.nflKickoff property, updateCD() and War Room date references, cache._lastPrune field and throttle gate
- `.gitignore` — Added `docs/screenshots/` exclusion line

## Decisions Made

- Centralized NFL kickoff date to `CFG.nflKickoff` as `YYYY-MM-DD` string — the `T20:20:00` time appended only at the countdown usage site, keeping the config value clean and reusable
- Used `docs/screenshots/` exclusion (not `*.png`) to avoid accidentally excluding app asset PNGs like harambe-logo.png
- 60-second throttle on `cache._prune()` — balances responsiveness to quota errors against preventing CPU grinding during rapid cache.set() calls

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All four edits applied cleanly and all verification greps returned expected results.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- INFRA-05, INFRA-10, INFRA-02, INFRA-04 all complete
- Phase 01 Plan 02 (service worker fix) can proceed — no dependencies on this plan
- Annual kickoff date update procedure: change `CFG.nflKickoff` in the CFG object (~line 1418) — both countdown and War Room update automatically

## Self-Check: PASSED

- `index.html` modified: confirmed (git log db07365 shows 1 file changed, 7 insertions)
- `.gitignore` updated: confirmed (git log 90142f8 shows docs/screenshots/ entry)
- `CFG.nflKickoff` count: 3 occurrences (grep verified)
- `_lastPrune` count: 3 occurrences (grep verified)
- Hardcoded `'2026-09-10'` in logic: 0 occurrences (grep verified — only CFG definition remains)
- Hardcoded `2026-09-10T20:20:00`: 0 occurrences (grep verified)
- `docs/screenshots/` files tracked: 0 (git ls-files verified)
- App asset PNGs tracked: 3 (harambe-logo.png, Kevin.png, Chuck.png confirmed)

---
*Phase: 01-infrastructure-hardening*
*Completed: 2026-04-01*
