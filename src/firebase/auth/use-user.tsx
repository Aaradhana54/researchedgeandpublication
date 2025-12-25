'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, type DocumentData } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/client';
import type { UserProfile } from '@/lib/types';

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  error: null,
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(
      auth,
      (authUser: FirebaseUser | null) => {
        if (profileUnsubscribe) {
          profileUnsubscribe();
        }

        if (authUser) {
          setLoading(true);
          const profileRef = doc(firestore, 'users', authUser.uid);
          profileUnsubscribe = onSnapshot(
            profileRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                setUser(docSnapshot.data() as UserProfile);
              } else {
                // This case might happen if profile creation fails after signup
                setUser(null);
                setError(new Error('User profile does not exist.'));
              }
              setLoading(false);
            },
            (err) => {
              console.error('Error fetching user profile:', err);
              setError(err);
              setUser(null);
              setLoading(false);
            }
          );
        } else {
          // User is signed out
          setUser(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err);
        setUser(null);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const value = { user, loading, error };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
