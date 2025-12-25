'use client';

import { type ReactNode } from 'react';
import { firebaseApp, auth, firestore, storage } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  // By initializing services here inside a 'use client' component,
  // we ensure they are treated as client-side singletons.
  const appInstance = firebaseApp;
  const authInstance = auth;
  const firestoreInstance = firestore;
  const storageInstance = storage;

  return (
    <FirebaseProvider
      value={{
        app: appInstance,
        auth: authInstance,
        firestore: firestoreInstance,
        storage: storageInstance,
      }}
    >
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseProvider>
  );
}
