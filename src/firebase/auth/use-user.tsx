'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/client';
import type { UserProfile } from '@/lib/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect for handling authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // If user logs out, immediately set loading to false.
      // If user logs in, the second effect will handle the loading state for profile fetching.
      if (!user) {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once

  // Effect for fetching the user profile from Firestore
  useEffect(() => {
    // If there's no user ID, there's no profile to fetch. Set loading to false.
    if (!user?.uid) {
      setUserProfile(null);
      setLoading(false); // Auth state is determined, and there's no user.
      return;
    }

    setLoading(true); // Start loading the profile
    const userDocRef = doc(firestore, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserProfile({ ...doc.data(), uid: doc.id } as UserProfile);
        } else {
          // User is authenticated but has no profile doc.
          setUserProfile(null); 
        }
        setLoading(false); // Profile fetching is complete
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setLoading(false);
    });

    // Cleanup subscription on unmount or when user.uid changes
    return () => unsubscribe();
  }, [user?.uid]); // Dependency on the stable user UID string

  return { user, userProfile, loading };
}
