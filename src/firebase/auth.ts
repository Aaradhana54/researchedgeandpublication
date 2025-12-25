'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { initializeFirebase } from './index';

// Initialize Firebase and get services once at the module level.
const firebasePromise = initializeFirebase();

async function getServices() {
  return await firebasePromise;
}

export async function signUpClient(name: string, email: string, password:string) {
  const { auth, firestore } = await getServices();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile in Firebase Auth
  await updateProfile(user, { displayName: name });

  // Create user profile in Firestore
  const userDocRef = doc(firestore, 'users', user.uid);
  await setDoc(userDocRef, {
    uid: user.uid,
    name: name,
    email: user.email,
    role: 'client', // CRITICAL: Role is always 'client' on signup
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userCredential;
}

export async function login(email: string, password: string) {
  const { auth } = await getServices();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  const { auth } = await getServices();
  return signOut(auth);
}

export async function googleSignIn() {
    const { auth, firestore } = await getServices();
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Create user profile in Firestore if it's a new user
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            role: 'client',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    return userCredential;
}
