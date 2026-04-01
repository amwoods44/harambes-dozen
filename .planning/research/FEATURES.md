# Feature Landscape

**Domain:** Dynasty fantasy football league companion app (Sleeper-connected)
**Researched:** 2026-03-31
**Scope:** What elite dynasty apps offer that this app is currently missing

---

## Context: What Already Exists

The app already ships 40+ features across 13 tabs. This document covers only what is MISSING. The existing feature set is strong on historical analytics, visualization, and broadcast aesthetic. The gaps cluster around: live player value integration, per-player scoring depth, offseason engagement tools, and social/narrative features.

---

## Table Stakes

Features users of dynasty companion apps expect. Missing one = the app feels incomplete compared to peers.

| Feature | Why Expected | Complexity | Data Source | Notes |
|---------|--------------|------------|-------------|-------|
| Roster Value Score (KTC/FantasyCalc) | Every major dynasty tool (KTC, Dynasty Daddy, FantasyCalc) surfaces total roster value — managers compare their squad's worth routinely | Med | FantasyCalc API (already used for pick values) | Apply FantasyCalc dynasty values to all rostered players, sum per team, rank the league. The data source already exists in the app for picks. |
| Roster Value Positional Breakdown | Users expect to see not just total value, but where it's concentrated (RB-heavy, WR-corps, QB strength) | Med | FantasyCalc API | Stacked bar or position radar per team. KTC does this explicitly as a league feature. |
| Trade Fairness Score | Companion to the existing Trade History — users expect to know who won each trade retroactively | Med | FantasyCalc values at trade time | My Fantasy Analyzer grades every trade using dynasty value at time + value change since + realized points. Only needs value-at-time snapshotting logic. |
| Contracts Fully Functional | Already in-progress; contract pill display, years remaining, cliff chart — currently placeholder data | High | Google Sheets CSV | Already scoped as Active in PROJECT.md. This is the single most requested dynasty-specific feature. Without it, the app is incomplete for a contract league. |
| Per-Player Weekly Points | "Points left on bench" / lineup efficiency analysis requires per-player weekly scoring | High | Sleeper stats endpoint (`/stats/nfl/<season>/<week>`) | MEDIUM confidence: Sleeper has a stats endpoint at `api.sleeper.com/stats/nfl` but some sources suggest the player scores endpoint was deprecated or rate-limited. Needs direct verification before building on this. |
| Player Card Modal | Click any player, see bio, KTC value, current contract, trade history | Med | FantasyCalc API + existing trade data | Already in PROJECT.md Active. Without this, the roster browser is read-only — no depth. |

---

## Differentiators

Features that set this app apart from every other dynasty companion tool. These are the gap between "solid" and "best in the world."

| Feature | Value Proposition | Complexity | Data Source | Notes |
|---------|-------------------|------------|-------------|-------|
| Dynasty Value Stock Market | Show each team's total roster value (KTC-based) as a line chart across the season/offseason. "Your franchise peaked in Week 9 and is down 8% since." | Med-High | FantasyCalc API (current) + cached historical snapshots | No peer does this for a private league. FantasyCalc publishes value data. The challenge is historical — you'd need to cache values at regular intervals going forward. For past seasons, use trade timestamps as value anchors. |
| Optimal Lineup / Bench Efficiency | Calculate the maximum points each team could have scored each week vs what they actually started. Surface the "coach skill" gap across the league. | High | Sleeper stats endpoint (per-player weekly) | My Fantasy Analyzer does this but only for current-season Sleeper leagues. Doing it historically for all 3 seasons is a genuine differentiator. Blocked on per-player scoring data availability. |
| Trade Winner Retrospective | For every trade ever made, show: value at trade time (FantasyCalc), value today, and points scored since trade by each side. Auto-badge the winner. | Med | FantasyCalc API + existing trade data | My Fantasy Analyzer does this in real-time only. Doing it historically for all league trades is unique. Data requires pairing roster IDs to trade transaction player IDs. |
| Player Journey / Trade Chain Visualization | Horizontal timeline per player: "CeeDee Lamb → Team A (Draft 2021) → Team B (Trade Week 4, 2023) → Team C (Trade Week 11, 2024)." Click any player to see their full franchise path. | Med | Existing Sleeper transaction data | Already in PROJECT.md Active. No major competitor does this per-player visually. The data exists in transactions — it's a parsing and render problem. |
| Contract Cliff Chart | Stacked area chart showing when contracted talent expires per team — each team has a "contract cliff" year. Identifies which teams face mass expirations simultaneously. | Med | Google Sheets CSV (contract data) | Completely unique in the dynasty space. Contract leagues are underserved. No other tool (including League Tycoon) does this as a multi-team comparative visualization. |
| Animated Season Standings Race | Week-by-week bar chart race showing standings evolve. Every team visible, labeled, animated. | Med | Existing weekly matchup data | Visually spectacular. Bar chart races are high-engagement social content. Data fully exists, it's a canvas animation problem. |
| "This Week in League History" | Surface a historically significant fact every week: "3 years ago today, Team X scored 206 points — the current league record." | Low | Existing historical matchup data | Extremely low complexity. The data is already fully loaded. Pure delight feature that drives weekly app opens. |
| Leaguemate Comparison Tool (Full) | Side-by-side comparison of any two teams across all dimensions: record, scoring, roster value, age curve, trade history, contract cliff, H2H | Med | Existing data + FantasyCalc values | The H2H Comparison Tool exists but is limited. A full broadcast-style "Two-Team Showdown" with every dimension including roster value and contract status is unique. |
| Roster Composition Radar Chart | Spider/radar chart per team covering QB value, RB value, WR value, TE value, age, and capital. Instantly reads a team's construction philosophy. | Med | FantasyCalc API + existing age/capital data | Canvas work. Data exists. Draft Sharks does this as a paid feature. Doing it per-team for the whole league is distinctive. |
| Achievements & Milestones Badge System | Auto-computed league-lifetime badges: Century Club (scored 200+), Iron Man (never missed a waiver claim), Dynasty Builder (highest youth % 3 seasons running), etc. | Low-Med | Existing historical data | FantasyCalc doesn't do this. KTC doesn't do this. Unique to this app. Drives re-engagement as managers check their badge count. |
| Season Narrative / Power Moves Feed | "Week 12 was the turning point — here's who rose and fell." Auto-generated text summary of the biggest weekly storylines: biggest upset, highest score, most impactful waiver move, most lopsided trade. | Med | Existing matchup + transaction data | League Rewind and League Legacy do this as standalone newsletter apps. Building this natively — especially with broadcast framing — would be unique. No per-player scoring needed, just matchup + transaction data. |
| Waiver Wire Value Score | Score every waiver claim: did the player actually produce after pickup? Surface the best and worst waiver decisions in league history. | Med-High | Per-player stats (Sleeper stats endpoint) + existing transaction data | Completely unique. Turns the waiver feed into a GM evaluation tool. |

