# Phase 2: Narrative & Delight - Research

**Researched:** 2026-03-31
**Domain:** Canvas animation, CountUp.js, IntersectionObserver, achievement computation, narrative generation — all in a vanilla JS single-file app
**Confidence:** HIGH — grounded primarily in direct codebase analysis and verified CDN sources

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** "This Week in League History" is a hero-level callout card — prominent, above the fold, after the hero section and before tab navigation. Vintage-style treatment with faded background, bold stat, "On this week in 2023..." format. This is the weekly engagement hook.
- **D-02:** Achievements & Badges live in two places: (1) per-team badge case in GM Dashboard — when you view a team, you see their lifetime badges, and (2) a league-wide "Hall of Fame" view showing who has the most badges. These are LIFETIME achievements, separate from seasonal Awards.
- **D-03:** Animated Standings Race goes in the Standings section within Trophies. A "Play the Season" button above the final standings table — click to watch week-by-week positions animate. Team-colored bars, smooth easing.
- **D-04:** Power Moves Feed is NOT a transaction list — it's "The Season Story" narrative. Lives as its own section in Trophies — a timeline of pivotal moments auto-generated from biggest score swings, most impactful trades, and crucial waiver pickups. ESPN SportsCenter tone: dramatic, punchy one-liners.
- **D-05:** Standings Race uses custom canvas animation (NOT Chart.js — would look generic). Team-colored bars, position labels, smooth week-to-week transitions. Matches existing canvas pattern from consistency scatter.
- **D-06:** Counter animations use CountUp.js (CDN-loaded, lazy) triggered by IntersectionObserver — fire when stat strip scrolls into view, not on page load. 1.5s ease-out.
- **D-07:** Standings Race is user-triggered via play button — respects user control, no auto-play.
- **D-08:** History facts match by NFL week number — "This time last season in Week 8, Team X scored 206.72" creates temporal relevance.
- **D-09:** Achievement badges use gold-foil metallic style with team-color accents — broadcast trophy case aesthetic. Dark theme compatible. Think championship rings or HOF plaques.
- **D-10:** Power Moves narrative uses ESPN SportsCenter tone — "The trade that changed everything." "A waiver wire steal nobody saw coming." Dramatic, punchy.
- **D-11:** 8-10 core achievement categories for v1: Century Club (scored 200+), Iron Man (move every week), Dynasty Builder (highest youth % multi-season), Wheeler-Dealer (most trades), Ghost (fewest moves), Draft Guru (best draft hit rate), Point Machine (highest season total), Comeback King (worst start, best finish). Expand later.

### Claude's Discretion

- Exact canvas animation frame rate and easing curve for standings race
- CountUp.js CDN version and exact configuration
- History fact selection algorithm when multiple facts match the same week
- Power Moves narrative template structure (how many storylines per week)
- Badge icon SVG designs within the gold-foil style constraint

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NARR-01 | "This Week in League History" — surface a historically significant fact matching the current week | `hero-hist` DOM element already exists and is populated by `buildHistoryFacts()`. The upgrade replaces the rotating ticker with a week-matched single fact using `D.standings_2024`, `D.standings_2023`, and per-season weekly score data derivable from `getStandings()`. |
| NARR-02 | Achievements & Milestones badge system — auto-computed league-lifetime badges | `calcBadges()` exists as a current-season-only stub. Lifetime badge computation reads from `D.franchise`, `D.champions`, `D.activity`, `D.weekly_scores`, `D.moves`, `D.draft_hits`. Two insertion points: per-team in `renderGM()` (already has `.mgr-badges` section), and a new Hall of Fame section in `renderAwards()`. |
| NARR-03 | Animated Season Standings Race — week-by-week bar chart race showing standings evolve | Custom canvas required (D-05). Data source is per-season matchup data reconstructed from `D.standings_2024`, `D.standings_2023`, and `D.matchup_weeks`. A `computeWeeklyStandings(year)` helper must be built. Canvas pattern confirmed from `renderAnalytics()` scatter at line 4447. |
| NARR-04 | Season Narrative / Power Moves Feed — auto-generated text summaries of biggest weekly storylines | All source data in `D.matchup_weeks` (score swings, upsets), `D.unified_trades` (by week), and `D.moves` (waiver adds). Lives as a new section in `renderTrophies()`. Narrative templates hardcoded as string patterns. |
| NARR-05 | Number counter animations on stat strips (animate up on page load / tab switch) | `animateCounters()` already exists at line 5012 and is called on tab switch. The function reads `.count-up[data-target]` elements. The gap: it uses a hand-rolled rAF loop at 800ms without IntersectionObserver. Upgrade to CountUp.js + IntersectionObserver adds library accuracy, easing control, and scroll-triggered firing. |
</phase_requirements>

---

## Summary

This phase adds five broadcast-quality features to the existing single-file vanilla JS app. Critically, **all five features are purely computational** — no new data sources are required. Every fact, badge, animation frame, and narrative line derives from data already assembled in the global `D` object.

The biggest implementation challenge is the Standings Race (NARR-03): the current-season weekly standings must be reconstructed week-by-week from `D.matchup_weeks`, and historical seasons require a second helper that computes cumulative win totals from per-week matchup data (which `mergeHistoricalData` builds into `hsMatchupWeeks` locally but does not persist to `D`). The fix is a `computeWeeklyStandings(year)` helper added to the data pipeline or computed at render time.

