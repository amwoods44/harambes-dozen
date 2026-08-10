import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import { LeagueOfficePage } from './LeagueOfficePage';

describe('LeagueOfficePage', () => {
  it('publishes the authority order and clearly demotes the 2022 constitution to legacy', () => {
    render(<LeagueOfficePage snapshot={currentHomeSnapshot} />);

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
    render(<LeagueOfficePage snapshot={currentHomeSnapshot} />);

    const deadlines = screen.getByRole('region', { name: /current deadlines/i });
    expect(within(deadlines).getByText('Draft night')).toBeInTheDocument();
    expect(within(deadlines).getByText('Trade deadline')).toBeInTheDocument();
    expect(within(deadlines).getByText('Exemption declarations')).toBeInTheDocument();
    expect(within(deadlines).getAllByText(/Sleeper · cached/i)).toHaveLength(2);
    expect(within(deadlines).getByText(/Commissioner · manual/i)).toBeInTheDocument();
  });
});
