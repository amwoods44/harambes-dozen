---
phase: 01-infrastructure-hardening
plan: "03"
subsystem: index.html
tags: [guard-clauses, xss-prevention, security, render-safety]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [safe-render-functions, xss-closed]
  affects: [all-18-render-functions, openPP-modal]
tech_stack:
  added: []
  patterns: [guard-clause-pattern, esc-at-injection-point]
key_files:
  created: []
  modified:
    - index.html
decisions:
  - "Do NOT double-escape: p.name/p.nm/t.name (D.teams)/D.rid_to_name are already esc()d at pipeline time — wrapping them would produce literal &amp; in UI"
  - "ridToNameForSeason() returns raw strings — historical champion/runner_up/franchise/standings names all need esc() at injection sites"
  - "p.team (NFL abbreviation) is raw at DB build time — wrapped at every injection site including alt attributes"
  - "Ticker facts[0] goes through innerHTML but is the current champion (esc()d at pipeline); rotation uses textContent — safe without modification"
metrics:
  duration: "~45min"
  completed: "2026-04-01"
  tasks_completed: 2
  files_modified: 1
---

# Phase 01 Plan 03: Guard Clauses + esc() Coverage Summary

One pass through all 18 render functions accomplishing both defensive goals simultaneously: guard clauses at the top of every data-accessing render function, and esc() wrapping at every genuine raw API string injection site.

## Tasks Completed

### Task 1: Guard Clauses (commit 76bcedd)

Added one-line `if(!D.key)return;` guards to 12 render functions:

| Function | Guard Added |
|----------|-------------|
| renderPower | `if(!D.teams)return;` |
| renderRosters | `if(!D.teams)return;` |
| renderTrophies | `if(!D.champions)return;` |
| renderMatchups | `if(!D.matchup_weeks)return;` |
| renderDraft | `if(!D.draft_picks)return;` |
| renderAge | `if(!D.teams)return;` |
| renderScoring | `if(!D.weekly_scores)return;` |
| renderAwards | `if(!D.teams\|\|!D.champions)return;` |
| renderAnalytics | `if(!D.rid_to_name\|\|!D.h2h)return;` |
| renderGM | `if(!D.teams)return;` |
| renderWarRoom | `if(!D.league)return;` |
| renderPulse | `if(!D.champions)return;` |
| renderChronicle | `if(!D.champions)return;` |

Left unchanged (already guarded or soft-guarded):
- renderContracts: has intentional empty-state message guard
- renderTrades: uses `D.unified_trades||[]` soft guard
- renderMoves: uses `D.moves||[]` soft guard
- renderRivals: uses `D.rivalries||[]` soft guard
- renderTab: dispatcher, not a data renderer

### Task 2: esc() Coverage (commit d8f3720)

**Critical finding: Most strings are already escaped at pipeline time.**

Fields esc()'d at DB build / buildCurrentSeasonData (DO NOT re-wrap):
- `p.fn` (full_name) — esc()'d at line 1581 when playerDB is built
- `p.name`, `p.nm` — both assigned from `p.fn`
- `D.teams[].team_name` — esc()'d at line 1797 from userMap
- `D.rid_to_name[]` — esc()'d at line 1803 from userMap
- `D.league.name` — esc()'d at line 1790
- `m.add`, `m.drop` (moves) — from `p.fn`
- Trade side `team`/`name` — from `D.rid_to_name`
- `D.champions[current]` champion/runner_up — from `D.rid_to_name`

Fields that ARE raw (esc() applied at injection sites):
- `p.team` / `p.tm` — NFL abbreviation, raw from Sleeper player DB
- Historical champion/runner_up names — from `ridToNameForSeason()` which has no esc()
- `D.luck[].team_name` — from `ridToNameForSeason()`, raw
- Historical franchise/standings names — from raw historical data
- Exemption fields: `e.o`, `e.p`, `e.from`, `e.note` — from Google Sheets CSV
- Trade exemption: `t.exm.from`, `t.exm.to`, `t.exm.used_on`

**Sites wrapped:**
- `p.team||'FA'` in renderRosters (text + alt), renderPower (text), conCard helper, renderDraft
- `p.team` in openPP alt attribute
- `D.luck[].team_name` in renderTrophies, renderAwards
- Historical champion/runner_up in banner (renderTrophies), season standings (renderTrophies), franchise row (renderTrophies), alltime standings row (renderTrophies), renderConstitution, renderPulse, renderChronicle
- Historical franchise `f.name`, `f.mgr` in both franchise ranking tables
- `e.o`, `e.p`, `e.from`, `e.note` in renderContracts, renderTrades, renderPulse, renderChronicle, openPP
- `t.exm.used_on` in renderPulse
- `draftGuru[0]` in renderAwards
- Pick strings via `cleanPick()` in renderTrades picksOnlySide

**esc() count: 43 (up from baseline of 6, target was 40+)**

## Verification

```
grep -A2 'function renderPower' index.html | grep 'if.*!D\.'   → "if(!D.teams)return;"  ✓
grep -A2 'function renderMatchups' index.html | grep 'if.*!D\.' → "if(!D.matchup_weeks)return;" ✓
grep -A2 'function renderRosters' index.html | grep 'if.*!D\.'  → "if(!D.teams)return;" ✓
grep -n "'+owner_name" index.html | grep -v 'esc('             → 0 results ✓
grep -c 'esc(' index.html                                       → 43 ✓
```

## Deviations from Plan

### Auto-fixed Issues

None — executed exactly as planned, with careful pipeline tracing confirming the double-escape list.

**Note on esc() count:** Plan expected 40+ citing "109+ unescaped injections." Actual count is 43 total esc() calls. This is because the vast majority of strings (player names, team names, manager names) are already escaped at data pipeline time. The 109+ figure counted raw fields in the pipeline before escaping — not injection sites. The correct approach is to apply esc() only at genuinely raw injection points, which is what was done.

## Known Stubs

None — both tasks are fully implemented with no placeholders.

## Self-Check: PASSED
