'use server';

/**
 * @fileOverview An AI-powered tool to review and approve testimonials.
 *
 * - approveTestimonial - A function that handles the testimonial approval process.
 * - ApproveTestimonialInput - The input type for the approveTestimonial function.
 * - ApproveTestimonialOutput - The return type for the approveTestimonial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApproveTestimonialInputSchema = z.object({
  name: z.string().describe('The name of the testimonial author.'),
  designation: z.string().describe('The designation of the testimonial author.'),
  message: z.string().describe('The testimonial message.'),
});
export type ApproveTestimonialInput = z.infer<typeof ApproveTestimonialInputSchema>;

const ApproveTestimonialOutputSchema = z.object({
  approved: z.boolean().describe('Whether the testimonial is approved or not.'),
  reason: z.string().describe('The reason for approval or rejection.'),
});
export type ApproveTestimonialOutput = z.infer<typeof ApproveTestimonialOutputSchema>;

export async function approveTestimonial(input: ApproveTestimonialInput): Promise<ApproveTestimonialOutput> {
  return approveTestimonialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'approveTestimonialPrompt',
  input: {schema: ApproveTestimonialInputSchema},
  output: {schema: ApproveTestimonialOutputSchema},
  prompt: `You are an expert marketing analyst specializing in evaluating customer testimonials.

  Given the following testimonial, determine if it should be approved for display on the Revio Research website.
  Consider the relevance, impact, and overall quality of the testimonial.
  Provide a brief reason for your decision.

  Name: {{{name}}}
  Designation: {{{designation}}}
  Message: {{{message}}}

  Return a JSON object with "approved" set to true if the testimonial is suitable for display, and false otherwise.
  Include a "reason" explaining your decision.
  `,
});

const approveTestimonialFlow = ai.defineFlow(
  {
    name: 'approveTestimonialFlow',
    inputSchema: ApproveTestimonialInputSchema,
    outputSchema: ApproveTestimonialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
