import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { parseContractLedger } from '../../data/contractLedger';
import { currentHomeSnapshot } from '../../data/currentLeague';
import { DesignSpecimenPage } from './DesignSpecimenPage';

const contracts = parseContractLedger(
  '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
  '"Patrick Mahomes","QB","KC","A.Woods","4046","4","None","None",""\n',
);

describe('DesignSpecimenPage player dossier interaction', () => {
  it('moves focus into the modal, closes with Escape, and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <DesignSpecimenPage
        snapshot={currentHomeSnapshot}
        session={{ kind: 'member', userId: '393634863552425984' }}
        contracts={contracts}
      />,
    );

    const trigger = screen.getByRole('button', { name: /open patrick mahomes quick dossier/i });
    await user.click(trigger);

    const close = screen.getByRole('button', { name: /close player dossier/i });
    expect(close).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
