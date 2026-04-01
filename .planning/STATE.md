---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Phase 3.2 complete — ready for hands-on polish pass with Aaron
last_updated: "2026-04-01T19:30:53.740Z"
last_activity: 2026-04-01
progress:
  total_phases: 9
  completed_phases: 5
  total_plans: 21
  completed_plans: 21
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** Every screen looks like it belongs on a broadcast — not a developer's side project.
**Current focus:** Phase 03.2 — broadcast-polish

## Current Position

Phase: 4
Plan: Not started
Status: Ready to execute
Last activity: 2026-04-01

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01-infrastructure-hardening P02 | 2 | 2 tasks | 2 files |
| Phase 01-infrastructure-hardening P01 | 3min | 3 tasks | 2 files |
| Phase 01-infrastructure-hardening P04 | 2min | 2 tasks | 1 files |
| Phase 01-infrastructure-hardening P03 | 45min | 2 tasks | 1 files |
| Phase 02-narrative-delight P01 | 8min | 2 tasks | 1 files |
| Phase 02-narrative-delight P02 | 5min | 1 tasks | 1 files |
| Phase 02-narrative-delight P03 | 25min | 2 tasks | 1 files |
| Phase 02-narrative-delight P04 | 14min | 1 tasks | 1 files |
| Phase 02-narrative-delight P05 | 3min | 2 tasks | 1 files |
| Phase 03-contracts-complete P01 | 2min | 2 tasks | 1 files |
| Phase 03-contracts-complete P02 | 2min | 2 tasks | 1 files |
| Phase 03-contracts-complete P03 | 3min | 2 tasks | 1 files |
| Phase 03.1-offseason-hardening P01 | 15min | 2 tasks | 1 files |
| Phase 03.1-offseason-hardening P02 | 4min | 3 tasks | 1 files |
| Phase 03.1-offseason-hardening P02 | 4min | 2 tasks | 1 files |
| Phase 03.1-offseason-hardening P03 | 12min | 2 tasks | 1 files |
| Phase 03.2-broadcast-polish P01 | 1 | 2 tasks | 1 files |
| Phase 03.2-broadcast-polish P02 | 3min | 2 tasks | 1 files |
| Phase 03.2-broadcast-polish P03 | 4min | 2 tasks | 1 files |
| Phase 03.2-broadcast-polish P04 | 4 | 2 tasks | 1 files |
| Phase 03.2 P05 | 4 | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Infrastructure phase first — SW/cache bugs will silently break every feature built on top
- Roadmap: Narrative & Delight second — zero dependencies, proves broadcast patterns before harder data work
- Roadmap: Contracts third — highest-identity incomplete feature, pipeline 95% done (one missing line)
- Roadmap: FantasyCalc fourth — unlocks 4+ downstream features as a data-layer foundation
- Roadmap: Player modal fifth — legitimately blocked on contracts + FantasyCalc completing
- Roadmap: Chart.js added to Phase 4 scope for Radar chart; CountUp.js to Phase 2 for counter animations
- Roadmap: Share cards last — canvas taint CORS question on sleepercdn.com must be resolved first
- [Phase 01-infrastructure-hardening]: Kept reg.update() in SW registration — triggers update checks on every load without destroying existing SW state
- [Phase 01-infrastructure-hardening]: CFG.nflKickoff: hardcoded NFL kickoff date centralized to single config property — one edit point for annual season update
- [Phase 01-infrastructure-hardening]: cache._prune throttle: 60-second gate added to prevent tight-loop grinding under localStorage quota pressure
- [Phase 01-infrastructure-hardening]: docs/screenshots/ excluded via .gitignore (not *.png glob) to preserve app asset PNGs
- [Phase 01-infrastructure-hardening]: Scroll-snapshot applied in renderTab() dispatch — single background re-render gateway, minimal interception point
- [Phase 01-infrastructure-hardening]: contractsFailed flag only set true when fetch fails AND no cache — cached fallback is silent-acceptable, total failure requires warning
- [Phase 01-infrastructure-hardening]: Contract warning banner is tab-scoped inline (not global status-banner) — failure is contextual to Contracts tab
- [Phase 01-infrastructure-hardening]: Do NOT double-escape: p.name/p.nm/t.name/D.rid_to_name are esc()d at pipeline — ridToNameForSeason() returns raw strings needing esc() at injection sites
- [Phase 01-infrastructure-hardening]: p.team (NFL abbreviation) is raw at DB build time — wrapped at every injection site including img alt attributes
- [Phase 02-narrative-delight]: CountUp.js loaded lazily on first call — not in head — preserves initial page load performance
- [Phase 02-narrative-delight]: mergeHistoricalData() 2-line pure insertion persists D['matchup_weeks_'+season] and D['weekly_scores_'+season] after hsMatchupWeeks is fully built
- [Phase 02-narrative-delight]: buildHeroHist() added to loadHistory() merge cycle — card upgrades from fallback ticker to vintage fact after historical data arrives
- [Phase 02-narrative-delight]: Vintage broadcast card pattern established: hero-hist-vintage with red top bar, muted red eyebrow label, white team name, accent-red pts stat
- [Phase 02-narrative-delight]: badgeSvg uses div-overlay for icon centering — simpler and more browser-compatible than foreignObject
- [Phase 02-narrative-delight]: Lifetime badges (computeLifetimeBadges) coexist with seasonal calcBadges() — different scope, different render locations
- [Phase 02-narrative-delight]: buildPowerMoves derives winner/loser names from team_a/team_b (which have .name) — winner/loser objects only have roster_id and points
- [Phase 02-narrative-delight]: ID selector for standings race canvas CSS to avoid conflicting with existing .race-canvas Power Race rule
- [Phase 02-narrative-delight]: RAF cleanup at top of renderTrophies() prevents orphaned animation loops on re-render
- [Phase 03-contracts-complete]: Exemption had/added fields set to null -- CSV lacks before/after data, timeline UI handles nulls with '--' display
- [Phase 03-contracts-complete]: Waiver auto-assignment placed AFTER acquisition tracking (option b) for correct data ordering
- [Phase 03-contracts-complete]: Fantasy Team column detection uses combined check: header matching + positional fallback at index 3
- [Phase 03-contracts-complete]: relBadge placed before cbadge in source -- safe due to function hoisting
- [Phase 03-contracts-complete]: No relBadge in compact trade card views (listSide/gridSide) -- pill alone suffices
- [Phase 03-contracts-complete]: GM trade assets mapped through cpill without restructuring s.assets -- cpill returns '' for non-player strings
- [Phase 03-contracts-complete]: Sub-render isolation: sortKeeperSheet calls renderKeeperTable (not renderContracts) to avoid destroying DOM state
- [Phase 03-contracts-complete]: ynowCol kept as dead code in exemption timeline -- original template uses hardcoded var(--blu), not dynamic coloring
- [Phase 03.1-offseason-hardening]: D.isOffseason stored on D object (not global) so mergeHistoricalData can reference it via parameter d.isOffseason without global state dependency
- [Phase 03.1-offseason-hardening]: D.lastSeason initialized null in buildCurrentSeasonData then populated in mergeHistoricalData — buildStats guards both (D.isOffseason&&D.lastSeason) truthy check
- [Phase 03.1-offseason-hardening]: computeRecords week initializers null not '-': null is falsy so template literals produce 'WkNull-free' output; '-' was producing WkNaN via parseInt
- [Phase 03.1-offseason-hardening]: scoringLabel/analyticsLabel as local vars so they reset correctly on each re-render
- [Phase 03.1-offseason-hardening]: scoring and matchups added to dirty tabs set after mergeHistoricalData so offseason fallbacks fire when D.lastSeason becomes available
- [Phase 03.1-offseason-hardening]: renderMatchups shows loading placeholder when D.isOffseason but D.lastSeason is null (historical still loading)
- [Phase 03.1-offseason-hardening]: scoringLabel/analyticsLabel declared as local vars so they reset correctly on each re-render
- [Phase 03.1-offseason-hardening]: renderMatchups shows loading placeholder when D.isOffseason but D.lastSeason is null (historical still loading)
- [Phase 03.1-offseason-hardening]: scoring and matchups added to dirty tabs set after mergeHistoricalData so offseason fallbacks fire when D.lastSeason becomes available
- [Phase 03.1-offseason-hardening]: awardsStandings/gmStandings local vars follow exact same pattern as scoringStandings from plan 02 — consistent offseason fallback pattern across all CUR_STANDINGS consumers
- [Phase 03.1-offseason-hardening]: defaultDraft uses Array.find on draftYears descending — first year with picks.length>0 is the most recent completed draft; skips upcoming empty season
- [Phase 03.1-offseason-hardening]: Chronicle week display: null-safe conditional append 'Season'+(week?' Wk '+week:'') — Season alone is valid, 'Wk null' is not
- [Phase 03.2-broadcast-polish]: Added Phase 03.2 CSS block at end of <style> to override earlier ad-hoc hardcoded values with token-based values (--sp-N)
- [Phase 03.2-broadcast-polish]: Used CSS mask-image (not ::after) for scroll strip fades — avoids conflict with cast strip's existing ::before/::after gradients
- [Phase 03.2-broadcast-polish]: Replaced wipeIn clip-path with fadeTabIn on .panel.wipe-in so tab transition actually fires (cascade override fix)
- [Phase 03.2-broadcast-polish]: CSS-first stub pattern: define animation/utility classes in CSS before JS wires them, so later plans only need JS changes
- [Phase 03.2-broadcast-polish]: cast-sep via JS index (3,7) not CSS nth-child for team order robustness
- [Phase 03.2-broadcast-polish]: con-team-filters CSS class replaces inline flex-wrap filter pills, enabling mobile scroll override
- [Phase 03.2-broadcast-polish]: Tier labels replaced with broadcast chyron (clip-path tag + horizontal rule line) for broadcast visual quality
- [Phase 03.2-broadcast-polish]: Heat map legend repositioned above data grid and aligned with data columns via padding-left:185px
- [Phase 03.2-05]: PRESS PLAY prompt delegates click to existing race-play-btn to preserve year-selection wiring in post-render handler
- [Phase 03.2-05]: War Room urgency threshold corrected to 30 days (was 14); Chronicle select removal skipped — none existed

### Roadmap Evolution

- Phase 03.1 inserted after Phase 3: Offseason Hardening (URGENT) — every tab handles zero-game offseason gracefully, NaN/Infinity eliminated, empty tabs show historical data, defaults favor last-completed season

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3: Verify live Google Sheets data format matches parser's expected column schema before cliff chart work
- Phase 4: Verify FantasyCalc player values endpoint (not just pick values) before Phase 4 begins
- Phase 7: Confirm Sleeper CDN CORS headers before designing share card layouts with player images

## Session Continuity

Last session: 2026-04-01T19:30:53.737Z
Stopped at: Phase 3.2 complete — ready for hands-on polish pass with Aaron
Resume file: .planning/phases/03.2-broadcast-polish/03.2-CONTEXT.md
