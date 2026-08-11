import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import { parseContractLedger } from '../../data/contractLedger';
import type { DraftPickOwnership } from '../../domain/picks';
import { sourceStamp } from '../../domain/source';
import type { LeagueTransaction } from '../../domain/transactions';
import { FranchisesPage } from './FranchisesPage';

const testContracts = parseContractLedger(
  '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
  '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","2024",""\n' +
  '"Jarquez Hunter","RB","LAR","A.Woods","11569","","None","None",""\n' +
  '"Javonte Williams","RB","DAL","A.Woods","7588","","None","None",""\n' +
  '"Kyle Williams","WR","NE","A.Woods","12547","","None","None",""\n' +
  '"A.J. Brown","WR","PHI","A.Woods","wr1","1","Franchise","None",""\n',
);

const memberSnapshot = {
  ...currentHomeSnapshot,
  franchises: currentHomeSnapshot.franchises.map((franchise) =>
    franchise.rosterId === 2
      ? { ...franchise, playerIds: ['4046', '11569', '7588', '12547', 'wr1', 'missing'] }
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
    id: 'woods-trade',
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
    id: 'other-trade',
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

describe('FranchisesPage', () => {
  it('shows all public franchise identities and roster counts', () => {
    render(<FranchisesPage snapshot={currentHomeSnapshot} session={{ kind: 'public' }} />);

    const directory = screen.getByRole('list', { name: /league franchises/i });
    expect(within(directory).getAllByRole('listitem')).toHaveLength(12);

    const commissioner = within(directory).getByRole('article', {
      name: /commissioner of power franchise/i,
    });
    expect(within(commissioner).getByLabelText(/commissioner of power emblem/i)).toHaveTextContent(
      'CP',
    );
    expect(within(commissioner).getByText('20 players')).toBeInTheDocument();

    const woods = within(directory).getByRole('article', { name: /a\.woods franchise/i });
    expect(within(woods).getByText('22 players')).toBeInTheDocument();
    expect(screen.getByText('Brocked and Loaded')).toBeInTheDocument();
  });

  it('does not render manager names, portrait elements, or avatar URLs for public visitors', () => {
    const { container } = render(
      <FranchisesPage snapshot={currentHomeSnapshot} session={{ kind: 'public' }} />,
    );

    expect(screen.queryByText('Conman4')).not.toBeInTheDocument();
    expect(screen.queryByText('charlieklumb21')).not.toBeInTheDocument();
    expect(screen.queryByText('Manager')).not.toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('sleepercdn.com/avatars');
  });

  it('reveals manager names and available portraits only to members', () => {
    render(
      <FranchisesPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
      />,
    );

    expect(screen.getAllByText('Manager')).toHaveLength(12);
    expect(screen.getByText('Conman4')).toBeInTheDocument();
    expect(screen.getByAltText('Conman4 portrait')).toHaveAttribute(
      'src',
      'https://sleepercdn.com/avatars/thumbs/82aec8e811b839b8ec25d7b458afd57b',
    );

    const ownFranchise = screen.getByRole('article', { name: /a\.woods franchise/i });
    expect(within(ownFranchise).getByText('Your franchise')).toBeInTheDocument();
    expect(within(ownFranchise).getByText('AWoods')).toBeInTheDocument();
  });

  it('joins live Sleeper ownership to corrected contract years by player ID', () => {
    render(
      <FranchisesPage
        snapshot={memberSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={testContracts}
        transactions={transactions}
        tradedPicks={tradedPicks}
      />,
    );

    const roster = screen.getByRole('region', { name: /roster position rooms/i });
    expect(within(roster).getByText('Patrick Mahomes')).toBeInTheDocument();
    expect(within(roster).getByText('Jarquez Hunter')).toBeInTheDocument();
    expect(within(roster).getAllByText('3Y')).toHaveLength(2);
    expect(within(roster).getByText('4Y')).toBeInTheDocument();
  });

  it('builds the selected club dossier from contracts, picks, movement, and verified history', () => {
    render(
      <FranchisesPage
        snapshot={memberSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={testContracts}
        transactions={transactions}
        tradedPicks={tradedPicks}
      />,
    );

    expect(screen.getByRole('button', { name: /select a\.woods/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /a\.woods franchise dossier/i })).toBeInTheDocument();

    const runway = screen.getByRole('region', { name: /contract pressure report/i });
    expect(within(runway).getByText('1-year decisions')).toBeInTheDocument();
    expect(within(runway).getByText('Two-year watch')).toBeInTheDocument();
    expect(within(runway).getByText('Long control')).toBeInTheDocument();
    expect(within(runway).getByText('Unmatched')).toBeInTheDocument();
    expect(within(runway).getByText(/exemption may renegotiate any contract/i)).toBeInTheDocument();

    const capital = screen.getByRole('region', { name: /draft capital ledger/i });
    expect(within(capital).getByText('2027 Round 1')).toBeInTheDocument();
    expect(within(capital).getByText('2027 Round 2')).toBeInTheDocument();

    const movement = screen.getByRole('region', { name: /verified roster movement/i });
    expect(within(movement).getByText('woods-trade')).toBeInTheDocument();
    expect(within(movement).queryByText('other-trade')).not.toBeInTheDocument();

    const history = screen.getByRole('region', { name: /verified franchise history/i });
    expect(within(history).getByText('2024 Champion')).toBeInTheDocument();
  });

  it('switches the dossier when another club is selected', async () => {
    const user = userEvent.setup();
    render(
      <FranchisesPage
        snapshot={memberSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={testContracts}
        transactions={transactions}
        tradedPicks={tradedPicks}
      />,
    );

    const coach = screen.getByRole('button', { name: /select coach/i });
    await user.click(coach);

    expect(coach).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: /coach franchise dossier/i })).toBeInTheDocument();
  });

  it('keeps player ownership, contracts, exemptions, and manager identity out of public markup', () => {
    const { container } = render(
      <FranchisesPage
        snapshot={memberSnapshot}
        session={{ kind: 'public' }}
        contracts={testContracts}
        transactions={transactions}
        tradedPicks={tradedPicks}
      />,
    );

    expect(container).not.toHaveTextContent('Patrick Mahomes');
    expect(container).not.toHaveTextContent('4046');
    expect(container).not.toHaveTextContent('4Y');
    expect(container).not.toHaveTextContent('Exm');
    expect(container).not.toHaveTextContent('Conman4');
    expect(container.innerHTML).not.toContain('sleepercdn.com/avatars');
  });
});
