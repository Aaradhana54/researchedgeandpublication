'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth, firestore } from '@/firebase/client';
import type { UserProfile } from '@/lib/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        // Clean up old profile listener if it exists
        if (profileUnsubscribe) {
            profileUnsubscribe();
        }

        // Listen for profile changes
        const userDocRef = doc(firestore, 'users', authUser.uid);
        profileUnsubscribe = onSnapshot(userDocRef, (doc) => {
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
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        if (profileUnsubscribe) {
            profileUnsubscribe();
        }
        setLoading(false);
      }
    });

    // Cleanup both subscriptions on unmount
    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return { user, userProfile, loading };
}
