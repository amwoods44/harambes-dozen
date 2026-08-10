import { describe, expect, it } from 'vitest';

import { createMemberSessionService, sessionFromMemberProfile } from './memberSession';

describe('member session boundary', () => {
  it('stays disabled before Firebase deployment configuration exists', () => {
    expect(createMemberSessionService(null)).toBeNull();
  });

  it('maps only active, explicitly linked league members to private sessions', () => {
    expect(sessionFromMemberProfile({ sleeperUserId: '393634863552425984', active: true })).toEqual({
      kind: 'member',
      userId: '393634863552425984',
      role: 'member',
    });
    expect(sessionFromMemberProfile({ sleeperUserId: '726213207588438016', role: 'admin' })).toEqual({
      kind: 'member',
      userId: '726213207588438016',
      role: 'admin',
    });
    expect(sessionFromMemberProfile({ sleeperUserId: 'x', active: false })).toEqual({ kind: 'public' });
    expect(sessionFromMemberProfile({})).toEqual({ kind: 'public' });
  });
});
