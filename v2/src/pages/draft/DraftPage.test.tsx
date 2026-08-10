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

    const decisionWindow = screen.getByRole('region', { name: /1.03 decision window/i });
    expect(decisionWindow).toHaveTextContent('2 selections before 1.03');
    expect(decisionWindow).toHaveTextContent('11 selections before 2.03');
    expect(decisionWindow).toHaveTextContent('15th overall');

    const runway = within(decisionWindow).getByRole('region', {
      name: /tier drop-off runway/i,
    });
    expect(runway).toHaveTextContent(
      'A tier with 11 or fewer acceptable names can be exhausted before 2.03',
    );
    expect(runway).toHaveTextContent(/no player tiers are published in this snapshot/i);

    const inputs = screen.getByRole('region', { name: /draft decision inputs/i });
    expect(inputs).toHaveTextContent('Tier / drop-off');
    expect(inputs).toHaveTextContent('Best fit');
    expect(inputs).toHaveTextContent('Availability');
    expect(inputs).toHaveTextContent(/positional needs remain unmodeled/i);
    expect(inputs).toHaveTextContent(/confirm the live player pool in sleeper/i);

    const order = screen.getByRole('region', { name: /round 1 draft order/i });
    expect(within(order).getAllByRole('listitem')).toHaveLength(12);
    const firstPick = within(order).getAllByRole('listitem')[0];
    expect(firstPick).toHaveTextContent('Marginally Alpha');
    expect(firstPick).toHaveTextContent('17 players');
    expect(firstPick).toHaveTextContent('Positional needs not published');
    expect(firstPick).toHaveTextContent('Sleeper draft order');
    expect(firstPick).toHaveTextContent('Trade provenance unavailable');
    const viewerPick = within(order).getAllByRole('listitem')[2];
    expect(viewerPick).toHaveTextContent('A.Woods');
    expect(viewerPick).toHaveTextContent('22 players');
    expect(viewerPick).toHaveTextContent('Positional needs not published');
    expect(viewerPick).toHaveTextContent('Sleeper draft order');
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
      /sign in to map the wait between your picks/i,
    );
    expect(
      screen.queryByRole('region', { name: /decision window/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('AWoods')).not.toBeInTheDocument();
    expect(screen.queryByText('TyKaz')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    const order = screen.getByRole('region', { name: /round 1 draft order/i });
    expect(within(order).getAllByRole('listitem')).toHaveLength(12);
    expect(within(order).getByText('A.Woods')).toBeInTheDocument();
    expect(within(order).getAllByText('Sleeper draft order')).toHaveLength(12);
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
