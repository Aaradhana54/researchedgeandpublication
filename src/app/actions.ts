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

// --- Project Creation ---
const projectFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  serviceType: z.string().min(1, 'Please select a service type.'),
  topic: z.string().min(1, 'Topic is required.').optional(),
  courseLevel: z.enum(['ug', 'pg', 'phd']).optional(),
  deadline: z.coerce.date().optional(),
  synopsisFileUrl: z.string().optional(),
  referencingStyle: z.string().optional(),
  pageCount: z.coerce.number().int().positive().optional(),
  wordCount: z.coerce.number().int().positive().optional(),
  language: z.string().optional(),
  wantToPublish: z.preprocess((val) => val === 'on', z.boolean()).optional(),
  publishWhere: z.string().optional(),
  userId: z.string(), // This will be passed programmatically
});


export type ProjectFormState = {
    message: string;
    errors?: Zod.ZodError<z.infer<typeof projectFormSchema>>['formErrors']['fieldErrors'];
    success: boolean;
};


export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {

  // Note: File handling would happen here. For now, we just pass a placeholder.
  // In a real app, you'd upload the file to Firebase Storage and get a URL.
  const synopsisFile = formData.get('synopsisFile') as File | null;
  let synopsisFileUrl: string | undefined = undefined;
  if (synopsisFile && synopsisFile.size > 0) {
      // Placeholder for file upload logic
      synopsisFileUrl = `/uploads/placeholder/${synopsisFile.name}`;
      console.log(`File "${synopsisFile.name}" would be uploaded. URL: ${synopsisFileUrl}`);
  }

  const rawFormData = {
    title: formData.get('title'),
    serviceType: formData.get('serviceType'),
    topic: formData.get('topic') || undefined,
    courseLevel: formData.get('courseLevel') || undefined,
    deadline: formData.get('deadline') || undefined,
    referencingStyle: formData.get('referencingStyle') || undefined,
    pageCount: formData.get('pageCount') === '' ? undefined : formData.get('pageCount'),
    wordCount: formData.get('wordCount') === '' ? undefined : formData.get('wordCount'),
    language: formData.get('language') || undefined,
    wantToPublish: formData.get('wantToPublish'),
    publishWhere: formData.get('publishWhere') || undefined,
    userId: formData.get('userId'),
    synopsisFileUrl: synopsisFileUrl,
  };


  const validatedFields = projectFormSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
      console.log("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Error: Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  // Double-check user authentication on the server
  if (!validatedFields.data.userId) {
      return { message: 'Error: You must be logged in to create a project.', success: false };
  }

  const projectsRef = collection(firestore, 'projects');
  
  // Clean up undefined, null, or empty string values so they are not stored in Firestore
  const projectData = Object.fromEntries(
      Object.entries(validatedFields.data).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

  try {
    const docRef = await addDoc(projectsRef, {
        ...projectData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return { message: `Success: Project "${projectData.title}" created!`, success: true };
  } catch (e: any) {
    console.error('Project creation error:', e);
    return { message: 'Error: Could not save the project to the database.', success: false };
  }
}
