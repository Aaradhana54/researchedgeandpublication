
'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { useFirebaseApp } from '../provider';
import type { UserProfile } from '@/lib/types';
import { getAuth } from 'firebase/auth';

interface UserContextValue {
  user: (UserProfile & { emailVerified: boolean }) | null;
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
  const [user, setUser] = useState<(UserProfile & { emailVerified: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const app = useFirebaseApp();

  useEffect(() => {
    if (!app) return;

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
          setLoading(true);
          const profileRef = doc(firestore, 'users', authUser.uid);
          
          profileUnsubscribe = onSnapshot(
            profileRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                 const userProfileData = docSnapshot.data() as Omit<UserProfile, 'uid'>;
                 // Combine profile with email verification status
                 setUser({ 
                   ...userProfileData, 
                   uid: authUser.uid,
                   emailVerified: authUser.emailVerified 
                  });
              } else {
                // This can happen if the user record is deleted from Firestore but not Auth
                setUser(null);
                // Force sign out to clean up state
                signOut(auth);
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
  }, [app]);

  const value = { user, loading, error };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
