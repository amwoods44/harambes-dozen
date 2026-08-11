# Harambe's Dozen — 440-Parity Foundation Design

**Date:** 2026-08-11  
**Status:** Approved direction; written-spec review pending  
**Owner and final approver:** Aaron Woods  
**Implementation scope:** Shared shell, Home, manager-avatar system, Franchises index,
and Franchise Profile wireframes

## Decision

Harambe's Dozen will begin from a clean-room, near-pixel-parity interpretation of the
public 440 & Friends league companion. The first objective is not to invent another
visual system. It is to reproduce the hierarchy, geometry, density, avatar prominence,
interaction conventions, and handcrafted league personality that Aaron already loves.

The baseline should be close enough that a side-by-side comparison clearly shows the
same product grammar. Harambe's Dozen then diverges intentionally through its own league
identity, live dynasty data, contracts, exemptions, draft-pick ownership, transaction
lineage, trophy, history, and approved feature improvements.

This supersedes the unapproved G1 specimen as the visual implementation foundation. The
existing V2 domain logic, source authority, privacy boundaries, services, tests, and PWA
shell remain valuable. Existing route presentation remains quarantined and is not reused
as the new visual foundation.

## Clean-room boundary

The parity goal does not authorize copying 440 & Friends source code or shipping its
logos, illustrations, photographs, written copy, team identities, or other proprietary
assets.

The implementation may closely reproduce observable design behavior:

- Page geometry, content widths, spacing rhythm, alignment, and section proportions.
- Navigation placement, profile switching, route hierarchy, and interaction sequence.
- Avatar scale, crop, framing, labels, and placement.
- Roster, record, history, transaction, award, and profile information hierarchy.
- Responsive rearrangement, information density, and scannability.
- The balance between playful illustration and ordinary fantasy-football information.

Every shipped asset is Harambe's Dozen original, user-supplied, licensed, or sourced from
an approved live provider. The implementation is written against Harambe's Dozen domain
models without inspecting or reusing 440 & Friends code.

## Reference authority

The reference set is:

1. The public 440 & Friends site at <https://www.440andfriends.com/> and its public profile,
   standings, draft, rivalry, trophy, records, and constitution surfaces as observed during
   the design audit.
2. The committed review captures under `docs/screenshots/`:
   - `Avatars.png` for manager-avatar treatment and scale.
   - `PlayerProfile.png` and `player-profile.png` for identity and profile hierarchy.
   - `page-loaded.png` for overall league-companion density and navigation.
   - `rosters-contracts.png` for roster and contract grouping.
   - `trade-cards.png`, `trade-record.png`, and `trades-grades.png` for transaction history.
   - `power-rankings.png` for editorial data presentation.
   - `ChampionExample.png` and `my-banners-current.png` for honors and collectible identity.
3. Aaron's approved component synthesis from the 2026-08-10 design exploration:
   - Illustrated manager personality and handcrafted warmth are essential.
   - The 440-style starting point is preferred to another novel visual system.
   - Subsequent deviations must be deliberate and approved.
4. Aaron's real Harambe's Dozen trophy photograph and the approved rule/data authority
   recorded in `docs/product/DECISION_LEDGER.md`.

Reference captures are research artifacts. They are not distributed as app assets.

## Product principle

The twelve managers are the main characters. Player and league data supports their shared
competition rather than replacing it with a generic statistics portal.

The first five seconds of every route must answer:

1. Where am I?
2. Which manager, franchise, player, season, or league moment is this about?
3. What is the most important fact or action here?
4. Where do I go next?

Personality is carried by original manager art, franchise identity, awards, rivalries,
league history, and small editorial touches. Ordinary fantasy information remains
familiar, compact, and actionable.

## Initial implementation slice

The first implementation plan covers one bounded foundation rather than the complete V2
application.

### 1. Shared shell

- Reproduce the observed 440 desktop content width, header height, navigation rhythm,
  route labels, profile control, and footer behavior as closely as practical.
- Reproduce its compact mobile header and route access pattern without shrinking a desktop
  layout.
- Retain Harambe's Dozen route names and authenticated public/member/admin behavior.
- Build layout primitives for content rail, section masthead, illustrated identity block,
  information row, artifact shelf, and responsive data table.
- Use semantic landmarks, visible keyboard focus, 44-pixel mobile targets, and reduced
  motion from the start.

### 2. Manager avatar system

- Create twelve original Harambe's Dozen manager portraits from the existing Sleeper
  avatars or supplied photographs.
- Match 440's observed illustration scale, crop, consistent line weight, simplified color
  blocking, framing, caption placement, and friendly caricature energy.
- Do not reproduce a 440 manager's face, clothing, pose, or proprietary illustration.
- Produce one portrait master per manager plus standard exports for navigation, avatar
  grid, draft order, transaction lane, profile header, and missing-image fallback.
- Manager art is a finite identity library, not live-generated content.
- Public pages use franchise emblems and approved public identity only; member views may
  use manager portraits according to the existing privacy contract.

### 3. Home parity wireframe

Home begins from the 440 homepage's density and navigation grammar rather than the rejected
cinematic hero or generic information portal.

The wireframe contains:

- League masthead and manager profile control.
- Current league update or seasonal feature.
- Manager/profile access.
- Standings or draft context.
- Updates/League Wire.
- Draft, champions, records, rivalry, trophy, constitution, and illustration entry points.
- One clear My Franchise action.

The first parity wireframe uses the current Draft Night state, but the composition must
remain reusable for Live Sunday, playoffs, and offseason content.

