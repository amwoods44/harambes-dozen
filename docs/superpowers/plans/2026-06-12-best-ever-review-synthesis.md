# "Best Ever" Review — Five-Lens Synthesis & Roadmap

**Date:** 2026-06-12 · **Inputs:** five parallel expert reviews (visual design, UX/IA, setup/configurability, data accuracy, performance/engineering), each grounded in code reads + the dev/audit screenshot set. **Bar:** best dynasty league companion page in internet history.

## Scorecard (today, on the PR #2 branch)

| Criterion | Score | One-line verdict |
|---|---|---|
| Visual/impressiveness | 5.5/10 | Championship-caliber component vocabulary (pennant rail, scoreboards, robbery banner); zero of 19 pages picks a dominant element below the repeated ~800px masthead |
| Organization/hierarchy | 5/10 | 18 tabs ≈ 6 too many; grouped by data type, not user intent; long pages bury the lede |
| Content | 7/10 | Depth is genuinely elite — six seasons, contracts, exemptions, KTC, drafts; curation is the gap |
| UX | 5/10 | Matchups opens on Week 1 all season; no "my team" anywhere; dead team names; state not deep-linkable |
| Out-of-box / barrier to entry | 4/10 | One-URL + PWA install is great; 10–16s cold load, silent failure modes, 3 annual code edits, ~18 fork edit-sites |
| Accuracy | 4/10 | Strong foundations (escaping, decimals, dedupe verified correct) but 7 breaks-trust bugs remain (below) |
| Configuration/customization | 3/10 | League identity smeared across 4 files; constitution hand-written though derivable from Sleeper settings |
| Attention to detail | 5/10 | Player popup is exemplary; "DRAFT GURU: undefined", stale CBS label, Est. 2023-vs-2016 break the illusion |

## Tier 0 — Breaks-trust bugs (fix before anything else)

Independently confirmed by 2+ reviewers where noted.

1. **Record book wiped per history merge** — `mergeHistoricalData` rebuilds `d.records` from current + *only the season being merged*; after the one-at-a-time `loadHistory` loop, all-time records cover just 2 of 6 seasons. Fix: scan all `matchup_weeks_<yr>` keys.
2. **Current season never enters H2H** — matrix/GM/Compare/Rivals are a year stale all season. Add current-season accumulation in `buildCurrentSeasonData`.
3. **Traded picks on both sides of every trade** — the `pk.includes('(')` side-filter matches everything; picks cancel out of every grade/heist calc. Keep structured picks with `owner_id`, filter per side.
4. **Service worker freezes contracts + FantasyCalc forever** (setup + perf reviewers, independently) — cache-first/no-revalidate branch in sw.js; commissioner's sheet edits never reach installed users until a manual CACHE_NAME bump. Network-first for those origins; only cache `res.ok`.
5. **"DRAFT GURU: undefined"** (visual + accuracy, independently) — `draft_hits` has no `drafter` field; the award always crowns `"undefined"`. Add `drafter`/rid at build, render via `tn()`.
6. **"CBS Era (2016-2020)" table shows Sleeper-era data** (setup + accuracy) — relabel "Sleeper Era All-Time" or source real CBS data; same mislabel in Chronicle.
7. **Historical analytics contaminated by playoffs + week drift** — `weekly_scores_<yr>` includes playoff/consolation games with no week keys; All-Play compares different weeks, Pythagorean PA inflated, heat map mislabels columns after byes. Store `{wk,pts}` pairs, stop at `playoffStart`.
8. **War Room exemption board lies** (UX) — `exemption_history` never populated ⇒ all-green board. Populate from sheet or hide when empty.
9. **localStorage at the quota cliff** (perf) — 4.2–4.7MB of ~5MB; on overflow the player DB silently re-downloads every visit. Move blobs to Cache API or cache derived data; surface `cache.set` failure.

Quick fixes in the same class: trade-acquired players tagged "commissioner" (missing ternary branch); drop-only transactions never counted as moves; luck rounded to whole wins; `u.avatar` is the one unescaped external string; matchups `selWk` stuck at Week 1 (one line).

## Tier 1 — The four structural moves that change the product

1. **A real front page + "My Franchise"** (visual + UX, independently): home is currently just the Power tab. Lead story splash, my live matchup (in-season) / my expiring contracts + deadlines (offseason), next-deadline countdown, latest trade, power top-3. My-team picker (or infer from CFG.userId), persisted; my rows highlighted app-wide; team names clickable everywhere (`gm-trigger` like the existing `pp-trigger`).
2. **Collapse the masthead on non-home tabs** to a slim sticky bar — reclaims ~600px × 18 pages; the precondition for any page having its own dominant element.
3. **IA: 18 → 11 tabs** — Pulse→Chronicle, Awards→Rafters, Moves→Trades("Transactions"), Scoring+Age→Analytics("Stats"), Contracts+WarRoom→"Front Office", GM promoted to primary as "Teams". Keep old ids in `HASH_ALIASES`; deep-link filter state (`#gm/7`, `#matchups/12`).
4. **Perceived performance**: render only the active tab at init (mechanism exists); start player-DB/values/CSV fetches at script start; cache the immutable league chain; first paint before contracts arrive (dirty-tab patch); kill the universal `*` transition rule; debounce history re-renders.

## Tier 2 — Craft

- One brand data-viz ramp (ash→gold→red) replacing traffic-light greens, H2H green/red, rainbow race bars.
- Scale contrast: a 96px number / full-bleed moment per page; #1 power row double-height team-color.
- Bold redesigns: Moves→"Transaction Wire", GM→"Manager Dossier", Scoring→"Almanac" (specs in the visual review).
- Trade-grade honesty: per-side picks (T0#3), drop or dual-apply the contract multiplier, label "by today's values", symmetric grade scale.
- Mobile: stop truncating team names (stack instead), fix trade-card left-edge clipping.

## Tier 3 — Setup & adoptability

- `LEAGUE_CONFIG` single block (3 required fields), constitution derived from `league.settings`, auto `SEASON_DATES` (last-Mon-May + state/nfl), hash-derived team-color fallback, ID-first contract joins (kill the typo class), failure banners for silent contract/value degradation + retry button on dead-end, harness gates: perf budget, localStorage assertion, double-render pass, SW staleness check.

## What's already at the bar (don't touch)

Pennant rail, player popup dossier, midseason scoreboard, install banner UX, `esc()`-at-ingestion discipline, fpts decimal handling, franchise-total idempotence, champions derivation, the dev/audit harness itself.

## Verdict

The museum is excellent; the companion is missing. Depth of content is already best-in-class — what separates this from "best ever" is (1) numbers a league can bet on (Tier 0), (2) a "you" in the product and a front page (Tier 1), (3) editorial curation over enumeration (Tier 2), and (4) an app that loads like television, not like a batch job (Tier 1 perf). Recommended order: Tier 0 in one PR, then Tier 1 items 1+2, then iterate.