NARR-05 (counter animations) is the most straightforward: `animateCounters()` already exists and the `.count-up[data-target]` pattern is already used throughout the app. The upgrade replaces the hand-rolled rAF loop with CountUp.js and adds IntersectionObserver so counters fire on scroll-into-view, not on tab activation.

**Primary recommendation:** Implement in dependency order — NARR-05 first (lowest risk, most visible), then NARR-01, NARR-02, NARR-04, then NARR-03 last (highest complexity due to data reconstruction).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Canvas 2D API | Browser-native | Standings Race animation frames | Already in use for consistency scatter (`renderAnalytics()` line 4447). No library adds anything to horizontal bar races. |
| IntersectionObserver | Browser-native | Trigger counter animations on scroll-into-view | Already in use for draft reveal (`renderDraft()` line 4090). Universal support. No library needed. |
| CountUp.js | 2.10.0 | Number counter animations | Verified on jsDelivr. UMD build exposes `window.countUp.CountUp`. 6.8KB. Handles easing, decimals, separators. Replaces hand-rolled rAF loop. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| html2canvas | 1.4.1 (already loaded) | Share card for History callout or Badge case | Only if share functionality is added to these views. |

**Installation (CDN lazy-load — do not add to `<head>`):**
```javascript
// Load CountUp.js only when first tab with stat strips activates
function loadCountUp(cb) {
  if (window.countUp) return cb();
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/countup.js@2.10.0/dist/countUp.umd.js';
  s.onload = cb;
  document.head.appendChild(s);
}
```

**Version verification (confirmed 2026-03-31):**
- `countup.js@2.10.0` — confirmed on jsDelivr. `window.countUp.CountUp` is the constructor.

---

## Architecture Patterns

### Recommended Project Structure (no change — single file)

All new code follows the existing layered structure:
```
index.html
├── <style>         — Add badge CSS, race canvas CSS, callout card CSS
├── <body>          — hero-hist div already exists; no structural HTML additions needed
└── <script>
    ├── Helpers     — Add computeWeeklyStandings(), computeLifetimeBadges(), buildPowerMoves()
    ├── Render fns  — Extend renderTrophies(), renderAwards(), renderGM()
    │                  Add animateStandingsRace() canvas function
    └── Init/utils  — Replace animateCounters() with CountUp.js version
                       Add global IntersectionObserver for scroll-triggered counters
```

### Pattern 1: Existing Counter Animation (animateCounters)

The existing implementation at line 5012 is a hand-rolled rAF loop:
```javascript
// Source: index.html line 5012
function animateCounters(scope){
  (scope||document).querySelectorAll('.count-up').forEach(function(el){
    var target=parseFloat(el.getAttribute('data-target'));
    var decimals=parseInt(el.getAttribute('data-decimals')||'0');
    var duration=800;
    // ...rAF loop with cubic-ease...
  });
}
```
Called at line 2711 (tab switch) and lines 2597/2636 (init). The upgrade replaces this with CountUp.js while preserving the `.count-up[data-target][data-decimals]` data attributes that already exist throughout the app.

### Pattern 2: CountUp.js + IntersectionObserver Replacement

```javascript
// Source: CountUp.js v2.10.0 UMD — window.countUp.CountUp
function animateCounters(scope) {
  if (!window.countUp) {
    loadCountUp(function(){ animateCounters(scope); });
    return;
  }
  (scope||document).querySelectorAll('.count-up').forEach(function(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0');
    var c = new countUp.CountUp(el, target, {
      duration: 1.5,
      decimalPlaces: decimals,
      useEasing: true,
      easingFn: function(t, b, c, d) { return c * (1 - Math.pow(1 - t/d, 3)) + b; }
    });
    c.start();
  });
}
```

For IntersectionObserver on stat strips (new behavior — fire once on scroll-into-view):
```javascript
// Source: IntersectionObserver MDN — browser-native
// Called after any render that produces .count-up elements
function setupScrollCounters(scope) {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        animateCounters(e.target.closest('[data-counter-scope]') || e.target.parentElement);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  (scope||document).querySelectorAll('.ss, .gm-stat-val, .count-up').forEach(function(el) {
    io.observe(el);
  });
}
```

Note: The stat strip (`.ss` elements) already contains `.count-up` children. Target the `.ss` parent for the observer so the whole strip fires together.

### Pattern 3: Canvas Standings Race Animation

The consistency scatter (line 4447) establishes the canvas pattern to follow:
```javascript
// Source: index.html line 4447 — renderAnalytics() canvas scatter
setTimeout(function() {
  var cvs = document.getElementById('scatter-chart');
  if (!cvs) return;
  var ctx = cvs.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w = cvs.offsetWidth || cvs.parentElement.offsetWidth || 900;
  var ht = cvs.offsetHeight || 300;
  cvs.width = w * dpr; cvs.height = ht * dpr;
  ctx.scale(dpr, dpr);
  // ...draw...
}, 200);
```

Standings race follows the same pattern but uses `requestAnimationFrame` for animation:

