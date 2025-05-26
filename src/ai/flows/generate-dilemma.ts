'use server';
/**
 * @fileOverview A flow to generate personalized ethical dilemmas using Genkit and Gemini.
 *
 * - generatePersonalizedDilemma - A function that generates a personalized ethical dilemma.
 * - GeneratePersonalizedDilemmaInput - The input type for the generatePersonalizedDilemma function.
 * - GeneratePersonalizedDilemmaOutput - The return type for the generatePersonalizedDilemma function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedDilemmaInputSchema = z.object({
  topic: z.string().describe('The ethical topic for the dilemma.'),
  intensity: z.string().describe('The intensity level of the dilemma (Suave, Medio, Extremo).'),
  userContext: z.string().optional().describe('Optional context about the user from previous responses.'),
  seedExamples: z
    .array(z.object({
      id_dilema: z.string(),
      texto_dilema: z.string(),
      topico_principal: z.string(),
      intensidad: z.string(),
      variable_oculta_primaria: z.string(),
    }))
    .describe('Seed dilemmas to guide the generation.'),
});

export type GeneratePersonalizedDilemmaInput = z.infer<typeof GeneratePersonalizedDilemmaInputSchema>;

const GeneratePersonalizedDilemmaOutputSchema = z.object({
  dilemmaText: z.string().describe('The generated ethical dilemma text.'),
});

export type GeneratePersonalizedDilemmaOutput = z.infer<typeof GeneratePersonalizedDilemmaOutputSchema>;

export async function generatePersonalizedDilemma(
  input: GeneratePersonalizedDilemmaInput
): Promise<GeneratePersonalizedDilemmaOutput> {
  return generatePersonalizedDilemmaFlow(input);
}

const generateDilemmaPrompt = ai.definePrompt({
  name: 'generateDilemmaPrompt',
  input: {schema: GeneratePersonalizedDilemmaInputSchema},
  output: {schema: GeneratePersonalizedDilemmaOutputSchema},
  prompt: `Eres un experto filósofo y psicólogo diseñando dilemas éticos para la app Kantify.
Basándote en los siguientes ejemplos de dilemas semilla sobre el tópico '{{topic}}' y de intensidad '{{intensity}}':
{{#each seedExamples}}
Ejemplo {{@index}}: {{texto_dilema}} (Variable oculta: {{variable_oculta_primaria}})
{{/each}}

{{#if userContext}}
Considera el siguiente contexto sobre el usuario (basado en sus respuestas previas):
'{{userContext}}'
{{/if}}

Genera UN NUEVO Y ORIGINAL dilema ético que:
1. Pertenezca claramente al tópico '{{topic}}'.
2. Tenga una intensidad comparable a '{{intensity}}'.
3. Explore una faceta de la variable oculta asociada a este tópico.
4. Sea conciso, claro y provoque reflexión, al estilo de los ejemplos.
5. NO repita los ejemplos proporcionados.
6. Devuelve SOLO el texto del nuevo dilema.

Nuevo Dilema:`,
});

const generatePersonalizedDilemmaFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedDilemmaFlow',
    inputSchema: GeneratePersonalizedDilemmaInputSchema,
    outputSchema: GeneratePersonalizedDilemmaOutputSchema,
  },
  async input => {
    const {output} = await generateDilemmaPrompt(input);
    return {dilemmaText: output!.dilemmaText};
  }
);
