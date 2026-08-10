import { describe, expect, it } from 'vitest';

import contractCsv from '../../../data/contracts.csv?raw';
import { parseContractLedger } from './contractLedger';

const contractPlayers = parseContractLedger(contractCsv);
const contractPlayersById = new Map(
  contractPlayers.map((player) => [player.sleeperPlayerId, player]),
);

describe('contract ledger', () => {
  it('parses the complete sheet snapshot without changing its source file', () => {
    expect(contractPlayers.length).toBeGreaterThan(300);
    expect(contractPlayersById.get('4046')).toMatchObject({
      playerName: 'Patrick Mahomes',
      yearsRemaining: 4,
      authority: 'contracts-sheet',
    });
  });

  it('layers direct manager corrections above the sheet', () => {
    expect(contractPlayersById.get('11569')).toMatchObject({
      playerName: 'Jarquez Hunter',
      yearsRemaining: 3,
      authority: 'manager-correction',
      exemption: null,
    });
    expect(contractPlayersById.get('10229')).toMatchObject({
      playerName: 'Rashee Rice',
      yearsRemaining: 5,
      exemption: '2026',
    });
  });

  it('preserves quoted commas and blank contract years', () => {
    const rows = parseContractLedger(
      '"Player Name","POS","NFL Team","Fantasy Team","Sleeper ID","Contract Years","Tag Status","Exemption","Notes"\n' +
      '"Doe, John","WR","FA","Club","1","","None","None","Needs review, later"\n',
    );
    expect(rows[0]).toMatchObject({ playerName: 'Doe, John', yearsRemaining: null, notes: 'Needs review, later' });
  });
});
