import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import type { DraftPickOwnership } from '../../domain/picks';
import type { LeagueTransaction } from '../../domain/transactions';
import { TradesPage } from './TradesPage';

describe('TradesPage', () => {
  it('shows factual draft context and an honest empty transaction state', () => {
    render(<TradesPage snapshot={currentHomeSnapshot} />);

    expect(screen.getByRole('heading', { name: /trades & pick ledger/i })).toBeInTheDocument();
    expect(screen.getByText(/moves execute on sleeper/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open league in sleeper/i })).toHaveAttribute(
      'href',
      `https://sleeper.com/leagues/${currentHomeSnapshot.leagueId}`,
    );
    expect(screen.getByText(/does not mean no moves have occurred/i)).toBeInTheDocument();

    const order = screen.getByRole('list', { name: /2026 round 1 draft position context/i });
    expect(within(order).getAllByRole('listitem')).toHaveLength(12);
    expect(within(order).getByText('1.03')).toBeInTheDocument();
    expect(within(order).getByText('A.Woods')).toBeInTheDocument();
  });

  it('resolves normalized transaction and traded-pick roster ids to franchise names', () => {
    const transactions: LeagueTransaction[] = [
      {
        id: 'tx-1',
        type: 'trade',
        status: 'complete',
        week: 2,
        createdAt: '2026-08-09T18:30:00.000Z',
        rosterIds: [2, 11],
        adds: { playerA: 2 },
        drops: { playerB: 11 },
        draftPicks: [{ season: '2027', round: 1 }],
        source: {
          authority: 'sleeper',
          state: 'live',
          fetchedAt: '2026-08-10T12:00:00.000Z',
        },
      },
    ];
    const tradedPicks: DraftPickOwnership[] = [
      {
        season: 2027,
        round: 1,
        originalRosterId: 2,
        currentOwnerRosterId: 11,
        previousOwnerRosterId: 2,
        transferred: true,
        source: {
          authority: 'sleeper',
          state: 'live',
          fetchedAt: '2026-08-10T12:00:00.000Z',
        },
      },
    ];

    render(
      <TradesPage
        snapshot={currentHomeSnapshot}
        transactions={transactions}
        tradedPicks={tradedPicks}
      />,
    );

    const activity = screen.getByRole('region', { name: /confirmed activity/i });
    expect(within(activity).getByText('A.Woods ↔ Coach')).toBeInTheDocument();
    expect(within(activity).getByText(/1 player added · 1 player dropped · 1 pick asset/i)).toBeInTheDocument();

    const ledger = screen.getByRole('region', { name: /confirmed pick transfers/i });
    expect(within(ledger).getByText('2027 Round 1')).toBeInTheDocument();
    expect(within(ledger).getByText(/A.Woods → Coach/i)).toBeInTheDocument();
  });
});
