import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';
import { currentHomeSnapshot } from './data/currentLeague';

describe('Harambe\'s Dozen pre-draft home', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('renders the live pre-draft hierarchy and personalized franchise panel for a member', () => {
    render(
      <App
        initialSession={{ kind: 'member', userId: '393634863552425984' }}
        now={new Date('2026-08-10T17:00:00.000Z')}
      />,
    );

    expect(screen.getByRole('heading', { name: /draft night/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/draft countdown/i)).toHaveTextContent('11Days');
    expect(screen.getByRole('navigation', { name: /primary/i })).toHaveTextContent(
      'HomeLeagueFranchisesTradesDraftLeague OfficeClubhouse',
    );

    const franchise = screen.getByRole('region', { name: /my franchise/i });
    expect(within(franchise).getByText('1.03')).toBeInTheDocument();
    expect(within(franchise).getByText('A.Woods')).toBeInTheDocument();

    const order = screen.getByRole('region', { name: /round 1 pick order/i });
    expect(within(order).getAllByRole('listitem')).toHaveLength(12);
    expect(within(order).getByText('Commissioner of Power')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /league wire/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /deadlines/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /records vault/i })).toBeInTheDocument();
  });

  it('keeps manager identity and My Franchise private for a public visitor', () => {
    render(<App initialSession={{ kind: 'public' }} now={new Date('2026-08-10T17:00:00.000Z')} />);

    expect(screen.queryByRole('region', { name: /my franchise/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Conman4')).not.toBeInTheDocument();
    expect(screen.getByText('Brocked and Loaded')).toBeInTheDocument();
  });

  it('lets a member switch themes and persists that choice', async () => {
    const user = userEvent.setup();
    render(
      <App
        initialSession={{ kind: 'member', userId: '393634863552425984' }}
        now={new Date('2026-08-10T17:00:00.000Z')}
      />,
    );

    await user.click(screen.getByRole('button', { name: /switch to night theme/i }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'night');
    expect(localStorage.getItem('hd12-theme')).toBe('night');
  });

  it('keeps the draft rail usable when Sleeper returns a partial roster join', async () => {
    const partial = {
      ...currentHomeSnapshot,
      draft: {
        ...currentHomeSnapshot.draft,
        order: [
          ...currentHomeSnapshot.draft.order,
          {
            slot: 13,
            rosterId: 99,
            ownerUserId: null,
            franchiseName: 'Roster 99',
            managerDisplayName: null,
            avatarId: null,
          },
        ],
      },
    };

    render(
      <App
        initialSession={{ kind: 'public' }}
        now={new Date('2026-08-10T17:00:00.000Z')}
        repository={{ loadHome: async () => partial }}
      />,
    );

    expect(await screen.findByText('Roster 99')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/partial draft board/i);
  });

  it('navigates from the shared shell into the complete draft page', async () => {
    const user = userEvent.setup();
    render(
      <App
        initialSession={{ kind: 'member', userId: '393634863552425984' }}
        now={new Date('2026-08-10T17:00:00.000Z')}
      />,
    );

    await user.click(screen.getByRole('navigation', { name: /primary/i }).querySelector('a[href="#/draft"]')!);

    expect(await screen.findByRole('heading', { name: /2026 draft board/i })).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: /primary/i })).getByRole('link', { name: 'Draft' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('keeps the Clubhouse private when reached through public navigation', async () => {
    const user = userEvent.setup();
    render(<App initialSession={{ kind: 'public' }} />);

    await user.click(screen.getByRole('link', { name: 'Clubhouse' }));

    expect(await screen.findByRole('heading', { name: /sign in to enter the clubhouse/i })).toBeInTheDocument();
    expect(screen.queryByText('Member access confirmed')).not.toBeInTheDocument();
  });

  it('keeps contract and manager intelligence out of public dossier routes', async () => {
    const privateMarkers = [
      'Patrick Mahomes',
      '4046',
      '4Y',
      'Conman4',
      'sleepercdn.com/avatars',
      'Exm',
    ];

    window.history.replaceState(null, '', '/#/franchises');
    const franchises = render(<App initialSession={{ kind: 'public' }} />);

    expect(await screen.findByRole('heading', { name: /the franchises/i })).toBeInTheDocument();
    expect(screen.getByText(/manager and roster intelligence stays inside the dozen/i)).toBeInTheDocument();
    for (const marker of privateMarkers) {
      expect(document.documentElement).not.toHaveTextContent(marker);
      expect(document.documentElement.innerHTML).not.toContain(marker);
    }

    franchises.unmount();
    window.history.replaceState(null, '', '/#/league-office');
    render(<App initialSession={{ kind: 'public' }} />);

    expect(await screen.findByRole('heading', { name: /league office/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /contract ledger health/i })).not.toBeInTheDocument();
    for (const marker of privateMarkers) {
      expect(document.documentElement).not.toHaveTextContent(marker);
      expect(document.documentElement.innerHTML).not.toContain(marker);
    }
  });

  it('opens the invitation-only email-link flow when Firebase is configured', async () => {
    const user = userEvent.setup();
    const submitEmail = vi.fn(async () => 'link-sent' as const);
    render(
      <App
        initialSession={{ kind: 'public' }}
        memberSessionService={{
          subscribe: () => () => undefined,
          submitEmail,
          signOut: async () => undefined,
          isCompletingEmailLink: () => false,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    const dialog = screen.getByRole('dialog', { name: /enter the clubhouse/i });
    await user.type(within(dialog).getByLabelText(/league email/i), 'member@example.com');
    await user.click(within(dialog).getByRole('button', { name: /email my sign-in link/i }));

    expect(submitEmail).toHaveBeenCalledWith('member@example.com');
    expect(await screen.findByRole('status')).toHaveTextContent(/sign-in link sent/i);
  });
});
