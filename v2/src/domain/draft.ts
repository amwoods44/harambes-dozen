import { sourceStamp, type SourceStamp } from './source';

interface SleeperDraft {
  draft_id: string;
  league_id: string;
  season: string;
  status: string;
  type: string;
  start_time: number;
  draft_order: Readonly<Record<string, number>>;
  slot_to_roster_id: Readonly<Record<string, number>>;
  settings: {
    rounds: number;
    teams: number;
    [key: string]: number;
  };
}

interface SleeperRosterIdentity {
  roster_id: number;
  owner_id: string;
}

interface SleeperUserIdentity {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: { team_name?: string } | null;
}

export interface DraftOrderEntry {
  slot: number;
  rosterId: number;
  ownerUserId: string | null;
  franchiseName: string;
  managerDisplayName: string | null;
  avatarId: string | null;
}

export interface LeagueDraft {
  id: string;
  leagueId: string;
  season: number;
  status: string;
  type: string;
  startsAt: string;
  rounds: number;
  teams: number;
  order: DraftOrderEntry[];
  source: SourceStamp;
}

export function normalizeDraft(
  raw: SleeperDraft,
  rosters: readonly SleeperRosterIdentity[],
  users: readonly SleeperUserIdentity[],
): LeagueDraft {
  const rosterById = new Map(rosters.map((roster) => [roster.roster_id, roster]));
  const userById = new Map(users.map((user) => [user.user_id, user]));

  const order = Object.entries(raw.slot_to_roster_id)
    .map(([slot, rosterId]): DraftOrderEntry => {
      const roster = rosterById.get(rosterId);
      const user = roster ? userById.get(roster.owner_id) : undefined;

      return {
        slot: Number(slot),
        rosterId,
        ownerUserId: roster?.owner_id ?? null,
        franchiseName: user?.metadata?.team_name || user?.display_name || `Roster ${rosterId}`,
        managerDisplayName: user?.display_name ?? null,
        avatarId: user?.avatar ?? null,
      };
    })
    .sort((left, right) => left.slot - right.slot);

  return {
    id: raw.draft_id,
    leagueId: raw.league_id,
    season: Number(raw.season),
    status: raw.status,
    type: raw.type,
    startsAt: new Date(raw.start_time).toISOString(),
    rounds: raw.settings.rounds,
    teams: raw.settings.teams,
    order,
    source: sourceStamp('sleeper'),
  };
}

