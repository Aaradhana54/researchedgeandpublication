
'use server';

import { z } from 'zod';
import { FieldValue, Timestamp }from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server';
import { revalidatePath } from 'next/cache';
import type { ProjectServiceType, CourseLevel } from '@/lib/types';


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
    z.date().optional()
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
  userId: string,
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
    
  if (!userId) {
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

  const dataToSave: any = {
    ...validatedFields.data,
  };
  
  // Explicitly handle date conversion to Firestore Timestamp
  if (validatedFields.data.deadline) {
    dataToSave.deadline = Timestamp.fromDate(validatedFields.data.deadline);
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
    await firestore.collection('projects').add({
      ...dataToSave,
      userId: userId,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/dashboard/projects');
    return { message: 'Project created successfully!', errors: {}, success: true };

  } catch (error) {
    console.error('Error creating project in Firestore:', error);
    return {
      message: 'An unexpected error occurred while saving the project. Please try again.',
      errors: { _form: ['Database error.'] },
      success: false,
    };
  }
}
