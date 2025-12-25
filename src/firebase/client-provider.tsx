'use client';

import { type ReactNode } from 'react';
// IMPORTANT: We now import the lazily-initialized services
import { firebaseApp, auth, firestore, storage } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  // The services are now initialized lazily on the client in config.ts.
  // We can safely pass them to the provider.
  return (
    <FirebaseProvider
      value={{
        app: firebaseApp,
        auth: auth,
        firestore: firestore,
        storage: storage,
      }}
    >
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseProvider>
  );
}
