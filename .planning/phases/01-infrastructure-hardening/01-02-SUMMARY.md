---
phase: 01-infrastructure-hardening
plan: 02
subsystem: infra
tags: [service-worker, pwa, cache, offline, github-pages]

# Dependency graph
requires: []
provides:
  - Corrected PWA service worker lifecycle — unregister-all anti-pattern removed
  - Cache bumped to harambes-dozen-v6, stale v5 will be deleted on next activation
  - SW skipWaiting + clients.claim confirmed active for immediate update propagation
affects: [phase-07-share-cards, any-pwa-related-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SW registration: feature check → load event → register + reg.update() (no unregister-all)"
    - "Cache versioning: bump CACHE_NAME constant in sw.js to invalidate stale caches on deploy"

key-files:
  created: []
  modified:
    - index.html
    - sw.js

key-decisions:
  - "Kept reg.update() in SW registration — it triggers update checks on every load without destroying existing SW state, which is correct behavior"
  - "Did not touch console.log calls in the SW block — scoped to plan changes only; pre-existing issue tracked separately"

patterns-established:
  - "SW lifecycle: install (skipWaiting) → activate (clients.claim + delete old caches) → fetch (cache-first for static, network-first for HTML)"

requirements-completed: [INFRA-01, INFRA-06]

# Metrics
duration: 2min
completed: 2026-04-01
---

# Phase 01 Plan 02: Service Worker Fix Summary

**Removed unregister-all anti-pattern from PWA registration and bumped cache to v6 so updates propagate immediately via skipWaiting + clients.claim**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-01T03:17:00Z
- **Completed:** 2026-04-01T03:17:49Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Removed the 3-line `getRegistrations().forEach(r.unregister())` block that was destroying offline caching on every page load
- Bumped cache version from `harambes-dozen-v5` to `harambes-dozen-v6` so the activate handler's old-cache-deletion loop fires on next deployment
- Confirmed `skipWaiting()` and `clients.claim()` are both present and untouched — update propagation works correctly without requiring a hard refresh

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove unregister-all pattern from index.html SW registration** - `5389495` (fix)
2. **Task 2: Increment cache version in sw.js to harambes-dozen-v6** - `10c500e` (fix)

**Plan metadata:** _(committed with this SUMMARY)_

## Files Created/Modified

- `index.html` - Removed 4 lines: `getRegistrations` + `regs.forEach(r.unregister())` + comment
- `sw.js` - Changed `harambes-dozen-v5` to `harambes-dozen-v6` on line 1

## Decisions Made

- Kept `reg.update()` call after successful registration — triggers an update check on every load, which is the correct behavior (not the same as unregister-all)
- Did not modify the `console.log` calls in the SW block — those are pre-existing and out of scope for this plan's surgical fix

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SW lifecycle is now correct: install → activate → fetch, with immediate propagation on deploy
- After next push to GitHub Pages, users will automatically receive the updated SW (no hard refresh needed)
- Pre-existing `console.log` calls in SW registration block remain (out of scope here)

## Self-Check

- `5389495` — exists (verified via commit)
- `10c500e` — exists (verified via commit)
- `grep -c 'unregister' index.html` → 0
- `grep -c 'getRegistrations' index.html` → 0
- `grep -c 'harambes-dozen-v5' sw.js` → 0
- `grep -c 'harambes-dozen-v6' sw.js` → 1
- `grep -c 'skipWaiting' sw.js` → 1
- `grep -c 'clients.claim' sw.js` → 1

## Self-Check: PASSED

---
*Phase: 01-infrastructure-hardening*
*Completed: 2026-04-01*
