'use server';

import { generateExitInsights, type ExitDataInput } from '@/ai/flows/generate-exit-insights';
import type { PedidoDemissao } from './types';
import { exitFormSchema } from './schemas';
import { z } from 'zod';
import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function getAiInsights() {
  try {
    const exitsCollection = collection(db, 'exits');
    const q = query(exitsCollection, where('tipo', '==', 'pedido_demissao'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { error: 'Não há dados de "pedido de demissão" para gerar insights.' };
    }
    
    const dataToProcess = querySnapshot.docs.map(doc => {
      const data = doc.data() as PedidoDemissao;
       return {
          data_desligamento: data.data_desligamento,
          tempo_empresa: data.tempo_empresa || 'N/A',
          nome_completo: data.nome_completo,
          bairro: data.bairro || 'N/A',
          idade: data.idade || 0,
          sexo: data.sexo || 'N/A',
          cargo: data.cargo,
          setor: data.setor,
          lider: data.lider,
          motivo: data.motivo,
          trabalhou_em_industria: data.trabalhou_em_industria ? 'sim' : 'não',
          nivel_escolar: data.nivel_escolar || 'N/A',
          deslocamento: data.deslocamento || 'N/A',
          nota_lideranca: data.nota_lideranca,
          obs_lideranca: data.obs_lideranca || '',
          nota_rh: data.nota_rh,
          obs_rh: data.obs_rh || '',
          nota_empresa: data.nota_empresa,
          comentarios: data.comentarios || '',
        };
    })

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
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Campos inválidos. Falha ao registrar desligamento.",
        };
    }

    try {
        const exitsCollection = collection(db, 'exits');
        await addDoc(exitsCollection, {
            ...validatedFields.data,
            createdAt: serverTimestamp(),
        });

        revalidatePath('/dashboard');
        
        return {
            success: true,
            message: "Desligamento registrado com sucesso.",
        };

    } catch (error: any) {
        console.error("Error adding document: ", error);
        return {
             success: false,
             message: error.message || "Ocorreu um erro ao salvar no banco de dados.",
        }
    }
}

export async function importExitsAction(data: any[]) {
  if (!data || data.length === 0) {
    return { success: false, message: 'Nenhum dado para importar.' };
  }

  const batch = writeBatch(db);
  const exitsCollection = collection(db, 'exits');

  let count = 0;

  for (const item of data) {
    const docRef = addDoc(exitsCollection, {
      ...item,
      createdAt: serverTimestamp(),
    }).withConverter(null); // Create a new doc with a random ID
     batch.set(docRef, {
      ...item,
      createdAt: serverTimestamp(),
    });
    count++;
  }

  try {
    await batch.commit();
    revalidatePath('/dashboard');
    return { success: true, message: `${count} registros importados com sucesso.` };
  } catch (error: any) {
    console.error('Error importing documents: ', error);
    return {
      success: false,
      message: error.message || 'Ocorreu um erro ao importar os dados.',
    };
  }
}
