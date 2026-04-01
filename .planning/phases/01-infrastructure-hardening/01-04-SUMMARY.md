---
phase: 01-infrastructure-hardening
plan: 04
subsystem: ui
tags: [vanilla-js, css, contracts, scroll-preservation, error-handling]

# Dependency graph
requires:
  - phase: 01-infrastructure-hardening/01-01
    provides: Service worker and PWA fixes applied to base index.html
provides:
  - D.contractsFailed flag set on Google Sheets CSV fetch failure
  - broadcast-styled inline warning banner in Contracts tab when CSV fails
  - scroll-snapshot pattern in renderTab() preserving Trades tab scrollTop across background re-renders
affects:
  - contracts-integration
  - trades-tab

# Tech tracking
tech-stack:
  added: []
  patterns:
    - scroll-snapshot IIFE around innerHTML-destructive re-renders to preserve panel scroll position
    - inline tab-scoped warning banner (not global status-banner) for data-source failures

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Scroll-snapshot applied in renderTab() dispatch rather than at each call site — renderTab is the single background re-render gateway, making it the correct interception point"
  - "contractsFailed flag only set true when fetch fails AND no cache fallback — cached data is silently acceptable, total failure is not"
  - "Contract warning banner is tab-scoped inline (not global status-banner) — failure is contextual to Contracts tab, not app-wide"

patterns-established:
  - "Scroll-snapshot pattern: save scrollTop before innerHTML write, restore after — apply to any background re-render of a panel the user may be actively browsing"
  - "Tab-scoped error banners: inline in tab content, not global overlay — use .contract-warn-banner class pattern for future tab-specific data failures"

requirements-completed: [INFRA-07, INFRA-09]

# Metrics
duration: 2min
completed: 2026-04-01
---

# Phase 01 Plan 04: Infrastructure Hardening — Contracts + Trades Summary

**D.contractsFailed flag wired to broadcast-styled inline warning banner in Contracts tab, plus scroll-snapshot IIFE in renderTab() preventing Trades tab from snapping to top during background history merges**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-01T03:23:00Z
- **Completed:** 2026-04-01T03:25:36Z
- **Tasks:** 2 (1 auto + 1 checkpoint auto-approved)
- **Files modified:** 1

## Accomplishments
- `D.contractsFailed` flag is set when `fetchContracts()` fails without a cache fallback, cleared on success
- `renderContracts()` prepends a broadcast-styled `.contract-warn-banner` when the flag is true — dark red background, accent red left border, Oswald icon
- `renderTab()` wraps trades re-render in scroll-snapshot IIFE: saves `scrollTop` before `safeRender`, restores after `innerHTML` write
- CSS for `.contract-warn-banner` and `.cwb-icon` / `.cwb-msg` added to style block alongside existing `.status-banner` styles

## Task Commits

Each task was committed atomically:

1. **Task 1: Add scroll-snapshot + CSV warning banner** - `8311e99` (feat)
2. **Task 2: Verify visually** - checkpoint auto-approved (AUTO_CHAIN=true)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified
- `index.html` - fetchContracts catch block, renderContracts banner injection, renderTab scroll-snapshot, CSS additions

## Decisions Made
- Scroll-snapshot applied in `renderTab()` rather than wrapping each `safeRender('trades',...)` call site — `renderTab` is the single background re-render dispatcher called by `loadHistory()`, making it the correct and minimal interception point
- `contractsFailed` flag only set `true` when fetch fails AND no cached fallback — if cache exists, silent fallback is acceptable behavior; only total failure warrants visible warning
- Warning banner is inline in Contracts tab content (not the global `status-banner`) — failure is tab-scoped, not app-wide

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None. Both features are fully wired: contractsFailed flag flows from fetchContracts to renderContracts, scroll-snapshot IIFE is in the live renderTab dispatch path.

## Next Phase Readiness
- Infrastructure hardening phase complete (all 4 plans done)
- Contracts tab now surfaces failures visibly — ready for Contracts Integration phase
- Trades scroll-preservation removes a UX regression that would have worsened as more historical seasons loaded
- No blockers for Phase 02

---
*Phase: 01-infrastructure-hardening*
*Completed: 2026-04-01*
