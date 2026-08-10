import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import type { DraftPickOwnership } from '../../domain/picks';
import type { LeagueTransaction } from '../../domain/transactions';
import { TradesPage } from './TradesPage';

const sleeperSource = {
  authority: 'sleeper' as const,
  state: 'live' as const,
  fetchedAt: '2026-08-10T12:00:00.000Z',
};

const completedTrade: LeagueTransaction = {
  id: 'tx-1',
  type: 'trade',
  status: 'complete',
  week: 2,
  createdAt: '2026-08-09T18:30:00.000Z',
  rosterIds: [2, 11],
  adds: { playerA: 2, playerC: 11 },
  drops: { playerB: 11 },
  draftPicks: [
    {
      season: '2027',
      round: 1,
      roster_id: 2,
      previous_owner_id: 4,
      owner_id: 11,
    },
  ],
  source: sleeperSource,
};

const transferredPick: DraftPickOwnership = {
  season: 2027,
  round: 1,
  originalRosterId: 2,
  previousOwnerRosterId: 4,
  currentOwnerRosterId: 11,
  transferred: true,
  source: sleeperSource,
};

describe('TradesPage', () => {
  it('turns an empty feed into an honest coverage report instead of a fake trade board', () => {
    render(<TradesPage snapshot={currentHomeSnapshot} />);

    expect(screen.getByRole('heading', { name: /^trade desk$/i })).toBeInTheDocument();
    expect(screen.getByText(/who moved, what changed, and what the record still cannot prove/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open league in sleeper/i })).toHaveAttribute(
      'href',
      `https://sleeper.com/leagues/${currentHomeSnapshot.leagueId}`,
    );

    const emptyState = screen.getByRole('region', { name: /transaction coverage/i });
    expect(within(emptyState).getByText(/no confirmed movement to explain yet/i)).toBeInTheDocument();
    expect(within(emptyState).getByText(/no trade conclusions are drawn from an empty feed/i)).toBeInTheDocument();
    expect(within(emptyState).getByText('12 clubs')).toBeInTheDocument();
    expect(within(emptyState).getByText('8 rounds')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /latest confirmed move/i })).not.toBeInTheDocument();
  });

  it('explains roster, contract-review, and draft-capital consequences from a completed trade', () => {
    render(
      <TradesPage
        snapshot={currentHomeSnapshot}
        transactions={[completedTrade]}
        tradedPicks={[transferredPick]}
      />,
    );

    const lead = screen.getByRole('region', { name: /latest confirmed move/i });
    expect(within(lead).getByRole('heading', { name: 'A.Woods ↔ Coach' })).toBeInTheDocument();
    expect(within(lead).getByText('2 players in')).toBeInTheDocument();
    expect(within(lead).getByText('1 player out')).toBeInTheDocument();
    expect(within(lead).getByText('1 pick moved')).toBeInTheDocument();
    expect(within(lead).getByText(/3 player ids need contract-ledger review/i)).toBeInTheDocument();
    expect(within(lead).getByText(/sleeper does not carry contract years, tags, or exemptions/i)).toBeInTheDocument();

    const footprint = screen.getByRole('table', { name: /franchise trade footprint/i });
    const woods = within(footprint).getByRole('row', { name: /a\.woods/i });
    expect(within(woods).getByText('1 in')).toBeInTheDocument();
    expect(within(woods).getByText('0 out')).toBeInTheDocument();
    expect(within(woods).getByText('1 original pick elsewhere')).toBeInTheDocument();
    const coach = within(footprint).getByRole('row', { name: /coach/i });
    expect(within(coach).getByText('1 in')).toBeInTheDocument();
    expect(within(coach).getByText('1 out')).toBeInTheDocument();
    expect(within(coach).getByText('1 acquired pick')).toBeInTheDocument();
  });

  it('shows the known pick path and labels the limit of Sleeper provenance', () => {
    render(
      <TradesPage
        snapshot={currentHomeSnapshot}
        transactions={[completedTrade]}
        tradedPicks={[transferredPick]}
      />,
    );

    const provenance = screen.getByRole('region', { name: /pick ownership paths/i });
    expect(within(provenance).getByText('2027 Round 1')).toBeInTheDocument();
    expect(within(provenance).getByText('A.Woods → Slippery007 → Coach')).toBeInTheDocument();
    expect(within(provenance).getByText(/original → previous → current/i)).toBeInTheDocument();
    expect(within(provenance).getByText(/not a complete transaction-by-transaction audit trail/i)).toBeInTheDocument();

    const history = screen.getByRole('region', { name: /transaction history/i });
    expect(within(history).getByText(/player movement and draft capital changed hands/i)).toBeInTheDocument();
  });

  it('withholds unconfirmed records and still reports verified pick-only movement', () => {
    render(
      <TradesPage
        snapshot={currentHomeSnapshot}
        transactions={[{ ...completedTrade, status: 'pending' }]}
        tradedPicks={[transferredPick]}
      />,
    );

    expect(screen.getByText('1 unconfirmed record withheld')).toBeInTheDocument();
    expect(screen.getByText(/no completed record means no deal is presented as final/i)).toBeInTheDocument();
    expect(screen.getByText(/pick movement is available even though transaction history is not/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /pick ownership paths/i })).toBeInTheDocument();
  });
});
