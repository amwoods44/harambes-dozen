import { sourceStamp, type SourceStamp } from './source';

interface SeasonTransactionRequest {
  status: string;
  completedWeeks: number;
}

export interface SleeperTransaction {
  transaction_id: string;
  type: string;
  status: string;
  leg: number;
  created: number;
  roster_ids?: readonly number[] | null;
  adds?: Readonly<Record<string, number>> | null;
  drops?: Readonly<Record<string, number>> | null;
  draft_picks?: readonly unknown[] | null;
}

export interface LeagueTransaction {
  id: string;
  type: string;
  status: string;
  week: number;
  createdAt: string;
  rosterIds: number[];
  adds: Readonly<Record<string, number>>;
  drops: Readonly<Record<string, number>>;
  draftPicks: readonly unknown[];
  source: SourceStamp;
}

export function transactionWeeksForSeason({
  status,
  completedWeeks,
}: SeasonTransactionRequest): number[] {
  if (status === 'pre_draft' || status === 'drafting' || status === 'complete') {
    return Array.from({ length: 18 }, (_, index) => index + 1);
  }

  const latestRelevantWeek = Math.min(18, Math.max(1, completedWeeks + 1));
  return Array.from({ length: latestRelevantWeek }, (_, index) => index + 1);
}

export function collectTransactions(
  byWeek: Readonly<Record<number, readonly SleeperTransaction[]>>,
): LeagueTransaction[] {
  const deduplicated = new Map<string, LeagueTransaction>();

  for (const [weekKey, transactions] of Object.entries(byWeek)) {
    for (const transaction of transactions) {
      deduplicated.set(transaction.transaction_id, {
        id: transaction.transaction_id,
        type: transaction.type,
        status: transaction.status,
        week: Number(weekKey),
        createdAt: new Date(transaction.created).toISOString(),
        rosterIds: [...(transaction.roster_ids ?? [])],
        adds: transaction.adds ?? {},
        drops: transaction.drops ?? {},
        draftPicks: transaction.draft_picks ?? [],
        source: sourceStamp('sleeper'),
      });
    }
  }

  return [...deduplicated.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}
