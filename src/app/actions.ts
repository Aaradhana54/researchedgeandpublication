'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/firebase/server';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  serviceType: z.string().min(1, 'Please select a service.'),
});

export type ContactFormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    message?: string[];
    serviceType?: string[];
  };
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
      message: 'Error: Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const leadsRef = collection(firestore, 'contact_leads');
  const leadData = {
    ...validatedFields.data,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(leadsRef, leadData);
    return { message: 'Success: Your message has been sent!' };
  } catch (e: any) {
    console.error('Contact form submission error:', e);
    return { message: 'Error: Could not submit the form.' };
  }
}
