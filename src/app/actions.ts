'use server';

// This file is intentionally left with minimal code.
// Server actions for form submissions were removed as per user request.

export type ProjectFormState = {
  message: string;
  errors?: Record<string, string[]>;
  success: boolean;
};

export type ContactFormState = {
    message: string;
    errors?: Record<string, string[] | undefined>;
};
