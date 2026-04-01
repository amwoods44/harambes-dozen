# Phase 1: Infrastructure Hardening - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix deployment reliability, caching correctness, data pipeline gaps, and XSS surface. Every feature built in Phases 2-7 depends on this foundation being solid. No new features — only fixes and hardening.

</domain>

<decisions>
## Implementation Decisions

### Error Visibility
- **D-01:** Google Sheets CSV failure displays as an inline warning banner at the top of the Contracts tab — not a modal, not a toast. Non-intrusive, contextual, visible only where contract data matters.
- **D-02:** The warning banner should match the broadcast aesthetic (use accent red with muted background, not a jarring alert style).

### Render Guard Behavior
- **D-03:** Render functions with missing `D` keys should silently skip rendering (return early) rather than showing spinners or error states. The data pipeline will populate keys and dirty-flag the tab for re-render. This matches the existing progressive-load pattern.
- **D-04:** Guard clauses go at the top of each render function: `if (!D.rosters) return;` style — simple, flat, one-line.

### State Preservation
- **D-05:** In this phase, preserve scroll position and open/collapsed state for: Trades tab (year filter changes trigger re-render) and any collapsible card sections. Other tabs addressed as they're polished in later phases.
- **D-06:** Use the scroll-snapshot pattern: capture `scrollTop` before innerHTML write, restore after. For open/collapsed state, capture `.open` class presence before render, restore after.

### XSS Prevention
- **D-07:** Apply `esc()` to ALL dynamic text interpolations from external sources (player names, team names, manager names) across all 18 render functions. Not just the player profile modal — comprehensive.

### Service Worker
- **D-08:** Fix paths to be relative to GitHub Pages subdirectory (`/harambes-dozen/`). Add `skipWaiting()` + `clients.claim()` so updates propagate immediately. Increment cache version name.

### Claude's Discretion
- Specific .gitignore patterns (what to exclude beyond Excel/backups/PNGs)
- Exact localStorage cache pruning throttle implementation (timestamp-based, at most once per minute)
- Whether to extract the NFL kickoff date comment into a more visible location (top of CFG vs inline)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision, constraints, core value
- `.planning/REQUIREMENTS.md` — INFRA-01 through INFRA-10 acceptance criteria
- `CLAUDE.md` — Code conventions, re-render safety rules, data→rendering verification requirements

### Codebase Architecture
- `.planning/codebase/ARCHITECTURE.md` — Layer boundaries, data pipeline, render function locations
- `.planning/codebase/CONCERNS.md` — XSS locations, performance issues, tech debt inventory
- `.planning/codebase/STACK.md` — Current tech stack, caching strategy, service worker details

### Research
- `.planning/research/PITFALLS.md` — Google Sheets CSV risks, service worker update pitfalls, localStorage quota
- `.planning/research/ARCHITECTURE.md` — Contracts pipeline gap (D.exemption_history), render state patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `esc()` function at line ~1408 in `index.html` — XSS escape helper, already exists but underutilized
- `cache` object at line ~1461 — localStorage TTL system with `_prune()` method that needs throttling
- `CFG` object at line ~1411 — configuration singleton, target for NFL kickoff date move
- `dirtyTabs` Set — existing dirty-flag re-render system, use for guard clause pattern

### Established Patterns
- Render functions fire via `renderAll()` or individual calls after data pipeline stages
- Each render function targets a specific panel via `getElementById` + `innerHTML`
- Service worker at `sw.js` uses cache-first strategy with hardcoded root paths
- `fetchCSV()` at line ~1445 handles Google Sheets fetch with no error visibility

### Integration Points
- `buildCurrentSeasonData()` — where `D.exemption_history` assignment is missing (one-line fix)
- `init()` function — call sequence determines render order, guard clauses must align with this
- `sw.js` — separate file, needs path fixes for GitHub Pages subdirectory
- `manifest.json` — needs `start_url` and scope adjusted for subdirectory

</code_context>

<specifics>
## Specific Ideas

No specific requirements — this is pure infrastructure hardening. Follow the broadcast aesthetic for the CSV warning banner. Everything else is mechanical correctness.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-infrastructure-hardening*
*Context gathered: 2026-03-31*
