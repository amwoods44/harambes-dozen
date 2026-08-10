# Front Office Dossiers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn League Office and Franchises into evidence-backed operational dossiers and publish a privacy-safe review deployment.

**Architecture:** Add two pure domain modules that derive rule authority, ledger health, roster rooms, contract runway, pick ownership, transaction movement, and verified history. Route components consume those derived view models, keep member/public rendering separate, and preserve the existing editorial shell. Sleeper remains the live ownership/transaction source; the private contract repository remains member-only.

**Tech Stack:** React 19, TypeScript 5.9, Vitest, Testing Library, Vite 7, Firebase client libraries, Firebase Hosting configuration, existing CSS design tokens.

## Global Constraints

- The approved composition and visual character in `v2/DESIGN.md` govern both routes.
- The 2022 constitution is legacy context and never current authority unless an individual rule is separately commissioner-confirmed.
- No player rankings, roster grades, contention labels, historical records, or contract values may be invented.
- Public markup may not contain manager names, Sleeper avatar URLs, player ownership, contract years, exemptions, or private player IDs.
- Cached Sleeper data must be labeled cached; only current Sleeper responses may be labeled live.
- Production bundles must not contain `data/contracts.csv`.
- All behavior changes use red-green-refactor: run the focused test and observe the expected failure before implementation.

---

### Task 1: Rule Authority and Ledger Health Domain

**Files:**
- Create: `v2/src/domain/leagueOffice.ts`
- Create: `v2/src/domain/leagueOffice.test.ts`

**Interfaces:**
- Consumes: `HomeSnapshot`, `ContractPlayer`, and `ViewerSession`.
- Produces: `leagueRuleRegister`, `deriveLedgerHealth(snapshot, contracts)`, `ruleStatusLabel(status)`, `LeagueRuleRecord`, and `LedgerHealth`.

- [ ] **Step 1: Write failing authority tests**

Create `v2/src/domain/leagueOffice.test.ts` with tests that require eight rule groups, verify the seven current confirmations, ensure exemptions are not restricted to expiring contracts, and ensure waivers/playoffs remain unresolved:

```ts
import { describe, expect, it } from 'vitest';
import { currentHomeSnapshot } from '../data/currentLeague';
import { parseContractLedger } from '../data/contractLedger';
import { deriveLedgerHealth, leagueRuleRegister } from './leagueOffice';

describe('league office domain', () => {
  it('separates commissioner-confirmed rules from unresolved legacy topics', () => {
    expect(new Set(leagueRuleRegister.map((rule) => rule.group)).size).toBe(8);
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'roster-wide-receivers',
      statement: 'Start three wide receivers.',
      status: 'commissioner-confirmed',
    }));
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'waiver-procedure',
      status: 'unresolved',
    }));
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'exemption-renegotiation',
      statement: 'An exemption may renegotiate any contract regardless of years remaining.',
      status: 'commissioner-confirmed',
      effectiveSeason: null,
    }));
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'playoff-format',
      status: 'unresolved',
    }));
  });

  it('reports private ledger coverage against current Sleeper ownership', () => {
    const contracts = parseContractLedger(
      '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
      '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","2024",""\n' +
      '"Jarquez Hunter","RB","LAR","A.Woods","11569","","None","None",""\n',
    );
    const snapshot = {
      ...currentHomeSnapshot,
      franchises: currentHomeSnapshot.franchises.map((franchise) =>
        franchise.rosterId === 2 ? { ...franchise, playerIds: ['4046', '11569', 'missing'] } : franchise,
      ),
    };

    expect(deriveLedgerHealth(snapshot, contracts)).toEqual({
      totalRecords: 2,
      currentRosterPlayers: 3,
      matchedRosterPlayers: 2,
      correctedRecords: 1,
      oneYearDecisions: 0,
      twoYearWatch: 0,
      unmatchedRosterIds: ['missing'],
    });
  });
});
```

- [ ] **Step 2: Run the domain test and confirm RED**

Run: `pnpm exec vitest run src/domain/leagueOffice.test.ts`

