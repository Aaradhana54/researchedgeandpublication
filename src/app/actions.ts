
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { UserRole, ProjectStatus } from '@/lib/types';
// The admin SDK is not being used as the server environment cannot authenticate.
// import { admin, firestore as adminFirestore, auth as adminAuth } from '@/firebase/server';

const CreateUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.string().min(1, { message: 'Role is required' }),
});

/**
 * This function is currently disabled due to a server-side authentication issue.
 * The environment is unable to refresh its access token to perform administrative tasks.
 * @see src/components/admin/create-user-dialog.tsx for the user-facing message.
 */
export async function createUserAsAdmin(formData: FormData) {
  throw new Error('User creation is temporarily unavailable due to a server configuration issue. Please contact support.');
}
