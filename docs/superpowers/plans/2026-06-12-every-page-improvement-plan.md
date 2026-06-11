# Every-Page Improvement Plan

**Date:** 2026-06-12 · **Status:** Proposed
**Evidence:** full-page screenshots of all 18 tabs (desktop + mobile, offseason + midseason states) captured with the mock-API harness — `dev/audit/screens/`. Re-generate with `node dev/audit/capture.js` (see `dev/audit/README.md`).

## The headline finding

**The app is built for September–December, but the league lives in it year-round.** In-season views (Power tiers/gauges, Matchups scorecards, race chart) are genuinely strong. But in the offseason state — what every manager sees *today* — the default landing tab shows `NaN`, four tabs are walls of zeros or empty skeletons, and one tab is permanently blank due to a re-render bug. Priority one is making the offseason experience first-class; priority two is fixing the pages that are "data in styled containers"; priority three is editorial polish on the already-good pages.

---

## P0 — Broken experiences, visible on the live site right now

1. **Power (default landing tab): `NaN` power scores, empty race chart, no tiers.** With 0 games played the composite divides by zero. Every card shows `NaN` in red; the Power Race canvas draws zero-width bars (an empty black panel). Fix: an explicit **Offseason Power Index** (last season's record + roster KTC + age profile + draft capital — weights already exist conceptually) with its own methodology pills, plus a `den(x)||1` guard so NaN can never render. The narrative block already says "OFFSEASON POWER INDEX" in one card — the math just doesn't follow.
2. **Stale-after-history-merge tabs.** `showTab()` re-renders only tabs in `dirtyTabs`; `loadHistory()` marks just 8 of 18 dirty (`trophies, rivals, pulse, chronicle, power, analytics, trades, draft`). **Moves, GM, Awards, Scoring** (and arguably Rosters via acquisition tags) render once against pre-merge empty data and never refresh. Concrete symptom: Moves shows "No moves data" forever while `D.moves` holds 300+ transactions. Fix: add the missing tabs to the dirty set (cheap, correct — re-render is destructive-safe by design).
3. **Analytics offseason NaNs.** All-Play table prints `NaN` in AP%, Pythagorean shows zeros, Consistency scatter is an empty canvas. Fix: season selector (like Trades/Draft already have) defaulting to the last completed season; H2H matrix is already all-time and fine.
4. **Scoring offseason: heat map renders an empty strip; all 12 sparkline cards show `0` totals and blank sparklines.** Same fix: season selector defaulting to last completed season.
5. **Age Map scatter is an empty quadrant chart** (Y axis = power score = NaN offseason). Fix follows from #1; also guard the scale math when all points are identical.
6. **Awards computed from the 0-0 current season** (MVP awarded on zeros). Fix: compute from last completed season, label the season, and add career-scope awards (most titles, all-time points) so the page has a permanent spine.
7. **GM dashboard: 0-0 records, 0.0 PPG, `--`/`NaN` chips on all 12 manager cards.** The overview should lead with **career** numbers (franchise W-L, titles, all-time PPG, trade count — all already in `D`) with the current season as a secondary line.
8. **War Room: "Exemption Deadline 0 DAYS AWAY · URGENT"** — the May 26 deadline has passed; needs a PASSED/COMPLETE state and the next real milestone promoted.
9. **Constitution Article X** says "Three seasons of Sleeper dynasty glory" — hardcoded, now wrong (five+). Derive from `D.champions.length`.
10. **CLAUDE.md correction:** html2canvas loads from **cdn.jsdelivr.net**, not cdnjs. Also document `let D` ≠ `window.D` (bit the harness; will bite any future probe/devtools work).

## P1 — Pages that are walls (design problems, not bugs)

11. **Rivals: 66 near-identical bar cards** — every possible pairing, ~10 screens of red bars. Redesign: a **Rivalry Week marquee** — top 6–8 rivalries as broadcast tale-of-the-tape cards (avatars facing off, series bar, streak, last meeting, biggest blowout), then "all series" as a compact collapsible matrix-style index. The other 58 pairings are lookup data, not content.
12. **Pulse: unbounded monotone feed** — dozens of identical draft-hit text cards drown the championships. Cap and curate: one featured card per type (magazine lede treatment with imagery), max ~20 items, group repetitive draft hits into a single "draft class" card per year.
13. **Chronicle: hundreds of tiny identical event cards** (every trade becomes an event) — the horizontal timeline collapses into a grid wall. Curate to milestones (titles, records, era markers, top-5 trades by value swing per year), make year sections feel like chapters — big year numerals, champion banner color, one featured story each.
14. **Rosters: collapsed state is 12 identical low-density bars.** The closed card should *be* the franchise card: starter face strip, contract-years heat strip, total KTC, age badge, activity badges — visible without expanding. Expanded view is already good.
15. **War Room: three stacked 12-row checklists.** Reframe as a command center: deadline countdown as the dominant hero module, then a 12-team grid of small status cards (exemption dot + expiring count + net picks in one card per team) instead of three separate full-width lists.
16. **The Rafters: exceptional banner scene, then ~8 screens of flat tables** (per-season standings lists, plain franchise table, legacy CBS table). Keep banners + records + franchise rankings; collapse per-season standings/brackets behind year accordions styled like the rest of the scene (they're also duplicated conceptually by Chronicle).

## P2 — Editorial polish on already-good pages

17. **Trades** (best page): unify grade pill / value-bar styling, lazy-render beyond ~24 cards (year filter already helps), surface "biggest heist of the year" as a featured card above the grid.
18. **Draft**: strong board; fix reveal animation so off-viewport rounds aren't blank when scrolled fast (IntersectionObserver + full-page capture showed pre-reveal gaps); Memory Lane steal/bust cards deserve hero treatment (player image + story line).
19. **Contracts**: ten stacked modules of equal visual weight → add an in-tab sub-nav (Overview / Exemptions / Cliff / Value) or promote 3 modules and collapse the rest; it's the densest page in the app.
20. **Matchups (in-season)**: scorecards are great; add a featured "Game of the Week" hero card above the grid; offseason empty state should show last season's playoff bracket recap instead of a one-liner.
21. **Hero/stat strip**: count-up stats visibly sit at 0 in screenshots until animation fires — animate from real values on scroll-into-view, not from 0 on render; offseason stat strip should show last-champion / offseason facts rather than zeroed season stats.
22. **Mobile**: team names truncate aggressively ("GORILLA WANT...", "JUNGLE JUGGER..."); cast strip shows 4 of 12 avatars with no scroll affordance; H2H compare table overflows. Worth one dedicated pass after P0/P1.

## Execution phasing

- **Phase 1 (P0, items 1–10):** one PR — "offseason correctness". Mostly logic; verify with `--mode=offseason` captures before/after.
- **Phase 2 (P1, items 11–16):** one PR per page redesign, each with its own design direction proposed first (per CLAUDE.md, genuinely different creative options).
- **Phase 3 (P2, items 17–22):** batched polish PRs.

Every phase: run the harness in both modes, desktop + mobile, zero console errors required.