Expected: FAIL because `./leagueOffice` does not exist.

- [ ] **Step 3: Implement the domain module**

Create `v2/src/domain/leagueOffice.ts` with these exact exported types and helpers:

```ts
import type { ContractPlayer } from '../data/contractLedger';
import type { HomeSnapshot } from '../data/currentLeague';

export type RuleAuthorityStatus =
  | 'commissioner-confirmed'
  | 'sleeper-live'
  | 'historical-correction'
  | 'legacy'
  | 'unresolved';

export type RuleGroup =
  | 'Roster configuration'
  | 'Scoring'
  | 'Contracts and extensions'
  | 'Exemptions'
  | 'Draft operations'
  | 'Trading'
  | 'Waivers and free agency'
  | 'Playoffs and competition';

export interface LeagueRuleRecord {
  id: string;
  group: RuleGroup;
  statement: string;
  status: RuleAuthorityStatus;
  effectiveSeason: number | null;
  sourceNote: string;
}

export interface LedgerHealth {
  totalRecords: number;
  currentRosterPlayers: number;
  matchedRosterPlayers: number;
  correctedRecords: number;
  oneYearDecisions: number;
  twoYearWatch: number;
  unmatchedRosterIds: string[];
}
```

Populate `leagueRuleRegister` with these records:

```ts
export const leagueRuleRegister: readonly LeagueRuleRecord[] = [
  { id: 'roster-wide-receivers', group: 'Roster configuration', statement: 'Start three wide receivers.', status: 'commissioner-confirmed', effectiveSeason: 2026, sourceNote: 'Commissioner confirmation supplied August 2026.' },
  { id: 'roster-kicker', group: 'Roster configuration', statement: 'No kicker roster slot.', status: 'commissioner-confirmed', effectiveSeason: null, sourceNote: 'Current configuration confirmed; change season remains unverified.' },
  { id: 'roster-ir', group: 'Roster configuration', statement: 'One injured-reserve slot.', status: 'commissioner-confirmed', effectiveSeason: 2026, sourceNote: 'Commissioner confirmation supplied August 2026.' },
  { id: 'scoring-fumbles', group: 'Scoring', statement: 'Ordinary fumbles score zero.', status: 'commissioner-confirmed', effectiveSeason: 2026, sourceNote: 'Commissioner confirmation supplied August 2026.' },
  { id: 'extensions-eligibility', group: 'Contracts and extensions', statement: 'Only players with one contract year remaining qualify for an extension.', status: 'commissioner-confirmed', effectiveSeason: 2026, sourceNote: 'Commissioner confirmation supplied August 2026.' },
  { id: 'exemption-renegotiation', group: 'Exemptions', statement: 'An exemption may renegotiate any contract regardless of years remaining.', status: 'commissioner-confirmed', effectiveSeason: null, sourceNote: 'Current rule confirmed August 2026; the believed 2024 change year remains unverified.' },
  { id: 'exemption-deadline', group: 'Exemptions', statement: 'Exemption declarations are normally due Memorial Day by end of day.', status: 'commissioner-confirmed', effectiveSeason: 2026, sourceNote: 'Current operating practice confirmed August 2026.' },
  { id: 'draft-board', group: 'Draft operations', statement: 'Draft order, format, and execution follow the current Sleeper league and draft settings.', status: 'sleeper-live', effectiveSeason: 2026, sourceNote: 'Sleeper league and draft endpoints.' },
  { id: 'trade-deadline', group: 'Trading', statement: 'The current Sleeper trade-deadline setting governs.', status: 'sleeper-live', effectiveSeason: 2026, sourceNote: 'Sleeper league settings; exact week should be displayed when available.' },
  { id: 'waiver-procedure', group: 'Waivers and free agency', statement: 'Current waiver timing and priority procedure require commissioner confirmation.', status: 'unresolved', effectiveSeason: null, sourceNote: 'The 2022 constitution is legacy context only.' },
  { id: 'playoff-format', group: 'Playoffs and competition', statement: 'Current playoff field, seeding, and anti-tanking procedure require confirmation.', status: 'unresolved', effectiveSeason: null, sourceNote: 'Do not promote the 2022 language without a current ruling.' },
];
```

