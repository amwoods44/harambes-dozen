import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { parseContractLedger } from '../../data/contractLedger';
import { currentHomeSnapshot } from '../../data/currentLeague';
import { DesignSpecimenPage } from './DesignSpecimenPage';

const contracts = parseContractLedger(
  '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
  '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","None",""\n' +
  '"Rashee Rice","WR","KC","A.Woods","10229","2","Franchise","None","Sheet value conflicts with the approved exemption"\n' +
  '"A.J. Brown","WR","PHI","A.Woods","wr1","1","Franchise","None",""\n',
);

describe('DesignSpecimenPage', () => {
  it('proves the component language with real league and player data', () => {
    render(
      <DesignSpecimenPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={contracts}
      />,
    );

    expect(screen.getByRole('heading', { name: /the twelve, in one visual language/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /franchise identity and player dossier/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /draft and trade system/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /game day and league editorial/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /state and workflow language/i })).toBeInTheDocument();

    expect(screen.getAllByText('A.Woods').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Patrick Mahomes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rashee Rice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.03').length).toBeGreaterThan(0);
    expect(screen.getByAltText(/harambe's dozen championship trophy/i)).toHaveAttribute(
      'src',
      '/assets/real-trophy-studio-v1.png',
    );
  });

  it('opens a quick dossier from a player-first lineup slot', async () => {
    const user = userEvent.setup();
    render(
      <DesignSpecimenPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={contracts}
      />,
    );

    const lineup = screen.getByRole('button', { name: /open patrick mahomes quick dossier/i });
    await user.click(lineup);

    const dossier = screen.getByRole('dialog', { name: /patrick mahomes dossier/i });
    expect(within(dossier).getByText(/acquired via startup draft/i)).toBeInTheDocument();
    expect(within(dossier).getByRole('link', { name: /full dossier/i })).toHaveAttribute(
      'href',
      '#/players/4046',
    );
  });

  it('keeps verified information quiet and reserves visible authority treatment for exceptions', () => {
    render(
      <DesignSpecimenPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={contracts}
      />,
    );

    expect(screen.queryByText(/^verified$/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/manager correction overrides sheet/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/cached · 18 minutes old/i)).toBeInTheDocument();
  });

  it('does not expose the private specimen to public sessions', () => {
    const { container } = render(
      <DesignSpecimenPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'public' }}
        contracts={contracts}
      />,
    );

    expect(screen.getByRole('heading', { name: /member review surface/i })).toBeInTheDocument();
    expect(container).not.toHaveTextContent('Patrick Mahomes');
    expect(container).not.toHaveTextContent('Rashee Rice');
    expect(container.innerHTML).not.toContain('sleepercdn.com/avatars');
  });
});
