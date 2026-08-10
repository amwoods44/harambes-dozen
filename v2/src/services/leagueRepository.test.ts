import { describe, expect, it, vi } from 'vitest';

import {
  sleeperDraftFixture,
  sleeperOffseasonTransactionFixture,
  sleeperRostersFixture,
  sleeperTradedPicksFixture,
  sleeperUsersFixture,
} from '../test/fixtures/sleeper';
import { createSleeperRepository } from './leagueRepository';

const leagueFixture = {
  league_id: '1334235260409380864',
  name: "Harambe's Dozen",
  season: '2026',
  status: 'pre_draft',
  draft_id: sleeperDraftFixture.draft_id,
};

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Sleeper league repository', () => {
  it('joins live league, franchise, and draft data into a normalized Home snapshot', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/rosters')) return jsonResponse(sleeperRostersFixture);
      if (url.endsWith('/users')) return jsonResponse(sleeperUsersFixture);
      if (url.includes('/draft/')) return jsonResponse(sleeperDraftFixture);
      return jsonResponse(leagueFixture);
    }) as typeof fetch;

    const snapshot = await createSleeperRepository(fetcher).loadHome();

    expect(snapshot.source).toMatchObject({ authority: 'sleeper', state: 'live' });
    expect(snapshot.franchises).toContainEqual(
      expect.objectContaining({ franchiseName: 'A.Woods', playerCount: 0 }),
    );
    expect(snapshot.draft.order).toContainEqual(
      expect.objectContaining({ slot: 3, rosterId: 2, franchiseName: 'A.Woods' }),
    );
    expect(snapshot.wire[0]).toMatchObject({
      headline: 'Commissioner of Power is officially on the clock',
      source: { authority: 'sleeper', state: 'live' },
    });
    expect(snapshot.deadlines.find((deadline) => deadline.id === '2026-draft-night')).toMatchObject({
      month: 'AUG',
      day: '21',
      source: { authority: 'sleeper', state: 'live' },
    });
    expect(fetcher).toHaveBeenCalledWith(
      `https://api.sleeper.app/v1/draft/${sleeperDraftFixture.draft_id}`,
    );
  });

  it('rejects a failed Sleeper request so the Home shell can keep its cached snapshot', async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 503 })) as typeof fetch;

    await expect(createSleeperRepository(fetcher).loadHome()).rejects.toThrow(
      'Sleeper request failed (503)',
    );
  });

  it('loads every offseason week and deduplicates confirmed transactions', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/transactions/')) return jsonResponse([sleeperOffseasonTransactionFixture]);
      return jsonResponse([]);
    }) as typeof fetch;

    const transactions = await createSleeperRepository(fetcher).loadTransactions!();

    expect(transactions).toHaveLength(1);
    expect(transactions[0].id).toBe(sleeperOffseasonTransactionFixture.transaction_id);
    expect(fetcher).toHaveBeenCalledTimes(18);
  });

  it('normalizes current traded-pick ownership from Sleeper', async () => {
    const fetcher = vi.fn(async () => jsonResponse(sleeperTradedPicksFixture)) as typeof fetch;

    const picks = await createSleeperRepository(fetcher).loadTradedPicks!();

    expect(picks[0]).toMatchObject({
      originalRosterId: 2,
      currentOwnerRosterId: 8,
      transferred: true,
    });
  });
});
