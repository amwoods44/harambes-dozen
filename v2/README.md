# Harambe's Dozen V2

The private-beta rebuild of the Harambe's Dozen league companion. V2 lives beside the
current site and does not replace production.

## No-drift implementation record

The current interface routes are a quarantined functional baseline while the approved V2 is
built through explicit visual gates. The authoritative product package is:

- `../docs/product/DECISION_LEDGER.md`
- `../docs/product/ASSET_MANIFEST.md`
- `../docs/product/REFERENCE_LIBRARY.md`
- `../docs/product/REVIEW_MATRIX.md`

No production route is considered visually approved merely because it is implemented or
covered by tests.

## Current build

The implemented private-beta build contains all seven primary areas: Home, League,
Franchises, Trades, Draft, League Office, and Clubhouse. The approved sports-editorial
Day/Night design system is shared across desktop and mobile.

## Front-office dossiers

League Office is the operating record, not a copy of the 2022 constitution. It separates
current commissioner confirmations, live Sleeper settings, unresolved questions, deadlines,
source authority, and member-only contract-ledger health. Ordinary extensions require one
contract year remaining. An exemption may renegotiate any contract regardless of years
remaining; the user believes that change began in 2024, but the effective season remains
explicitly unverified until a dated ruling is supplied.

Franchises is a selectable twelve-club directory. Members can open a club dossier containing
its live Sleeper roster joined to the private contract ledger, contract runway, original and
current draft-pick ownership, verified Sleeper transactions, and confirmed championship-game
finishes. The interface labels corrections and unmatched records instead of inventing missing
facts. Public visitors see club identity and opening-pick context only; manager portraits,
handles, player ownership, contract years, exemptions, transactions, and ledger health remain
private.

The UI starts from a verified 2026 snapshot and refreshes league, roster, user, and draft
data from Sleeper in the browser. Transactions are loaded across every Sleeper week so
offseason moves are not missed, and traded-pick ownership preserves Sleeper's original
and current-owner semantics.

Member franchise views join live Sleeper player ownership to the 300+ row Contracts
Sheet snapshot by player ID. Direct 2026 manager corrections—including the declared
exemptions—override older Sheet values without modifying `data/contracts.csv`. Local
development reads that source file only after a member preview is active. Production
reads the normalized ledger from the rules-protected Firestore `contracts` collection;
the private ledger is not embedded in the public JavaScript bundle.

## Run locally

```sh
pnpm install
pnpm dev
```

Local development defaults to the A.Woods member preview. Use `?public=1` to inspect the
public privacy view or `?as=<sleeper-user-id>` to preview another member. Those query
parameters are disabled in production builds. Production uses invitation-only Firebase
email-link authentication when the four `VITE_FIREBASE_*` values are configured. Each
Firebase `members/{uid}` document must contain an active `sleeperUserId` and optional
`role: "admin"`; deny-by-default rules are included in `firestore.rules`. Contract
documents use the Sleeper player ID as their document ID and include `playerName`,
`position`, `nflTeam`, `yearsRemaining`, and optional `tag`, `exemption`, `notes`, and
`authority` fields.

## Quality gates

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm capture:specimen http://127.0.0.1:5177/
node scripts/capture.mjs
node scripts/capture-routes.mjs http://127.0.0.1:5173/
```

The capture scripts write the Home theme matrix to `artifacts/visual-qa/` and the seven-
route desktop/mobile matrix to `artifacts/route-qa/`.

The G1 command writes four deterministic review captures and metadata to
`artifacts/specimen-review/current/`. It compares them with an approved baseline when one
exists. A baseline can be recorded only after explicit approval by setting
`HD12_APPROVAL_ID` and adding `--record-approved-baseline`; the approval ID is written into
the capture manifest.

## Source authority

1. Sleeper: league settings, users, rosters, draft metadata, and draft order.
2. Versioned commissioner overlays: contracts, exemptions, current rules, dues, and
   corrections.
3. Explicit historical corrections.
4. The 2022 constitution as legacy context only.

## Remaining deployment configuration

The review-deployment mode is a privacy-safe public demo unless Firebase web configuration,
email-link authentication, and the private Firestore collections are supplied at build time.
The public demo is suitable for visual review because production defaults to a public session
and private contract source data is excluded from `dist`. It is not an authenticated member
deployment and cannot be used to review member dossiers on the hosted URL.

- Create/select the Firebase project and copy `.env.example` to `.env.local` with its
  public web configuration.
- Enable email-link sign-in and populate the 12 `members/{uid}` identity records.
- Import the normalized contract ledger into the private `contracts/{sleeperPlayerId}`
  collection; never place it in the public hosting directory.
- Deploy `firestore.rules`, then run a private member/public privacy rehearsal.
- Server-side Sleeper fan-out and commissioner editing remain future backend slices;
  Sleeper is still the official execution surface for drafts and transactions.
