# Harambe's Dozen V2 — Review Matrix and Quality Gates

## Tier A: 48 human-reviewed captures

Review sessions contain no more than eight captures.

| Gate | Experience | Required captures | Count |
| --- | --- | --- | ---: |
| G1 | Design-system specimen | Desktop light, desktop dark, mobile light, mobile dark | 4 |
| G2 | Home: Draft + Live Sunday | Both themes on desktop and mobile | 8 |
| G2 | Home: Playoffs + Offseason | Desktop and mobile in the primary theme for each state | 4 |
| G4 | Franchises | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G4 | Trades | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G4 | Draft | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G4 | Player Dossier | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G6 | League | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G6 | Records Vault | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G7 | League Office | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
| G7 | Clubhouse | Desktop light, mobile light, desktop dark, hostile/common-empty mobile | 4 |
|  | **Total** |  | **48** |

Live Sunday is a Home seasonal state and therefore does not add a ninth route experience.

## Tier B: automated and spot-reviewed

Tablet layouts, secondary hostile-state themes, loading, partial, error, pending, success,
additional seasonal states, and authentication combinations are blocking tests without an
individual ceremonial approval requirement.

## Approval scorecard

Aaron scores every Tier A capture from 1–5:

1. Immediate answer.
2. Fantasy-football familiarity.
3. Harambe's Dozen identity.
4. Depth without excessive reading.
5. Visual craft and hierarchy.
6. Mobile intentionality.
7. Material improvement over Sleeper for the assigned job.

Approval requires explicit **approved**, every category at least 4, no hard rejection, and
a re-capture of every requested correction. Deviations from approved references are recorded
in the decision ledger.

## Automatic tripwires

- Home, League, Franchises, Trades, and Draft: at most 120 words of running body copy in the first viewport, excluding names, labels, and data.
- League Office and Clubhouse: at most 180 first-viewport words.
- No more than three visually identical sibling containers dominate a viewport.
- Franchises, Draft, and Player Dossier reserve at least 30% of the first composition for player imagery or meaningful data visualization.
- Each route has one unmistakable dominant element; when type is the anchor, its headline or primary statistic is at least 2.5× body size.
- Franchise is player-first, Draft board/pool-first, and Trades lane/tree-first.
- Verified provenance badges do not repeat across ordinary content.
- Every route names one league-specific element that cannot exist on a generic fantasy platform.

Tripwires are warning floors, not the quality ceiling.

## Gate status

| Gate | Exit condition | Current state |
| --- | --- | --- |
| G0 | Ledger, assets, references, target, tripwires, Tier A list complete | In implementation |
| G1 | Four specimen captures explicitly approved | In implementation |
| G2 | Four-state Golden Home visually approved | Blocked by G1 |
| G3 | Golden Home live, tested, Aaron + trusted reviewer usability pass | Blocked by G2 |
| G4 | Franchises, Trades, Draft, Dossier compositions and blueprints approved | Blocked by G3 |
| G5 | Core routes live; midpoint coherence review complete | Blocked by G4 |
| G6 | League, Sunday replay, Records live; tone pack approved | Blocked by G5 |
| G7 | Office and focused Clubhouse live and approved | Blocked by G6 |
| G8 | Integrated release review and beta rehearsal complete | Blocked by G7 |

## Capture reliability contract

Every capture records route, theme, session, state, fixture ID, viewport, device scale, and
clock. Fonts and images finish loading; animation is settled; reduced motion is enabled;
external nondeterminism is masked only when unavoidable. A visual test that flakes three
times is quarantined and repaired. Intentional changes use the supersession protocol rather
than a looser threshold.

