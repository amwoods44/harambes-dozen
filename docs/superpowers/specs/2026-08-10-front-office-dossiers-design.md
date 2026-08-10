# Front Office Dossiers Design

**Date:** August 10, 2026  
**Status:** Approved direction, pending written-spec review  
**Scope:** League Office and Franchises routes in Harambe's Dozen V2

## Purpose

Transform two visually present but shallow routes into member tools that answer questions Sleeper cannot answer by itself:

- **League Office:** Which source governs each current rule, deadline, contract decision, and correction?
- **Franchises:** What does each club own, where is its contract pressure, what draft capital does it control, and what verified movement created the current position?

The pages must retain the approved sports-publication character in `v2/DESIGN.md`: polished, competitive, and knowingly unserious. They must not become generic dashboards, movie posters, or invented dynasty-advice generators.

## Product approach

Use a **Front Office dossier** model. Each page has one dominant editorial composition, followed by structured evidence and decision context. Live data provides the facts; the interface explains their consequence and provenance.

Rejected approaches:

1. **Wholesale legacy-dashboard port:** It would add volume quickly but would also reintroduce questionable calculations, stale assumptions, and visual clutter.
2. **Pure editorial profiles:** They would improve personality but would remain shallow and fail the league-decision standard.

## Authority model

Every displayed league fact must carry one of these statuses:

| Status | Meaning | Examples |
| --- | --- | --- |
| Commissioner confirmed | Current rule or correction explicitly confirmed by the commissioner/manager record | Three starting WRs; no kicker; one IR; ordinary fumbles score zero; extensions require one year remaining; Memorial Day EOD exemption deadline |
| Sleeper live | Current platform configuration or ownership loaded from Sleeper | League status; roster ownership; draft order; transaction history; traded-pick ownership |
| Historical correction | Versioned correction to the league record | Corrected champions or historical ownership |
| Legacy | Context from the 2022 constitution that has not been reconfirmed | Older rules text and procedures |
| Unresolved | A materially relevant current rule has no verified current source | Any 2022 clause not confirmed by current settings or commissioner notes |

The 2022 constitution remains accessible as historical context but cannot be presented as current authority. The UI must never silently convert a legacy clause into a present-day rule.

## League Office experience

### 1. Editorial masthead

The page opens as a commissioner operations desk rather than an administrative settings screen. It shows the season, current league phase, data freshness, and the number of confirmed versus unresolved rule areas.

### 2. Current-rule register

Rules are grouped into:

- Roster configuration
- Scoring
- Contracts and extensions
- Exemptions
- Draft operations
- Trading
- Waivers and free agency
- Playoffs and competition

Each rule row includes the rule statement, authority status, effective season when known, and a concise source note. Unresolved sections are useful states, not placeholders: they explain exactly what still requires confirmation.

### 3. Offseason docket

The existing deadline list becomes a prioritized operating calendar. It distinguishes upcoming, annual, platform-controlled, and already-passed items. Dates stay calendar-forward and use the visual language established on Home.

### 4. Contract-ledger health

Member-only ledger reporting includes:

- Total private contract records
- Records joined to current Sleeper ownership
- Manager-corrected records
- Players with one year remaining
- Players with two years remaining
- Unmatched Sleeper roster IDs

This is an integrity view, not a commissioner editing interface. Editing remains out of scope until a protected backend workflow exists.

### 5. Legacy archive

The 2022 constitution is presented in an archive treatment with an explicit warning. Confirmed current rules may link back to the relevant legacy topic, but the archived language never outranks current authority.

## Franchise dossier experience

### 1. Club selector and identity masthead

Members can select any of the twelve clubs. The selected franchise receives a strong editorial header with manager portrait, franchise name, next draft selection, roster size, and verified championship count when available.

Public visitors see franchise identity, club emblem, public roster count, and public draft position only. Manager identity, player ownership, contracts, and transaction consequences remain private.

### 2. Roster position rooms

