
'use server';

import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server';
import { revalidatePath } from 'next/cache';


export type ContactFormState = {
    message: string;
    errors?: Record<string, string[] | undefined>;
};
