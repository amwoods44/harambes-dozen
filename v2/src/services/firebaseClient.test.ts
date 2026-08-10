import { describe, expect, it } from 'vitest';

import { firebaseConfigFromEnvironment } from './firebaseClient';

describe('Firebase runtime boundary', () => {
  it('stays disabled when deployment credentials are not configured', () => {
    expect(firebaseConfigFromEnvironment({})).toBeNull();
  });

  it('accepts only a complete public Firebase web configuration', () => {
    expect(
      firebaseConfigFromEnvironment({
        VITE_FIREBASE_API_KEY: 'public-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'league.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'league',
        VITE_FIREBASE_APP_ID: 'app-id',
      }),
    ).toEqual({
      apiKey: 'public-key',
      authDomain: 'league.firebaseapp.com',
      projectId: 'league',
      appId: 'app-id',
    });

    expect(
      firebaseConfigFromEnvironment({
        VITE_FIREBASE_API_KEY: 'public-key',
        VITE_FIREBASE_PROJECT_ID: 'league',
      }),
    ).toBeNull();
  });
});