The roster is grouped into QB, RB, WR, TE, DEF, and other/unmatched sections. Every matched player row shows name, NFL team, contract years, tag status, exemption marker, and authority marker. Unknown player metadata remains visibly unmatched instead of receiving guessed details.

### 3. Contract runway

The page computes only evidence-backed contract pressure:

- One-year decisions
- Two-year watch list
- Three-plus-year control
- Unknown or unmatched records
- Tags and recorded exemptions

The result is described as a **pressure report**, not a contention score. It may say that a club has a high count of near-term decisions; it may not claim the club is rebuilding, contending, strong, or weak without verified inputs supporting that statement.

### 4. Draft-capital ledger

Show the franchise's opening 2026 pick, owned traded picks, picks originally belonging to the club but now held elsewhere, and the next-pick gap when it can be derived. Original and current ownership must remain distinct.

### 5. Verified movement

Show recent completed transactions that include the selected roster. Summaries use transaction data only. Contract consequences are joined by Sleeper player ID when possible; missing joins are labeled for review.

### 6. History strip

Show championships and runner-up finishes only from the verified Sleeper-era record. Do not infer all-time records, rivalries, or manager tendencies until the historical dataset is normalized and tested.

## Data flow and boundaries

The page consumes existing `HomeSnapshot`, `ContractPlayer`, transaction, pick, and championship data. Presentation-specific derivations should live in small pure helpers with direct unit tests. UI components receive already-derived facts rather than recomputing authority or ownership inconsistently.

No new third-party valuation feed, player-ranking model, or commissioner editing surface is introduced in this slice.

When live Sleeper refresh fails, the UI may display the last cached snapshot with its timestamp. It must not label cached values as live.

## Visual direction

- Preserve the navy, cream, antique-gold, and signal-red system.
- Use editorial mastheads, scoreboard alignment, thin rules, and compact athletic typography.
- Use manager portraits as sports headshots, not generic circular avatars floating in cards.
- Treat contract years and authority labels like roster/status notation from a team media guide.
- Light and dark themes remain separately art-directed.
- Mobile uses a deliberate single-club workflow with a compact selector and horizontally scrollable evidence tables only where necessary.

## Accessibility and privacy

- Every dossier section has a meaningful accessible name.
- Club-selection buttons communicate selected state.
- Tables retain row/column semantics or an equivalent accessible structure.
- Color never carries authority or contract status alone.
- Public markup must not contain private manager names, player IDs, player ownership, contract values, exemption records, or Sleeper avatar URLs.

## Testing

Implementation follows red-green-refactor cycles.

Required automated coverage:

- Rule status and authority labeling
- Legacy and unresolved separation
- Contract-ledger health calculations
- Position-room grouping
- One-year/two-year/long-control calculations
- Pick ownership and outgoing-pick semantics
- Transaction filtering by selected roster
- Verified history display
- Member/public privacy boundary
- Club-selection interaction

Required completion checks:

- Focused route tests
- Full Vitest suite
- TypeScript typecheck
- Production build
- Desktop and mobile captures in light and dark themes
- Horizontal-overflow audit
- Public and member privacy rehearsal

## Deployment

After verification, publish a review build with a stable URL. The deployment must not embed the private contract CSV in the public bundle. If production Firebase member authentication is not configured, the review deployment must remain a clearly labeled demo using non-sensitive fixture/cached data, while the local member preview remains the source for private-data QA.

## Definition of done

This slice is done only when:

1. League Office distinguishes current, live, legacy, and unresolved information at rule level.
2. Franchises provides roster, contract, pick, movement, and verified-history context for all twelve clubs.
3. The member experience contains meaningful decision support without invented rankings or advice.
4. The public experience exposes no private identity or contract information.
5. The two routes meet the approved sports-editorial visual standard on desktop and mobile in both themes.
6. Tests, typecheck, build, captures, overflow checks, and privacy rehearsal pass.
7. Aaron receives a stable review URL and knows whether it is a demo or authenticated member deployment.
