import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import type { ViewerSession } from '../App';
import { firebaseRuntime, type FirebaseRuntime } from './firebaseClient';

const pendingEmailKey = 'hd12-pending-sign-in-email';

function updatePendingEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(pendingEmailKey, email);
    else localStorage.removeItem(pendingEmailKey);
  } catch {
    // Email-link authentication still works when browser storage is unavailable.
  }
}

function removeAuthenticationParameters() {
  const url = new URL(window.location.href);
  ['apiKey', 'continueUrl', 'finishSignIn', 'lang', 'mode', 'oobCode'].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState(
    window.history.state,
    document.title,
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export interface MemberProfile {
  sleeperUserId?: unknown;
  role?: unknown;
  active?: unknown;
}

export interface MemberSessionService {
  subscribe(listener: (session: ViewerSession) => void): () => void;
  submitEmail(email: string): Promise<'link-sent' | 'signed-in'>;
  signOut(): Promise<void>;
  isCompletingEmailLink(): boolean;
}

export function sessionFromMemberProfile(profile: MemberProfile): ViewerSession {
  const sleeperUserId = typeof profile.sleeperUserId === 'string'
    ? profile.sleeperUserId.trim()
    : '';
  if (!sleeperUserId || profile.active === false) return { kind: 'public' };
  const role = profile.role === 'admin' ? 'admin' : 'member';
  return { kind: 'member', userId: sleeperUserId, role };
}

export function createMemberSessionService(
  runtime: FirebaseRuntime | null = firebaseRuntime(),
): MemberSessionService | null {
  if (!runtime) return null;

  return {
    subscribe(listener) {
      let generation = 0;
      const unsubscribe = onAuthStateChanged(runtime.auth, async (user) => {
        const eventGeneration = ++generation;
        if (!user) {
          listener({ kind: 'public' });
          return;
        }
        try {
          const member = await getDoc(doc(runtime.db, 'members', user.uid));
          if (eventGeneration !== generation || runtime.auth.currentUser?.uid !== user.uid) return;
          listener(member.exists() ? sessionFromMemberProfile(member.data()) : { kind: 'public' });
        } catch {
          if (eventGeneration !== generation) return;
          listener({ kind: 'public' });
        }
      });
      return () => {
        generation += 1;
        unsubscribe();
      };
    },
    async submitEmail(rawEmail) {
      const email = rawEmail.trim().toLowerCase();
      if (!email) throw new Error('Enter the email address on your league invitation.');
      if (isSignInWithEmailLink(runtime.auth, window.location.href)) {
        await signInWithEmailLink(runtime.auth, email, window.location.href);
        updatePendingEmail(null);
        removeAuthenticationParameters();
        return 'signed-in';
      }
      const returnUrl = `${window.location.origin}${window.location.pathname}?finishSignIn=1`;
      await sendSignInLinkToEmail(runtime.auth, email, {
        url: returnUrl,
        handleCodeInApp: true,
      });
      updatePendingEmail(email);
      return 'link-sent';
    },
    async signOut() {
      await signOut(runtime.auth);
    },
    isCompletingEmailLink() {
      return isSignInWithEmailLink(runtime.auth, window.location.href);
    },
  };
}
