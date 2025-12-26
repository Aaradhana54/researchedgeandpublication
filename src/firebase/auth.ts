'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, firestore } from './client';
import type { UserProfile, UserRole } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

// --- Login with Role Check ---
export async function loginWithRole(email: string, password: string, requiredRole: UserRole | UserRole[]) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // After successful authentication, check the user's role from Firestore.
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // If the user document doesn't exist, they can't have the required role.
    await signOut(auth); // Sign out the user
    throw new Error('User profile not found.');
  }

  const userProfile = userDocSnap.data() as UserProfile;
  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!rolesToCheck.includes(userProfile.role)) {
    // If the role doesn't match, sign them out and throw an error.
    await signOut(auth);
    throw new Error(`Access denied. You do not have the required permissions for this portal.`);
  }

  // If role matches, return the user.
  return user;
}


// --- Generic Login (to be phased out or used carefully) ---
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// --- Signup with specific role ---
export async function signup(email: string, password: string, name: string, role: UserRole = 'client') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userProfile: Omit<UserProfile, 'createdAt'> = {
    uid: user.uid,
    name,
    email,
    role: role,
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
    console.error("Failed to create user profile, but user was created in Auth.", error);
  });

  return user;
}


// --- Logout ---
export async function logout() {
  await signOut(auth);
}
