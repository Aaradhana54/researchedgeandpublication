
// --- RE-EXPORTS for SERVICES, PROVIDERS and HOOKS ---
export { firebaseApp, auth, firestore, storage } from './client';

// --- Auth Hooks ---
export { useUser } from './auth/use-user';

// --- Firestore Hooks ---
export { useDoc } from './firestore/use-doc';
export { useCollection } from './firestore/use-collection';
