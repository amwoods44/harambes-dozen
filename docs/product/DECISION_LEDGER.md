# Harambe's Dozen V2 — Decision Ledger

**Ledger ID:** `HD12-V2-LEDGER-001`  
**Status:** Authoritative for V2 product and presentation decisions  
**Target:** Private beta on August 21, 2026; a missed quality gate moves the date rather than weakening the gate  
**Owner and final approver:** Aaron Woods

This ledger is the no-drift record for Harambe's Dozen V2. If another specification,
mockup, implementation, or comment conflicts with this file, this file wins unless the
baseline-supersession protocol below has been completed.

## Product contract

Harambe's Dozen V2 is the custom league companion for twelve friends in a contract
dynasty fantasy-football league. It should feel like a premium sports publication,
franchise front office, clubhouse, and living archive made specifically for this league.
Sleeper remains authoritative for lineups, scoring, draft selections, roster movement,
and official transactions. V2 explains, organizes, records, and adds league-specific
context that Sleeper does not.

The emotional target is polished and impressive without becoming self-serious. Harambe is
the league's affectionate mascot and recurring editorial character—not a movie protagonist,
video-game avatar, casino mascot, or fantasy-world hero.

### Hard rejections

- No generic dashboard or information-portal composition.
- No prose-first route that makes ordinary fantasy information feel like a novel.
- No Sleeper clone and no visual treatment that could belong to any league.
- No GTA, movie-poster, video-game, casino, or prestige-drama framing.
- No invented rankings, manager tendencies, contracts, history, or transaction claims.
- No repeated provenance badges on verified ordinary content.
- No manager identity, contract data, private notes, or negotiations in public markup.
- No route in primary navigation without a useful, complete league job.
- No desktop composition merely stacked into a mobile page.

## Approved baselines

| ID | Baseline | Status | Notes |
| --- | --- | --- | --- |
| `BASE-HOME-L-001` | Approved light Draft Night Home concept supplied in the August 9–10 review | Superseded as implementation foundation; retained inspiration | Its information jobs and selected editorial modules remain useful, but the 440-parity reset replaces its cinematic composition. |
| `BASE-HOME-D-001` | Approved dark Draft Night Home concept supplied in the August 9–10 review | Superseded as implementation foundation; retained inspiration | Its information jobs and selected editorial modules remain useful, but the 440-parity reset replaces its cinematic composition. |
| `BASE-TROPHY-PHOTO-001` | Aaron's photograph of the physical Harambe's Dozen trophy | Object authority | Polished gold two-handled cup, central stem, flared lower body, black stepped base, black-and-gold plaque. |
| `ASSET-TROPHY-STUDIO-001` | `v2/public/assets/real-trophy-studio-v1.png` | Review candidate | Faithful studio cleanup derived from `BASE-TROPHY-PHOTO-001`; requires approval in the G1 specimen. |
| `BASE-DESIGN-STD-001` | `v2/DESIGN.md` at commit `a3f921f` | Retained engineering and token context | The 440-parity baseline now governs route composition; compatible accessibility, theme, and token work may be retained. |
| `BASE-440-PARITY-001` | 440 & Friends clean-room parity strategy approved 2026-08-11 | Approved implementation foundation | Match observable page geometry, density, avatar prominence, hierarchy, and interactions very closely; ship only Harambe's Dozen code, data, copy, and original/licensed assets. |
| `SPEC-440-FOUNDATION-001` | `docs/superpowers/specs/2026-08-11-440-parity-foundation-design.md` | Written-spec review pending | First bounded slice: shared shell, Home, manager-avatar system, Franchises index, and Franchise Profile wireframes. |

Approved references are immutable records. They may be replaced, but not silently edited.

## Recovered interview decisions

