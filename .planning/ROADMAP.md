# Roadmap: Harambe's Dozen — Dynasty HQ

## Overview

Seven phases transform the existing 40-feature dashboard into the most complete dynasty fantasy football companion app available. The journey moves from foundation to differentiators: fix the infrastructure so deployment is reliable, ship the zero-dependency narrative features that build broadcast credibility, complete the contracts system that defines the league's identity, integrate FantasyCalc for roster intelligence, deliver the full player modal, polish every existing tab to broadcast standard, and cap it with shareable stat cards. Every screen looks like ESPN dynasty coverage by the end.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Infrastructure Hardening** - Fix deployment, caching, data pipeline gaps, and XSS surface so every feature built on top is reliable
- [ ] **Phase 2: Narrative & Delight** - Ship five zero-dependency broadcast features (history, badges, standings race, power moves, counter animations)
- [ ] **Phase 3: Contracts Complete** - Fully functional contracts system — pills, cliff chart, exemptions, and sortable keeper sheet
- [ ] **Phase 4: Roster Intelligence** - FantasyCalc integration unlocking roster value scores, positional breakdown, and trade fairness grades
- [ ] **Phase 5: Player Depth** - Full player modal with dynasty value, contract, trade timeline, and leaguemate comparison tool
- [ ] **Phase 6: Polish** - Every existing tab reviewed and elevated to broadcast-quality standard
- [ ] **Phase 7: Share Cards** - Broadcast-quality shareable stat cards with Web Share API mobile integration

## Phase Details

### Phase 1: Infrastructure Hardening
**Goal**: The app deploys reliably, caches correctly, handles errors visibly, and has no silent failure paths that will break features built in later phases
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09, INFRA-10
**Success Criteria** (what must be TRUE):
  1. The PWA installs correctly on mobile and the service worker registers without 404 errors on GitHub Pages
  2. App updates reach users without requiring a hard refresh — stale cache is a thing of the past
  3. The loading screen shows the Harambe logo (not the ESPN base64 image)
  4. If the Google Sheets CSV fetch fails, a visible warning banner appears instead of silent empty contract data
  5. Every render function guards against rendering before its required data is available — no silent empty panels
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Config fixes: CFG.nflKickoff, _prune throttle, .gitignore cleanup, logo verification (INFRA-02, INFRA-04, INFRA-05, INFRA-10)
- [x] 01-02-PLAN.md — Service worker: remove unregister-all pattern, bump cache to v6 (INFRA-01, INFRA-06)
- [x] 01-03-PLAN.md — Render safety: guard clauses in all 18 render functions + esc() XSS coverage (INFRA-03, INFRA-08)
- [x] 01-04-PLAN.md — New patterns: Trades scroll preservation + Contracts CSV warning banner (INFRA-07, INFRA-09)

### Phase 2: Narrative & Delight
**Goal**: Five broadcast-quality features ship that require zero new data sources, delivering immediate visible value and establishing the render patterns all subsequent phases inherit
**Depends on**: Phase 1
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, NARR-05
**Success Criteria** (what must be TRUE):
  1. "This Week in League History" surfaces a historically significant league fact matching the current calendar week
  2. The Achievements tab shows auto-computed lifetime badges (Century Club, Iron Man, Dynasty Builder, etc.) for each manager
  3. The Standings Race plays back a week-by-week animated bar chart showing how the season unfolded
  4. A Power Moves Feed displays auto-generated text summaries of the biggest weekly storylines
  5. Stat strip numbers count up from zero on page load and tab activation — no instant static numbers
**Plans**: 5 plans

Plans:
- [x] 02-01-PLAN.md — Pipeline fix + CountUp.js counter animations: mergeHistoricalData persistence + animateCounters upgrade (NARR-05)
- [x] 02-02-PLAN.md — "This Week in League History" callout card: week-matched vintage ESPN hero card (NARR-01)
- [x] 02-03-PLAN.md — Achievements & Badges: computeLifetimeBadges, badgeSvg, GM badge case, Awards Hall of Fame (NARR-02)
- [x] 02-04-PLAN.md — Power Moves Feed: buildPowerMoves, Season Story section in Trophies tab (NARR-04)
- [x] 02-05-PLAN.md — Standings Race: computeWeeklyStandings, animateStandingsRace canvas, year selector + play button (NARR-03)

