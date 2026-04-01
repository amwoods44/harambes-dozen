# Requirements: Harambe's Dozen — Dynasty HQ

**Defined:** 2026-03-31
**Core Value:** Every screen looks like it belongs on a broadcast — not a developer's side project.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: Service worker and manifest paths resolve correctly on GitHub Pages subdirectory (`/harambes-dozen/`)
- [x] **INFRA-02**: .gitignore excludes Excel files, backups, and unnecessary PNGs from tracking
- [x] **INFRA-03**: All dynamic text from APIs escaped via `esc()` across all render functions (XSS prevention)
- [x] **INFRA-04**: Loading screen displays Harambe logo instead of ESPN base64 image
- [x] **INFRA-05**: NFL kickoff date moved to CFG object with comment requiring annual update
- [x] **INFRA-06**: Service worker uses `skipWaiting()` and versioned cache names to prevent stale caches
- [x] **INFRA-07**: Render state preservation — scroll position and open/collapsed state survive re-renders on dirty flag flushes
- [x] **INFRA-08**: Guard clauses at top of render functions verify required `D` keys are populated before rendering
- [x] **INFRA-09**: Google Sheets CSV fetch includes explicit error handling with visible warning banner on failure
- [x] **INFRA-10**: localStorage cache pruning throttled to run at most once per minute

### Contracts

- [ ] **CONT-01**: Contract data flows reliably from Google Sheets CSV into `D.contracts` with parsed years, team, and player mapping
- [ ] **CONT-02**: `D.exemption_history` populated from contract data in `buildCurrentSeasonData()`
- [ ] **CONT-03**: Contract pills (1-7 years) visible on player cards in Rosters tab
- [ ] **CONT-04**: Contract pills visible in GM Dashboard player listings
- [ ] **CONT-05**: Contract years visible in Trade History cards (what contract came with traded players)
- [ ] **CONT-06**: Release eligibility indicator on players with 1 year remaining
- [ ] **CONT-07**: Annual exemption tracking — which team used their exemption, on which player, displayed in Contracts tab
- [ ] **CONT-08**: Waiver pickups display as 1-year auto-assigned contracts
- [ ] **CONT-09**: Contract Cliff Chart — stacked area showing when each team's contracted talent expires
- [ ] **CONT-10**: Contracts tab fully functional with sortable keeper/contract sheet view

### Roster Intelligence

- [ ] **ROST-01**: FantasyCalc player dynasty values fetched and mapped to all rostered players in `D`
- [ ] **ROST-02**: Total roster value score per team, ranked across the league
- [ ] **ROST-03**: Roster value positional breakdown (stacked bar or position-grouped display per team)
- [ ] **ROST-04**: Trade Fairness Score — retroactive grading of each historical trade using FantasyCalc values
- [ ] **ROST-05**: Trade Winner Retrospective — value at trade time vs value today, auto-badge the winner
- [ ] **ROST-06**: Roster Composition Radar Chart — spider chart per team (QB/RB/WR/TE value, age, capital)

### Player Depth

- [ ] **PLAY-01**: Player Card Modal — click any player across any tab to see full profile
- [ ] **PLAY-02**: Player Card shows FantasyCalc dynasty value, tier, and overall rank
- [ ] **PLAY-03**: Player Card shows contract years remaining and release eligibility
- [ ] **PLAY-04**: Player Card shows complete trade history for that player within the league
- [ ] **PLAY-05**: Player Journey visualization — horizontal timeline showing franchise path (Draft → Team A → Team B → Team C)

### Narrative & Delight

- [x] **NARR-01**: "This Week in League History" — surface a historically significant fact matching the current week
- [x] **NARR-02**: Achievements & Milestones badge system — auto-computed league-lifetime badges (Century Club, Iron Man, Dynasty Builder, etc.)
- [ ] **NARR-03**: Animated Season Standings Race — week-by-week bar chart race showing standings evolve
- [x] **NARR-04**: Season Narrative / Power Moves Feed — auto-generated text summaries of biggest weekly storylines
- [x] **NARR-05**: Number counter animations on stat strips (animate up on page load / tab switch)
- [ ] **NARR-06**: Leaguemate Comparison Tool (Full) — broadcast-style two-team showdown across all dimensions including roster value and contract status

