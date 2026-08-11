import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { parseContractLedger } from '../../data/contractLedger';
import { currentHomeSnapshot } from '../../data/currentLeague';
import { LeagueOfficePage } from './LeagueOfficePage';

const contracts = parseContractLedger(
  '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
  '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","2024",""\n' +
  '"Jarquez Hunter","RB","LAR","A.Woods","11569","","None","None",""\n',
);

const snapshot = {
  ...currentHomeSnapshot,
  franchises: currentHomeSnapshot.franchises.map((franchise) =>
    franchise.rosterId === 2
      ? { ...franchise, playerIds: ['4046', '11569', 'missing'] }
      : franchise,
  ),
};

describe('LeagueOfficePage', () => {
  it('publishes the authority order and clearly demotes the 2022 constitution to legacy', () => {
    render(<LeagueOfficePage snapshot={snapshot} session={{ kind: 'public' }} />);

    expect(screen.getByRole('heading', { name: /league office/i })).toBeInTheDocument();
    const hierarchy = screen.getByRole('list', { name: /source authority hierarchy/i });
    expect(within(hierarchy).getAllByRole('listitem')).toHaveLength(4);
    expect(within(hierarchy).getByText('Sleeper')).toBeInTheDocument();
    expect(within(hierarchy).getByText('Commissioner overlays')).toBeInTheDocument();
    expect(within(hierarchy).getByText('Historical corrections')).toBeInTheDocument();

    const constitution = screen.getByRole('region', { name: /2022 constitution/i });
    expect(within(constitution).getByText('Legacy')).toBeInTheDocument();
    expect(within(constitution).getByText(/not current authority/i)).toBeInTheDocument();
  });

  it('renders the current deadline set with each deadline source visible', () => {
    render(<LeagueOfficePage snapshot={snapshot} session={{ kind: 'public' }} />);

    const deadlines = screen.getByRole('region', { name: /current deadlines/i });
    expect(within(deadlines).getByText('Draft night')).toBeInTheDocument();
    expect(within(deadlines).getByText('Trade deadline')).toBeInTheDocument();
    expect(within(deadlines).getByText('Exemption declarations')).toBeInTheDocument();
    expect(within(deadlines).getAllByText(/Sleeper · cached/i)).toHaveLength(2);
    expect(within(deadlines).getByText(/Commissioner · manual/i)).toBeInTheDocument();
  });

  it('publishes the current rule register without promoting unresolved legacy topics', () => {
    render(<LeagueOfficePage snapshot={snapshot} session={{ kind: 'public' }} />);

    const register = screen.getByRole('region', { name: /current rule register/i });
    expect(within(register).getByText('Waivers and free agency')).toBeInTheDocument();
    expect(within(register).getByText('Playoffs and competition')).toBeInTheDocument();
    expect(within(register).getByText(
      'An exemption may renegotiate any contract regardless of years remaining.',
    )).toBeInTheDocument();
    expect(within(register).getAllByText('Unresolved')).toHaveLength(2);
    expect(within(register).getAllByText('Commissioner confirmed')).toHaveLength(7);
    expect(within(register).getAllByText('Sleeper live')).toHaveLength(2);
  });

  it('shows ledger integrity only to members', () => {
    const { rerender } = render(
      <LeagueOfficePage
        snapshot={snapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={contracts}
      />,
    );

    const ledger = screen.getByRole('region', { name: /contract ledger health/i });
    expect(within(ledger).getByText('2')).toBeInTheDocument();
    expect(within(ledger).getByText('2 / 3')).toBeInTheDocument();
    expect(within(ledger).getByText('1 unmatched')).toBeInTheDocument();

    rerender(<LeagueOfficePage snapshot={snapshot} session={{ kind: 'public' }} />);
    expect(screen.queryByRole('region', { name: /contract ledger health/i })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('2 / 3');
  });
});
