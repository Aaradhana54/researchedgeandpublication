
'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, getFirestore } from 'firebase/firestore';
import { auth, firestore } from './client';
import type { UserProfile, UserRole } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { getApp } from 'firebase/app';

// --- Login with Role Check ---
export async function loginWithRole(email: string, password: string, requiredRole: UserRole | UserRole[]) {
  const app = getApp();
  const authInstance = getAuth(app);
  const firestoreInstance = getFirestore(app);

  const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
  const user = userCredential.user;

  // After successful authentication, check the user's role from Firestore.
  const userDocRef = doc(firestoreInstance, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    // If the user document doesn't exist, they can't have the required role.
    await signOut(authInstance); // Sign out the user
    throw new Error('User profile not found.');
  }

  const userProfile = userDocSnap.data() as UserProfile;
  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!rolesToCheck.includes(userProfile.role)) {
    // If the role doesn't match, sign them out and throw an error.
    await signOut(authInstance);
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
export async function signup(email: string, password: string, name: string, role: UserRole = 'client', referredByCode: string | null = null) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const dataToSet: any = {
    name,
    email,
    role,
    uid: user.uid,
    createdAt: serverTimestamp(),
  };

  if (role === 'referral-partner') {
    // Generate a unique referral code for partners. For simplicity, we use part of the UID.
    dataToSet.referralCode = user.uid.substring(0, 8);
  }
  
  if (role === 'client' && referredByCode) {
      dataToSet.referredBy = referredByCode;
  }

  const userDocRef = doc(firestore, 'users', user.uid);

  // Firestore rules should allow the user to create their own profile document
  setDoc(userDocRef, dataToSet).catch((error) => {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'create',
      requestResourceData: dataToSet,
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
