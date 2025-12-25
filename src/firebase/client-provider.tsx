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
  return (
    <FirebaseProvider value={{ app: firebaseApp, auth, firestore, storage }}>
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </FirebaseProvider>
  );
}
