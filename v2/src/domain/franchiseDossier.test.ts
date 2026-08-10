import { describe, expect, it } from 'vitest';

import { parseContractLedger } from '../data/contractLedger';
import { currentHomeSnapshot } from '../data/currentLeague';
import type { DraftPickOwnership } from './picks';
import { sourceStamp } from './source';
import type { LeagueTransaction } from './transactions';
import { buildFranchiseDossier } from './franchiseDossier';

const contracts = parseContractLedger(
  '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
  '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","2024",""\n' +
  '"Kyle Williams","RB","NE","A.Woods","12547","","None","None",""\n' +
  '"A.J. Brown","WR","PHI","A.Woods","wr1","1","Franchise","None",""\n',
);

const snapshot = {
  ...currentHomeSnapshot,
  franchises: currentHomeSnapshot.franchises.map((franchise) =>
    franchise.rosterId === 2
      ? { ...franchise, playerIds: ['4046', '12547', 'wr1', 'missing'] }
      : franchise,
  ),
};

const tradedPicks: DraftPickOwnership[] = [
  {
    season: 2027,
    round: 1,
    originalRosterId: 8,
    currentOwnerRosterId: 2,
    previousOwnerRosterId: 8,
    transferred: true,
    source: sourceStamp('sleeper'),
  },
  {
    season: 2027,
    round: 2,
    originalRosterId: 2,
    currentOwnerRosterId: 4,
    previousOwnerRosterId: 2,
    transferred: true,
    source: sourceStamp('sleeper'),
  },
];

const transactions: LeagueTransaction[] = [
  {
    id: 'involving-woods',
    type: 'trade',
    status: 'complete',
    week: 1,
    createdAt: '2026-08-09T18:00:00.000Z',
    rosterIds: [2, 4],
    adds: { '4046': 4 },
    drops: {},
    draftPicks: [],
    source: sourceStamp('sleeper'),
  },
  {
    id: 'other-clubs',
    type: 'trade',
    status: 'complete',
    week: 1,
    createdAt: '2026-08-10T18:00:00.000Z',
    rosterIds: [5, 6],
    adds: {},
    drops: {},
    draftPicks: [],
    source: sourceStamp('sleeper'),
  },
];

describe('franchise dossier domain', () => {
  it('derives position rooms, contract runway, capital, movement, and verified finishes', () => {
    const dossier = buildFranchiseDossier({
      snapshot,
      rosterId: 2,
      contracts,
      tradedPicks,
      transactions,
    });

    expect(dossier.positionRooms.QB.map((player) => player.playerName)).toEqual([
      'Patrick Mahomes',
    ]);
    expect(dossier.positionRooms.UNMATCHED).toHaveLength(1);
    expect(dossier.positionRooms.UNMATCHED[0]).toMatchObject({
      sleeperPlayerId: 'missing',
      playerName: 'Contract record not matched',
    });
    expect(dossier.runway).toEqual({ oneYear: 1, twoYear: 1, longControl: 1, unknown: 1 });
    expect(dossier.picks.incoming).toHaveLength(1);
    expect(dossier.picks.outgoing).toHaveLength(1);
    expect(dossier.movements.map((transaction) => transaction.id)).toEqual(['involving-woods']);
    expect(dossier.finishes).toContainEqual({ season: 2024, result: 'Champion' });
    expect(dossier.openingPick).toBe(3);
  });

  it('does not mistake a multi-year contract for ineligible exemption control', () => {
    const dossier = buildFranchiseDossier({
      snapshot,
      rosterId: 2,
      contracts,
      tradedPicks,
      transactions,
    });

    expect(dossier.positionRooms.QB[0]).toMatchObject({
      playerName: 'Patrick Mahomes',
      yearsRemaining: 4,
      exemption: '2024',
    });
  });
});
