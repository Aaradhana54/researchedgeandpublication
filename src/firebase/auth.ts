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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeFirebase } from './index';

async function getServices() {
  const { auth, firestore } = await initializeFirebase();
  return { auth, firestore };
}

export async function signUpClient(name: string, email: string, password: string) {
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
    await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'client',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true }); // Merge to avoid overwriting existing data

    return userCredential;
}
