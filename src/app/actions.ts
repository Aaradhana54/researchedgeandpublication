
'use server';

import { z } from 'zod';
import { serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/types';
import { firestore, auth as adminAuth, admin } from '@/firebase/server';


export type ProjectFormState = {
  message: string;
  errors?: {
    title?: string[];
    topic?: string[];
    courseLevel?: string[];
    deadline?: string[];
    referencingStyle?: string[];
    pageCount?: string[];
    language?: string[];
    _form?: string[];
  };
  success: boolean;
};

const ProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required.'),
  serviceType: z.string(),
  // Thesis/Dissertation specific fields
  topic: z.string().min(1, 'Topic is required.').optional(),
  courseLevel: z.string().min(1, 'Course level is required.').optional(),
  deadline: z.preprocess(
    (val) => (typeof val === 'string' && val !== '' ? new Date(val) : undefined),
    z.date({ invalid_type_error: "Invalid date format for deadline." }).optional()
  ),
  referencingStyle: z.string().min(1, 'Referencing style is required.').optional(),
  pageCount: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Page count must be a number.'}).optional()
  ),
  language: z.string().min(1, 'Language is required.').optional(),
  // Other form types fields (optional here)
  wordCount: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number().optional()
  ),
  wantToPublish: z.boolean().optional(),
  publishWhere: z.string().optional(),
});


export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
    
  const userId = formData.get('userId');
  if (!userId || typeof userId !== 'string') {
    return {
      message: 'Authentication error: User ID is missing.',
      errors: { _form: ['You must be logged in to create a project.'] },
      success: false,
    };
  }

  const rawFormData = {
    title: formData.get('title'),
    serviceType: formData.get('serviceType'),
    topic: formData.get('topic') || undefined,
    courseLevel: formData.get('courseLevel') || undefined,
    deadline: formData.get('deadline') || undefined,
    referencingStyle: formData.get('referencingStyle') || undefined,
    pageCount: formData.get('pageCount') || undefined,
    language: formData.get('language') || undefined,
    wordCount: formData.get('wordCount') || undefined,
    wantToPublish: formData.get('wantToPublish') === 'on',
    publishWhere: formData.get('publishWhere') || undefined,
  };

  const validatedFields = ProjectSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check the form fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const dataToSave: any = {};

  // Copy validated data
  Object.assign(dataToSave, validatedFields.data);

  // Explicitly handle date conversion to Firestore Timestamp using the ADMIN SDK
  if (validatedFields.data.deadline) {
    dataToSave.deadline = admin.firestore.Timestamp.fromDate(validatedFields.data.deadline);
  } else {
    delete dataToSave.deadline; // Ensure undefined dates are not sent
  }

  // Remove any other keys that are undefined to keep the document clean
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
  });


  try {
    const projectsCollection = firestore.collection('projects');
    await projectsCollection.add({
      ...dataToSave,
      userId: userId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/dashboard/projects');
    return { message: 'Project created successfully!', errors: {}, success: true };

  } catch (error: any) {
    console.error('Error creating project in Firestore:', error);
    const errorMessage = error.message || 'An unknown database error occurred.';
    return {
      message: `Failed to create project: ${errorMessage}`,
      errors: { _form: [errorMessage] },
      success: false,
    };
  }
}

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
