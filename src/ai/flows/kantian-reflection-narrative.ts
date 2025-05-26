'use server';
/**
 * @fileOverview A Genkit flow for generating a Kantian reflection narrative based on user choices.
 *
 * - generateKantianNarrative - A function that generates the narrative.
 * - KantianNarrativeInput - The input type for the generateKantianNarrative function.
 * - KantianNarrativeOutput - The return type for the generateKantianNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KantianNarrativeInputSchema = z.object({
  dilemmaText: z.string().describe('The text of the ethical dilemma.'),
  userResponse: z.number().describe('The user\u2019s response to the dilemma (a number between 0 and 1).'),
  topic: z.string().describe('The ethical topic of the dilemma.'),
});

export type KantianNarrativeInput = z.infer<typeof KantianNarrativeInputSchema>;

const KantianNarrativeOutputSchema = z.object({
  narrative: z.string().describe('A narrative explaining the consequences of universalizing the user\u2019s response, using a \'What if everyone...\' format.'),
});

export type KantianNarrativeOutput = z.infer<typeof KantianNarrativeOutputSchema>;

export async function generateKantianNarrative(
  input: KantianNarrativeInput
): Promise<KantianNarrativeOutput> {
  return kantianReflectionNarrativeFlow(input);
}

const kantianNarrativePrompt = ai.definePrompt({
  name: 'kantianNarrativePrompt',
  input: {schema: KantianNarrativeInputSchema},
  output: {schema: KantianNarrativeOutputSchema},
  prompt: `You are an AI assistant designed to help users reflect on the ethical implications of their decisions from a Kantian perspective.

You will receive the text of an ethical dilemma, the user's response (a number between 0 and 1), and the ethical topic of the dilemma.

Your task is to generate a short narrative (around 100-150 words) that explains the potential consequences of universalizing the user's response, using a \"What if everyone...\" format.

The narrative should:

*   Clearly state the user's implied maxim (the principle behind their action) based on their response.
*   Explain what would happen if everyone acted according to that maxim.
*   Highlight any contradictions, harms, or undesirable consequences that would arise from the universalization of the maxim.
*   Offer a concise reflection on the ethical implications of the user's choice from a Kantian perspective, focusing on the importance of acting according to principles that could be universal laws.
*   Be written in a clear, accessible, and engaging style.

Here's the information:

Dilemma: {{{dilemmaText}}}
User Response (0-1): {{{userResponse}}}
Topic: {{{topic}}}

Narrative:`,
});

const kantianReflectionNarrativeFlow = ai.defineFlow(
  {
    name: 'kantianReflectionNarrativeFlow',
    inputSchema: KantianNarrativeInputSchema,
    outputSchema: KantianNarrativeOutputSchema,
  },
  async input => {
    const {output} = await kantianNarrativePrompt(input);
    return output!;
  }
);
