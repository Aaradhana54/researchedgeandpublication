import { getApps, initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

// --- SERVICE INITIALIZATION ---

let firebaseApp: FirebaseApp;

// Check if Firebase has already been initialized
if (getApps().length > 0) {
  firebaseApp = getApp();
} else {
  firebaseApp = initializeApp(firebaseConfig);
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);
const storage: FirebaseStorage = getStorage(firebaseApp);

export { firebaseApp, auth, firestore, storage };


// --- RE-EXPORTS for PROVIDERS and HOOKS ---

export { FirebaseProvider } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useFirebase, useFirebaseApp, useAuth, useFirestore, useStorage } from './provider';

// --- Auth Hooks ---
export { useUser } from './auth/use-user';

// --- Firestore Hooks ---
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