### Phase 3: Contracts Complete
**Goal**: The contracts system is fully functional — data flows reliably from Google Sheets, pills appear across all relevant tabs, the cliff chart visualizes expiration risk, and the Contracts tab is the definitive keeper-league reference
**Depends on**: Phase 1
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, CONT-09, CONT-10
**Success Criteria** (what must be TRUE):
  1. Contract years (1-7) display as styled pills on player cards in the Rosters tab, GM Dashboard, and Trade History
  2. Players with 1 year remaining show a release eligibility indicator
  3. Waiver pickups automatically display as 1-year contracts
  4. The Contract Cliff Chart shows when each team's contracted talent expires in a multi-team stacked visualization
  5. The Contracts tab shows a fully sortable keeper/contract sheet with exemption tracking per team
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Pipeline fixes: exemption aggregation in parseContractCSV, waiver auto-assignment, POS/Fantasy Team column parsing (CONT-01, CONT-02, CONT-08)
- [x] 03-02-PLAN.md — cpill distribution: contract pills across Rosters bench, Trade History, GM Dashboard + RELEASABLE badge (CONT-03, CONT-04, CONT-05, CONT-06)
- [ ] 03-03-PLAN.md — Sortable keeper sheet + exemption timeline/cliff chart data verification (CONT-07, CONT-09, CONT-10)

### Phase 4: Roster Intelligence
**Goal**: FantasyCalc dynasty values are integrated for all rostered players, enabling roster value rankings, positional breakdown, and retroactive trade fairness grades
**Depends on**: Phase 1
**Requirements**: ROST-01, ROST-02, ROST-03, ROST-04, ROST-05, ROST-06
**Success Criteria** (what must be TRUE):
  1. Every rostered player shows a FantasyCalc dynasty value, and each team has a total roster value score ranked across the league
  2. Roster value positional breakdown shows where each team's value is concentrated (QB/RB/WR/TE)
  3. Every historical trade has a retroactive fairness score showing which side won at trade time and who won in hindsight
  4. The Trade Winner Retrospective auto-badges the winner of each trade based on current vs trade-time values
  5. The Roster Composition Radar shows a spider chart per team across value, age, and capital dimensions
**Plans**: TBD
**UI hint**: yes

### Phase 5: Player Depth
**Goal**: Clicking any player across any tab opens a full profile modal with dynasty value, contract, complete trade history, and visual journey — and the leaguemate comparison tool spans all dimensions
**Depends on**: Phase 3, Phase 4
**Requirements**: PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05, NARR-06
**Success Criteria** (what must be TRUE):
  1. Clicking any player anywhere in the app opens a modal with their FantasyCalc dynasty value, tier, and overall rank
  2. The player modal shows contract years remaining and release eligibility status
  3. The player modal shows every trade involving that player within the league, in chronological order
  4. The Player Journey tab shows a horizontal timeline of each player's franchise path (Draft → Team A → Team B → Team C)
  5. The Leaguemate Comparison Tool delivers a broadcast-style two-team showdown across all dimensions including roster value and contract status
**Plans**: TBD
**UI hint**: yes

### Phase 6: Polish
**Goal**: Every existing tab has been reviewed and elevated to true broadcast quality — consistent hover states, graceful error/empty/loading states, and the Constitution and Rafters tabs are complete
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: POLI-01, POLI-02, POLI-03, POLI-04, POLI-05
**Success Criteria** (what must be TRUE):
  1. Every interactive element across all tabs has a visible hover state — no element responds to clicks without a hover cue
  2. Every tab handles its loading, error, and empty states gracefully — no blank panels, no raw errors shown to users
  3. The Constitution tab is complete and polished to broadcast standard
  4. The Rafters tab is complete and polished to broadcast standard
  5. A full tab-by-tab audit confirms every existing tab meets the broadcast quality bar
**Plans**: TBD
**UI hint**: yes

### Phase 7: Share Cards
**Goal**: Users can export and share broadcast-quality stat cards from key views, with native OS share sheet on mobile
**Depends on**: Phase 5, Phase 6
**Requirements**: SHAR-01, SHAR-02, SHAR-03
**Success Criteria** (what must be TRUE):
  1. Users can export a shareable image from key views (standings, matchup cards, trade cards)
  2. Share cards render correctly using gradient avatar circles — no canvas taint errors from cross-origin player images
  3. On supported mobile devices, the Web Share API opens the native OS share sheet when tapping the share button
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure Hardening | 0/TBD | Not started | - |
| 2. Narrative & Delight | 2/5 | In Progress|  |
| 3. Contracts Complete | 0/3 | Not started | - |
| 4. Roster Intelligence | 0/TBD | Not started | - |
| 5. Player Depth | 0/TBD | Not started | - |
| 6. Polish | 0/TBD | Not started | - |
| 7. Share Cards | 0/TBD | Not started | - |