```javascript
// Source: Canvas 2D API — browser-native
function animateStandingsRace(canvasId, weeklyStandings) {
  var cvs = document.getElementById(canvasId);
  if (!cvs) return;
  var ctx = cvs.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w = cvs.offsetWidth || 600;
  var ht = Math.max(300, D.teams.length * 40 + 60);
  cvs.width = w * dpr; cvs.height = ht * dpr;
  ctx.scale(dpr, dpr);

  var currentWeek = 0;
  var frame = 0;
  var FRAMES_PER_WEEK = 20; // ~333ms at 60fps per week transition
  var rafId = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function drawFrame() {
    var wkIdx = Math.floor(frame / FRAMES_PER_WEEK);
    var t = easeOut((frame % FRAMES_PER_WEEK) / FRAMES_PER_WEEK);
    if (wkIdx >= weeklyStandings.length) { cancelAnimationFrame(rafId); return; }

    var fromStandings = wkIdx > 0 ? weeklyStandings[wkIdx - 1] : weeklyStandings[0];
    var toStandings = weeklyStandings[wkIdx];

    ctx.clearRect(0, 0, w, ht);
    // Draw team bars — interpolate bar widths and positions
    toStandings.forEach(function(team, i) {
      var tc = TC[team.roster_id] || { p: '#cc0000' };
      var barW = (team.wins / Math.max(...toStandings.map(x => x.wins)) || 1) * (w - 160);
      ctx.fillStyle = tc.p;
      ctx.fillRect(120, i * 36 + 8, barW * t, 24);
      // Team label
      ctx.fillStyle = '#e8e8f0';
      ctx.font = '700 11px Oswald';
      ctx.textAlign = 'right';
      ctx.fillText(team.team_name.substring(0, 14), 116, i * 36 + 24);
      // Win total
      ctx.fillStyle = tc.p;
      ctx.font = '700 12px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(team.wins + '-' + team.losses, 126 + barW * t, i * 36 + 24);
    });
    // Week label
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.font = '700 14px Oswald';
    ctx.textAlign = 'right';
    ctx.fillText('WK ' + (wkIdx + 1), w - 8, ht - 8);

    frame++;
    rafId = requestAnimationFrame(drawFrame);
  }

  rafId = requestAnimationFrame(drawFrame);
  return function() { if (rafId) cancelAnimationFrame(rafId); }; // cancel fn for cleanup
}
```

**Critical detail:** `TC` is a global object keyed by `roster_id` with `{p: '#hex', s: '#hex', i: 'ABBR'}`. Use `TC[team.roster_id].p` for the primary team color.

### Pattern 4: computeWeeklyStandings — Data Gap Resolution

The standings race requires cumulative week-by-week standings. The current season's `D.matchup_weeks` is already keyed by week number. For historical seasons, `mergeHistoricalData` builds `hsMatchupWeeks` locally but **does not persist it to `D`**. Two options:

**Option A (simpler, no pipeline change):** For each historical season, re-compute standings from `D.standings_YYYY` (final) and work backwards — but this loses the week-by-week progression needed for the race.

**Option B (correct, pipeline addition):** Store historical weekly scores per season during `mergeHistoricalData`:
```javascript
// Add to mergeHistoricalData after building hsMatchupWeeks:
d['matchup_weeks_' + season] = hsMatchupWeeks;
d['weekly_scores_' + season] = hsWeeklyScores;
```
Then `computeWeeklyStandings(year)` reads from `D['matchup_weeks_' + year]` and reconstructs cumulative standings week by week.

**Recommendation: Option B.** The planner should include a Wave 0 task that adds these two lines to `mergeHistoricalData`. Without them, the standings race can only show the current season.

```javascript
function computeWeeklyStandings(year) {
  var mwKey = year === CURRENT_YEAR ? 'matchup_weeks' : 'matchup_weeks_' + year;
  var mw = D[mwKey] || {};
  var weeks = Object.keys(mw).map(Number).sort(function(a,b){return a-b;});
  var cumulative = {}; // roster_id -> {wins, losses, fpts}
  var snapshot = [];
  weeks.forEach(function(wk) {
    (mw[wk] || []).forEach(function(g) {
      var a = g.team_a.roster_id, b = g.team_b.roster_id;
      if (!cumulative[a]) cumulative[a] = {roster_id:a,wins:0,losses:0,fpts:0};
      if (!cumulative[b]) cumulative[b] = {roster_id:b,wins:0,losses:0,fpts:0};
      cumulative[a].fpts += g.team_a.points;
      cumulative[b].fpts += g.team_b.points;
      if (g.winner.roster_id === a) { cumulative[a].wins++; cumulative[b].losses++; }
      else { cumulative[b].wins++; cumulative[a].losses++; }
    });
    snapshot.push(Object.values(cumulative).map(function(x){return Object.assign({},x);})
      .sort(function(a,b){return b.wins-a.wins||b.fpts-a.fpts;}));
  });
  return snapshot; // array of week snapshots, each is sorted standings array
}
```

### Pattern 5: Lifetime Badges (computeLifetimeBadges)

Current `calcBadges()` (line 2988) is current-season-only and lives in renderRosters. The lifetime version needs to cross-reference `D.franchise`, `D.champions`, `D.activity`, `D.weekly_scores`, and `D.moves`. Build as a new helper:

