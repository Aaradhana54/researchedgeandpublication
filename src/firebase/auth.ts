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
import type { UserProfile } from '@/lib/types';

// --- Sign Up ---
export async function signup(email: string, password: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    name,
    email,
    createdAt: serverTimestamp() as any, // Let the server generate the timestamp
  };

  await setDoc(doc(firestore, 'users', user.uid), userProfile);

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
