import type { ContractPlayer } from '../data/contractLedger';
import type { FranchiseSnapshot, HomeSnapshot } from '../data/currentLeague';
import { sleeperEraChampions } from '../data/leagueHistory';
import type { DraftPickOwnership } from './picks';
import type { LeagueTransaction } from './transactions';

export type PositionRoomKey = 'QB' | 'RB' | 'WR' | 'TE' | 'DEF' | 'OTHER' | 'UNMATCHED';

export interface DossierPlayer {
  sleeperPlayerId: string;
  playerName: string;
  position: string;
  nflTeam: string;
  yearsRemaining: number | null;
  tag: string | null;
  exemption: string | null;
  authority: ContractPlayer['authority'] | 'unmatched';
}

export interface FranchiseDossier {
  franchise: FranchiseSnapshot;
  openingPick: number | null;
  positionRooms: Record<PositionRoomKey, DossierPlayer[]>;
  runway: {
    oneYear: number;
    twoYear: number;
    longControl: number;
    unknown: number;
  };
  picks: {
    incoming: DraftPickOwnership[];
    outgoing: DraftPickOwnership[];
  };
  movements: LeagueTransaction[];
  finishes: Array<{ season: number; result: 'Champion' | 'Runner-up' }>;
}

interface FranchiseDossierInput {
  snapshot: HomeSnapshot;
  rosterId: number;
  contracts: readonly ContractPlayer[];
  tradedPicks: readonly DraftPickOwnership[];
  transactions: readonly LeagueTransaction[];
}

const positionRoomOrder: PositionRoomKey[] = [
  'QB',
  'RB',
  'WR',
  'TE',
  'DEF',
  'OTHER',
  'UNMATCHED',
];

function emptyRooms(): Record<PositionRoomKey, DossierPlayer[]> {
  return Object.fromEntries(positionRoomOrder.map((room) => [room, []])) as Record<
    PositionRoomKey,
    DossierPlayer[]
  >;
}

function positionRoom(position: string): PositionRoomKey {
  const normalized = position.trim().toUpperCase();
  if (normalized === 'DST') return 'DEF';
  if (['QB', 'RB', 'WR', 'TE', 'DEF'].includes(normalized)) {
    return normalized as PositionRoomKey;
  }
  return 'OTHER';
}

function comparePlayers(left: DossierPlayer, right: DossierPlayer) {
  const leftYears = left.yearsRemaining ?? Number.POSITIVE_INFINITY;
  const rightYears = right.yearsRemaining ?? Number.POSITIVE_INFINITY;
  return leftYears - rightYears || left.playerName.localeCompare(right.playerName);
}

export function buildFranchiseDossier({
  snapshot,
  rosterId,
  contracts,
  tradedPicks,
  transactions,
}: FranchiseDossierInput): FranchiseDossier {
  const franchise = snapshot.franchises.find((candidate) => candidate.rosterId === rosterId);
  if (!franchise) throw new Error(`Franchise roster ${rosterId} was not found.`);

  const contractsById = new Map(
    contracts.map((contract) => [contract.sleeperPlayerId, contract]),
  );
  const positionRooms = emptyRooms();

  for (const sleeperPlayerId of franchise.playerIds) {
    const contract = contractsById.get(sleeperPlayerId);
    if (!contract) {
      positionRooms.UNMATCHED.push({
        sleeperPlayerId,
        playerName: 'Contract record not matched',
        position: '—',
        nflTeam: '—',
        yearsRemaining: null,
        tag: null,
        exemption: null,
        authority: 'unmatched',
      });
      continue;
    }

    const room = positionRoom(contract.position);
    positionRooms[room].push({
      sleeperPlayerId: contract.sleeperPlayerId,
      playerName: contract.playerName,
      position: room === 'OTHER' ? contract.position : room,
      nflTeam: contract.nflTeam,
      yearsRemaining: contract.yearsRemaining,
      tag: contract.tag,
      exemption: contract.exemption,
      authority: contract.authority,
    });
  }

  for (const room of positionRoomOrder) positionRooms[room].sort(comparePlayers);

  const matchedPlayers = positionRoomOrder
    .filter((room) => room !== 'UNMATCHED')
    .flatMap((room) => positionRooms[room]);

  return {
    franchise,
    openingPick:
      snapshot.draft.order.find((entry) => entry.rosterId === rosterId)?.slot ?? null,
    positionRooms,
    runway: {
      oneYear: matchedPlayers.filter((player) => player.yearsRemaining === 1).length,
      twoYear: matchedPlayers.filter((player) => player.yearsRemaining === 2).length,
      longControl: matchedPlayers.filter(
        (player) => player.yearsRemaining !== null && player.yearsRemaining >= 3,
      ).length,
      unknown:
        matchedPlayers.filter((player) => player.yearsRemaining === null).length +
        positionRooms.UNMATCHED.length,
    },
    picks: {
      incoming: tradedPicks.filter(
        (pick) =>
          pick.currentOwnerRosterId === rosterId && pick.originalRosterId !== rosterId,
      ),
      outgoing: tradedPicks.filter(
        (pick) =>
          pick.originalRosterId === rosterId && pick.currentOwnerRosterId !== rosterId,
      ),
    },
    movements: transactions
      .filter(
        (transaction) =>
          transaction.status === 'complete' && transaction.rosterIds.includes(rosterId),
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5),
    finishes: sleeperEraChampions.flatMap((result) => {
      if (result.champion === franchise.franchiseName) {
        return [{ season: result.season, result: 'Champion' as const }];
      }
      if (result.runnerUp === franchise.franchiseName) {
        return [{ season: result.season, result: 'Runner-up' as const }];
      }
      return [];
    }),
  };
}
