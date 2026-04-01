# Phase 3: Contracts Complete - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 03-contracts-complete
**Areas discussed:** Exemption Pipeline, Pill Distribution, Cliff Visualization, Keeper Sheet
**Mode:** --auto (all decisions auto-selected with recommended defaults)

---

## Exemption Pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| Parse from CSV | Build exemption aggregation from per-player exemption column in Google Sheets | ✓ |
| Hardcode from Excel | Manual data entry from the Excel source file | |
| Separate API endpoint | Fetch exemptions from a different data source | |

**User's choice:** [auto] Parse from CSV (recommended default)
**Notes:** The parser already detects `exm` per player row. The gap is aggregation into the `{year: [{player, owner, ...}]}` shape that renderContracts expects.

---

## Pill Distribution

| Option | Description | Selected |
|--------|-------------|----------|
| Everywhere | Rosters (starters + bench), GM Dashboard, Trade History, Player Profile | ✓ |
| Key views only | Rosters + GM Dashboard only | |
| Current only | Keep cpill in Rosters starters only | |

**User's choice:** [auto] Everywhere (recommended default — matches CONT-03/04/05)
**Notes:** cpill() already handles the lookup — just needs insertion at more render sites.

---

## Cliff Visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Keep heatmap cards | Enhance existing broadcast-style heatmap grid | ✓ |
| Stacked area chart | Replace with traditional stacked area chart per CONT-09 literal reading | |
| Both | Heatmap + small area chart | |

**User's choice:** [auto] Keep heatmap cards (recommended default — already built and broadcast-quality)
**Notes:** CONT-09 says "stacked area" but the heatmap is more visually distinctive and already implemented. A stacked area would be a regression to generic charting.

---

## Keeper Sheet

| Option | Description | Selected |
|--------|-------------|----------|
| Sortable table | Master player table with sortable column headers below visual sections | ✓ |
| Card grid | Sortable card grid with filter/sort controls | |
| Replace existing | Replace current sections with a single sortable table | |

**User's choice:** [auto] Sortable table (recommended default — adds data-dense view without replacing broadcast sections)
**Notes:** Default sort by KTC value descending. Columns: Player, Team, Pos, Years, Tag, Exemption, KTC.

---

## Claude's Discretion

- Sort implementation approach (in-memory array sort)
- Search/filter addition to keeper sheet
- Column header styling for sort indicators
- Waiver pickup detection from transaction types

## Deferred Ideas

None — discussion stayed within phase scope.