```javascript
// Lifetime badges — reads from D directly, no parameters
function computeLifetimeBadges(rosterIdOrTeamName) {
  // Resolve team
  var rid = typeof rosterIdOrTeamName === 'number' ? rosterIdOrTeamName : null;
  var teamName = typeof rosterIdOrTeamName === 'string' ? rosterIdOrTeamName : D.rid_to_name[rid];
  if (!teamName) return [];
  var badges = [];

  // Century Club — scored 200+ in a single week (any season)
  var wk = D.weekly_scores[rid] || [];
  if (wk.some(function(p){return p>=200;})) badges.push({id:'century', label:'Century Club', icon:'fire', desc:'Scored 200+ in a single week'});

  // Champion
  if (D.champions.some(function(c){return c.champion===teamName;})) badges.push({id:'champion', label:'Dynasty Champ', icon:'trophy', desc:'Won the championship'});

  // Wheeler-Dealer — 5+ trades lifetime
  var act = D.activity[teamName] || {};
  if ((act.trades||0) >= 5) badges.push({id:'dealer', label:'Wheeler-Dealer', icon:'trade', desc:'5+ trades lifetime'});

  // Ghost — fewest moves (bottom 2 in activity)
  var allAct = Object.values(D.activity).map(function(a){return a.trades+a.moves;}).sort(function(a,b){return a-b;});
  if ((act.trades||0)+(act.moves||0) <= allAct[1]) badges.push({id:'ghost', label:'The Ghost', icon:'ghost', desc:'Fewest lifetime moves'});

  // Point Machine — highest season total in any year
  var franchise = (D.franchise||[]).find(function(f){return f.name===teamName;});
  if (franchise) {
    var maxPts = Math.max.apply(null,(D.franchise||[]).map(function(f){return f.total_pts;}));
    if (franchise.total_pts >= maxPts * 0.95) badges.push({id:'machine', label:'Point Machine', icon:'bolt', desc:'All-time points leader'});
  }

  // Dynasty Builder — youngest avg age in 2+ seasons
  var youngSeasons = SEASON_YEARS.filter(function(yr) {
    var st = getStandings(yr);
    // Would need age data per season — current limit: only current season has age
  });
  // NOTE: Dynasty Builder multi-season requires per-season age data not stored in D.
  // For v1, compute only from current season avg age.
  var team = D.teams.find(function(t){return t.team_name===teamName;});
  if (team) {
    var ages = team.players.filter(function(p){return p.age&&p.pos!=='DEF';}).map(function(p){return p.age;});
    var avg = ages.length ? ages.reduce(function(a,b){return a+b;},0)/ages.length : 28;
    if (avg <= 24.5) badges.push({id:'builder', label:'Dynasty Builder', icon:'seedling', desc:'Youngest roster in the league'});
  }

  // Draft Guru — most draft picks that became starters
  var hits = D.draft_hits ? Object.values(D.draft_hits).flat().filter(function(h){return h.status==='starter'&&D.rid_to_name[rid]===teamName;}) : [];
  // NOTE: draft_hits keys off roster_id at current season, not team name — cross-ref needed
  if (hits.length >= 3) badges.push({id:'guru', label:'Draft Guru', icon:'draft', desc: hits.length + ' draft picks became starters'});

  // Comeback King — worst-to-first in a season (requires week-by-week standings)
  // Deferred: needs computeWeeklyStandings data

  return badges;
}
```

**Key limitation:** `D.weekly_scores` stores current-season scores only. Scoring 200+ in a historical season requires `D['weekly_scores_2024']` etc. — which only exists if the pipeline addition (Option B above) is implemented. For v1, Century Club badge is current-season-only unless the pipeline is extended.

### Pattern 6: Power Moves Narrative Generation

```javascript
function buildPowerMoves(year) {
  var mwKey = year === CURRENT_YEAR ? 'matchup_weeks' : 'matchup_weeks_' + year;
  var mw = D[mwKey] || {};
  var weeks = Object.keys(mw).map(Number).sort(function(a,b){return a-b;});
  var stories = [];

  weeks.forEach(function(wk) {
    var games = mw[wk] || [];
    if (!games.length) return;

    // Biggest upset: lowest-wins team beats highest-wins team
    var prevSt = /* standings before this week */ null; // requires computeWeeklyStandings
    // For v1: define upset as winner with fewer total points scored than loser overall
    var avgPts = games.reduce(function(s,g){return s+g.team_a.points+g.team_b.points;},0)/(games.length*2);
    var bigGame = games.slice().sort(function(a,b){return Math.max(b.team_a.points,b.team_b.points)-Math.max(a.team_a.points,a.team_b.points);})[0];
    var highScore = Math.max(bigGame.team_a.points, bigGame.team_b.points);
    var highTeam = highScore===bigGame.team_a.points ? bigGame.team_a.name : bigGame.team_b.name;

    // Score above 180 = notable
    if (highScore >= 180) {
      stories.push({wk, type:'explosion', headline: highTeam + ' dropped ' + highScore + ' in Week ' + wk + '. Nobody saw it coming.', pts: highScore});
    }

    // Closest game
    var closest = games.slice().sort(function(a,b){return a.diff-b.diff;})[0];
    if (closest.diff <= 2) {
      stories.push({wk, type:'heartbreak', headline: 'Week ' + wk + ': ' + closest.loser.name + ' lost by ' + closest.diff.toFixed(2) + '. That\'s a bad beat.'});
    }

    // Trades that week
    var weekTrades = (D.unified_trades||[]).filter(function(t){return t.wk===wk&&(t.yr===year||t.s===year);});
    weekTrades.forEach(function(tr) {
      var sideA = tr.sides[0], sideB = tr.sides[1];
      if (sideA && sideB && (sideA.players.length + sideB.players.length) >= 3) {
        stories.push({wk, type:'trade', headline: 'Week ' + wk + ': ' + esc(sideA.name) + ' and ' + esc(sideB.name) + ' struck a deal. The jury is still out.'});
      }
    });
  });

  // Sort by week, cap at 3 stories per week, take top 15
  return stories.slice(0, 15);
}
```

