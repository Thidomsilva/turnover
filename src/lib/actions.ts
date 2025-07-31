'use server';

import { generateExitInsights, type ExitDataInput } from '@/ai/flows/generate-exit-insights';
import { MOCK_EXIT_DATA } from './data';
import type { PedidoDemissao } from './types';
import { exitFormSchema } from './schemas';
import { z } from 'zod';

export async function getAiInsights() {
  try {
    const dataToProcess = MOCK_EXIT_DATA
      .filter(d => d.tipo === 'pedido_demissao')
      .map(d => {
        const pd = d as PedidoDemissao;
        return {
          data_desligamento: pd.data_desligamento,
          tempo_empresa: pd.tempo_empresa,
          nome_completo: pd.nome_completo,
          bairro: pd.bairro,
          idade: pd.idade,
          sexo: pd.sexo,
          cargo: pd.cargo,
          setor: pd.setor,
          lider: pd.lider,
          motivo: pd.motivo,
          trabalhou_em_industria: pd.trabalhou_em_industria ? 'sim' : 'não',
          nivel_escolar: pd.nivel_escolar,
          deslocamento: pd.deslocamento,
          nota_lideranca: pd.nota_lideranca,
          obs_lideranca: pd.obs_lideranca,
          nota_rh: pd.nota_rh,
          obs_rh: pd.obs_rh,
          nota_empresa: pd.nota_empresa,
          comentarios: pd.comentarios,
        };
      });

    if (dataToProcess.length === 0) {
      return { error: 'Não há dados de "pedido de demissão" para gerar insights.' };
    }

    const result = await generateExitInsights({ exitData: dataToProcess as ExitDataInput['exitData'] });
    return { insights: result.insights };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return { error: 'Falha ao gerar insights. Por favor, tente novamente.' };
  }
}

export async function addExitAction(data: z.infer<typeof exitFormSchema>) {
    const validatedFields = exitFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to Create Exit Record.",
        };
    }

    // Here you would typically save the data to a database.
    // For this demo, we'll just log it to the console.
    console.log("New Exit Record:", validatedFields.data);

    // Simulate a successful operation
    return {
        message: "Exit record created successfully.",
    };
}
