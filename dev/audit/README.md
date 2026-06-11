# Visual-Audit Harness (`dev/audit/`)

Runs the app in headless Chromium with **all external APIs mocked**, then
screenshots every tab. Use it for `/visual-verify` in remote/cloud sessions
where the network policy blocks `api.sleeper.app`, `api.fantasycalc.com`,
`sleepercdn.com`, and the published Google Sheet.

## Run

```bash
NODE_PATH=/opt/node22/lib/node_modules \
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
node dev/audit/capture.js --mode=offseason --viewports=desktop,mobile
```

- `--mode=offseason` (default): current season 2026, week 0, five completed
  historical seasons (2021–2025) — matches what the live site shows today.
- `--mode=midseason`: current season 2025 at week 14 — populates the
  matchup/standings views that are empty in the offseason.
- `--viewports=desktop,mobile`: 1440×900 and/or 390×844.

Output: `dev/audit/screens/<mode>/<tab>--<viewport>.png` (full-page),
plus `_home--*.png` for the hero/header. The run **fails (exit 1) if any
page error, console error, or unexpected 4xx occurs**, so it doubles as a
smoke test of the data pipeline.

## How it works

- `fixtures.js` deterministically generates (seeded RNG) a 12-team league:
  six seasons of schedules/scores/brackets, ~25 trades + ~70 waiver moves a
  season, rookie drafts, traded picks, FantasyCalc values, and the contracts
  CSV — shaped exactly the way `buildCurrentSeasonData()` /
  `mergeHistoricalData()` / `parseContractCSV()` consume them.
- `capture.js` serves the repo root on `localhost:8131` and uses Playwright
  route interception: Sleeper/FantasyCalc/Sheets URLs get fixture JSON/CSV;
  any other external image or script (sleepercdn, espncdn, jsdelivr) gets a
  deterministic placeholder; Google Fonts pass through. Service workers are
  blocked so caching never masks a data bug.

## Gotchas discovered (relevant to app code too)

- `let D` is a global **lexical** binding — it is NOT `window.D`. Probe it
  from `page.evaluate`/`waitForFunction` with `typeof D !== 'undefined'`.
- History-merge completion is observable via `D.champions.length` reaching
  the number of completed seasons.
- The app loads html2canvas from **cdn.jsdelivr.net** (CLAUDE.md previously
  said cdnjs).