---

## Anti-Features

Features to explicitly NOT build. Each has a reason grounded in constraint or strategic focus.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Live Scoreboard Mode | Requires WebSockets or aggressive polling (every 30s during games). Static hosting on GitHub Pages cannot support this. Single-file architecture would need real-time state management it's not designed for. | Surface prior-week results with strong matchup cards — the game-day UX exists through Sleeper's own app |
| Commissioner Admin Panel | Requires a backend (database writes, auth). GitHub Pages is static hosting only. League Tycoon owns this space for contract management on a proper backend. | Contract data flows one-way from Google Sheets — the "admin panel" for this league is the spreadsheet |
| Trade Impact Simulator (drag-and-drop) | Complex UI state, real-time recalculation of power rankings with hypothetical trades — this is a dedicated product, not a tab feature | Surface trade winner data historically and current KTC value comparisons — inform decisions without simulating them |
| Playoff Simulator (Monte Carlo) | Computationally intensive, only useful for 6 weeks per year, and requires per-player projections (not available from Sleeper) | The existing playoff bracket with historical data serves the same nostalgia and analysis need |
| Player News / Injury Feed | Requires a real-time news API (ESPN, Rotoworld, etc.) — no free public API provides this at quality. Would need polling, caching, and content moderation. | Surface player KTC value trends as a proxy for "what the market thinks" about player status |
| IDP (Individual Defensive Players) | This league is not IDP. Adding IDP infrastructure for a league that doesn't use it is technical debt with zero user value | — |
| Devy (College Players) | This league does not use devy. Adds complexity to the player database (~10K additional players) with no utility for this league's members | — |
| Sound Design | Absolute last priority. Adds no analytical value and requires careful implementation to not be annoying. Single-file file size already growing. | — |
| Light Mode | Dark is the brand identity. Adding light mode doubles CSS maintenance burden for no strategic gain | — |
| Framework Migration | React/Vue would require a build system, bundler, and complete rewrite. Zero-dependency identity is correct for the use case. | — |
| Multi-League Support | The app is designed for THIS league specifically. Templatability (configuration-driven) is the right path, not multi-league within one instance | Design CFG object to be config-driven so any league can fork it |

---

## Feature Dependencies

```
Roster Value Score
  → requires FantasyCalc API integration (player values, not just pick values)
  → unlocks: Roster Value Positional Breakdown, Trade Fairness Score, Dynasty Value Stock Market,
             Trade Winner Retrospective, Leaguemate Comparison Tool (Full), Roster Composition Radar

Per-Player Weekly Points (Sleeper stats endpoint)
  → requires: verification that endpoint is accessible and not rate-limited
  → unlocks: Optimal Lineup / Bench Efficiency, Waiver Wire Value Score, Post-Game Recap Cards

Contract Data (Google Sheets CSV, already in-progress)
  → unlocks: Contract Cliff Chart, Contract expiration on Player Card Modal, Contract display on Roster Value

Player Card Modal
  → requires: Roster Value Score (for KTC value display)
  → requires: Contract Data (for contract years)
  → partially unlocks: Player Journey / Trade Chain (modal is the entry point)

Player Journey / Trade Chain
  → requires: Player Card Modal (or standalone tab)
  → requires: transaction parsing (player ID from trade asset strings)

Trade Winner Retrospective
  → requires: Roster Value Score (FantasyCalc player values)
  → enhances: existing Trade History tab

Animated Season Standings Race
  → no external dependencies — fully served by existing matchup data

"This Week in League History"
  → no external dependencies — date matching against existing data

Achievements & Milestones
  → no external dependencies — computed from existing data

Season Narrative / Power Moves Feed
  → no external dependencies for matchup narratives
  → enhanced by: Per-Player Weekly Points (for player-level stories)
```

