'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from './client';
import type { UserProfile, UserRole } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

// --- Sign Up ---
export async function signup(email: string, password: string, name: string, role: UserRole = 'client') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  const userProfile: Omit<UserProfile, 'createdAt'> = {
    uid: user.uid,
    name,
    email,
    role: role, // Assign specified role, default to 'client' or 'referral-partner'
  };

  const userDocRef = doc(firestore, 'users', user.uid);

  setDoc(userDocRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
  }).catch((error) => {
      const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userProfile,
      }, error);
      errorEmitter.emit('permission-error', permissionError);
      // We don't re-throw here as we don't want to block the signup flow
      // The error is logged for developers via the emitter.
      console.error("Failed to create user profile, but user was created in Auth.", error);
  })


  return user;
}

// --- Login ---
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// --- Logout ---
export async function logout() {
  await signOut(auth);
}
