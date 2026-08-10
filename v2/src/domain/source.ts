export type DataAuthority = 'sleeper' | 'commissioner' | 'historical-correction' | 'legacy';

export interface SourceStamp {
  authority: DataAuthority;
  fetchedAt: string;
  state: 'live' | 'cached' | 'manual';
}

export function sourceStamp(
  authority: DataAuthority,
  state: SourceStamp['state'] = authority === 'sleeper' ? 'live' : 'manual',
): SourceStamp {
  return {
    authority,
    state,
    fetchedAt: new Date().toISOString(),
  };
}

