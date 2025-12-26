
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/types';
import { firestore, auth as adminAuth, admin } from '@/firebase/server';


const CreateUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.string().min(1, { message: 'Role is required' }),
});

export async function createUserAsAdmin(formData: FormData) {
  const rawFormData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as UserRole,
  };

  const validation = CreateUserSchema.safeParse(rawFormData);

  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => e.message).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }

  const { email, password, name, role } = validation.data;

  try {
    // 1. Create the user in Firebase Auth using the Admin SDK
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Create the user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      name,
      email,
      role,
      createdAt: admin.firestore.Timestamp.now(),
    };
    
    // Use the admin firestore instance
    await firestore.collection('users').doc(userRecord.uid).set(userProfile);

    // 3. Revalidate paths to update the user lists in the admin panel
    revalidatePath('/admin/users');
    revalidatePath('/admin/team/writing');
    revalidatePath('/admin/team/sales');
    revalidatePath('/admin/team/publication');
    revalidatePath('/admin/team/accounts');

    return { success: true, message: `User ${name} created successfully.` };
  } catch (error: any) {
    let errorMessage = 'An unknown error occurred.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email is already in use by another account.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    console.error('Error creating user as admin:', error);
    throw new Error(errorMessage);
  }
}
