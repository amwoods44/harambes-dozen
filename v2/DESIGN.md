# Harambe's Dozen Design Standard

> The authoritative no-drift decisions, baseline identifiers, and approval gates now live in
> `../docs/product/DECISION_LEDGER.md`. This file remains the concise visual standard.

## Product character

Harambe's Dozen is a private fantasy-football league companion for twelve friends. It should feel like a custom sports publication and front office, not a generic fantasy app, movie poster, or video-game menu. The tone is polished, competitive, and knowingly unserious.

## Acceptance target

The approved home composition is the paired light/dark editorial concept supplied on August 10, 2026:

- navy sports masthead with an oversized league crest
- compact Draft Night headline built as one editorial composition
- Harambe in a navy-and-gold letterman jacket
- My Franchise decision card
- all twelve Round 1 managers in a horizontal pick rail
- League Wire, calendar-style Deadlines, and Records Vault in one row
- the real two-handle gold league trophy wherever a championship trophy appears
- a mobile layout that feels purpose-built, not merely stacked

## Visual language

- Palette: deep navy, warm cream, antique gold, and signal red.
- Typography: condensed athletic display type for headlines and Source Sans for reading.
- Geometry: fine rules, compact corners, scoreboard alignment, and tabular numbers.
- Illustration: editorial sports photography, halftone/grain, play-diagram marks, and league-specific art.
- Avatars: real Sleeper manager portraits for members, framed as sports headshots. Public views use club emblems and never reveal manager identity.
- Themes: light and dark are separately art-directed. Dark mode is not a simple color inversion.

## Product-depth standard

Every page must answer a league question that Sleeper does not answer on its own.

- Home: What matters to my franchise right now?
- Draft: Where is the tier/drop-off risk, when do I pick again, and what information is still missing?
- Trades: What actually changed, what are the contract consequences, and where did each pick come from?
- Franchises: Who owns each player, what is the contract clock, and where is the roster pressure?
- League Office: Which source governs each rule, deadline, and correction?
- Records: Who won, who lost, and how the league's history connects?

Live data is plumbing. The product is the explanation layered on top of it.

## Hard rejection gates

- no generic dashboard-card mosaic as the primary composition
- no made-up player rankings, needs, contract terms, history, or transaction steps
- no exposing manager identities or contract data to public visitors
- no decorative illustration that turns the league into a movie/game universe
- no placeholder route that is reachable in navigation without a useful league job
- no mobile route that becomes unreachable from the primary navigation

The previous Front Office dossier page treatment is superseded as a visual foundation. Its
tested authority, privacy, and domain logic remain reusable, but new production routes must
pass the specimen and blueprint gates in `../docs/product/REVIEW_MATRIX.md`.
