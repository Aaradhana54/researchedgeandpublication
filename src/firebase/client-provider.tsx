'use client';

import { type ReactNode } from 'react';
import { firebaseApp, auth, firestore, storage } from './index';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider value={{ app: firebaseApp, auth, firestore, storage }}>
      {children}
    </FirebaseProvider>
  );
}
