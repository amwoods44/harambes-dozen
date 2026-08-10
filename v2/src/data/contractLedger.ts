export type ContractAuthority = 'contracts-sheet' | 'manager-correction';

export interface ContractPlayer {
  sleeperPlayerId: string;
  playerName: string;
  position: string;
  nflTeam: string;
  sheetFantasyTeam: string;
  yearsRemaining: number | null;
  tag: string | null;
  exemption: string | null;
  notes: string;
  authority: ContractAuthority;
}

interface ContractCorrection {
  yearsRemaining: number;
  reason: string;
  exemption?: string;
}

/** Direct manager corrections supplied August 8-10, 2026. */
export const contractCorrections: Readonly<Record<string, ContractCorrection>> = {
  '10229': { yearsRemaining: 5, reason: '2026 exemption: Rashee Rice', exemption: '2026' },
  '6904': { yearsRemaining: 3, reason: '2026 exemption: Jalen Hurts', exemption: '2026' },
  '9224': { yearsRemaining: 3, reason: '2026 exemption: Chase Brown', exemption: '2026' },
  '2216': { yearsRemaining: 2, reason: '2026 exemption: Mike Evans', exemption: '2026' },
  '6803': { yearsRemaining: 2, reason: '2026 exemption: Brandon Aiyuk', exemption: '2026' },
  '7588': { yearsRemaining: 3, reason: '2026 exemption: Javonte Williams', exemption: '2026' },
  '7569': { yearsRemaining: 4, reason: '2026 exemption: Nico Collins', exemption: '2026' },
  '9487': { yearsRemaining: 4, reason: '2026 exemption: Parker Washington', exemption: '2026' },
  '4983': { yearsRemaining: 3, reason: '2026 exemption: DJ Moore', exemption: '2026' },
  '6813': { yearsRemaining: 3, reason: '2026 exemption: Jonathan Taylor', exemption: '2026' },
  '7553': { yearsRemaining: 3, reason: '2026 exemption: Kyle Pitts', exemption: '2026' },
  '11569': { yearsRemaining: 3, reason: 'Manager correction: Jarquez Hunter' },
  '12547': { yearsRemaining: 2, reason: 'Manager correction: Kyle Williams' },
  '12498': { yearsRemaining: 2, reason: 'Manager correction: Mason Taylor' },
  '12495': { yearsRemaining: 3, reason: 'Manager correction: Ollie Gordon' },
  '3257': { yearsRemaining: 3, reason: 'Manager correction: Jacoby Brissett' },
  '12533': { yearsRemaining: 3, reason: 'Manager correction: Jacory Croskey-Merritt' },
};

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function cleanOptional(value: string) {
  const clean = value.trim();
  return !clean || clean.toLowerCase() === 'none' ? null : clean;
}

export function parseContractLedger(input: string): ContractPlayer[] {
  const [, ...rows] = parseCsv(input);
  return rows
    .filter((row) => row[4]?.trim())
    .map((row) => {
      const sleeperPlayerId = row[4].trim();
      const correction = contractCorrections[sleeperPlayerId];
      const rawYears = row[5]?.trim();
      return {
        sleeperPlayerId,
        playerName: row[0]?.trim() || sleeperPlayerId,
        position: row[1]?.trim() || '—',
        nflTeam: row[2]?.trim() || 'FA',
        sheetFantasyTeam: row[3]?.trim() || 'Unknown',
        yearsRemaining: correction?.yearsRemaining ?? (rawYears ? Number(rawYears) : null),
        tag: cleanOptional(row[6] || ''),
        exemption: correction?.exemption ?? cleanOptional(row[7] || ''),
        notes: correction?.reason || row[8]?.trim() || '',
        authority: correction ? 'manager-correction' : 'contracts-sheet',
      };
    });
}
