
'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, firestore } from './server';

// --- Client Signup ---
export async function signUpClient(name: string, email: string, password:string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

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


// --- Generic Login/Logout ---

export async function login(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user };
    } catch (error: any) {
        return { error };
    }
}

export async function logout() {
  return signOut(auth);
}

export async function googleSignIn() {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

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
        return { user: userCredential.user };
    } catch (error: any) {
        return { error };
    }
}
