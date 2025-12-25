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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If user is null, we're not loading anymore
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    // If there's no user, we don't need to fetch a profile
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserProfile({ ...doc.data(), uid: doc.id } as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setLoading(false);
    });

    // Cleanup subscription on unmount or if user changes
    return () => unsubscribe();
  }, [user]); // Re-run this effect only when the user object changes

  return { user, userProfile, loading };
}
