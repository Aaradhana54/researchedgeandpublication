'use server';

import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server';
import { revalidatePath } from 'next/cache';
import type { ProjectServiceType, CourseLevel } from '@/lib/types';

const projectFormSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  title: z.string().min(3, 'Project title must be at least 3 characters.'),
  serviceType: z.string(),
  topic: z.string().optional(),
  courseLevel: z.string().optional(),
  deadline: z.coerce.date().optional(),
  referencingStyle: z.string().optional(),
  pageCount: z.coerce.number().optional(),
  wordCount: z.coerce.number().optional(),
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
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // Convert FormData to a plain object
  const rawFormData = {
    userId: formData.get('userId'),
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
      message: 'Validation failed. Please check the form for errors.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const dataToSave = { ...validatedFields.data };

    // Remove undefined fields before saving to Firestore
    Object.keys(dataToSave).forEach(key => {
        if ((dataToSave as any)[key] === undefined) {
            delete (dataToSave as any)[key];
        }
    });

    await firestore.collection('projects').add({
      ...dataToSave,
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
      message: 'An error occurred while saving the project. Please try again.',
      success: false,
    };
  }
}


export type ContactFormState = {
    message: string;
    errors?: Record<string, string[] | undefined>;
};
