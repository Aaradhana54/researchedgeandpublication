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

// --- Project Creation (DISABLED) ---

export type ProjectFormState = {
    message: string;
    errors?: Record<string, string[]>;
    success: boolean;
};

// This function is currently disabled and will not be called from the frontend.
export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // The logic has been removed as per the request.
  // The form on the client-side is disabled and will not trigger this action.
  return {
    message: 'Submission is currently disabled.',
    errors: {},
    success: false,
  };
}
