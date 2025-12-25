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
export async function signup(email: string, password: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  const userProfile: Omit<UserProfile, 'createdAt'> = {
    uid: user.uid,
    name,
    email,
    role: 'client', // Assign 'client' role by default
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

// --- Admin: Create User ---
export async function createUser(email: string, password: string, name: string, role: UserRole) {
    // Note: This function doesn't handle auth. It's designed to be called from a server action
    // where an admin is already authenticated. It creates a user in Auth and Firestore.
    // In a real app, you'd use the Firebase Admin SDK for this on the server.
    // For this client-side simulation, we rely on security rules that must allow an admin to create users.

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile: Omit<UserProfile, 'createdAt'> = {
        uid: user.uid,
        name,
        email,
        role,
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
        throw permissionError; // Re-throw so the admin form knows it failed
    });

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
