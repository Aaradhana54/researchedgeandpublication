'use server';

import { z } from 'zod';
import { approveTestimonial } from '@/ai/flows/approve-testimonials-flow';

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

  try {
    // Here you would typically save to Firestore
    console.log('Contact form submitted:', validatedFields.data);
    return { message: 'Success: Your message has been sent!' };
  } catch (e) {
    return { message: 'Error: Could not submit the form.' };
  }
}

// --- Testimonial Approval Action ---

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  designation: z.string().min(1, 'Designation is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export type TestimonialApprovalState = {
  message: string;
  result?: {
    approved: boolean;
    reason: string;
  };
  errors?: {
    name?: string[];
    designation?: string[];
    message?: string[];
  };
};

export async function submitTestimonialForApproval(
  prevState: TestimonialApprovalState,
  formData: FormData
): Promise<TestimonialApprovalState> {
  const validatedFields = testimonialSchema.safeParse({
    name: formData.get('name'),
    designation: formData.get('designation'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Please correct the errors below.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await approveTestimonial(validatedFields.data);
    return {
      message: 'Testimonial processed by AI.',
      result: result,
    };
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      message: 'An error occurred while processing the testimonial.',
    };
  }
}
