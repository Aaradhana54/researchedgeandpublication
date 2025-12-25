import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

export async function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
  } else {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
  }

  return { app: firebaseApp, auth, firestore, storage };
}

// --- Re-exports from providers and hooks ---
export { FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useFirebase, useFirebaseApp, useAuth, useFirestore, useStorage } from './provider';

// --- Auth Hooks ---
export { useUser } from './auth/use-user';

// --- Firestore Hooks ---
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