Implement `deriveLedgerHealth` by building a set of all current `playerIds`, matching by `sleeperPlayerId`, counting corrections and one-/two-year records only among matched players, and returning sorted unmatched IDs. Implement `ruleStatusLabel` with human-readable labels matching the design spec.

- [ ] **Step 4: Run the domain test and confirm GREEN**

Run: `pnpm exec vitest run src/domain/leagueOffice.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add v2/src/domain/leagueOffice.ts v2/src/domain/leagueOffice.test.ts
git commit -m "feat(office): model rule authority and ledger health"
```

---

### Task 2: Franchise Dossier Domain

**Files:**
- Create: `v2/src/domain/franchiseDossier.ts`
- Create: `v2/src/domain/franchiseDossier.test.ts`

**Interfaces:**
- Consumes: `HomeSnapshot`, `ContractPlayer[]`, `DraftPickOwnership[]`, `LeagueTransaction[]`, and a roster ID.
- Produces: `buildFranchiseDossier(input): FranchiseDossier`, including position rooms, contract runway, pick ledger, movement, and verified finishes.

- [ ] **Step 1: Write failing dossier derivation tests**

Create fixtures for roster 2 containing one QB at 4Y, one RB at 2Y, one WR at 1Y, and one unmatched ID. Add incoming and outgoing traded picks and two transactions, only one of which touches roster 2. Assert:

```ts
const dossier = buildFranchiseDossier({
  snapshot,
  rosterId: 2,
  contracts,
  tradedPicks,
  transactions,
});

expect(dossier.positionRooms.QB.map((player) => player.playerName)).toEqual(['Patrick Mahomes']);
expect(dossier.positionRooms.UNMATCHED).toHaveLength(1);
expect(dossier.runway).toMatchObject({ oneYear: 1, twoYear: 1, longControl: 1, unknown: 1 });
expect(dossier.picks.incoming).toHaveLength(1);
expect(dossier.picks.outgoing).toHaveLength(1);
expect(dossier.movements).toHaveLength(1);
expect(dossier.finishes).toContainEqual(expect.objectContaining({ season: 2024, result: 'Champion' }));
```

- [ ] **Step 2: Run the dossier test and confirm RED**

Run: `pnpm exec vitest run src/domain/franchiseDossier.test.ts`

Expected: FAIL because `./franchiseDossier` does not exist.

- [ ] **Step 3: Implement `buildFranchiseDossier`**

Export these types:

```ts
export type PositionRoomKey = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'OTHER' | 'UNMATCHED';

export interface DossierPlayer {
  sleeperPlayerId: string;
  playerName: string;
  position: string;
  nflTeam: string;
  yearsRemaining: number | null;
  tag: string | null;
  exemption: string | null;
  authority: ContractPlayer['authority'];
}

export interface FranchiseDossier {
  franchise: FranchiseSnapshot;
  openingPick: number | null;
  positionRooms: Record<PositionRoomKey, DossierPlayer[]>;
  runway: { oneYear: number; twoYear: number; longControl: number; unknown: number };
  picks: { incoming: DraftPickOwnership[]; outgoing: DraftPickOwnership[] };
  movements: LeagueTransaction[];
  finishes: Array<{ season: number; result: 'Champion' | 'Runner-up' }>;
}
```

Rules:

- Normalize `DST` to `DEF`; unrecognized positions go to `OTHER`.
- Create unmatched rows using only the exact label `Contract record not matched`; do not infer name, team, or position.
- Sort matched players by contract years ascending, then player name.
- Incoming picks have `currentOwnerRosterId === rosterId && originalRosterId !== rosterId`.
- Outgoing picks have `originalRosterId === rosterId && currentOwnerRosterId !== rosterId`.
- Movements are completed transactions whose `rosterIds` include the roster, newest first, limited to five.
- Finishes compare the franchise name to `sleeperEraChampions` champion and runner-up fields.

