import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ClubhousePage } from './ClubhousePage';

describe('ClubhousePage', () => {
  it('gates public sessions without loading or revealing member content', async () => {
    const user = userEvent.setup();
    const onRequestSignIn = vi.fn();

    render(<ClubhousePage session={{ kind: 'public' }} onRequestSignIn={onRequestSignIn} />);

    expect(screen.getByRole('heading', { name: /sign in to enter the clubhouse/i })).toBeInTheDocument();
    expect(screen.getByText(/does not load member names, conversations, or notifications/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /member clubhouse/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/393634863552425984/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /member sign in/i }));
    expect(onRequestSignIn).toHaveBeenCalledOnce();
  });

  it('shows members an authenticated empty state instead of fabricated chat', () => {
    render(<ClubhousePage session={{ kind: 'member', userId: '393634863552425984' }} />);

    expect(screen.getByRole('region', { name: /member clubhouse/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^clubhouse$/i })).toBeInTheDocument();
    expect(screen.getByText(/conversation feed is not connected yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no placeholder messages are shown/i)).toBeInTheDocument();
    expect(screen.queryByText('393634863552425984')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
