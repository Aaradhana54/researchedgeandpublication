
'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, getFirestore, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from './client';
import type { UserProfile, UserRole } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
import { getApp, initializeApp, deleteApp } from 'firebase/app';
import { firebaseConfig } from './config';

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
export async function signup(email: string, password: string, name: string, role: UserRole = 'client', referredByCode: string | null = null, mobile: string | null = null) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const dataToSet: any = {
    name,
    email,
    role,
    uid: user.uid,
    createdAt: serverTimestamp(),
  };
  
  if (mobile) {
    dataToSet.mobile = mobile;
  }

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

// --- Admin-only user creation ---
export async function createUserAsAdmin(email: string, password: string, name: string, role: UserRole) {
  // Create a temporary, secondary Firebase app instance.
  // This allows us to create a new user without signing out the current admin.
  const secondaryAppName = `secondary-app-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  const firestoreInstance = getFirestore(getApp());

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(firestoreInstance, 'users', user.uid);
    const dataToSet: any = {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: serverTimestamp(),
    };
    
    if (role === 'referral-partner') {
       dataToSet.referralCode = user.uid.substring(0, 8);
    }

    // Since the admin is authenticated on the client, Firestore security rules
    // should permit this write operation.
    await setDoc(userDocRef, dataToSet);

    return user;
  } catch (error: any) {
    console.error("Error creating user as admin:", error);
    throw error; // Re-throw the error to be handled by the calling component
  } finally {
     // Clean up the secondary app instance
    await deleteApp(secondaryApp);
  }
}

// --- Admin-only user deletion ---
export async function deleteUserAsAdmin(uid: string) {
  const firestoreInstance = getFirestore(getApp());
  
  // This is a placeholder for a proper backend implementation.
  // Directly deleting users from the client-side is not possible for security reasons
  // without compromising the main admin session.
  // This function will only delete the Firestore document for now.
  // To fully delete the user, you need a backend function (e.g., Cloud Function).
  
  console.warn("deleteUserAsAdmin is deleting Firestore record only. Auth user remains.");

  const userDocRef = doc(firestoreInstance, 'users', uid);
  await deleteDoc(userDocRef);
}