- Desktop and mobile are equal-priority products.
- Light and dark are separately art-directed themes.
- The visual language is deep navy, warm cream, antique gold, and signal red.
- The Home concepts named above are the direct reference, not loose inspiration.
- Real player imagery and manager portraits are core information architecture, not garnish.
- Every manager receives a custom franchise identity within one Harambe's Dozen system.
- Home changes with the league moment: Draft countdown, Live Sunday, Playoff race, and Offseason/front office.
- Home answers what matters now; League owns complete matchup detail and the historical matchup archive.
- Player selection opens a quick dossier; Full Dossier opens a stable route. Mobile uses a full-screen sheet.
- Mobile primary navigation is Home, League, Franchises, Trades, and More. More contains Draft, League Office, and Clubhouse.
- Records Vault is a deep League experience entered from Home, League, Franchises, and historical links.
- Trades supports two through four teams, private discussion, unanimous agreement, and handoff to Sleeper for official execution.
- Draft mirrors Sleeper selections; V2 does not make selections.
- Clubhouse beta includes posts, edits, reactions, polls, moderation, and editorial promotion. Threads, DMs, and chat replacement are deferred.
- Automatic editorial copy must trace to approved templates and verified inputs.
- One trusted league member reviews the live Golden Home and final usability. Aaron retains aesthetic approval authority.

## Rules and data authority

Authority is resolved in this order for the fact each source actually governs:

1. Sleeper for current platform state, lineups, scoring, rosters, transactions, draft metadata, and official selections.
2. Versioned commissioner/member-approved records for contracts, exemptions, current rules, dues, and corrections.
3. Explicit historical corrections for league history.
4. The 2022 constitution as legacy context only.

Conflicts are never silently merged. An ordinary member sees the best resolved fact and a
clear exception only when it is stale, partial, conflicted, or unresolved. Detailed freshness
and authority live in an investigate layer. Admin-only Sheet conflicts appear as review
suggestions, not as warning badges across member pages.

### Current rule corrections

- Current lineup: three starting WRs, no kicker, and one IR slot.
- Ordinary fumbles score zero; lost-fumble scoring remains a separate setting.
- Ordinary extension eligibility requires one contract year remaining.
- **An exemption may renegotiate any contract regardless of years remaining.** Aaron believes this changed in 2024; the precise effective date remains unresolved until a dated ruling is supplied.
- Exemption declarations are normally due Memorial Day at end of day.
- The 2022 constitution is not assumed to reflect later changes.

## Privacy model

| Audience | May see | Must not receive |
| --- | --- | --- |
| Public | League identity, public standings/history, franchise emblems, public stories, public schedule | Manager identities, Sleeper avatar URLs, player ownership joined to contracts, contract years, exemptions, private notes, negotiations, approvals |
| Member | Public material plus manager identities, rosters, contract context, league workflows, Clubhouse, private trade discussion | Admin-only conflict resolution, protected credentials, another member's private notes |
| Admin | Member material plus approval queues, conflict suggestions, moderation and authority audit | Secrets or unredacted infrastructure credentials in client markup |

Public/member/admin boundaries must be tested at the rendered-markup level, not only hidden
with CSS.

## Feature-to-destination inventory

| Capability | V2 destination | Beta decision |
| --- | --- | --- |
| Current league moment, next action, live scoreboard, draft order, deadlines | Seasonal Home | Required |
| League Wire, verified recaps, league-history moments, active poll fallback | Home + Clubhouse promotion | Required |
| Standings, weekly matchups, complete Live Sunday detail, scoring archive | League | Required |
| H2H, all-play, schedule/luck, scoring analysis | League analysis | Retain when normalized and evidence-tested; no invented composite power score |
| Franchise identities, roster, projected lineup, contracts, capital, horizon | Franchises | Required |
| Manager fingerprint, awards, rivalries, franchise history | Franchises + Records | Required when derived from verified history |
| Trade market, blocks, recent activity, proposals, unanimous agreement | Trades | Required |
| Trade history, pick inventory, partner matrix, asset lineage | Trades + Player Dossier | Required when normalized |
| Spatial draft board, available pool, My Picks, official mirrored selections | Draft | Required |
| Draft history and hit-rate evidence | Draft + Records | Retain when inputs are defined and tested |
| Rules, contracts, exemptions, dues, guided submissions, approvals | League Office | Required |
| On-record feed, posts, edits, reactions, polls, moderation | Clubhouse | Required focused beta |
| Champions, playoff paths, records, awards, rivalries, almanac | Records Vault | Required |
| Player production, contract timeline, acquisition, ownership and asset tree | Player Dossier | Required |
| News API, speculative player-value market, Monte Carlo simulator | None | Deferred; not required for August 21 |
| Direct messages, full chat, threaded community | None | Deferred beyond focused Clubhouse beta |
| Sleeper lineup changes, draft selections, roster execution | Sleeper | Intentionally not duplicated |

