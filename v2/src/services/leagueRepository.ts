import { normalizeDraft } from '../domain/draft';
import { normalizeTradedPick, type DraftPickOwnership, type SleeperTradedPick } from '../domain/picks';
import { sourceStamp } from '../domain/source';
import {
  collectTransactions,
  transactionWeeksForSeason,
  type LeagueTransaction,
  type SleeperTransaction,
} from '../domain/transactions';
import {
  currentHomeSnapshot,
  type FranchiseSnapshot,
  type HomeSnapshot,
} from '../data/currentLeague';

export interface LeagueRepository {
  loadHome(): Promise<HomeSnapshot>;
  loadTransactions?(): Promise<LeagueTransaction[]>;
  loadTradedPicks?(): Promise<DraftPickOwnership[]>;
}

interface SleeperLeaguePayload {
  league_id: string;
  name: string;
  season: string;
  status: string;
  draft_id: string;
}

interface SleeperRosterPayload {
  roster_id: number;
  owner_id: string;
  players?: string[] | null;
}

interface SleeperUserPayload {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: { team_name?: string } | null;
}

export function createSleeperRepository(
  fetcher: typeof fetch = fetch,
  leagueId = currentHomeSnapshot.leagueId,
): LeagueRepository {
  const api = 'https://api.sleeper.app/v1';

  async function getJson<T>(path: string): Promise<T> {
    const response = await fetcher(`${api}${path}`);
    if (!response.ok) throw new Error(`Sleeper request failed (${response.status})`);
    return (await response.json()) as T;
  }

  return {
    async loadHome() {
      const [league, rosters, users] = await Promise.all([
        getJson<SleeperLeaguePayload>(`/league/${leagueId}`),
        getJson<SleeperRosterPayload[]>(`/league/${leagueId}/rosters`),
        getJson<SleeperUserPayload[]>(`/league/${leagueId}/users`),
      ]);
      const rawDraft = await getJson<Parameters<typeof normalizeDraft>[0]>(
        `/draft/${league.draft_id}`,
      );
      const liveSource = sourceStamp('sleeper');
      const cachedByRoster = new Map(
        currentHomeSnapshot.franchises.map((franchise) => [franchise.rosterId, franchise]),
      );
      const usersById = new Map(users.map((user) => [user.user_id, user]));

      const franchises: FranchiseSnapshot[] = rosters.map((roster) => {
        const user = usersById.get(roster.owner_id);
        const cached = cachedByRoster.get(roster.roster_id);
        return {
          rosterId: roster.roster_id,
          ownerUserId: roster.owner_id,
          franchiseName:
            user?.metadata?.team_name?.trim() || user?.display_name || `Roster ${roster.roster_id}`,
          managerDisplayName: user?.display_name || `Roster ${roster.roster_id}`,
          avatarId: user?.avatar ?? null,
          playerCount: roster.players?.length ?? 0,
          playerIds: [...(roster.players ?? [])],
          accent: cached?.accent ?? '#8c7856',
          monogram: cached?.monogram ?? `R${roster.roster_id}`,
          source: liveSource,
        };
      });
      const draft = normalizeDraft(rawDraft, rosters, users);
      const openingTeam = draft.order[0]?.franchiseName ?? 'The 1.01 holder';
      const woodsPick = draft.order.find((entry) => entry.franchiseName === 'A.Woods')?.slot;
      const coachPick = draft.order.find((entry) => entry.franchiseName === 'Coach')?.slot;
      const draftDate = new Date(draft.startsAt);
      const draftMonth = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        timeZone: 'America/Chicago',
      }).format(draftDate).toUpperCase();
      const draftDay = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        timeZone: 'America/Chicago',
      }).format(draftDate);
      const draftDetail = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Chicago',
        timeZoneName: 'short',
      }).format(draftDate);

      return {
        ...currentHomeSnapshot,
        leagueId: league.league_id,
        leagueName: league.name,
        season: Number(league.season),
        status: 'pre_draft',
        source: liveSource,
        franchises,
        draft,
        wire: [
          {
            ...currentHomeSnapshot.wire[0],
            headline: `${openingTeam} is officially on the clock`,
            summary: `The ${draft.season} ${draft.type} draft order is locked.${
              woodsPick ? ` A.Woods owns 1.${String(woodsPick).padStart(2, '0')};` : ''
            }${coachPick ? ` Coach waits at 1.${String(coachPick).padStart(2, '0')}.` : ''}`,
            source: liveSource,
          },
        ],
        deadlines: currentHomeSnapshot.deadlines.map((deadline) =>
          deadline.id === '2026-draft-night'
            ? {
                ...deadline,
                month: draftMonth,
                day: draftDay,
                detail: draftDetail,
                source: liveSource,
              }
            : deadline,
        ),
      };
    },
    async loadTransactions() {
      const weeks = transactionWeeksForSeason({ status: 'pre_draft', completedWeeks: 0 });
      const entries = await Promise.all(
        weeks.map(async (week) => [
          week,
          await getJson<SleeperTransaction[]>(`/league/${leagueId}/transactions/${week}`),
        ] as const),
      );
      return collectTransactions(Object.fromEntries(entries));
    },
    async loadTradedPicks() {
      const picks = await getJson<SleeperTradedPick[]>(`/league/${leagueId}/traded_picks`);
      return picks.map(normalizeTradedPick);
    },
  };
}
