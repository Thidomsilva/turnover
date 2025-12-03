
'use server';

import { generateExitInsights, type ExitDataInput } from '@/ai/flows/generate-exit-insights';
import type { PedidoDemissao, User } from './types';
import { exitFormSchema } from './schemas';
import { z } from 'zod';
import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, writeBatch, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { differenceInDays, parseISO, isValid } from 'date-fns';

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
          tempo_empresa: String(data.tempo_empresa) || 'N/A',
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
        const { data_admissao, data_desligamento, ...rest } = validatedFields.data;
        
        let tenureInDays = null;
        if (data_admissao && data_desligamento) {
            const admissionDate = parseISO(data_admissao);
            const exitDate = parseISO(data_desligamento);
            if(isValid(admissionDate) && isValid(exitDate)) {
               tenureInDays = differenceInDays(exitDate, admissionDate);
            }
        }


        const exitsCollection = collection(db, 'exits');
        await addDoc(exitsCollection, {
            ...rest,
            data_admissao,
            data_desligamento,
            tempo_empresa: tenureInDays,
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

export async function updateExitAction(id: string, data: z.infer<typeof exitFormSchema>) {
    const validatedFields = exitFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Campos inválidos. Falha ao atualizar.",
        };
    }

    try {
        const exitRef = doc(db, 'exits', id);
        
        const { data_admissao, data_desligamento, ...rest } = validatedFields.data;
        
        let tenureInDays = null;
        if (data_admissao && data_desligamento) {
            const admissionDate = parseISO(data_admissao);
            const exitDate = parseISO(data_desligamento);
            if(isValid(admissionDate) && isValid(exitDate)) {
               tenureInDays = differenceInDays(exitDate, admissionDate);
            }
        }

        await updateDoc(exitRef, {
            ...rest,
            data_admissao,
            data_desligamento,
            tempo_empresa: tenureInDays,
        });

        revalidatePath('/dashboard');
        
        return {
            success: true,
            message: "Registro atualizado com sucesso.",
        };

    } catch (error: any) {
        console.error("Error updating document: ", error);
        return {
             success: false,
             message: error.message || "Ocorreu um erro ao atualizar o registro.",
        }
    }
}

export async function deleteExitAction(id: string) {
    try {
        if (!id) {
            return { success: false, message: "ID do registro não fornecido." };
        }
        const exitRef = doc(db, 'exits', id);
        await deleteDoc(exitRef);

        revalidatePath('/dashboard');

        return {
            success: true,
            message: "Registro excluído com sucesso.",
        };
    } catch (error: any) {
        console.error("Error deleting document: ", error);
        return {
            success: false,
            message: "Ocorreu um erro ao excluir o registro.",
        };
    }
}


function excelDateToYYYYMMDD(serial: any): string | null {
    if (!serial) return null;
    
    if (typeof serial === 'string' && isValid(parseISO(serial))) {
        return serial.split('T')[0];
    }
    
    if (typeof serial === 'string') {
        const d = new Date(serial);
        if (isValid(d)) {
            return d.toISOString().split('T')[0];
        }
    }

    if (typeof serial === 'number' && isFinite(serial)) {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        if (isValid(date_info)) {
            const year = date_info.getUTCFullYear();
            const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date_info.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    
    return null;
}

export async function importExitsAction(data: any[]) {
    if (!data || data.length === 0) {
        return { success: false, message: 'Nenhum dado para importar.' };
    }

    const batch = writeBatch(db);
    const exitsCollection = collection(db, 'exits');
    let count = 0;
    let errors = [];

    for (const rawItem of data) {
        try {
            const item: { [key: string]: any } = {};
            for (const key in rawItem) {
                if (Object.prototype.hasOwnProperty.call(rawItem, key)) {
                     const newKey = String(key).toLowerCase().trim().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    item[newKey] = rawItem[key];
                }
            }
            
            const nomeCompleto = String(item['nomecompleto'] || '').trim();
            if (!nomeCompleto) continue;

            const admissionDateStr = excelDateToYYYYMMDD(item['dataadmissao']);
            const exitDateStr = excelDateToYYYYMMDD(item['datadesligamento']);
            let tenureInDays = null;

            if (admissionDateStr && exitDateStr) {
                const admissionDate = parseISO(admissionDateStr);
                const exitDate = parseISO(exitDateStr);
                if(isValid(admissionDate) && isValid(exitDate)) {
                    tenureInDays = differenceInDays(exitDate, admissionDate);
                }
            } else if (item['tempodeempresa'] && !isNaN(Number(item['tempodeempresa']))) {
                 tenureInDays = Number(item['tempodeempresa']);
            }
            
            const dataToSave = {
                nome_completo: nomeCompleto,
                data_admissao: admissionDateStr,
                data_desligamento: exitDateStr,
                tempo_empresa: tenureInDays,
                tipo: String(item['tipo'] || '').trim() || null,
                lider: String(item['lider'] || '').trim() || null,
                sexo: String(item['sexo'] || '').trim() || null,
                idade: Number(item['idade']) || null,
                motivo: String(item['motivo'] || item['motivodesligamento'] || '').trim() || null,
                bairro: String(item['bairro'] || '').trim() || null,
                cargo: String(item['cargo'] || '').trim() || null,
                setor: String(item['setor'] || '').trim() || null,
                trabalhou_em_industria: String(item['trabalhouemindustria'] || '').trim() || null,
                nivel_escolar: String(item['nivelescolar'] || '').trim() || null,
                deslocamento: String(item['deslocamento'] || '').trim() || null,
                nota_lideranca: Number(item['notalideranca']) || null,
                obs_lideranca: String(item['obslideranca'] || '').trim() || null,
                nota_rh: Number(item['notarh']) || null,
                obs_rh: String(item['obsrh'] || '').trim() || null,
                nota_empresa: Number(item['notaempresa']) || null,
                comentarios: String(item['comentarios'] || '').trim() || null,
                filtro: String(item['filtro'] || '').trim() || null,
                turno: String(item['turno'] || '').trim() || null,
                createdAt: serverTimestamp()
            };

            const docRef = doc(exitsCollection);
            batch.set(docRef, dataToSave);
            count++;

        } catch (error) {
            console.error('Error processing row, skipping:', rawItem, error);
            errors.push(`Erro ao processar a linha para '${rawItem['Nome Completo'] || 'desconhecido'}'.`);
        }
    }
    
    if (count === 0 && errors.length > 0) {
        return { success: false, message: `Nenhum registro importado. ${errors.join(' ')}` };
    }
     if (count === 0) {
        return { success: false, message: 'Nenhum registro válido encontrado para importação. Verifique se as colunas necessárias estão preenchidas corretamente.' };
    }


    try {
        await batch.commit();
        revalidatePath('/dashboard');
        revalidatePath('/settings');
        const successMessage = `${count} registros importados com sucesso.`;
        const errorMessage = errors.length > 0 ? ` ${errors.length} registros foram ignorados.` : '';
        return { success: true, message: successMessage + errorMessage };
    } catch (error: any) {
        console.error('Error committing batch to Firestore: ', error);
        return {
            success: false,
            message: `Ocorreu um erro ao salvar os dados no banco: ${error.message}`,
        };
    }
}

export async function getUsersAction(): Promise<User[]> {
  try {
    const usersCollection = collection(db, 'users');
    // Limita para os 50 primeiros usuários para evitar lentidão
    const { limit } = await import('firebase/firestore');
    const querySnapshot = await getDocs(query(usersCollection, limit(50)));
    if (querySnapshot.empty) {
      return [];
    }
    const users = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }) as User);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
