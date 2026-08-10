export const sleeperUsersFixture = [
  {
    user_id: '393634863552425984',
    display_name: 'AWoods',
    avatar: '9e7b822224080787fa6fad652e3f285e',
    metadata: { team_name: 'A.Woods' },
  },
  {
    user_id: '726213207588438016',
    display_name: 'charlieklumb21',
    avatar: null,
    metadata: { team_name: 'Commissioner of Power' },
  },
] as const;

export const sleeperRostersFixture = [
  { roster_id: 1, owner_id: '726213207588438016', players: [], starters: [] },
  { roster_id: 2, owner_id: '393634863552425984', players: [], starters: [] },
] as const;

export const sleeperDraftFixture = {
  draft_id: '1334235260417744896',
  league_id: '1334235260409380864',
  season: '2026',
  status: 'pre_draft',
  type: 'linear',
  start_time: 1787356847000,
  draft_order: {
    '726213207588438016': 2,
    '393634863552425984': 3,
  },
  slot_to_roster_id: {
    '2': 1,
    '3': 2,
  },
  settings: {
    rounds: 8,
    teams: 12,
    slots_qb: 1,
    slots_rb: 2,
    slots_wr: 3,
    slots_te: 1,
    slots_flex: 2,
    slots_def: 1,
    slots_bn: 15,
  },
} as const;

export const sleeperTradedPicksFixture = [
  {
    round: 2,
    season: '2026',
    roster_id: 2,
    owner_id: 8,
    previous_owner_id: 2,
  },
  {
    round: 1,
    season: '2026',
    roster_id: 10,
    owner_id: 6,
    previous_owner_id: 4,
  },
] as const;

export const sleeperOffseasonTransactionFixture = {
  transaction_id: '1339999999999999999',
  type: 'trade',
  status: 'complete',
  leg: 1,
  created: 1786118400000,
  roster_ids: [2, 8],
  adds: { '12501': 8 },
  drops: null,
  draft_picks: [
    {
      season: '2027',
      round: 2,
      roster_id: 2,
      previous_owner_id: 2,
      owner_id: 8,
    },
  ],
} as const;