- [ ] **Step 4: Run the dossier test and confirm GREEN**

Run: `pnpm exec vitest run src/domain/franchiseDossier.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add v2/src/domain/franchiseDossier.ts v2/src/domain/franchiseDossier.test.ts
git commit -m "feat(franchises): derive evidence-backed club dossiers"
```

---

### Task 3: League Office Operational Dossier

**Files:**
- Modify: `v2/src/App.tsx`
- Modify: `v2/src/pages/office/LeagueOfficePage.tsx`
- Modify: `v2/src/pages/office/LeagueOfficePage.test.tsx`

**Interfaces:**
- Consumes: `snapshot`, `session`, and `contracts` from `App`.
- Produces: member-aware rule register, docket, ledger-health panel, and legacy archive.

- [ ] **Step 1: Extend route tests before production code**

Add tests requiring:

1. All eight rule groups.
2. Visible `Commissioner confirmed`, `Sleeper live`, and `Unresolved` labels.
3. Waiver and playoff statements under unresolved status.
4. Member-only contract-ledger health statistics.
5. No contract statistics in public markup.
6. The 2022 archive explicitly says it is not current authority.

Use `parseContractLedger` and a snapshot with known `playerIds`; render once with `{ kind: 'member', userId: '393634863552425984' }` and once with `{ kind: 'public' }`.

- [ ] **Step 2: Run the Office route test and confirm RED**

Run: `pnpm exec vitest run src/pages/office/LeagueOfficePage.test.tsx`

Expected: FAIL because the page does not accept `session`/`contracts` or render the required register and health view.

- [ ] **Step 3: Update the route contract in `App.tsx`**

Replace the League Office switch branch with:

```tsx
case 'league-office':
  page = (
    <LeagueOfficePage
      snapshot={snapshot}
      session={session}
      contracts={contracts}
    />
  );
  break;
```

- [ ] **Step 4: Rebuild `LeagueOfficePage.tsx` around derived facts**

Change props to:

```ts
export interface LeagueOfficePageProps {
  snapshot: HomeSnapshot;
  session: ViewerSession;
  contracts?: ContractPlayer[];
}
```

Render these named regions in order:

- `League Office status`
- `Current rule register`
- `Offseason docket`
- `Contract ledger health` only for members
- `2022 constitution archive`

Group `leagueRuleRegister` by `RuleGroup`. Each rule row shows statement, `ruleStatusLabel`, effective season (`Effective 2026` or `Effective season unverified`), and source note. The masthead scoreboard shows season, league phase, confirmed count, and unresolved count. Use `deriveLedgerHealth` only inside the member branch.

- [ ] **Step 5: Run the Office route test and confirm GREEN**

Run: `pnpm exec vitest run src/pages/office/LeagueOfficePage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add v2/src/App.tsx v2/src/pages/office/LeagueOfficePage.tsx v2/src/pages/office/LeagueOfficePage.test.tsx
git commit -m "feat(office): publish the operational rule dossier"
```

---

### Task 4: Interactive Franchise Dossier

**Files:**
- Modify: `v2/src/App.tsx`
- Modify: `v2/src/pages/franchises/FranchisesPage.tsx`
- Modify: `v2/src/pages/franchises/FranchisesPage.test.tsx`

**Interfaces:**
- Consumes: `snapshot`, `session`, `contracts`, `transactions`, and `tradedPicks`.
- Produces: a privacy-separated public directory and member-only selected-club dossier.

- [ ] **Step 1: Extend Franchise tests before production code**

Add tests that require:

- A selected club button with `aria-pressed="true"`.
- Clicking another club updates the dossier heading.
- Position rooms for QB/RB/WR/TE/DEF/unmatched.
- One-year, two-year, long-control, and unmatched runway totals.
- Incoming and outgoing pick groups that retain original/current owner semantics.
- Only transactions involving the selected roster.
- Verified champion and runner-up finishes.
- Public markup contains none of the private strings, player IDs, manager names, contract years, exemptions, or avatar URLs.

