import { describe, expect, it } from 'vitest';

import { normalizeContractRow } from './contracts';
import { normalizeDraft } from './draft';
import { normalizeTradedPick } from './picks';
import { collectTransactions, transactionWeeksForSeason } from './transactions';
import {
  sleeperDraftFixture,
  sleeperOffseasonTransactionFixture,
  sleeperRostersFixture,
  sleeperTradedPicksFixture,
  sleeperUsersFixture,
} from '../test/fixtures/sleeper';

describe('Sleeper draft-pick ownership', () => {
  it('keeps roster_id as the original team and owner_id as the current owner', () => {
    const pick = normalizeTradedPick(sleeperTradedPicksFixture[0]);

    expect(pick).toMatchObject({
      season: 2026,
      round: 2,
      originalRosterId: 2,
      currentOwnerRosterId: 8,
      previousOwnerRosterId: 2,
    });
  });
});

describe('offseason transactions', () => {
  it('requests the full Sleeper transaction range before any games are played', () => {
    expect(transactionWeeksForSeason({ status: 'pre_draft', completedWeeks: 0 })).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 1),
    );
  });

  it('keeps and deduplicates transactions returned from offseason week buckets', () => {
    const transactions = collectTransactions({
      1: [sleeperOffseasonTransactionFixture],
      18: [sleeperOffseasonTransactionFixture],
    });

    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      id: sleeperOffseasonTransactionFixture.transaction_id,
      type: 'trade',
      status: 'complete',
    });
  });
});

describe('pre-draft metadata', () => {
  it('joins draft slots to roster and franchise identity before picks exist', () => {
    const draft = normalizeDraft(
      sleeperDraftFixture,
      sleeperRostersFixture,
      sleeperUsersFixture,
    );

    expect(draft.status).toBe('pre_draft');
    expect(draft.rounds).toBe(8);
    expect(draft.startsAt).toBe('2026-08-22T00:00:47.000Z');
    expect(draft.order).toContainEqual(
      expect.objectContaining({
        slot: 3,
        rosterId: 2,
        franchiseName: 'A.Woods',
      }),
    );
  });
});

describe('contract expiration', () => {
  it('treats one year remaining as expiring and blank years as unknown', () => {
    expect(
      normalizeContractRow({
        sleeperPlayerId: '8151',
        playerName: 'Kenneth Walker',
        yearsRemaining: '1',
      }),
    ).toMatchObject({ yearsRemaining: 1, status: 'expiring' });

    expect(
      normalizeContractRow({
        sleeperPlayerId: '7588',
        playerName: 'Javonte Williams',
        yearsRemaining: '',
      }),
    ).toMatchObject({ yearsRemaining: null, status: 'unknown' });
  });
});