### Polish

- [ ] **POLI-01**: Every existing tab reviewed and polished to broadcast-quality standard
- [ ] **POLI-02**: Constitution tab polished and complete
- [ ] **POLI-03**: Rafters tab polished and complete
- [ ] **POLI-04**: Consistent hover states on all interactive elements across all tabs
- [ ] **POLI-05**: Loading, error, and empty states handled gracefully on every tab

### Share & Social

- [ ] **SHAR-01**: Share card / screenshot export for key views (standings, matchups, trade cards)
- [ ] **SHAR-02**: Share cards use team-colored gradient circles (not headshots) to avoid canvas taint from cross-origin images
- [ ] **SHAR-03**: Web Share API integration for native OS share sheet on supported devices

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Per-Player Analytics (blocked on Sleeper stats endpoint verification)

- **PPLY-01**: Optimal Lineup / Bench Efficiency — best possible lineup vs what was started each week
- **PPLY-02**: Waiver Wire Value Score — did picked-up players actually produce?
- **PPLY-03**: Post-Game Recap Cards — auto-generated narratives per matchup

### Advanced Features

- **ADVN-01**: Dynasty Value Stock Market — roster value tracked over time as a line chart
- **ADVN-02**: Live Scoreboard Mode — real-time game-day updating view
- **ADVN-03**: Player News Integration — injury reports, depth chart changes

### Templatability

- **TMPL-01**: Configuration-driven setup — any Sleeper league can plug in user ID and league name
- **TMPL-02**: Team identity system adapts to any league's teams
- **TMPL-03**: Contract rules configurable (not hardcoded to 1-7 year structure)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Commissioner Admin Panel | Requires backend (Firebase/Supabase), different architecture entirely |
| Trade Impact Simulator | Complex drag-and-drop state management, dedicated product not a tab feature |
| Playoff Simulator (Monte Carlo) | Computationally intensive, only useful 6 weeks/year, needs projections |
| Sound Design | Absolute last priority, no analytical value, file size concern |
| Light Mode | Dark is the brand identity, doubles CSS maintenance |
| Framework Migration (React/Vue) | Zero-dependency identity is intentional and correct |
| IDP Support | League is not IDP, zero user value |
| Devy (College Players) | League doesn't use devy, adds 10K+ players with no utility |
| Multi-League Support | Templatability (fork-and-configure) is the right path, not multi-league |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 1 | Complete |
| INFRA-08 | Phase 1 | Complete |
| INFRA-09 | Phase 1 | Complete |
| INFRA-10 | Phase 1 | Complete |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| CONT-05 | Phase 3 | Pending |
| CONT-06 | Phase 3 | Pending |
| CONT-07 | Phase 3 | Pending |
| CONT-08 | Phase 3 | Pending |
| CONT-09 | Phase 3 | Pending |
| CONT-10 | Phase 3 | Pending |
| ROST-01 | Phase 4 | Pending |
| ROST-02 | Phase 4 | Pending |
| ROST-03 | Phase 4 | Pending |
| ROST-04 | Phase 4 | Pending |
| ROST-05 | Phase 4 | Pending |
| ROST-06 | Phase 4 | Pending |
| PLAY-01 | Phase 5 | Pending |
| PLAY-02 | Phase 5 | Pending |
| PLAY-03 | Phase 5 | Pending |
| PLAY-04 | Phase 5 | Pending |
| PLAY-05 | Phase 5 | Pending |
| NARR-01 | Phase 2 | Complete |
| NARR-02 | Phase 2 | Complete |
| NARR-03 | Phase 2 | Pending |
| NARR-04 | Phase 2 | Complete |
| NARR-05 | Phase 2 | Complete |
| NARR-06 | Phase 5 | Pending |
| POLI-01 | Phase 6 | Pending |
| POLI-02 | Phase 6 | Pending |
| POLI-03 | Phase 6 | Pending |
| POLI-04 | Phase 6 | Pending |
| POLI-05 | Phase 6 | Pending |
| SHAR-01 | Phase 7 | Pending |
| SHAR-02 | Phase 7 | Pending |
| SHAR-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after roadmap creation — all 45 requirements mapped*