Use `userEvent.setup()` for club selection and real domain fixtures rather than mocked helper returns.

- [ ] **Step 2: Run the Franchise route test and confirm RED**

Run: `pnpm exec vitest run src/pages/franchises/FranchisesPage.test.tsx`

Expected: FAIL because the route has no pick ledger, movement, history, runway, position rooms, or selected-state semantics.

- [ ] **Step 3: Pass transaction and pick inputs from `App.tsx`**

Replace the Franchises switch branch with:

```tsx
case 'franchises':
  page = (
    <FranchisesPage
      snapshot={snapshot}
      session={session}
      contracts={contracts}
      transactions={transactions}
      tradedPicks={tradedPicks}
    />
  );
  break;
```

- [ ] **Step 4: Rebuild `FranchisesPage.tsx`**

Extend props with optional `transactions` and `tradedPicks` arrays. Keep the public directory branch structurally separate from the member dossier branch so private values never enter public elements.

The member branch renders:

1. A horizontal twelve-club selector with `aria-pressed`.
2. `Franchise identity` masthead with portrait, franchise, manager, opening pick, roster count, and verified finishes.
3. `Contract pressure report` with four evidence-backed runway numbers and a sentence based only on those counts. The copy must distinguish ordinary one-year extension eligibility from exemptions, which may renegotiate any contract regardless of years remaining.
4. `Roster position rooms` with one section per non-empty room.
5. `Draft capital ledger` with separate incoming/outgoing lists.
6. `Verified roster movement` with up to five transactions.
7. `Verified franchise history` with champion/runner-up rows or an honest empty state.

Do not render words such as `contender`, `rebuild`, `elite`, `weak`, or `grade`. Do not label only one-year players as exemption eligible.

- [ ] **Step 5: Run the Franchise route test and confirm GREEN**

Run: `pnpm exec vitest run src/pages/franchises/FranchisesPage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```bash
git add v2/src/App.tsx v2/src/pages/franchises/FranchisesPage.tsx v2/src/pages/franchises/FranchisesPage.test.tsx
git commit -m "feat(franchises): deliver interactive club dossiers"
```

---

### Task 5: Editorial Styling, Themes, and Responsive Behavior

**Files:**
- Modify: `v2/src/pages/office/LeagueOfficePage.css`
- Modify: `v2/src/pages/franchises/FranchisesPage.css`
- Modify: `v2/src/styles.css` only if a shared token is genuinely required by both routes

**Interfaces:**
- Consumes: semantic class names introduced in Tasks 3 and 4.
- Produces: independently art-directed day/night desktop and mobile presentations.

- [ ] **Step 1: Start the development server and capture the failing visual baseline**

Run: `pnpm dev --host 127.0.0.1 --port 5176`

Capture League Office and Franchises at 1440×1000 and 390×844 in day and night themes. Record overflow and obvious hierarchy problems before styling.

- [ ] **Step 2: Style League Office as an operations desk**

Implement:

- A navy editorial masthead with red phase indicator and four-column scoreboard.
- A two-column desktop rule register with group dividers, thin gold rules, and status stamps that include text.
- Calendar-forward docket cards using month/day blocks.
- A member ledger-health strip with tabular numbers and a clearly labeled unmatched-record action state.
- A cream/red archive treatment in day mode and charcoal/red document-vault treatment in night mode.
- Mobile stacking at 760px with no text smaller than 11px for operational copy.

- [ ] **Step 3: Style Franchises as a club media guide**

Implement:

- A compact horizontal club selector with sports-headshot portraits and visible selected state.
- A selected-club masthead using the club accent as a restrained rule/highlight rather than a full-card rainbow.
- Position-room sections with media-guide roster rows.
- A contract runway scoreboard with signal red reserved for one-year decisions.
- Separate pick-ledger and transaction columns on desktop, stacked on mobile.
- Verified-history banners that use the real trophy language without adding unverified records.
- A public directory that remains polished but visibly limited.

- [ ] **Step 4: Capture the complete route matrix**

Run: `node scripts/capture-routes.mjs http://127.0.0.1:5176/`

