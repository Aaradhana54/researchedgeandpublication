'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore'; // Import getFirestore
import { useFirebaseApp } from '../provider'; // Import useFirebaseApp
import type { UserProfile } from '@/lib/types';
import { getAuth } from 'firebase/auth';

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
  const app = useFirebaseApp(); // Get the initialized app instance

  useEffect(() => {
    if (!app) return; // Wait for the app to be initialized

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    let profileUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(
      auth,
      (authUser: FirebaseUser | null) => {
        if (profileUnsubscribe) {
          profileUnsubscribe();
        }

        if (authUser) {
          // Still loading until we get the profile
          setLoading(true);
          const profileRef = doc(firestore, 'users', authUser.uid);
          
          profileUnsubscribe = onSnapshot(
            profileRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                 const userProfileData = docSnapshot.data() as Omit<UserProfile, 'uid'>;
                setUser({ ...userProfileData, uid: authUser.uid });
              } else {
                setUser(null);
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
  }, [app]); // Rerun effect if app instance changes

  const value = { user, loading, error };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
