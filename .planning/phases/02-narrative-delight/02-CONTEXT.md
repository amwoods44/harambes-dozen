# Phase 2: Narrative & Delight - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Five broadcast-quality features that require zero new data sources. All data already exists in `D`. These features deliver immediate visible value and establish render patterns (canvas animation, IntersectionObserver triggers, narrative generation) that subsequent phases inherit.

</domain>

<decisions>
## Implementation Decisions

### Feature Placement
- **D-01:** "This Week in League History" is a hero-level callout card — prominent, above the fold, after the hero section and before tab navigation. Vintage-style treatment with faded background, bold stat, "On this week in 2023..." format. This is the weekly engagement hook.
- **D-02:** Achievements & Badges live in two places: (1) per-team badge case in GM Dashboard — when you view a team, you see their lifetime badges, and (2) a league-wide "Hall of Fame" view showing who has the most badges. These are LIFETIME achievements, separate from seasonal Awards.
- **D-03:** Animated Standings Race goes in the Standings section within Trophies. A "Play the Season" button above the final standings table — click to watch week-by-week positions animate. Team-colored bars, smooth easing.
- **D-04:** Power Moves Feed is NOT a transaction list — it's "The Season Story" narrative. Lives as its own section in Trophies — a timeline of pivotal moments auto-generated from biggest score swings, most impactful trades, and crucial waiver pickups. ESPN SportsCenter tone: dramatic, punchy one-liners.

### Animation & Interaction
- **D-05:** Standings Race uses custom canvas animation (NOT Chart.js — would look generic). Team-colored bars, position labels, smooth week-to-week transitions. Matches existing canvas pattern from consistency scatter.
- **D-06:** Counter animations use CountUp.js (CDN-loaded, lazy) triggered by IntersectionObserver — fire when stat strip scrolls into view, not on page load. 1.5s ease-out.
- **D-07:** Standings Race is user-triggered via play button — respects user control, no auto-play.

### Content Generation
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, broadcast quality bar
- `.planning/REQUIREMENTS.md` — NARR-01 through NARR-05 acceptance criteria
- `CLAUDE.md` — Design quality bar, re-render safety rules, code conventions

### Codebase
- `.planning/codebase/ARCHITECTURE.md` — Render function patterns, data flow, D object structure
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, HTML string building approach
- `.planning/codebase/STACK.md` — Current canvas usage, CDN loading patterns

### Research
- `.planning/research/STACK.md` — CountUp.js CDN URL, Chart.js (NOT for standings race), IntersectionObserver patterns
- `.planning/research/FEATURES.md` — Feature landscape, achievement categories, narrative patterns
- `.planning/research/ARCHITECTURE.md` — Dirty-tab system, render patterns, lazy loading strategy

### Prior Phase Context
- `.planning/phases/01-infrastructure-hardening/01-CONTEXT.md` — Guard clause pattern (D-03/D-04), scroll preservation pattern (D-05/D-06)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `renderAnalytics()` canvas scatter plot — existing canvas pattern to follow for standings race
- `icon()` helper — SVG icon builder for achievement badge icons
- `D.history` — historical season data already loaded, drives history facts and standings race
- `D.matchups` — weekly matchup data for standings race week-by-week computation
- `D.transactions` — trade/waiver data for Power Moves narrative generation
- `tn()` / `cn()` — team name / coach name helpers
- `TC` object — team colors for race bar coloring

### Established Patterns
- Render functions build HTML via string concatenation → `innerHTML`
- Tab content injected via `getElementById(panelId).innerHTML = html`
- Canvas elements created inline, drawn in render function
- CDN scripts loaded via `<script>` tag (html2canvas pattern exists)

### Integration Points
- Hero section in HTML body — insert history callout card after hero, before nav
- `renderTrophies()` — add standings race canvas + play button, add Season Story section
- `renderAwards()` — add Hall of Fame badge display
- `renderGM()` — add per-team badge case section
- Stat strips throughout app — add CountUp.js + IntersectionObserver triggers

</code_context>

<specifics>
## Specific Ideas

- History callout should feel like a vintage ESPN segment — faded background treatment, strong typography
- Achievement badges should evoke championship rings or HOF plaques — metallic, embossed feel
- Standings race should be dramatic — team-colored bars, smooth transitions, position labels visible throughout
- Power Moves narratives should read like SportsCenter highlights — "The trade that changed everything"
- Counter animations should be subtle but noticeable — 1.5s is the sweet spot between "barely noticed" and "waiting too long"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-narrative-delight*
*Context gathered: 2026-03-31*