Additionally capture night-mode League Office and Franchises at desktop/mobile sizes. Confirm `documentWidth === viewportWidth` in all four new route/theme combinations.

- [ ] **Step 5: Commit Task 5**

```bash
git add v2/src/pages/office/LeagueOfficePage.css v2/src/pages/franchises/FranchisesPage.css v2/src/styles.css
git commit -m "style: art-direct front office dossiers"
```

---

### Task 6: Privacy, Regression, and Production Verification

**Files:**
- Modify: `v2/src/App.test.tsx` only if route-level integration assertions are missing
- Modify: `v2/README.md`

**Interfaces:**
- Consumes: completed domain and route implementation.
- Produces: verified private/public behavior and current documentation.

- [ ] **Step 1: Add an integration privacy assertion if absent**

Render the App at `#/franchises` and `#/league-office` with a public session. Assert the document does not contain `Patrick Mahomes`, `4046`, `4Y`, `Conman4`, `sleepercdn.com/avatars`, or `Exm`.

- [ ] **Step 2: Run focused tests**

Run:

```bash
pnpm exec vitest run \
  src/domain/leagueOffice.test.ts \
  src/domain/franchiseDossier.test.ts \
  src/pages/office/LeagueOfficePage.test.tsx \
  src/pages/franchises/FranchisesPage.test.tsx \
  src/App.test.tsx
```

Expected: all focused tests pass with zero unhandled errors.

- [ ] **Step 3: Run the complete verification suite**

Run:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: each command exits 0.

- [ ] **Step 4: Audit the production bundle for private source leakage**

Run:

```bash
rg -n "Patrick Mahomes|Jarquez Hunter|Contract Years|Fantasy Team|data/contracts.csv" dist
```

Expected: no matches from the private CSV or its distinctive contract content.

- [ ] **Step 5: Update README**

Document the new operational dossiers, their source boundaries, their public/member behavior, and the exact review-deployment mode.

- [ ] **Step 6: Commit Task 6**

```bash
git add v2/src/App.test.tsx v2/README.md
git commit -m "test: verify dossier privacy and production boundaries"
```

---

### Task 7: Publish the Review Build

**Files:**
- Modify: `v2/firebase.json`
- Create only if a Firebase project is selected: `v2/.firebaserc`

**Interfaces:**
- Consumes: verified `v2/dist` output.
- Produces: a stable public review URL labeled as either authenticated member deployment or privacy-safe demo.

- [ ] **Step 1: Add Firebase Hosting configuration**

Extend `v2/firebase.json` with:

```json
{
  "firestore": { "rules": "firestore.rules" },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

- [ ] **Step 2: Rebuild immediately before deployment**

Run: `pnpm build`

Expected: exit 0 and a fresh `dist/index.html`.

- [ ] **Step 3: Identify an authenticated Firebase project**

Run: `firebase projects:list`

If an existing Harambe's Dozen Firebase project is available, set it in `.firebaserc`. If no authenticated project exists, stop before creating external infrastructure and report that the only blocker is Firebase project selection/sign-in.

- [ ] **Step 4: Deploy a Hosting preview channel**

Run: `firebase hosting:channel:deploy front-office-dossiers --expires 30d`

Expected: Firebase returns an HTTPS preview URL.

- [ ] **Step 5: Rehearse the deployed public boundary**

Open the returned URL at Home, League Office, and Franchises. Confirm the public directory renders, private roster/contracts do not appear, navigation works, and no console errors occur.

- [ ] **Step 6: Commit hosting configuration**

```bash
git add v2/firebase.json v2/.firebaserc v2/README.md
git commit -m "chore: configure dossier review deployment"
```

- [ ] **Step 7: Handoff**

Report the stable URL, its expiration date, whether it is a privacy-safe demo or authenticated member build, the verification counts, and any external configuration still required for invitation-only member access.
