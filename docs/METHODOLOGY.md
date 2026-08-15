# Methodology — how every number is calculated

This documents the formulas, scopes, exponents, and thresholds behind each metric, so every
number on the site is defensible and reproducible. Approximations are labeled as such here and
in the UI. Enforcement: the `dev/audit` harness fails the build if any page renders
`NaN`/`undefined`/`Infinity` (the broken-number invariant gate).

## Records & scope conventions
- **Regular season** = weeks before the league's `playoff_start` (default 15). Playoff and
  consolation games are excluded from all rate stats (luck, all-play, Pythagorean, SOS, H2H).
- **All-time** aggregates scan every persisted `matchup_weeks_<yr>` / `standings_<yr>`; franchise
  totals rebuild from scratch on each history merge (idempotent), and champions/trades are
  de-duplicated (by year / `txn_id`).
- Number formatting: points to 1–2 decimals as the source provides; counts are integers;
  percentages to whole or 1 decimal as labeled.

## Power Index (composite, 0–100)
- **In-season:** 40% win% + 30% points% + 20% youth + 10% draft capital.
- **Offseason:** 30% roster KTC value + 25% win% + 15% points% + 20% youth + 10% capital
  (record recedes, dynasty value leads). Labeled "Offseason Power Index" in-UI.
- Components normalized to 0–1 before weighting; weights sum to 1. Win% excludes ties by design
  (a deliberate choice, not a bug). Youth = clamp(1 − (avgAge − 22)/12, 0, 1).

## Luck / Expected Wins (all-play based)
- For each regular-season week, count how many of the other N−1 teams a team would have beaten;
  ties count 0.5. `expected_wins = total_all_play_wins / (N − 1)`. `luck = actual_wins −
  expected_wins`. Per season; "luck factor" badges trigger at |luck| ≥ 3.

## All-Play record
- Same all-play tally rendered as a W–L record and AP%. **Ties score half-win / half-loss**, so
  `apW + apL = weeks × (N − 1)` always (the percentage is honest, not inflated).

## Pythagorean expected wins
- `pyth = PF^k / (PF^k + PA^k)`, `expected_wins = pyth × games`. The exponent **k is fit to this
  league's own data** — robust median of per-team `ln(W/L)/ln(PF/PA)`, clamped to [1.4, 2.6],
  defaulting to 2.0 when history is thin. This replaces the NFL constant 2.37, which overstates
  fantasy variance. The k in force is shown above the table. PA is regular-season only.

## Strength of Schedule
- Opponent win % over regular-season opponents (final-season opponent records — standard SOS).
  ≥55% HARD, ≥50% AVERAGE, else EASY.

## Consistency
- Population standard deviation of weekly scores (weeks treated as the full population for a
  completed season). Plotted vs average points.

## Head-to-Head matrix
- Win–loss between every pair, regular season, **all-time across every season** (including the
  current one). Labeled ALL-TIME and explicitly noted as not affected by the year selector.

## Trade grading
- Per side: `value = Σ player KTC × control-discount + Σ pick value`. **Control discount** by
  contract years remaining: unsigned ×0.5, ≤1yr ×0.6, ≤2yr ×0.85, else ×1. **Pick values** by
  round (1st 5000 · 2nd 2000 · 3rd 800 · later 300) — an approximation, disclosed in-UI.
- Grade = net value swing **at today's values** (not trade-date values), disclosed in-UI.
  Scale: A+ >3000, A >1500, B >500, C ±500, D <−500, F <−1500.
- **Multi-team (3+) trades**: nets cannot be decomposed from the available data, so they are
  shown but **not graded**, and excluded from the Trade Record leaderboard and Heist.

## Draft hit-rate
- A pick is a **starter / rostered / cut** by its player's current status; the original drafter is
  credited (validated roster id). **Biggest steal** = value recovered = current KTC above the pick
  slot's round baseline (not merely the latest-round starter). The current/most-recent class is
  flagged "too recent to grade" (rookies haven't had a season to earn roles).

## Transactions & activity
- Waiver / FA / commissioner moves are counted for **every roster touched by an add OR a drop**
  (drop-only cuts included). Trades count per participating roster.

## Manager badges — thresholds (documented; tune per league)
- **Wheeler-Dealer** ≥5 trades (≈2σ above the ~2–3 median in a 12-team league).
- **Ghost** ≤8 total actions (trades+moves+picks) over a full season.
- **Draft Hoarder** ≥18 picks. **Dynasty Builder** avg age ≤25. **Win Now** avg age ≥28.5.
- **Lucky Charm** luck ≥3 · **Snake Bitten** luck ≤−3.
- These are league-tunable heuristics, documented here rather than hidden in code.
