export interface ChampionshipResult {
  season: number;
  champion: string;
  runnerUp: string;
  source: 'sleeper-verified';
}

/** Verified Sleeper-era championship record from the August 8, 2026 handoff. */
export const sleeperEraChampions: ChampionshipResult[] = [
  { season: 2021, champion: 'A.Woods', runnerUp: 'Marginally Alpha', source: 'sleeper-verified' },
  { season: 2022, champion: 'Slippery007', runnerUp: 'Proud Boys', source: 'sleeper-verified' },
  { season: 2023, champion: 'Coach', runnerUp: 'TME', source: 'sleeper-verified' },
  { season: 2024, champion: 'A.Woods', runnerUp: 'TylerPrice12', source: 'sleeper-verified' },
  { season: 2025, champion: 'Amon-Ra Doggin', runnerUp: 'Proud Boys', source: 'sleeper-verified' },
];