**Tone templates (hardcoded strings — Claude's discretion):**
- Explosion: `"[TEAM] dropped [N] in Week [W]. Nobody saw it coming."`
- Heartbreak: `"Week [W]: [TEAM] lost by [N]. That's a bad beat."`
- Trade: `"Week [W]: [TEAM] and [TEAM] struck a deal. The jury is still out."`
- Upset: `"The giant-slayer. Week [W]: [UNDERDOG] took down [FAVORITE]."`
- High week: `"The week the league woke up. [N] total points scored in Week [W]."`

### Pattern 7: History Fact Week-Matching

The current `buildHistoryFacts()` at line 2769 uses a rotating ticker. For NARR-01, compute the current NFL week and match against historical data:

```javascript
function getCurrentNFLWeek() {
  // NFL regular season weeks: kickoff + N*7 days
  // CFG.nflKickoff is '2026-09-10' — this is next season's date
  // For matching history, use the calendar week offset from Sept kickoff of each past season
  var now = new Date();
  // Past seasons: 2023 kickoff ~Sep 7, 2024 kickoff ~Sep 5
  // Approximate: use week-of-year offset from first Thursday of September
  var month = now.getMonth(); // 0-indexed
  var day = now.getDate();
  // NFL week 1 = first full week of September
  // If offseason (Jan-Aug), use "equivalent week" from last season
  var seasonStart = new Date(now.getFullYear(), 8, 1); // Sep 1
  // Find first Thursday
  var dow = seasonStart.getDay();
  var daysToThur = (4 - dow + 7) % 7;
  var kickoff = new Date(seasonStart.getFullYear(), 8, 1 + daysToThur);
  var diffMs = now - kickoff;
  if (diffMs < 0) {
    // Before this year's kickoff — use last season's equivalent week
    kickoff = new Date(seasonStart.getFullYear() - 1, 8, 1 + daysToThur);
    diffMs = now - kickoff;
  }
  return Math.max(1, Math.min(18, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1));
}
```

Match logic: for each historical season, find the game(s) played in that same week number. Pick the fact with the highest statistical significance (highest score, biggest blowout, most lopsided trade).

### Pattern 8: Badge SVG Gold-Foil Style

Achievement badges use the gold-foil metallic gradient already established in `trophySvg()` (line 3067). Replicate that gradient approach:

```javascript
// Gold-foil badge shell — inline SVG, matches trophySvg() gradient palette
function badgeSvg(iconName, teamColor) {
  var tc = teamColor || '#cc0000';
  var gradId = 'bg-' + Math.random().toString(36).substr(2,5);
  return '<svg width="48" height="48" viewBox="0 0 48 48">'
    + '<defs>'
    + '<radialGradient id="' + gradId + '" cx="35%" cy="30%">'
    + '<stop offset="0%" stop-color="#f5e070"/>'
    + '<stop offset="40%" stop-color="#d4a843"/>'
    + '<stop offset="100%" stop-color="#8a6420"/>'
    + '</radialGradient>'
    + '</defs>'
    + '<circle cx="24" cy="24" r="22" fill="url(#' + gradId + ')" stroke="' + tc + '" stroke-width="2" stroke-opacity=".4"/>'
    + '<circle cx="24" cy="24" r="19" fill="none" stroke="#e8c65a" stroke-width=".5" stroke-opacity=".3"/>'
    + icon(iconName, 20, '#2a1a00') // dark icon on gold
    + '</svg>';
}
```

The badge card structure matches the existing `mgr-badge` pattern but with larger SVG, team-color border, and a gold background.

### Anti-Patterns to Avoid

- **Inserting canvas into innerHTML:** Do not put a `<canvas>` tag in a re-renderable HTML string and then try to draw to it immediately. Always use `setTimeout(..., 50)` or `requestAnimationFrame` after innerHTML assignment, just like `renderAnalytics()` does at line 4447.
- **RAF loop not cancelled:** Store the `cancelAnimationFrame` return and call it before re-render, or the race animation will run invisibly in the background after tab switch.
- **History fact on cold data:** `buildHistoryFacts()` runs in `init()` after `buildCurrentSeasonData()` but before `mergeHistoricalData()` completes. Week-matched facts require historical season data. Wrap in a guard: `if (!D['matchup_weeks_2024']) fall back to ticker format`.
- **`animateCounters` called before CountUp.js loaded:** Check `window.countUp` before calling. The existing callsites at lines 2597, 2636, and 2711 all need the lazy-load guard.
- **Infinite IntersectionObserver fire:** Call `io.unobserve(e.target)` immediately after the element intersects. Already shown in `draftObserver` at line 4091.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number counter easing with decimals | Custom rAF loop (already exists but limited) | CountUp.js 2.10.0 | Handles edge cases: NaN targets, rapid re-fires, decimal formatting, separator locale. The existing hand-rolled version at line 5012 has no protection against `target=NaN`. |
| Scroll-triggered reveal | Scroll event listener with `scrollTop` math | IntersectionObserver | Already used correctly in `renderDraft()`. Off-main-thread, accurate threshold, no jank. |
| Canvas DPR scaling | Ignoring devicePixelRatio | The established `cvs.width = w * dpr; cvs.height = ht * dpr; ctx.scale(dpr,dpr)` pattern | Retina displays will look blurry without this. The pattern is already in `renderAnalytics()`. |

**Key insight:** The app already has correct patterns for every problem this phase introduces. The work is applying known patterns to new surfaces, not inventing new approaches.

---

## Common Pitfalls

### Pitfall 1: Historical Per-Season Weekly Scores Not in D

**What goes wrong:** `computeWeeklyStandings('2024')` returns empty snapshots. The standings race shows nothing for past years.

**Why it happens:** `mergeHistoricalData()` builds `hsMatchupWeeks` and `hsWeeklyScores` as local variables inside a `forEach` block. They are NOT stored on `d`. Only `d['standings_2024']`, the final standings, survive.

**How to avoid:** Add two lines inside the historical season `forEach` in `mergeHistoricalData()`:
```javascript
d['matchup_weeks_' + season] = hsMatchupWeeks;
d['weekly_scores_' + season] = hsWeeklyScores;
```
These are needed for NARR-03 (standings race per historical season) and NARR-02 (Century Club badge for past seasons).

**Warning signs:** `D.matchup_weeks_2024` is `undefined` when accessed in render function.

### Pitfall 2: Canvas Element Drawn Before Layout Is Complete

**What goes wrong:** `cvs.offsetWidth` returns 0, canvas renders as a narrow sliver.

**Why it happens:** `innerHTML` sets the DOM but the browser hasn't laid out the new canvas yet when the JavaScript immediately reads dimensions.

**How to avoid:** Wrap canvas draw calls in `setTimeout(..., 50)` or `requestAnimationFrame`, exactly as `renderAnalytics()` does at line 4447. Never draw to canvas synchronously after `innerHTML` assignment.

**Warning signs:** Canvas is 1px wide, team bars invisible.

### Pitfall 3: CountUp.js Race Condition on Tab Switch

**What goes wrong:** User switches tabs before CountUp.js has loaded. Counters show "0" or NaN.

**Why it happens:** The lazy-load call is async. If `animateCounters()` is called at line 2711 (tab switch) before the CDN script has finished loading, `window.countUp` is undefined.

**How to avoid:** In the upgraded `animateCounters()`, check `if (!window.countUp) { loadCountUp(function(){animateCounters(scope);}); return; }` before accessing the constructor. The existing fallback behavior (showing "0") is acceptable if the script hasn't loaded yet.

### Pitfall 4: IntersectionObserver Fires on Hidden Elements

**What goes wrong:** All `.count-up` elements "intersect" immediately on init because their parent tab panel is `display:none`.

**Why it happens:** IntersectionObserver uses the viewport, not parent visibility. Elements in inactive tabs may technically not intersect (correct), but elements in the initially visible tab will all fire at once on setup.

**How to avoid:** For the stat strip (`.ss` elements in the hero/header area), call `animateCounters()` directly on tab activation (already done at line 2711). Use IntersectionObserver only for elements deeper in tab content that the user must scroll to reach. The existing `animateCounters(tp)` call in `showTab()` already handles the scroll-free case.

### Pitfall 5: Standings Race RAF Loop Persists After Re-render

**What goes wrong:** User plays the race, switches tabs, comes back — two races animate simultaneously. Console shows duplicate draws.

**Why it happens:** `renderTrophies()` overwrites `innerHTML` but the existing `requestAnimationFrame` loop from the previous render keeps drawing to a detached (garbage-collected) canvas, or worse, the new canvas element has the same ID and both loops try to draw to it.

**How to avoid:** Store the cancel function in a module-scope variable:
```javascript
var _raceCancel = null;
// Before starting race:
if (_raceCancel) _raceCancel();
_raceCancel = animateStandingsRace('standings-race-canvas', snapshots);
// Before re-render of trophies tab:
// Call _raceCancel() if set
```

---

## Code Examples

Verified patterns from existing codebase:

### Existing IntersectionObserver in renderDraft()
```javascript
// Source: index.html line 4090
var draftObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      draftObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.draft-round').forEach(function(round) {
  draftObserver.observe(round);
});
```

### Canvas DPR Pattern from renderAnalytics()
```javascript
// Source: index.html line 4447
setTimeout(function() {
  var cvs = document.getElementById('scatter-chart');
  if (!cvs) return;
  var ctx = cvs.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var w = cvs.offsetWidth || cvs.parentElement.offsetWidth || 900;
  var ht = cvs.offsetHeight || 300;
  cvs.width = w * dpr; cvs.height = ht * dpr;
  ctx.scale(dpr, dpr);
  // ... drawing ...
}, 200);
```

### Existing countUp data-attribute contract
```javascript
// Source: index.html line 4640 — used throughout renderGM(), renderTrophies(), etc.
h += '<span class="count-up" data-target="' + avg + '" data-decimals="1">0</span>';
// animateCounters() reads: el.getAttribute('data-target'), el.getAttribute('data-decimals')
// CountUp.js replacement must honor this exact attribute contract.
```

### Existing calcBadges() pattern to extend
```javascript
// Source: index.html line 2988
function calcBadges(teamName) {
  var badges = [];
  var act = D.activity[teamName];
  if (act && act.trades >= 5) badges.push({label:'Wheeler-Dealer', bg:'rgba(204,0,0,.12)', color:'var(--a)'});
  // ...
  return badges;  // array of {label, bg, color}
}
// Usage in renderRosters() and renderGM():
calcBadges(t.team_name).forEach(function(b) {
  h += '<span class="mgr-badge" style="background:'+b.bg+';color:'+b.color+';border:1px solid '+b.color+'44">'+b.label+'</span>';
});
```

### TC Object (team colors)
```javascript
// Source: index.html — TC is a global object keyed by roster_id
// TC[1] = { p: '#cc0000', s: '#ffffff', i: 'HD' }
// p = primary color, s = secondary color, i = 2-3 char abbreviation
var teamColor = TC[roster_id] ? TC[roster_id].p : '#cc0000';
```

### D.unified_trades Structure
```javascript
// Source: index.html line 2335 — built in mergeHistoricalData
// D.unified_trades[i] = {
//   yr: '2024',       // season year string
//   wk: 7,            // NFL week number
//   s: '2024',        // season (alias of yr)
//   txn_id: 'abc123',
//   sides: [
//     { rid: 3, name: 'Team Name', team: 'Team Name',
//       players: [{id:'12345', nm:'Patrick Mahomes'}],
//       picks: ['2025 Rd1 (Team X)'],
//       assets: ['Patrick Mahomes', '2025 Rd1 (Team X)']
//     },
//     { ... other side ... }
//   ]
// }
```

---

## Data Sources Available for Each Feature

### NARR-01: This Week in League History

| Data | Source | Notes |
|------|--------|-------|
| Current NFL week | Computed from `CFG.nflKickoff` and `new Date()` | NFLKickoff is next season's date. Must compute previous season's kickoff by subtracting ~1 year. |
| Historical weekly matchups | `D.matchup_weeks` (current season), `D['matchup_weeks_2024']` etc. (historical, requires pipeline addition) | Current season data is always present. Historical requires the pipeline fix. |
| Historical standings | `getStandings('2024')`, `getStandings('2023')` | Available after `mergeHistoricalData` completes. |

### NARR-02: Achievements & Badges

| Badge | Data Source | Computation |
|-------|-------------|-------------|
| Century Club (200+ in one week) | `D.weekly_scores[roster_id]` — current season only | `wk.some(p => p >= 200)` |
| Champion | `D.champions.some(c => c.champion === teamName)` | Direct lookup |
| Wheeler-Dealer | `D.activity[teamName].trades` | `>= 5` threshold |
| Ghost | `D.activity[teamName]` all values summed | Bottom 2 in league |
| Point Machine | `D.franchise.find(f => f.name === teamName).total_pts` | League maximum |
| Dynasty Builder | `D.teams.find(t => t.team_name === teamName).players` avg age | `<= 24.5` |
| Draft Guru | `D.draft_hits` | Count `status === 'starter'` per team |
| Comeback King | Week-by-week standings | Requires `computeWeeklyStandings()` |
| Iron Man | `D.moves` per week per team | Every week of each season must have a move |

**Scope note:** `Iron Man` (moved every week) requires checking `D.moves` grouped by week for each season. This is cross-seasonal and requires the moves data from `mergeHistoricalData`, which IS persisted to `D.moves` (line 2149). Iron Man is achievable with existing data.

### NARR-03: Standings Race

| Data | Source | Notes |
|------|--------|-------|
| Current-season weekly snapshots | Computable from `D.matchup_weeks` | Available immediately |
| Historical weekly snapshots | `D['matchup_weeks_2024']` | Requires pipeline addition |
| Team colors per bar | `TC[roster_id].p` | Global object |
| Team abbreviations | `TC[roster_id].i` | 2-3 char abbr |

**Year selector for the race:** User picks 2023, 2024, or 2025. For current season, standings are live (may show partial season if mid-season). For historical, shows full season from week 1 to final.

### NARR-04: Power Moves Feed

| Data | Source | Notes |
|------|--------|-------|
| Weekly high scores | `D.matchup_weeks[wk]` — sort by `max(team_a.points, team_b.points)` | Current season |
| Blowouts/close games | `D.matchup_weeks[wk]` — sort by `diff` ascending/descending | Current season |
| Trades by week | `D.unified_trades.filter(t => t.wk === wk)` | All seasons in unified_trades |
| Waiver adds | `D.moves.filter(m => m.wk === wk && m.tp === 'waiver')` | All seasons |

### NARR-05: Counter Animations

| Data | Source | Notes |
|------|--------|-------|
| Counter elements | `.count-up[data-target][data-decimals]` across all tabs | Already in renderGM, renderTrophies, renderMatchups, renderAnalytics, renderPower |
| Stat strip | `#sstrip` — populated by `buildStats()` at line 2791 | Contains `.ss > .ss-v > .count-up` elements |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain number display | `.count-up` rAF loop | Already shipped | Upgrade to CountUp.js improves easing, NaN safety |
| Static history ticker | Rotating `setInterval` facts | Already shipped | Upgrade to week-matched single strong fact |
| Badge stubs (calcBadges) | Current-season-only badges | Already shipped | Upgrade to lifetime cross-season computation |

---

## Open Questions

1. **Historical season per-week data for standings race**
   - What we know: `mergeHistoricalData` builds `hsMatchupWeeks` locally. It's not stored in `D`.
   - What's unclear: Whether the pipeline addition adds meaningful memory pressure to localStorage cache. Each season's weekly matchup data is small (~14 weeks × 6 games × ~100 bytes = ~8KB per season).
   - Recommendation: Add the two lines. 8KB is trivial. Without this, the standings race is current-season-only, which is a weak v1.

2. **NFL week computation accuracy**
   - What we know: `CFG.nflKickoff` is the 2026 kickoff date. Computing "equivalent week" for past seasons requires knowing each season's kickoff date, which varies by year.
   - What's unclear: How precise the week-matching needs to be. "This week in 2023" could mean ±1 week and still feel accurate.
   - Recommendation: Use a lookup table of past kickoff dates for 2023 and 2024 (Sep 7, 2023 and Sep 5, 2024) hardcoded alongside `CFG.nflKickoff`. Week-matching with ±1 tolerance is acceptable.

3. **Century Club badge requires per-week scores for historical seasons**
   - What we know: `D.weekly_scores` contains current-season scores only. `D['weekly_scores_2024']` requires the pipeline addition.
   - What's unclear: Whether tracking a badge across all historical seasons is worth the complexity for v1.
   - Recommendation: For v1, Century Club is current-season-only. Add a footnote in the badge description: "2025 season." Full historical version activates automatically once the pipeline stores per-season weekly scores.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is entirely code changes within a single static HTML file. No external tools, services, runtimes, CLI utilities, or databases beyond what the app already fetches are required. CountUp.js loads via CDN at runtime in the browser.

---

## Validation Architecture

> `workflow.nyquist_validation` not explicitly set to false in `.planning/config.json` — treating as enabled.

This project has no test framework configured (no pytest.ini, jest.config, or test/ directory). The validation strategy is visual + behavioral verification in-browser.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — visual verification via browser DevTools |
| Config file | None |
| Quick run command | Open `index.html` in browser, navigate to tab |
| Full suite command | Full walkthrough of all 5 feature surfaces |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NARR-01 | History callout shows week-matched fact (not rotating ticker) | manual | Open app, check hero section shows "Week N" fact | N/A |
| NARR-02 | Badge case visible in GM Dashboard + Hall of Fame in Awards | manual | Navigate to GM tab, select any team, verify badge case section | N/A |
| NARR-03 | Play button appears above standings in Trophies; clicking animates race | manual | Navigate to Trophies, click Play, verify animation runs | N/A |
| NARR-04 | Power Moves section visible in Trophies with 5+ story items | manual | Navigate to Trophies, scroll to Season Story section | N/A |
| NARR-05 | Stat strip numbers animate up on page load and tab switch | manual | Load app, observe hero stat strip; switch tabs, verify GM counters animate | N/A |

### Sampling Rate
- **Per task commit:** Open `index.html` in browser, navigate to the affected tab, verify no console errors
- **Per wave merge:** Full walkthrough — hero, Trophies, Awards, GM Dashboard, tab-switch counter behavior
- **Phase gate:** All 5 features visually verified before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test infrastructure to create — this project uses manual visual verification only
- [ ] Pre-implementation check: confirm `D.matchup_weeks` populates after historical load by adding temporary `console.info` log

*(No automated test infrastructure needed — project convention is visual-verify per CLAUDE.md)*

---

## Sources

### Primary (HIGH confidence)
- Direct analysis of `index.html` (2026-03-31, lines 2769, 2988, 4090, 4447, 5012, 2711) — all patterns verified in codebase
- CountUp.js UMD file at `https://cdn.jsdelivr.net/npm/countup.js@2.10.0/dist/countUp.umd.js` — confirmed `window.countUp` global, 2026-03-31
- `.planning/codebase/ARCHITECTURE.md` — D object structure, render patterns, canvas usage
- `.planning/codebase/CONVENTIONS.md` — naming, string building, event patterns
- `.planning/codebase/STACK.md` — CDN load strategy, existing dependencies

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` — CountUp.js CDN URL and version verified, IntersectionObserver patterns
- `.planning/research/ARCHITECTURE.md` — dirty-tab system, render state preservation patterns

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — CountUp.js CDN verified live; Canvas and IntersectionObserver are browser-native
- Architecture: HIGH — all patterns read directly from index.html source
- Pitfalls: HIGH — derived from direct inspection of data flow in mergeHistoricalData (lines 2087-2113), re-render safety rules in CLAUDE.md, and existing canvas pattern at line 4447
- Data structures: HIGH — D object shape confirmed from buildCurrentSeasonData and mergeHistoricalData source

**Research date:** 2026-03-31
**Valid until:** 2026-06-30 (stable codebase — single static file, no external API changes for this feature set)
