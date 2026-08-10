import type { ContractPlayer } from '../data/contractLedger';
import type { HomeSnapshot } from '../data/currentLeague';

export type RuleAuthorityStatus =
  | 'commissioner-confirmed'
  | 'sleeper-live'
  | 'historical-correction'
  | 'legacy'
  | 'unresolved';

export type RuleGroup =
  | 'Roster configuration'
  | 'Scoring'
  | 'Contracts and extensions'
  | 'Exemptions'
  | 'Draft operations'
  | 'Trading'
  | 'Waivers and free agency'
  | 'Playoffs and competition';

export interface LeagueRuleRecord {
  id: string;
  group: RuleGroup;
  statement: string;
  status: RuleAuthorityStatus;
  effectiveSeason: number | null;
  sourceNote: string;
}

export interface LedgerHealth {
  totalRecords: number;
  currentRosterPlayers: number;
  matchedRosterPlayers: number;
  correctedRecords: number;
  oneYearDecisions: number;
  twoYearWatch: number;
  unmatchedRosterIds: string[];
}

export const leagueRuleRegister: readonly LeagueRuleRecord[] = [
  {
    id: 'roster-wide-receivers',
    group: 'Roster configuration',
    statement: 'Start three wide receivers.',
    status: 'commissioner-confirmed',
    effectiveSeason: 2026,
    sourceNote: 'Commissioner confirmation supplied August 2026.',
  },
  {
    id: 'roster-kicker',
    group: 'Roster configuration',
    statement: 'No kicker roster slot.',
    status: 'commissioner-confirmed',
    effectiveSeason: null,
    sourceNote: 'Current configuration confirmed; change season remains unverified.',
  },
  {
    id: 'roster-ir',
    group: 'Roster configuration',
    statement: 'One injured-reserve slot.',
    status: 'commissioner-confirmed',
    effectiveSeason: 2026,
    sourceNote: 'Commissioner confirmation supplied August 2026.',
  },
  {
    id: 'scoring-fumbles',
    group: 'Scoring',
    statement: 'Ordinary fumbles score zero.',
    status: 'commissioner-confirmed',
    effectiveSeason: 2026,
    sourceNote: 'Commissioner confirmation supplied August 2026.',
  },
  {
    id: 'extensions-eligibility',
    group: 'Contracts and extensions',
    statement: 'Only players with one contract year remaining qualify for an ordinary extension.',
    status: 'commissioner-confirmed',
    effectiveSeason: 2026,
    sourceNote: 'Commissioner confirmation supplied August 2026.',
  },
  {
    id: 'exemption-renegotiation',
    group: 'Exemptions',
    statement: 'An exemption may renegotiate any contract regardless of years remaining.',
    status: 'commissioner-confirmed',
    effectiveSeason: null,
    sourceNote: 'Current rule confirmed August 2026; the believed 2024 change year remains unverified.',
  },
  {
    id: 'exemption-deadline',
    group: 'Exemptions',
    statement: 'Exemption declarations are normally due Memorial Day by end of day.',
    status: 'commissioner-confirmed',
    effectiveSeason: 2026,
    sourceNote: 'Current operating practice confirmed August 2026.',
  },
  {
    id: 'draft-board',
    group: 'Draft operations',
    statement: 'Draft order, format, and execution follow the current Sleeper league and draft settings.',
    status: 'sleeper-live',
    effectiveSeason: 2026,
    sourceNote: 'Sleeper league and draft endpoints.',
  },
  {
    id: 'trade-deadline',
    group: 'Trading',
    statement: 'The current Sleeper trade-deadline setting governs.',
    status: 'sleeper-live',
    effectiveSeason: 2026,
    sourceNote: 'Sleeper league settings; show the exact week when the live setting is available.',
  },
  {
    id: 'waiver-procedure',
    group: 'Waivers and free agency',
    statement: 'Current waiver timing and priority procedure require commissioner confirmation.',
    status: 'unresolved',
    effectiveSeason: null,
    sourceNote: 'The 2022 constitution is legacy context only.',
  },
  {
    id: 'playoff-format',
    group: 'Playoffs and competition',
    statement: 'Current playoff field, seeding, and anti-tanking procedure require confirmation.',
    status: 'unresolved',
    effectiveSeason: null,
    sourceNote: 'Do not promote the 2022 language without a current ruling.',
  },
];

const statusLabels: Record<RuleAuthorityStatus, string> = {
  'commissioner-confirmed': 'Commissioner confirmed',
  'sleeper-live': 'Sleeper live',
  'historical-correction': 'Historical correction',
  legacy: 'Legacy',
  unresolved: 'Unresolved',
};

export function ruleStatusLabel(status: RuleAuthorityStatus) {
  return statusLabels[status];
}

export function deriveLedgerHealth(
  snapshot: HomeSnapshot,
  contracts: readonly ContractPlayer[],
): LedgerHealth {
  const rosterPlayerIds = new Set(
    snapshot.franchises.flatMap((franchise) => franchise.playerIds),
  );
  const contractsById = new Map(
    contracts.map((contract) => [contract.sleeperPlayerId, contract]),
  );
  const matchedContracts = [...rosterPlayerIds]
    .map((playerId) => contractsById.get(playerId))
    .filter((contract): contract is ContractPlayer => Boolean(contract));

  return {
    totalRecords: contracts.length,
    currentRosterPlayers: rosterPlayerIds.size,
    matchedRosterPlayers: matchedContracts.length,
    correctedRecords: matchedContracts.filter(
      (contract) => contract.authority === 'manager-correction',
    ).length,
    oneYearDecisions: matchedContracts.filter(
      (contract) => contract.yearsRemaining === 1,
    ).length,
    twoYearWatch: matchedContracts.filter(
      (contract) => contract.yearsRemaining === 2,
    ).length,
    unmatchedRosterIds: [...rosterPlayerIds]
      .filter((playerId) => !contractsById.has(playerId))
      .sort(),
  };
}