---

## MVP Recommendation

Prioritize by: (1) data already available, (2) user impact, (3) uniqueness.

**Build first — data exists, high impact:**
1. Roster Value Score + Positional Breakdown (FantasyCalc API already in use)
2. Trade Fairness Score using KTC values at trade time
3. Animated Season Standings Race (all data exists, pure canvas animation)
4. "This Week in League History" (near-zero complexity, drives weekly opens)
5. Achievements & Milestones badge system (data exists, unique to this app)
6. Season Narrative / Power Moves Feed (data exists, no per-player stats needed)

**Build second — requires contract data completing:**
7. Contract Cliff Chart (depends on Google Sheets contract integration finishing)
8. Player Card Modal with contract + KTC value (depends on #1 and contract data)

**Build third — per-player stats required, needs verification:**
9. Optimal Lineup / Bench Efficiency
10. Waiver Wire Value Score

**Defer — higher complexity, diminishing returns:**
- Player Journey / Trade Chain (parsing complexity, medium effort)
- Dynasty Value Stock Market (requires forward-caching values going forward)
- Full Leaguemate Comparison Tool (builds on everything above)

---

## Data Availability Notes

**FantasyCalc API (MEDIUM confidence):** The app already uses FantasyCalc for pick capital display. Player values for all NFL players are available at `fantasycalc.com/api/values` endpoints. Dynasty values can be pulled for all rostered players. This is the correct source for roster value scoring.

**Sleeper stats endpoint (LOW confidence — needs verification):** The endpoint `api.sleeper.com/stats/nfl/<season>/<week>` reportedly exists and returns per-player stats. However, multiple sources indicate Sleeper deprecated or restricted their open player scores endpoint at some point. Before building any feature that depends on per-player weekly scoring, verify this endpoint directly against the current production API. Do not assume it works based on third-party documentation.

**Existing Sleeper transaction data:** Trade asset parsing is complex — trade items are stored as player IDs (for players) and pick strings (for picks). Player journey tracking requires resolving player IDs from historical transactions against the player database. The data is there but parsing it reliably is non-trivial.

---

## Competitive Landscape Summary

| Competitor | What They Do Well | What This App Can Beat Them On |
|------------|-------------------|-------------------------------|
| KeepTradeCut | Crowdsourced player values, roster ranking by KTC value | Broadcast aesthetic, league-specific history, narrative features, contract integration |
| Dynasty Daddy | Free, broad analytics, trade calculator | Visual quality, custom league identity, contract-league features |
| My Fantasy Analyzer | Trade grading with value-at-time, optimal lineup, multi-season aggregation | Visual quality, narrative, historical depth, contract tracking |
| FantasyCalc | Computer-generated values, weekly power rankings | League-specific history, visual storytelling, contract features |
| League Tycoon | Contract dynasty management, cap tracking | Analytical depth (KTC-value analytics), visual broadcast quality |
| Dynasty Nerds | Film room, scouting, expert content | Self-contained league analytics, no subscription required, custom league identity |

**The gap this app can own:** Every competitor is either a generic platform serving all leagues OR a plain-analytics tool without visual identity. This app has the broadcast aesthetic AND the private-league depth. The unique combination is: broadcast-quality presentation + this specific league's history + contract-league analytics. No competitor combines all three.

---

## Sources

- [Dynasty Daddy](https://dynasty-daddy.com/) — free dynasty analytics platform
- [KeepTradeCut Power Rankings](https://keeptradecut.com/dynasty/power-rankings) — roster value and positional breakdown
- [My Fantasy Analyzer](https://myfantasyanalyzer.com/) — trade grading, optimal lineup, multi-season Sleeper analytics
- [League Tycoon Features](https://leaguetycoon.com/features/) — contract dynasty, salary cap management
- [Draft Sharks Dynasty Tools](https://www.draftsharks.com/kb/best-dynasty-tools) — multi-year projections, dynasty war room
- [Dynasty Nerds Tools](https://www.dynastynerds.com/) — league analyzer, lineup optimizer, rookie guide
- [Sleeper API Docs](https://docs.sleeper.com/) — endpoint reference, stats availability
- [Bleacher Nation Dynasty Sites Guide](https://www.bleachernation.com/fantasy-football/2025/07/30/dynasty-sites/) — platform comparison
- [League Rewind App](https://apps.apple.com/us/app/league-rewind-fantasy-football/id6499177011) — auto-generated narrative recaps
