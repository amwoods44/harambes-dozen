# Harambe's Dozen — Feature Status

> Dynasty HQ Dashboard for a 12-team PPR dynasty league with contracts.
> Single-file app (index.html) powered by embedded Sleeper API data.

---

## INSTALLED & WORKING

These features are live in the current build and fully functional.

### Core Tabs (8 original)

| Feature | Tab | What It Does | League Use |
|---------|-----|-------------|------------|
| Power Rankings | Rankings | Composite score (40% record, 30% points, 20% youth, 10% capital) with tier groupings, expandable roster cards | See who's actually the best dynasty, not just this year's record |
| Roster Browser | Rosters | Full roster for every team, grouped by position, with starter headshots and age coloring | Scout opponents, plan trades, evaluate roster depth |
| Manager Badges | Rosters | Auto-computed personality tags (Wheeler-Dealer, Ghost, Dynasty Builder, Win Now, Champion, etc.) | Instantly know each manager's style and tendencies |
| Championship History | Trophies | Banner cards for every champion (2023-2025), records (highest score, closest game, biggest blowout) | Bragging rights, rivalry fuel |
| Franchise Rankings | Trophies | All-time W-L, total points, win %, and championship count across 3 seasons | Who's the GOAT franchise in your league |
| Luck Rating | Trophies | Schedule-adjusted wins showing who got lucky/unlucky schedules | Settle the "I would've won with your schedule" argument forever |
| Playoff Bracket | Trophies | Visual bracket per year: quarterfinals, semis, championship, with runner-up | Relive the playoff drama, see the path to the title |
| Manager Activity | Trophies | Stacked bar chart showing trades, moves, and draft picks per manager | Expose the ghosts and the hyperactive managers |
| Season Standings | Trophies | Final standings for 2023, 2024, 2025 with champion highlighted | Quick reference for historical seasons |
| Trade History | Trades | Full trade cards with both sides, assets, and week/year markers | Revisit trades, evaluate who won them in hindsight |
| Pick Capital Net | Trades | Net future pick balance per team (+/- traded picks) | See who's stocking up vs mortgaging the future |
| Capital Inventory Grid | Trades | Table showing exactly who owns which future picks (OWN / via Team / TRADED) | Dynasty gold — know the full pick landscape before proposing trades |
| Trade Partner Matrix | Trades | Bar chart showing which managers trade with each other most | Expose trade alliances and preferred partners |
| Most Traded Players | Trades | Hot commodities — players traded 2+ times | Track the league's trade darlings |
| Matchup Cards | Matchups | Week-by-week matchup browser with owner avatars, crown on winner, margin tags | Relive weekly matchups with broadcast-style presentation |
| Week Summary Stats | Matchups | High/avg/low scoring per week, thriller (<5pt) and blowout (>40pt) labels | Instantly see wild weeks vs boring ones |
| Draft Board Grid | Draft | Visual grid (rounds x picks) with position-colored cells and hit/bust borders | See draft strategy at a glance — who went RB-heavy, who reached for a QB |
| Draft Pick List | Draft | Traditional pick-by-pick list with player photos, position, team, drafter | Detailed draft review |
| Draft Hit Rate | Scoring | Which draft picks became starters, bench, or got cut — per draft class | Grade your league's drafting ability |
| Age Map | Age Map | Stacked bar showing young/prime/vet split per team, sorted by avg age | Dynasty window analysis — who's building vs who's mortgaging |
| Championship Window | Age Map | Text labels per team: Wide Open, Building, Win Now, Closing | Quick dynasty philosophy guide |
| Scoring Heat Map | Scoring | 12x17 color-coded grid showing every team's score every week | Visual pattern recognition — hot streaks, cold streaks, consistency |
| Scoring Sparklines | Scoring | Mini bar charts per team with weekly scoring, high/low/avg/std dev | Quick performance profiles |
| Scoring Settings | Scoring | Full PPR + bonus scoring rules reference | Always know the scoring without digging through Sleeper |

### New Tabs (5 added)

| Feature | Tab | What It Does | League Use |
|---------|-----|-------------|------------|
| Awards (12 categories) | Awards | Auto-computed superlatives: Champion, MVP, Point Machine, Mr. Consistent, Boom or Bust, Luckiest, Snake Bitten, Dynasty Builder, Wheeler-Dealer, Ghost, Single Week Record, Draft Guru | End-of-season awards without voting — the numbers decide |
| H2H Matrix | Analytics | 12x12 heatmap showing every team's head-to-head record vs every other | See your nemesis at a glance, identify favorable matchups |
| All-Play Record | Analytics | If you played every team every week, what's your record? Removes schedule luck entirely | The truest ranking of team strength — no schedule noise |
| Consistency Scatter | Analytics | Canvas chart: avg points (x-axis) vs standard deviation (y-axis) per team | Identify boom/bust vs steady performers visually |
| Pythagorean Wins | Analytics | Expected wins based on PF/PA ratio using Pythagorean expectation formula | Are you overperforming or underperforming your point differential? |
| Strength of Schedule | Analytics | Opponent win % — how tough was your schedule | Know who had an easy ride vs who earned every win |
| Waiver Wire Feed | Moves | Full transaction history: waiver claims, FA pickups, commissioner moves, grouped by week | See who's working the wire — the hidden skill gap in dynasty |
| Move Type Breakdown | Moves | Waiver vs FA vs commissioner split, most active manager | Quantify waiver activity across the league |
| GM Dashboard | GM | Select any team, see their full profile: scoring stats, roster composition, activity, H2H vs all opponents, weekly sparkline, trade history | Your franchise command center — everything about YOUR team in one place |
| Rivalry Tracker | Rivals | All 20 rivalry matchups ranked by total games, with dominance bar and ownership badges | Know who owns who, fuel the trash talk |