## Superseded specifications

| ID | Previous item | Superseded scope | Retained value | Replacement |
| --- | --- | --- | --- | --- |
| `SPEC-FO-DOSSIER-001` | `docs/superpowers/specs/2026-08-10-front-office-dossiers-design.md` | The dossier/page presentation and repeated evidence-panel visual model | Tested rule authority, privacy logic, joins, contract calculations, pick semantics | This ledger, the G1 specimen, and approved route blueprints |
| `IMPL-V2-ROUTES-001` | Existing route components under `v2/src/pages` | Production visual foundation | Useful data access, domain helpers, accessibility and privacy tests | New approved production route tree after G1/G3 gates |
| `FEATURES-LEGACY-001` | `docs/FEATURES.md` single-file dashboard framing | Navigation and product framing | Inventory of historical calculations and datasets worth normalizing | Feature-to-destination inventory above |
| `G1-SPECIMEN-001` | Existing G1 design-system specimen and 2026-08-10 captures | Visual implementation foundation | Tested accessibility states, portrait sourcing, trophy candidate, privacy and presentation-model work | `BASE-440-PARITY-001` and `SPEC-440-FOUNDATION-001`; specimen remains logic/state reference only |
| `BASE-HOME-CONCEPTS-001` | `BASE-HOME-L-001` and `BASE-HOME-D-001` | Cinematic Home composition and route-wide visual foundation | My Franchise, league-moment priority, pick context, League Wire, deadlines, Records Vault, trophy emphasis | `BASE-440-PARITY-001`; reason: Aaron consistently preferred 440's human, illustrated companion structure and approved close parity on 2026-08-11 |

The superseded route components remain quarantined for logic reference. They are not evidence
that a future route has passed design approval.

## Baseline supersession protocol

Any approved reference or capture can be replaced only when one ledger entry records:

1. The previous reference identifier.
2. The reason the previous reference no longer serves the product.
3. The replacement capture and stable identifier.
4. Aaron's repeated explicit approval.
5. A link to both versions and the approval record.

The integrated review may reopen an earlier approval through this same protocol. Visual-test
thresholds are never loosened merely to make a changed baseline pass.

## Approval record

| Gate | Item | State | Approval evidence |
| --- | --- | --- | --- |
| G0 | Ledger, manifest, references, tripwires, Tier A list | Complete | Control package implemented; later-route assets are explicitly route-blocked in the manifest. |
| G1 | Design-system specimen | Rejected as visual foundation; superseded | Aaron rejected the cinematic/information-portal drift and approved the 440-first parity reset on 2026-08-11. |
| G1R | 440-parity foundation spec and wireframes | Written-spec review pending | `SPEC-440-FOUNDATION-001`; requires spec approval, implementation plan, then desktop/mobile wireframe approval. |
| G2 | Four-state visual Golden Home | Blocked by G1R | Rebased Draft Night Home plus remaining seasonal states after parity foundation approval. |
| G3 | Live Golden Home | Blocked by G2 | Aaron + one trusted usability review; Aaron final. |
| G4–G8 | Remaining approved plan gates | Blocked by earlier gates | See `REVIEW_MATRIX.md`. |
