import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import { parseContractLedger } from '../../data/contractLedger';
import { FranchisesPage } from './FranchisesPage';

const testContracts = parseContractLedger(
  '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
  '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","2024",""\n' +
  '"Jarquez Hunter","RB","LAR","A.Woods","11569","","None","None",""\n' +
  '"Javonte Williams","RB","DAL","A.Woods","7588","","None","None",""\n',
);

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
    const snapshot = {
      ...currentHomeSnapshot,
      franchises: currentHomeSnapshot.franchises.map((franchise) =>
        franchise.rosterId === 2
          ? { ...franchise, playerIds: ['4046', '11569', '7588'] }
          : franchise,
      ),
    };
    render(
      <FranchisesPage
        snapshot={snapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={testContracts}
      />,
    );

    const roster = screen.getByRole('region', { name: /selected franchise roster/i });
    expect(within(roster).getByText('Patrick Mahomes')).toBeInTheDocument();
    expect(within(roster).getByText('Jarquez Hunter')).toBeInTheDocument();
    expect(within(roster).getAllByText('3Y')).toHaveLength(2);
    expect(within(roster).getByText('4Y')).toBeInTheDocument();
  });
});
