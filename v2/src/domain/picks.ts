import { sourceStamp, type SourceStamp } from './source';

export interface SleeperTradedPick {
  round: number;
  season: string;
  /** Sleeper: the roster that originally owned the pick. */
  roster_id: number;
  /** Sleeper: the roster that owns the pick now. */
  owner_id: number;
  previous_owner_id: number;
}

export interface DraftPickOwnership {
  season: number;
  round: number;
  originalRosterId: number;
  currentOwnerRosterId: number;
  previousOwnerRosterId: number;
  transferred: boolean;
  source: SourceStamp;
}

export function normalizeTradedPick(raw: SleeperTradedPick): DraftPickOwnership {
  return {
    season: Number(raw.season),
    round: raw.round,
    originalRosterId: raw.roster_id,
    currentOwnerRosterId: raw.owner_id,
    previousOwnerRosterId: raw.previous_owner_id,
    transferred: raw.roster_id !== raw.owner_id,
    source: sourceStamp('sleeper'),
  };
}

