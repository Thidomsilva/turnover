'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating insights from employee exit data.
 *
 * The flow takes structured exit data as input and uses an AI model to identify potential issues
 * and generate actionable insights for HR and management, such as high turnover rates, common reasons for leaving, and department-specific problems.
 *
 * @exports `generateExitInsights` - An async function that takes `ExitDataInput` and returns `ExitDataOutput`.
 * @exports `ExitDataInput` - The input type for the `generateExitInsights` function.
 * @exports `ExitDataOutput` - The return type for the `generateExitInsights` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the exit data.
const ExitDataInputSchema = z.object({
  exitData: z.array(
    z.object({
      data_desligamento: z.string().describe('Exit date (YYYY-MM-DD)'),
      tempo_empresa: z.string().describe('Length of employment'),
      nome_completo: z.string().describe('Employee name'),
      bairro: z.string().describe('Neighborhood'),
      idade: z.number().describe('Age'),
      sexo: z.string().describe('Gender'),
      cargo: z.string().describe('Job title'),
      setor: z.string().describe('Department'),
      lider: z.string().describe('Manager'),
      motivo: z.string().describe('Reason for leaving'),
      trabalhou_em_industria: z.string().describe('Previous industry experience (yes/no)'),
      nivel_escolar: z.string().describe('Education level'),
      deslocamento: z.string().describe('Commute'),
      nota_lideranca: z.number().describe('Leadership rating'),
      obs_lideranca: z.string().describe('Leadership observations'),
      nota_rh: z.number().describe('HR rating'),
      obs_rh: z.string().describe('HR observations'),
      nota_empresa: z.number().describe('Company rating'),
      comentarios: z.string().describe('Additional comments'),
      filtro: z.string().optional().describe('Internal filter'),
    })
  ).describe('Array of exit data objects'),
});
export type ExitDataInput = z.infer<typeof ExitDataInputSchema>;

// Define the output schema for the generated insights.
const ExitDataOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights about exit data.'),
});
export type ExitDataOutput = z.infer<typeof ExitDataOutputSchema>;

// Exported function to generate exit insights
export async function generateExitInsights(input: ExitDataInput): Promise<ExitDataOutput> {
  return generateExitInsightsFlow(input);
}

// Define the prompt for generating exit insights.
const exitInsightsPrompt = ai.definePrompt({
  name: 'exitInsightsPrompt',
  input: {schema: ExitDataInputSchema},
  output: {schema: ExitDataOutputSchema},
  prompt: `You are an HR data analyst tasked with identifying potential issues and generating actionable insights from employee exit data.

  Analyze the following exit data and provide a summary of key observations, potential problems, and suggested actions for HR and management.

  Consider turnover rates, common reasons for leaving, department-specific issues, and any correlations between different data points (e.g., leadership scores and employee departures).

  Exit Data:
  {{#each exitData}}
  - Date: {{data_desligamento}}, Employee: {{nome_completo}}, Department: {{setor}}, Reason: {{motivo}}, Manager: {{lider}}
  {{/each}}
  `,
});

// Define the Genkit flow for generating exit insights.
const generateExitInsightsFlow = ai.defineFlow(
  {
    name: 'generateExitInsightsFlow',
    inputSchema: ExitDataInputSchema,
    outputSchema: ExitDataOutputSchema,
  },
  async input => {
    const {output} = await exitInsightsPrompt(input);
    return output!;
  }
);
