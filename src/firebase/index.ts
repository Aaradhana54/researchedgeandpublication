import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export async function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }

  return { app: firebaseApp, auth, firestore };
}

// --- Re-exports from providers and hooks ---
export { FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';

// --- Auth Hooks ---
export { useUser } from './auth/use-user';

// --- Firestore Hooks ---
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
