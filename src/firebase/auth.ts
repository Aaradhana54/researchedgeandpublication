'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, writeBatch } from 'firebase/firestore';
import { auth, firestore } from './config';
import { z } from 'zod';
import { getFirebaseErrorMessage } from './errors';


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


// --- Admin Signup ---
const adminSignupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.'),
    confirmPassword: z.string(),
    inviteCode: z.string().min(6, { message: 'Invite code is required.' })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ['confirmPassword'],
});

export type AdminSignupState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    inviteCode?: string[];
  };
};

export async function signUpAdmin(prevState: AdminSignupState, formData: FormData): Promise<AdminSignupState> {
    const validatedFields = adminSignupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Error: Please correct the fields below.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { name, email, password, inviteCode } = validatedFields.data;

    try {
        // 1. Validate Invite Code
        const invitesRef = collection(firestore, 'invites');
        const q = query(invitesRef, where("code", "==", inviteCode));
        const inviteSnap = await getDocs(q);

        if (inviteSnap.empty) {
            return { message: 'Error: Invalid invite code.' };
        }

        const inviteDoc = inviteSnap.docs[0];
        if (inviteDoc.data().claimed) {
            return { message: 'Error: This invite code has already been used.' };
        }
        
        // 2. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        
        // 3. Use a batch write to create user and update invite atomically
        const batch = writeBatch(firestore);
        
        const userDocRef = doc(firestore, 'users', user.uid);
        batch.set(userDocRef, {
            uid: user.uid,
            name: name,
            email: user.email,
            role: 'admin', // Set role to admin
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        const inviteDocRef = doc(firestore, 'invites', inviteDoc.id);
        batch.update(inviteDocRef, {
            claimed: true,
            claimedBy: user.uid,
            claimedAt: serverTimestamp()
        });

        await batch.commit();

        // The user will be automatically signed in. We can redirect them from the client.
        return { message: 'Success: Admin account created.' };

    } catch (error: any) {
        // Use a function to get a user-friendly error message
        return { message: `Error: ${getFirebaseErrorMessage(error.code)}` };
    }
}


// --- Generic Login/Logout ---

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export async function googleSignIn() {
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

    return userCredential;
}
