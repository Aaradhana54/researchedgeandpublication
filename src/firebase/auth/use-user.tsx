'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/client';
import type { UserProfile } from '@/lib/types';

interface UseUserHook {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export function useUser(): UseUserHook {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      // If a profile listener is active, unsubscribe from it
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      if (authUser) {
        // User is logged in, set the user object
        setUser(authUser);
        
        // Set up a new listener for the user's profile document
        const userDocRef = doc(firestore, 'users', authUser.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile({ ...docSnap.data(), uid: docSnap.id } as UserProfile);
          } else {
            // Profile doesn't exist
            setUserProfile(null);
          }
          // Finished loading auth state and profile data
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setLoading(false);
        });

      } else {
        // User is signed out, reset all state
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function to unsubscribe from both listeners on component unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return { user, userProfile, loading };
}
