import type { LeagueDraft } from '../domain/draft';
import type { SourceStamp } from '../domain/source';

const cachedSleeperSource: SourceStamp = {
  authority: 'sleeper',
  fetchedAt: '2026-08-08T23:59:00.000Z',
  state: 'cached',
};

const commissionerSource: SourceStamp = {
  authority: 'commissioner',
  fetchedAt: '2026-08-08T23:59:00.000Z',
  state: 'manual',
};

const historicalSource: SourceStamp = {
  authority: 'historical-correction',
  fetchedAt: '2026-08-08T23:59:00.000Z',
  state: 'manual',
};

export interface HomeStory {
  id: string;
  kicker: string;
  publishedAt: string;
  headline: string;
  summary: string;
  href: string;
  source: SourceStamp;
}

export interface HomeDeadline {
  id: string;
  month: string;
  day: string;
  name: string;
  detail: string;
  flag: string;
  source: SourceStamp;
}

export interface HomeRecord {
  champion: string;
  runnerUp: string;
  season: number;
  source: SourceStamp;
}

export interface FranchiseSnapshot {
  rosterId: number;
  ownerUserId: string;
  franchiseName: string;
  managerDisplayName: string;
  avatarId: string | null;
  playerCount: number;
  playerIds: string[];
  accent: string;
  monogram: string;
  source: SourceStamp;
}

export interface HomeSnapshot {
  leagueId: string;
  leagueName: string;
  season: number;
  status: 'pre_draft';
  draft: LeagueDraft;
  franchises: FranchiseSnapshot[];
  wire: HomeStory[];
  deadlines: HomeDeadline[];
  records: HomeRecord;
  source: SourceStamp;
}

export const franchises: FranchiseSnapshot[] = [
  ['726213207588438016', 1, 'Commissioner of Power', 'charlieklumb21', null, 20, '#d6a84b', 'CP'],
  ['393634863552425984', 2, 'A.Woods', 'AWoods', '9e7b822224080787fa6fad652e3f285e', 22, '#b21e2b', 'AW'],
  ['609197812051152896', 3, 'Proud Boys', 'shotdude72', '67afb25d6a1e59a718c8cfad54b1483e', 12, '#6e87a4', 'PB'],
  ['726537849402355712', 4, 'Slippery007', 'Slippery007', null, 16, '#268f95', 'S7'],
  ['727227228114464768', 5, 'Marginally Alpha', 'TyKaz', 'eeb56fba97620d2b148a7aaca3e47327', 17, '#d46b2c', 'MA'],
  ['727227384700440576', 6, 'TME', 'TME', 'b3338675f635c2c1f42b469621d38ec6', 15, '#597aaa', 'TME'],
  ['727243085242806272', 7, 'Hillschmeier Farms', 'nlinsmei', '4f4090e5e9c3941414db40a871e3e909', 15, '#6d8a4e', 'HF'],
  ['726530531143000064', 8, 'Epstein’s Client List', 'Jaredbenson03', 'f0edbf4278f53f9425db175073df6584', 18, '#7b6ca8', 'ECL'],
  ['726953570741649408', 9, 'Amon-Ra Doggin', 'chadcegelski', 'b3338675f635c2c1f42b469621d38ec6', 17, '#c37b34', 'ARD'],
  ['726530677910097920', 10, 'Brocked and Loaded', 'Conman4', '82aec8e811b839b8ec25d7b458afd57b', 22, '#2c65a5', 'BL'],
  ['726536109831553024', 11, 'Coach', 'conery24', 'f0edbf4278f53f9425db175073df6584', 22, '#6d7e91', 'C'],
  ['727240160521043968', 12, 'TylerPrice12', 'TylerPrice12', '4f4090e5e9c3941414db40a871e3e909', 16, '#8b5d42', 'TP'],
].map(
  ([ownerUserId, rosterId, franchiseName, managerDisplayName, avatarId, playerCount, accent, monogram]) => ({
    ownerUserId: String(ownerUserId),
    rosterId: Number(rosterId),
    franchiseName: String(franchiseName).trim(),
    managerDisplayName: String(managerDisplayName),
    avatarId: avatarId ? String(avatarId) : null,
    playerCount: Number(playerCount),
    playerIds: [],
    accent: String(accent),
    monogram: String(monogram),
    source: cachedSleeperSource,
  }),
);

const slotToRoster = [5, 1, 2, 8, 4, 10, 12, 6, 11, 7, 3, 9];

export const currentHomeSnapshot: HomeSnapshot = {
  leagueId: '1334235260409380864',
  leagueName: "Harambe's Dozen",
  season: 2026,
  status: 'pre_draft',
  source: cachedSleeperSource,
  franchises,
  wire: [
    {
      id: '2026-draft-order-locked',
      kicker: 'Board official',
      publishedAt: '2026-08-08T23:59:00.000Z',
      headline: 'Marginally Alpha is officially on the clock',
      summary: 'The 2026 linear draft order is locked. A.Woods owns 1.03; Coach waits at 1.09.',
      href: '#draft',
      source: cachedSleeperSource,
    },
  ],
  deadlines: [
    {
      id: '2026-draft-night',
      month: 'AUG',
      day: '21',
      name: 'Draft night',
      detail: 'Fri · 7:00 PM CT',
      flag: 'Next',
      source: cachedSleeperSource,
    },
    {
      id: '2026-trade-deadline',
      month: 'WK',
      day: '12',
      name: 'Trade deadline',
      detail: 'Sleeper league setting',
      flag: 'Season',
      source: cachedSleeperSource,
    },
    {
      id: 'annual-exemption-deadline',
      month: 'MAY',
      day: '25',
      name: 'Exemption declarations',
      detail: 'Memorial Day · EOD',
      flag: 'Annual',
      source: commissionerSource,
    },
  ],
  records: {
    champion: 'Amon-Ra Doggin',
    runnerUp: 'Proud Boys',
    season: 2025,
    source: historicalSource,
  },
  draft: {
    id: '1334235260417744896',
    leagueId: '1334235260409380864',
    season: 2026,
    status: 'pre_draft',
    type: 'linear',
    startsAt: '2026-08-22T00:00:47.000Z',
    rounds: 8,
    teams: 12,
    source: cachedSleeperSource,
    order: slotToRoster.map((rosterId, index) => {
      const franchise = franchises.find((candidate) => candidate.rosterId === rosterId)!;
      return {
        slot: index + 1,
        rosterId,
        ownerUserId: franchise.ownerUserId,
        franchiseName: franchise.franchiseName,
        managerDisplayName: franchise.managerDisplayName,
        avatarId: franchise.avatarId,
      };
    }),
  },
};

export const sleeperAvatarUrl = (avatarId: string) =>
  `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
