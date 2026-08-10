import { sourceStamp, type SourceStamp } from './source';

export interface CommissionerContractRow {
  sleeperPlayerId: string | null;
  playerName: string;
  yearsRemaining: string | number | null;
  tag?: string | null;
  exemption?: string | null;
  notes?: string | null;
}

export type ContractStatus = 'unknown' | 'expired' | 'expiring' | 'active';

export interface PlayerContract {
  sleeperPlayerId: string | null;
  playerName: string;
  yearsRemaining: number | null;
  status: ContractStatus;
  tag: string | null;
  exemption: string | null;
  notes: string | null;
  source: SourceStamp;
}

function parseYears(value: CommissionerContractRow['yearsRemaining']): number | null {
  if (value === null || String(value).trim() === '') return null;

  const years = Number.parseInt(String(value), 10);
  return Number.isFinite(years) && years >= 0 ? years : null;
}

function contractStatus(yearsRemaining: number | null): ContractStatus {
  if (yearsRemaining === null) return 'unknown';
  if (yearsRemaining === 0) return 'expired';
  if (yearsRemaining === 1) return 'expiring';
  return 'active';
}

export function normalizeContractRow(row: CommissionerContractRow): PlayerContract {
  const yearsRemaining = parseYears(row.yearsRemaining);
  const rawTag = row.tag?.trim() ?? '';

  return {
    sleeperPlayerId: row.sleeperPlayerId || null,
    playerName: row.playerName.trim(),
    yearsRemaining,
    status: contractStatus(yearsRemaining),
    tag:
      !rawTag || rawTag.toLowerCase() === 'none'
        ? null
        : rawTag.toLowerCase() === 'true'
          ? 'Franchise'
          : rawTag,
    exemption:
      row.exemption && row.exemption.trim().toLowerCase() !== 'none'
        ? row.exemption.trim()
        : null,
    notes: row.notes?.trim() || null,
    source: sourceStamp('commissioner'),
  };
}

