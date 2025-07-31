'use server';

import { generateExitInsights, type ExitDataInput } from '@/ai/flows/generate-exit-insights';
import type { PedidoDemissao } from './types';
import { exitFormSchema } from './schemas';
import { z } from 'zod';
import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, writeBatch, doc } from 'firebase/firestore';
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

// Helper to convert Excel serial date to YYYY-MM-DD
function excelDateToYYYYMMDD(serial: number): string {
    if (typeof serial !== 'number' || isNaN(serial)) {
        // If it's not a number, it might already be a date string like 'YYYY-MM-DD'
        if (typeof serial === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(serial)) {
            return serial;
        }
        // Return a placeholder or throw an error for invalid formats
        return new Date().toISOString().split('T')[0];
    }
    // Formula to convert Excel serial number to JS date (subtract 25569 for origin date)
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const year = date_info.getUTCFullYear();
    const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date_info.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


export async function importExitsAction(data: any[]) {
    if (!data || data.length === 0) {
        return { success: false, message: 'Nenhum dado para importar.' };
    }

    const batch = writeBatch(db);
    const exitsCollection = collection(db, 'exits');
    let count = 0;

    const requiredStringFields = ['nome_completo', 'lider', 'setor', 'cargo', 'motivo'];

    for (const rawItem of data) {
        try {
            const item: { [key: string]: any } = {};

            // --- Data Cleaning and Validation ---

            // Handle and convert dates
            if (rawItem.data_desligamento) {
                item.data_desligamento = excelDateToYYYYMMDD(rawItem.data_desligamento);
            } else {
                continue; // Skip records without a date
            }

            // Ensure required string fields are strings and not empty
            for (const field of requiredStringFields) {
                const value = rawItem[field];
                item[field] = value !== null && value !== undefined ? String(value).trim() : '';
                 if (!item[field]) {
                    // Optional: skip if a critical field is missing
                    // For now, we'll allow it but log it
                    console.warn(`Missing required field '${field}' in row:`, rawItem);
                }
            }

            // Handle numeric fields, defaulting to a sensible value if invalid
            item.nota_lideranca = Number(rawItem.nota_lideranca) || 0;
            item.nota_rh = Number(rawItem.nota_rh) || 0;
            item.nota_empresa = Number(rawItem.nota_empresa) || 0;

            // Handle optional fields
            item.tempo_empresa = rawItem.tempo_empresa ? String(rawItem.tempo_empresa) : '';
            item.comentarios = rawItem.comentarios ? String(rawItem.comentarios) : '';
            item.tipo = rawItem.tipo ? String(rawItem.tipo) : 'pedido_demissao'; // Default type if missing
            
            // --- End Data Cleaning ---

            const docRef = doc(exitsCollection);
            batch.set(docRef, item);
            count++;

        } catch (error) {
            console.error('Error processing row, skipping:', rawItem, error);
            // Continue to the next item instead of failing the whole batch
        }
    }
    
    if (count === 0) {
        return { success: false, message: 'Nenhum registro válido encontrado para importação. Verifique o formato da planilha.' };
    }

    try {
        await batch.commit();
        revalidatePath('/dashboard');
        return { success: true, message: `${count} registros importados com sucesso.` };
    } catch (error: any) {
        console.error('Error committing batch to Firestore: ', error);
        return {
            success: false,
            message: `Ocorreu um erro ao salvar os dados no banco: ${error.message}`,
        };
    }
}


export async function clearAllExitsAction() {
    try {
        const exitsCollectionRef = collection(db, 'exits');
        const querySnapshot = await getDocs(exitsCollectionRef);

        if (querySnapshot.empty) {
            return { success: true, message: "O banco de dados já está vazio." };
        }

        const batch = writeBatch(db);
        querySnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        revalidatePath('/dashboard');

        return { success: true, message: "Todos os dados de desligamento foram removidos com sucesso." };

    } catch (error: any) {
        console.error("Error clearing collection: ", error);
        return {
             success: false,
             message: error.message || "Ocorreu um erro ao limpar o banco de dados.",
        }
    }
}
