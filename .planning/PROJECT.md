# Harambe's Dozen — Dynasty HQ

## What This Is

The world's most polished dynasty fantasy football league companion app. An ESPN-level broadcast parody dashboard for the 12-team Harambe's Dozen PPR dynasty league, pulling live data from Sleeper API. Not replacing Sleeper — expanding it with deeper analytics, richer history, and presentation quality that makes 12 leaguemates feel like their league has its own media network. Single-file vanilla app deployed on GitHub Pages, designed to eventually be templatable for any Sleeper dynasty league.

## Core Value

Every screen looks like it belongs on a broadcast — not a developer's side project. If it doesn't feel like ESPN's dynasty coverage, it's not done.

## Requirements

### Validated

- ✓ Power Rankings with composite scoring and tier groupings — existing
- ✓ Roster Browser with position grouping, headshots, age coloring — existing
- ✓ Manager Badges (auto-computed personality tags) — existing
- ✓ Championship History with banner cards (2023-2025) — existing
- ✓ Franchise Rankings (all-time W-L, points, win %, titles) — existing
- ✓ Luck Rating (schedule-adjusted wins) — existing
- ✓ Playoff Bracket visualization per year — existing
- ✓ Trade History with full trade cards — existing
- ✓ Pick Capital Net and Capital Inventory Grid — existing
- ✓ Trade Partner Matrix — existing
- ✓ Matchup Cards with week-by-week browsing — existing
- ✓ Draft Board Grid and Pick List — existing
- ✓ Age Map with dynasty window labels — existing
- ✓ Scoring Heat Map and Sparklines — existing
- ✓ Awards (12 auto-computed superlative categories) — existing
- ✓ H2H Matrix, All-Play Record, Consistency Scatter, Pythagorean Wins, SOS — existing
- ✓ Waiver Wire Feed and Move Type Breakdown — existing
- ✓ GM Dashboard (per-team command center) — existing
- ✓ Rivalry Tracker with dominance bars — existing
- ✓ Power Race Chart and H2H Comparison Tool — existing
- ✓ PWA support, responsive design, dark theme, loading screen, ticker — existing
- ✓ 13 navigable tabs with full tab system — existing

### Active

**Contracts Integration**
- [ ] Contract data flows from Google Sheets CSV into the app reliably
- [ ] Contract years (1-7) visible on player cards across all relevant views (Rosters, GM, Trades)
- [ ] Contract pill styling matches broadcast aesthetic
- [ ] Contract expiration tracking (years remaining per player per team)
- [ ] Release eligibility indicator (1 year remaining = releasable)
- [ ] Annual exemption tracking (1 per team, restructure any contract)
- [ ] Waiver pickup auto-display as 1-year contract
- [ ] Contract Cliff Chart (stacked area showing when talent expires per team)
- [ ] Contracts tab fully functional with keeper/contract sheet view

**Page Polish & New Features**
- [ ] Every existing tab polished to broadcast-quality standard
- [ ] Player Card Modal (click any player for bio, trade history, contract details)
- [ ] Player Journey / Trade Chains (timeline: Player X → Team A → Team B → Team C)
- [ ] Roster Composition Radar Chart (spider chart per team)
- [ ] Dynasty Value Stock Market (composite player value tracked over time)
- [ ] Achievements & Milestones badge system
- [ ] This Week in League History
- [ ] Animated Season Standings Race
- [ ] Number counter animations on stat strips
- [ ] Constitution tab polished and complete
- [ ] Rafters tab polished and complete
- [ ] Share card / screenshot export functionality

**Infrastructure & Quality**
- [ ] PWA paths fixed for GitHub Pages subdirectory (`/harambes-dozen/`)
- [ ] .gitignore added (exclude Excel files, backups, unnecessary PNGs)
- [ ] XSS prevention: all dynamic text escaped via `esc()` across all render functions
- [ ] Loading screen uses Harambe logo instead of ESPN base64 image
- [ ] NFL kickoff date moved to CFG and documented for annual update
- [ ] Service worker cache strategy validated for GitHub Pages
- [ ] Render state preservation (scroll position, open/collapsed state survive re-renders)

**Templatability (Future)**
- [ ] Configuration-driven: any Sleeper league can plug in their user ID and league name
- [ ] Team identity system adapts to any league's teams
- [ ] Contract rules configurable (not hardcoded to 1-7 year structure)

### Out of Scope

- Live Scoreboard Mode — requires real-time polling/websockets, high complexity
- Commissioner Admin Panel — requires backend (Firebase/Supabase), different architecture
- Sound Design — absolute last priority, tackle only after everything else is perfect
- Trade Impact Simulator — complex state management, defer to future milestone
- Playoff Simulator (Monte Carlo) — computational engine, seasonal utility only
- Framework migration (React, Vue) — zero-dependency approach is intentional
- Build tools / npm / TypeScript — vanilla JS is the identity
- Light mode — dark is the brand

## Context

- **Audience:** 12 leaguemates in the Harambe's Dozen dynasty league, potentially public-facing if quality is high enough, eventually templatable for other leagues
- **Data source:** Sleeper API (public, no auth) for all league data; FantasyCalc API for dynasty trade values; Google Sheets CSV for contract data
- **Contract rules:** Players drafted get 1-7 year contracts (owner's choice). Players on contract stay on your team for that duration. Releasable at 1 year remaining. 1 annual exemption per team to restructure any contract. Waiver pickups auto-assigned 1-year contracts, released to draft pool after season.
- **Existing app:** ~5,600 lines in index.html, 18 render functions, 40+ working features, 13 tabs. Heavily polished broadcast aesthetic with Oswald/Inter/JetBrains Mono font stack.
- **Design identity:** ESPN broadcast parody. Dark warm theme (#120e0c base, #cc0000 accent red, #ffcc00 gold). Angled clip-path headers, team-colored accents, gradient circles. Font weights 600-900 on headings are intentional.
- **Known tech debt:** Global mutable `D` object (load-bearing, not refactorable), mixed var/let/const, innerHTML destructive rendering, hardcoded kickoff date, XSS surface from unescaped API data.

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only. No framework, no build tools, no npm. Zero runtime dependencies.
- **Architecture**: Single `index.html` file. Global `D` object is the data store. Not refactorable to modules without breaking everything.
- **Hosting**: GitHub Pages (static files only, no server-side logic).
- **Data**: Sleeper API (public, rate-limited by courtesy), Google Sheets CSV (manual contract data entry), FantasyCalc (public).
- **Timeline**: ASAP — no hard deadline, but urgency to ship.
- **File size**: Already at ~5,600 lines. Will grow. Accepted tradeoff of the single-file approach.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stay vanilla JS, no framework | Zero-dependency identity, instant load, no build complexity | — Pending |
| Single index.html architecture | Simplicity of deployment, no routing needed | — Pending |
| Google Sheets for contract data | Low-friction for manual entry, no backend needed | — Pending |
| Dark-only theme | Broadcast identity, ESPN parody aesthetic | ✓ Good |
| Sleeper API as primary data source | League already lives on Sleeper, public API, no auth | ✓ Good |
| Templatability as future goal | Build for one league first, generalize later | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
