import { describe, expect, it } from 'vitest';

import { parseContractLedger } from '../data/contractLedger';
import { currentHomeSnapshot } from '../data/currentLeague';
import { deriveLedgerHealth, leagueRuleRegister } from './leagueOffice';

describe('league office domain', () => {
  it('separates confirmed rules from unresolved legacy topics', () => {
    expect(new Set(leagueRuleRegister.map((rule) => rule.group)).size).toBe(8);
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'roster-wide-receivers',
      statement: 'Start three wide receivers.',
      status: 'commissioner-confirmed',
    }));
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'exemption-renegotiation',
      statement: 'An exemption may renegotiate any contract regardless of years remaining.',
      status: 'commissioner-confirmed',
      effectiveSeason: null,
    }));
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'waiver-procedure',
      status: 'unresolved',
    }));
    expect(leagueRuleRegister).toContainEqual(expect.objectContaining({
      id: 'playoff-format',
      status: 'unresolved',
    }));
  });

  it('reports private ledger coverage against current Sleeper ownership', () => {
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

    expect(deriveLedgerHealth(snapshot, contracts)).toEqual({
      totalRecords: 2,
      currentRosterPlayers: 3,
      matchedRosterPlayers: 2,
      correctedRecords: 1,
      oneYearDecisions: 0,
      twoYearWatch: 0,
      unmatchedRosterIds: ['missing'],
    });
  });
});
