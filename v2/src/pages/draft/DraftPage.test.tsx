import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { currentHomeSnapshot } from '../../data/currentLeague';
import { DraftPage } from './DraftPage';

describe('DraftPage', () => {
  it('shows the complete linear draft context and a member draft lane', () => {
    render(
      <DraftPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: /2026 draft board/i })).toBeInTheDocument();

    const context = screen.getByRole('region', { name: /2026 draft context/i });
    expect(context).toHaveTextContent('Linear');
    expect(context).toHaveTextContent('8 rounds');
    expect(context).toHaveTextContent('12 clubs');
    expect(context).toHaveTextContent('96 picks');
    expect(
      within(context).getByText('Friday, August 21 at 7:00 PM CDT'),
    ).toHaveAttribute('datetime', '2026-08-22T00:00:47.000Z');

    const lane = screen.getByRole('region', { name: /your draft lane/i });
    expect(lane).toHaveTextContent('A.Woods');
    expect(within(lane).getByText('1.03')).toBeInTheDocument();
    expect(within(lane).getByText('8.03')).toBeInTheDocument();

    const order = screen.getByRole('region', { name: /round 1 draft order/i });
    expect(within(order).getAllByRole('listitem')).toHaveLength(12);
    expect(within(order).getAllByRole('listitem')[0]).toHaveTextContent('Marginally Alpha');
    expect(within(order).getByText('AWoods')).toBeInTheDocument();

    expect(screen.getByText(/cached sleeper snapshot/i)).toHaveTextContent(
      'August 8, 2026 at 6:59 PM CDT',
    );
    expect(screen.getByRole('link', { name: /open sleeper league/i })).toHaveAttribute(
      'href',
      'https://sleeper.com/leagues/1334235260409380864',
    );
  });

  it('keeps personal picks, manager handles, and portraits out of the public view', () => {
    render(<DraftPage snapshot={currentHomeSnapshot} session={{ kind: 'public' }} />);

    expect(screen.queryByRole('region', { name: /your draft lane/i })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /member draft view/i })).toHaveTextContent(
      /sign in to see your eight-pick lane/i,
    );
    expect(screen.queryByText('AWoods')).not.toBeInTheDocument();
    expect(screen.queryByText('TyKaz')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    const order = screen.getByRole('region', { name: /round 1 draft order/i });
    expect(within(order).getAllByRole('listitem')).toHaveLength(12);
    expect(within(order).getByText('A.Woods')).toBeInTheDocument();
  });

  it('announces an incomplete Sleeper order instead of presenting it as complete', () => {
    const incompleteSnapshot = {
      ...currentHomeSnapshot,
      draft: {
        ...currentHomeSnapshot.draft,
        order: currentHomeSnapshot.draft.order.slice(0, 11),
      },
    };

    render(<DraftPage snapshot={incompleteSnapshot} session={{ kind: 'public' }} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Sleeper returned 11 of 12 Round 1 slots',
    );
    expect(
      within(screen.getByRole('region', { name: /round 1 draft order/i })).getAllByRole('listitem'),
    ).toHaveLength(11);
  });
});
