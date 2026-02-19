'use server';
/**
 * @fileOverview A Genkit flow for generating personalized music practice sessions for children.
 *
 * - generatePersonalizedPracticeSession - A function that generates a tailored practice exercise.
 * - PersonalizedPracticeSessionGeneratorInput - The input type for the function.
 * - PersonalizedPracticeSessionGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedPracticeSessionGeneratorInputSchema = z.object({
  challengingNotes: z.array(z.string()).describe('Notes that the child frequently struggles with, e.g., ["C4", "F#5"].'),
  challengingClefs: z.array(z.enum(['treble', 'bass'])).describe('Clefs that the child frequently struggles with, e.g., ["treble"].'),
  recentPerformanceSummary: z.string().optional().describe('An optional summary of the child\'s recent performance, providing context for personalization.'),
});
export type PersonalizedPracticeSessionGeneratorInput = z.infer<typeof PersonalizedPracticeSessionGeneratorInputSchema>;

const PersonalizedPracticeSessionGeneratorOutputSchema = z.object({
  exerciseType: z.enum(['identify_note_on_staff', 'find_note_on_keyboard', 'simple_note_sequence']).describe('The type of practice exercise to generate.'),
  clef: z.enum(['treble', 'bass', 'mixed']).describe('The primary clef for the exercise.'),
  focusNotes: z.array(z.string()).describe('Specific notes the exercise should focus on, e.g., ["C4", "E4", "G4"].'),
  instructions: z.string().describe('Clear, child-friendly instructions for the generated practice exercise.'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('The suggested difficulty level for the exercise.'),
});
export type PersonalizedPracticeSessionGeneratorOutput = z.infer<typeof PersonalizedPracticeSessionGeneratorOutputSchema>;

export async function generatePersonalizedPracticeSession(input: PersonalizedPracticeSessionGeneratorInput): Promise<PersonalizedPracticeSessionGeneratorOutput> {
  return personalizedPracticeSessionGeneratorFlow(input);
}

const personalizedPracticePrompt = ai.definePrompt({
  name: 'personalizedPracticePrompt',
  input: { schema: PersonalizedPracticeSessionGeneratorInputSchema },
  output: { schema: PersonalizedPracticeSessionGeneratorOutputSchema },
  prompt: `You are a friendly and encouraging music teacher for children aged 6-12. Your task is to create a personalized practice exercise based on a child's recent performance. The goal is to help them improve on notes or clefs they find challenging.

Here is what the child has been struggling with:
{{#if challengingNotes}}
Challenging Notes: {{{challengingNotes}}}
{{/if}}
{{#if challengingClefs}}
Challenging Clefs: {{{challengingClefs}}}
{{/if}}
{{#if recentPerformanceSummary}}
Recent Performance Summary: {{{recentPerformanceSummary}}}
{{/if}}

Based on this information, design a single, focused practice exercise. Choose an 'exerciseType' from 'identify_note_on_staff', 'find_note_on_keyboard', or 'simple_note_sequence'. If both clefs are challenging, you can suggest 'mixed'. Provide clear, encouraging instructions. Suggest a 'difficultyLevel' (easy, medium, hard) appropriate for targeted practice.

Make sure the 'focusNotes' array contains specific notes that are relevant to the identified challenges and clefs.`,
});

const personalizedPracticeSessionGeneratorFlow = ai.defineFlow(
  {
    name: 'personalizedPracticeSessionGeneratorFlow',
    inputSchema: PersonalizedPracticeSessionGeneratorInputSchema,
    outputSchema: PersonalizedPracticeSessionGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedPracticePrompt(input);
    return output!;
  }
);
