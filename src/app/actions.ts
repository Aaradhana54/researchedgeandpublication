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

// --- Project Creation ---
const projectFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  serviceType: z.string().min(1, 'Please select a service type.'),
  topic: z.string().min(1, 'Topic is required.').optional(),
  courseLevel: z.enum(['ug', 'pg', 'phd']).optional(),
  deadline: z.coerce.date().optional(),
  synopsisFileUrl: z.string().url().optional(),
  referencingStyle: z.string().optional(),
  pageCount: z.coerce.number().int().positive().optional(),
  wordCount: z.coerce.number().int().positive().optional(),
  language: z.string().optional(),
  wantToPublish: z.boolean().optional(),
  publishWhere: z.string().optional(),
  userId: z.string(), // This will be passed programmatically
});


export type ProjectFormState = {
    message: string;
    errors?: z.inferFlattenedErrors<typeof projectFormSchema>['fieldErrors'];
    success: boolean;
};


export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {

  const synopsisFile = formData.get('synopsisFile') as File | null;
  // In a real app, you would upload this file to Firebase Storage and get the URL.
  // For now, we'll just simulate a URL if a file is present.
  let synopsisFileUrl: string | undefined = undefined;
  if (synopsisFile && synopsisFile.size > 0) {
      synopsisFileUrl = `/uploads/placeholder/${synopsisFile.name}`;
      console.log(`File "${synopsisFile.name}" would be uploaded. Using placeholder URL: ${synopsisFileUrl}`);
  }
  
  const rawData = Object.fromEntries(formData.entries());

  const processedData = {
      ...rawData,
      topic: rawData.topic || undefined,
      courseLevel: rawData.courseLevel || undefined,
      deadline: rawData.deadline || undefined,
      referencingStyle: rawData.referencingStyle || undefined,
      language: rawData.language || undefined,
      publishWhere: rawData.publishWhere || undefined,
      pageCount: rawData.pageCount ? Number(rawData.pageCount) : undefined,
      wordCount: rawData.wordCount ? Number(rawData.wordCount) : undefined,
      wantToPublish: rawData.wantToPublish === 'on',
      synopsisFileUrl: synopsisFileUrl,
  };


  const validatedFields = projectFormSchema.safeParse(processedData);
  
  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten());
    return {
      message: 'Error: Please correct the errors in the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  if (!validatedFields.data.userId) {
      return { message: 'Error: You must be logged in to create a project.', success: false, errors: undefined };
  }

  const projectsRef = firestore.collection('projects');
  
  // Explicitly remove undefined values before sending to Firestore Admin SDK
  const projectData: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(validatedFields.data)) {
    if (value !== undefined) {
      projectData[key] = value;
    }
  }

  try {
    await projectsRef.add({
        ...projectData,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });
    return { message: `Success: Project "${projectData.title}" created!`, success: true, errors: undefined };
  } catch (e: any) {
    console.error('Project creation error:', e);
    // Return the specific Firestore error message for better debugging
    return { message: `Error: Could not save the project to the database. Reason: ${e.message}`, success: false };
  }
}