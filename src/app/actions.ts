
'use server';

import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server';
import { revalidatePath } from 'next/cache';

const projectFormSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters.'),
  serviceType: z.string(),
  topic: z.string().optional(),
  courseLevel: z.string().optional(),
  deadline: z.preprocess(
    (val) => (typeof val === 'string' && val !== '' ? new Date(val) : undefined),
    z.date().optional()
  ),
  referencingStyle: z.string().optional(),
  pageCount: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number().optional()
  ),
  wordCount: z.preprocess(
    (val) => (val === '' || val == null ? undefined : Number(val)),
    z.number().optional()
  ),
  language: z.string().optional(),
  wantToPublish: z.boolean().optional(),
  publishWhere: z.string().optional(),
});


export type ProjectFormState = {
  message: string;
  errors?: Record<string, string[]>;
  success: boolean;
};

export async function createProject(
  userId: string,
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {

  if (!userId) {
     return {
      message: 'Authentication error: User ID is missing. Please log in again.',
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
    wordCount: formData.get('wordCount') || undefined,
    language: formData.get('language') || undefined,
    wantToPublish: formData.get('wantToPublish') === 'on',
    publishWhere: formData.get('publishWhere') || undefined,
  };

  const validatedFields = projectFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please correct the errors in the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const dataToSave: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(validatedFields.data)) {
        if (value !== undefined) {
            dataToSave[key] = value;
        }
    }

    await firestore.collection('projects').add({
      ...dataToSave,
      userId: userId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/dashboard/projects');

    return {
      message: 'Project submitted successfully!',
      success: true,
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      message: 'An unexpected error occurred while saving the project. Please try again.',
      success: false,
    };
  }
}

export type ContactFormState = {
    message: string;
    errors?: Record<string, string[] | undefined>;
};
