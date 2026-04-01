# Phase 1: Infrastructure Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 01-infrastructure-hardening
**Areas discussed:** Error visibility, Render guard behavior, State preservation scope
**Mode:** Auto (all decisions auto-selected as recommended defaults)

---

## Error Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Inline warning banner | Non-intrusive banner at top of Contracts tab | ✓ |
| Modal dialog | Blocking alert on failure | |
| Toast notification | Temporary popup that auto-dismisses | |

**User's choice:** [auto] Inline warning banner (recommended default)
**Notes:** Contextual placement in Contracts tab — only users looking at contracts see the warning. Matches broadcast aesthetic.

---

## Render Guard Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Silent skip | Return early, let dirty-flag re-render when data arrives | ✓ |
| Loading spinner | Show spinner while waiting for data | |
| Empty state message | Show "Loading data..." text | |

**User's choice:** [auto] Silent skip (recommended default)
**Notes:** Matches existing progressive-load pattern. Data pipeline populates D, then dirty-flags trigger renders.

---

## State Preservation Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Trades + collapsibles only | Focus on documented fragile areas | ✓ |
| All interactive panels | Comprehensive but high effort | |
| Defer entirely | Handle in Polish phase | |

**User's choice:** [auto] Trades + collapsibles only (recommended default)
**Notes:** CLAUDE.md documents Trades year filter and collapsible cards as the two fragile areas. Other tabs handled in Phase 6 (Polish).

---

## Claude's Discretion

- .gitignore patterns
- localStorage cache pruning throttle implementation
- NFL kickoff date comment placement

## Deferred Ideas

None.
