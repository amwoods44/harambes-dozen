# Harambe's Dozen V2

The private-beta rebuild of the Harambe's Dozen league companion. V2 lives beside the
current site and does not replace production.

## Current build

The implemented private-beta build contains all seven primary areas: Home, League,
Franchises, Trades, Draft, League Office, and Clubhouse. The approved sports-editorial
Day/Night design system is shared across desktop and mobile.

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
node scripts/capture.mjs
node scripts/capture-routes.mjs http://127.0.0.1:5173/
```

The capture scripts write the Home theme matrix to `artifacts/visual-qa/` and the seven-
route desktop/mobile matrix to `artifacts/route-qa/`.

## Source authority

1. Sleeper: league settings, users, rosters, draft metadata, and draft order.
2. Versioned commissioner overlays: contracts, exemptions, current rules, dues, and
   corrections.
3. Explicit historical corrections.
4. The 2022 constitution as legacy context only.

## Remaining deployment configuration

- Create/select the Firebase project and copy `.env.example` to `.env.local` with its
  public web configuration.
- Enable email-link sign-in and populate the 12 `members/{uid}` identity records.
- Import the normalized contract ledger into the private `contracts/{sleeperPlayerId}`
  collection; never place it in the public hosting directory.
- Deploy `firestore.rules`, then run a private member/public privacy rehearsal.
- Server-side Sleeper fan-out and commissioner editing remain future backend slices;
  Sleeper is still the official execution surface for drafts and transactions.
