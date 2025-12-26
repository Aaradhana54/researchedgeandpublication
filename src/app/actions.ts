'use server';

import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server'; // Use server-side admin firestore

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  serviceType: z.string().min(1, 'Please select a service.'),
});

export type ContactFormState = {
  message: string;
  errors?: z.inferFlattenedErrors<typeof contactFormSchema>['fieldErrors'];
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
    serviceType: formData.get('serviceType'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error: Please correct the errors in the form.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const leadsRef = firestore.collection('contact_leads');
  const leadData = {
    ...validatedFields.data,
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    await leadsRef.add(leadData);
    return { message: 'Success: Your message has been sent!' };
  } catch (e: any) {
    console.error('Contact form submission error:', e);
    return { message: `Error: Could not submit the form. Reason: ${e.message}` };
  }
}

// --- Project Creation (Rebuilt from Scratch) ---

const projectFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  serviceType: z.string().min(1, { message: 'Please select a service type.' }),
  topic: z.string().min(1, { message: 'Topic is required.' }).optional().or(z.literal('')),
  courseLevel: z.enum(['ug', 'pg', 'phd']).optional(),
  deadline: z.coerce.date().optional(),
  synopsisFileUrl: z.string().url().optional(),
  referencingStyle: z.string().optional().or(z.literal('')),
  pageCount: z.coerce.number({ invalid_type_error: 'Page count must be a number.' }).int().positive().optional(),
  wordCount: z.coerce.number({ invalid_type_error: 'Word count must be a number.' }).int().positive().optional(),
  language: z.string().optional().or(z.literal('')),
  wantToPublish: z.boolean().optional().default(false),
  publishWhere: z.string().optional().or(z.literal('')),
  userId: z.string().min(1, { message: 'You must be logged in.' }),
});

export type ProjectFormState = {
    message: string;
    errors?: z.inferFlattenedErrors<typeof projectFormSchema>['fieldErrors'];
    success: boolean;
};

const initialProjectFormState: ProjectFormState = {
  message: '',
  errors: undefined,
  success: false,
};

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {

  // 1. Sanitize and prepare data for validation
  const rawData = Object.fromEntries(formData.entries());

  const dataToValidate = {
      ...rawData,
      // Convert empty strings from optional fields to undefined for Zod
      topic: rawData.topic || undefined,
      courseLevel: rawData.courseLevel || undefined,
      deadline: rawData.deadline || undefined,
      referencingStyle: rawData.referencingStyle || undefined,
      language: rawData.language || undefined,
      publishWhere: rawData.publishWhere || undefined,
      pageCount: rawData.pageCount ? Number(rawData.pageCount) : undefined,
      wordCount: rawData.wordCount ? Number(rawData.wordCount) : undefined,
      wantToPublish: rawData.wantToPublish === 'on',
      // File handling should be done here. For now, we simulate a URL.
      synopsisFileUrl: formData.get('synopsisFile') ? '/uploads/placeholder.txt' : undefined,
  };

  // 2. Validate the data using Zod
  const validatedFields = projectFormSchema.safeParse(dataToValidate);
  
  if (!validatedFields.success) {
    console.log('Validation failed:', validatedFields.error.flatten());
    return {
      message: 'Validation Error: Please correct the errors in the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // 3. Prepare a clean data object for Firestore (remove undefined values)
  const firestoreData: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(validatedFields.data)) {
    if (value !== undefined) {
      firestoreData[key] = value;
    }
  }
  
  // 4. Add server-side fields and save to Firestore using Admin SDK
  try {
    const projectsRef = firestore.collection('projects');
    await projectsRef.add({
        ...firestoreData,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });
    
    // 5. Return success response
    return { message: `Success: Project "${firestoreData.title}" created!`, success: true, errors: undefined };

  } catch (e: any) {
    console.error('Project creation error:', e);
    // 6. Return specific database error
    return { message: `Error: Could not save the project to the database. Reason: ${e.message}`, success: false };
  }
}
