
'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, getFirestore, deleteDoc, collection, writeBatch } from 'firebase/firestore';
import { auth, firestore } from './client';
import type { UserProfile, UserRole } from '@/lib/types';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, getFirebaseErrorMessage } from './errors';
import { getApp, initializeApp, deleteApp } from 'firebase/app';
import { firebaseConfig } from './config';

// --- Login with Role Check ---
export async function loginWithRole(email: string, password: string, requiredRole: UserRole | UserRole[]) {
  const app = getApp();
  const authInstance = getAuth(app);
  const firestoreInstance = getFirestore(app);

  const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
  const user = userCredential.user;

  // Check if email is verified for client roles
  const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (rolesToCheck.includes('client') && !user.emailVerified) {
    await signOut(authInstance);
    // Throw a specific error code to be handled in the UI
    const error = new Error('Please verify your email before logging in.');
    error.name = 'AuthError';
    (error as any).code = 'auth/email-not-verified';
    throw error;
  }

  const userDocRef = doc(firestoreInstance, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await signOut(authInstance);
    throw new Error('User profile not found.');
  }

  const userProfile = userDocSnap.data() as UserProfile;

  if (!rolesToCheck.includes(userProfile.role)) {
    await signOut(authInstance);
    throw new Error(`Access denied. You do not have the required permissions for this portal.`);
  }

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

  // Send verification email
  await sendEmailVerification(user);

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
    dataToSet.referralCode = user.uid.substring(0, 8);
  }
  
  if (role === 'client' && referredByCode) {
      dataToSet.referredBy = referredByCode;
  }

  const userDocRef = doc(firestore, 'users', user.uid);

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

// --- Password Reset ---
export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// --- Admin-only user creation ---
export async function createUserAsAdmin(email: string, password: string, name: string, role: UserRole) {
  const secondaryAppName = `secondary-app-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  const firestoreInstance = getFirestore(getApp());
  const mainAuth = getAuth(getApp());

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;
    
    // Create the user profile document in Firestore
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
    await setDoc(userDocRef, dataToSet);

    // Send a password reset email so the user can set their password
    await sendPasswordResetEmail(mainAuth, email);

    return user;

  } catch (error: any) {
    console.error("Error creating user as admin:", error);
    // Attempt to clean up the created auth user if firestore write fails, though this is not guaranteed
     if (secondaryAuth.currentUser) {
       // This part of cleanup is tricky and might fail if the user was just created
       // and the session isn't fully established.
       console.log("Attempting cleanup of partially created user.");
     }
    throw error;
  } finally {
    // Ensure the temporary app is always cleaned up
    if (secondaryAuth.currentUser) {
        await signOut(secondaryAuth);
    }
    await deleteApp(secondaryApp);
  }
}

// --- Resend verification email ---
export async function resendVerificationEmail(email: string, password: string) {
    // We need to re-authenticate the user briefly to get a fresh user object
    // This is a common pattern for sensitive operations.
    const tempAuth = getAuth();
    const userCredential = await signInWithEmailAndPassword(tempAuth, email, password);
    if(userCredential.user && !userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
    }
    // Sign out immediately after, we don't want to leave this session active.
    await signOut(tempAuth);
}


// --- Admin-only user deletion ---
export async function deleteUserAsAdmin(uid: string) {
  const firestoreInstance = getFirestore(getApp());
  
  console.warn("deleteUserAsAdmin is deleting Firestore record only. Auth user remains.");

  const userDocRef = doc(firestoreInstance, 'users', uid);
  await deleteDoc(userDocRef);
}
