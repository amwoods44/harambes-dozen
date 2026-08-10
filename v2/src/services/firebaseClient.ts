import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseEnvironment = Readonly<Record<string, string | undefined>>;

export interface FirebaseRuntime {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

export function firebaseConfigFromEnvironment(
  environment: FirebaseEnvironment,
): FirebaseOptions | null {
  const apiKey = environment.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = environment.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = environment.VITE_FIREBASE_PROJECT_ID?.trim();
  const appId = environment.VITE_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) return null;

  return { apiKey, authDomain, projectId, appId };
}

let runtime: FirebaseRuntime | null | undefined;

export function firebaseRuntime(): FirebaseRuntime | null {
  if (runtime !== undefined) return runtime;

  const config = firebaseConfigFromEnvironment(import.meta.env);
  if (!config) {
    runtime = null;
    return runtime;
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  runtime = { app, auth: getAuth(app), db: getFirestore(app) };
  return runtime;
}
