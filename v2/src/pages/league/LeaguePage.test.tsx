import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import { LeaguePage } from './LeaguePage';

describe('LeaguePage', () => {
  it('presents the current 12-team roster format as the governing standard', () => {
    render(<LeaguePage snapshot={currentHomeSnapshot} session={{ kind: 'public' }} />);

    expect(
      screen.getByRole('heading', { name: "Harambe's Dozen league format" }),
    ).toBeInTheDocument();

    const format = screen.getByRole('region', { name: /current roster format/i });
    expect(within(format).getByText('12 teams')).toBeInTheDocument();
    expect(within(format).getByText('1 QB')).toBeInTheDocument();
    expect(within(format).getByText('2 RB')).toBeInTheDocument();
    expect(within(format).getByText('3 WR')).toBeInTheDocument();
    expect(within(format).getByText('1 TE')).toBeInTheDocument();
    expect(within(format).getByText('2 FLEX')).toBeInTheDocument();
    expect(within(format).getByText('1 DEF')).toBeInTheDocument();
    expect(within(format).getByText('15 bench')).toBeInTheDocument();
    expect(within(format).getByText('1 IR')).toBeInTheDocument();
    expect(within(format).getByText('No kicker')).toBeInTheDocument();
  });

  it('states source authority and keeps the 2022 constitution in legacy context', () => {
    render(
      <LeaguePage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
      />,
    );

    const authority = screen.getByRole('region', { name: /source authority/i });
    expect(within(authority).getByText(/current league settings/i)).toHaveTextContent(
      /commissioner/i,
    );
    expect(within(authority).getByText(/sleeper/i)).toHaveTextContent(/league and roster data/i);
    expect(within(authority).getByText(/2022 constitution/i)).toHaveTextContent(
      /legacy context only/i,
    );
    expect(within(authority).getByText(/if sources conflict/i)).toHaveTextContent(
      /current settings and commissioner rulings govern/i,
    );
    const history = screen.getByRole('heading', { name: /championship history/i }).closest('section')!;
    expect(within(history).getByText('2025')).toBeInTheDocument();
    expect(within(history).getAllByText('A.Woods')).toHaveLength(2);
  });
});