### Enhancement Features (added to existing tabs)

| Feature | Tab | What It Does | League Use |
|---------|-----|-------------|------------|
| Power Race Chart | Rankings | Canvas horizontal bar race showing top 6 teams by power score | Visual spectacle of who's on top |
| H2H Comparison Tool | Rankings | Dropdown: pick any two teams, compare power/wins/points/age/roster/H2H record | Quick side-by-side before proposing a trade or talking trash |

### Infrastructure

| Feature | Status | What It Does |
|---------|--------|-------------|
| 13 navigable tabs | Working | Full tab system with active states |
| Owner avatars | Working | Pulled from Sleeper CDN, fallback to gorilla emoji |
| Player headshots | Working | Sleeper CDN thumbnails on roster cards and draft |
| Responsive design | Working | Mobile-optimized at 768px, 600px, 480px, 380px breakpoints |
| PWA support | Working | Service worker, manifest, installable on mobile home screen |
| Loading screen | Working | Animated gorilla + spinner on page load |
| NFL countdown | Working | Days/hours/minutes to NFL kickoff in header |
| Live badge | Working | Animated green dot status indicator |
| Bottom ticker | Working | Scrolling league facts and stats |
| Dark theme | Working | Full dark mode, no light mode (dark is the identity) |

---

## FUTURE CAPABILITIES

These are features that would make the app truly elite. They require additional data, APIs, or more complex architecture.

### Needs More Data from Sleeper

| Feature | What It Would Do | What's Missing |
|---------|-----------------|----------------|
| Contracts Display | Show contract years, salary, tag status on every player | Contract data not in current JSON — needs Sleeper MCP or manual entry |
| Contract Cliff Chart | Stacked area showing when contracted talent expires per team | Contract data |
| Optimal Lineup / Points Left on Bench | Calculate best possible lineup each week vs what was started | Per-player weekly scoring (we only have team totals) |
| Player Journey / Trade Chains | Horizontal timeline: "Player X: Team A -> Team B -> Team C" with dates | Need trade-level player mapping (current trades show assets as strings) |
| Post-Game Recap Cards | Auto-generated narratives: "Team A survived despite Player X's quiet 9.2" | Per-player weekly scoring |
| Player Card Modal | Click any player for full bio, trade history, contract details | Enriched player data |

### Needs External APIs

| Feature | What It Would Do | What's Needed |
|---------|-----------------|---------------|
| Live Scoreboard Mode | Full-screen game-day view updating in real time | Sleeper API polling or websocket during games |
| Player News Integration | Injury reports, depth chart changes for rostered players | News API (Sleeper trending, ESPN, etc.) |
| Trade Impact Simulator | Drag-and-drop trade builder that recalculates rankings in real time | Complex state management + value model |
| Playoff Simulator (Monte Carlo) | Run 10K simulated seasons, output championship probabilities | Computational engine, only useful during season |

### Polish & Delight (Build When Foundation is Bulletproof)

| Feature | What It Would Do | Complexity |
|---------|-----------------|-----------|
| Dynasty Value Stock Market | Composite player value tracked over time, portfolio per team | Medium — needs a value formula + historical tracking |
| Roster Composition Radar Chart | Spider chart per team (QB/RB/WR/TE/Youth/Contract) | Medium — canvas work, data exists |
| Animated Season Standings Race | Bar chart race showing standings evolve week by week | Medium — D3 transitions or custom animation |
| Trade Network Force Graph | Force-directed graph: thicker lines = more trades between teams | Medium — D3.js |
| Scoring Violin Plots | Distribution shapes per team instead of simple sparklines | Medium — statistical visualization |
| This Week in League History | "On this week in 2023, Team X scored 206.72" | Low — just date matching |
| Achievements & Milestones | Badge system: Century Club, Iron Man, Draft Guru | Low — computed from existing data |
| Export & Share Screenshots | html2canvas to generate shareable images with watermark | Low-Medium |
| Number Counter Animations | Stat strip numbers animate up on page load | Low |
| Sound Design | Crowd roar on championships, sad trombone on toilet bowl | Low — absolute last |
| Commissioner Admin Panel | Password-protected page for data management | High — needs backend (Firebase/Supabase) |

---

## BY THE NUMBERS

| Metric | Count |
|--------|-------|
| Total tabs | 13 |
| Working features | 40+ |
| Render functions | 15 |
| Data sections used | 22 of 25 (88%) |
| Lines of code | ~1,830 |
| External dependencies | 0 (vanilla JS + HTML + CSS) |
| File count | 1 (index.html) |

---

*Last updated: 2026-03-27*
