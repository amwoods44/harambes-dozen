import { describe, expect, it } from 'vitest';

import { viewerSessionFromSearch } from './viewerSession';

describe('viewerSessionFromSearch', () => {
  it('defaults production visitors to the public league view', () => {
    expect(viewerSessionFromSearch('', false)).toEqual({ kind: 'public' });
    expect(viewerSessionFromSearch('?as=393634863552425984', false)).toEqual({ kind: 'public' });
  });

  it('supports explicit member impersonation only in local development', () => {
    expect(viewerSessionFromSearch('?as=393634863552425984', true)).toEqual({
      kind: 'member',
      userId: '393634863552425984',
    });
  });

  it('supports an explicit public privacy preview during development', () => {
    expect(viewerSessionFromSearch('?public=1&as=393634863552425984', true)).toEqual({
      kind: 'public',
    });
  });
});