### 4. Franchises index parity wireframe

- Lead with the twelve original manager illustrations at the same prominence and scan
  speed as the 440 profile grid.
- Each identity contains manager or public franchise label, emblem, record/honor summary,
  and a clear profile action.
- Desktop preserves the reference grid rhythm. Mobile becomes a deliberate two-column or
  single-column illustrated index based on the verified 390-pixel fit.
- No dossier prose appears in the index.

### 5. Franchise Profile parity wireframe

- Reproduce the reference profile silhouette: identity first, headline season state,
  recognizable statistic groups, roster/player imagery, honors, and historical modules.
- Use player-first lineup and roster presentation. Contract clocks annotate players rather
  than replacing player identity.
- Provide stable destinations for current lineup, complete roster, draft capital, honors,
  transactions, history, rivalry, and manager profile.
- Deep contract evidence and source authority remain available on demand, not repeated
  across the ordinary surface.
- The complete NFL Player Dossier route is deferred. Player selections in this slice may
  open the existing quick information treatment, but the 440 profile reference maps to a
  Harambe's Dozen manager/franchise profile rather than an NFL player biography.

## Avatar and imagery production model

The high-illustration appearance is sustainable because only the stable league identity
layer is custom illustrated.

| Surface | Production source | Update frequency |
| --- | --- | --- |
| Twelve manager portraits | Original illustrated masters derived from approved manager sources | Rare; only when identity changes |
| Twelve franchise emblems | Original Harambe's Dozen system | Rare; approved rebrand only |
| Harambe league art | Small approved seasonal and spot-art library | Occasional curated addition |
| Trophy | Retouched real trophy master | Fixed |
| NFL players | Sleeper player-ID headshots with designed fallback | Live with roster/player changes |
| League Wire | Reusable compositions using portraits, headshots, emblems, arrows, and verified data | Live/template-driven |
| Championship or major-event art | Optional editor-assisted feature illustration | Only for major moments |

No route depends on generating a new illustration for routine live updates.

## Data and presentation boundary

Route components consume existing normalized presentation models. They do not import raw
Sleeper, Sheet, Firebase, or remote-image clients.

- Sleeper remains authoritative for current rosters, lineups, scores, transactions,
  draft state, and official selections.
- Commissioner-approved records remain authoritative for contracts, exemptions, rules,
  dues, and corrections.
- Presentation models supply visibility, freshness, missing-image, empty, and conflict
  state alongside display data.
- Public markup never contains member-only identity, avatar URLs, contract joins, private
  notes, or negotiations.

The wireframe fixture and live provider must share the same runtime schema so that real
data cannot silently destroy an approved composition.

## Parity measurement

Parity is evaluated side-by-side at fixed 1440-pixel desktop and 390-pixel mobile
viewports.

For a mapped reference surface:

- Major content width, section height, and grid proportions should remain within 2% of the
  reference unless a recorded Harambe requirement forces a deviation.
- Repeated spacing, avatar diameter, label baseline, and row height should remain within
  four CSS pixels of the mapped reference rhythm.
- The same first-viewport information must appear in the same priority order.
- A member should identify the analogous control or destination without explanation.
- Typography may use original or licensed alternatives, but cap height, line count, weight,
  hierarchy, and wrapping must remain visually equivalent.
- Responsive behavior must preserve the reference's task priority, not merely its desktop
  decoration.

These tolerances are review guides, not permission to reproduce protected artwork.

## Deviation ledger

Every intentional departure from the parity baseline is recorded with:

1. Reference page and capture.
2. Baseline behavior.
3. Proposed Harambe's Dozen behavior.
4. Reason: league-specific function, clearer fantasy use, accessibility, privacy, live-data
   resilience, or approved visual identity.
5. Desktop and mobile capture.
6. Aaron's approval.

Unrecorded visual novelty is drift. “Different for the sake of different” is not a valid
reason.

## Wireframe review package

The first package contains:

- Shared shell: desktop and mobile.
- Home Draft Night: desktop and mobile.
- Franchises index: desktop and mobile.
- Franchise Profile: desktop and mobile.
- Manager-avatar contact sheet showing all twelve sources, illustration candidates, and
  standard crops.
- A side-by-side reference overlay for each mapped 440 surface.
- Hostile-data captures for long names, missing portraits, empty honors, no draft picks,
  and stale live data.

Wireframes use real Harambe's Dozen fixture data and the same presentation schema intended
for live integration. Lorem ipsum, invented manager tendencies, and fictional league facts
are prohibited.

## Approval criteria

Aaron approves the foundation only when:

- The page silhouette and interaction rhythm feel recognizably close to 440 & Friends.
- The twelve managers, not generic cards, dominate franchise identity.
- No 440 proprietary artwork, team identity, copy, or source code ships.
- Harambe's Dozen data, privacy, and source authority remain correct.
- Desktop and mobile both feel intentionally designed.
- Player, roster, transaction, and history surfaces look like familiar fantasy-football
  interfaces rather than dossiers or novels.
- Every visual deviation from parity has an explicit reason.
- Aaron believes the result is a strong starting point he can evolve rather than another
  design direction he must undo.

## Deferred scope

Trades, Draft, League Office, Clubhouse, Records Vault, and full Live Sunday are not part
of the first implementation slice. Their existing domain logic remains available. Once the
shell, identity, Home, Franchises, and Profile foundation is approved, each later route
receives its own parity mapping and bounded implementation plan.

This sequencing prevents the current mistake from repeating across the entire app.
