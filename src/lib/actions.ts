
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
        const exitsCollection = collection(db, 'exits');
        await addDoc(exitsCollection, {
            ...validatedFields.data,
            tempo_empresa: parseFloat(String(validatedFields.data.tempo_empresa).replace(',', '.')),
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

function excelDateToYYYYMMDD(serial: any): string {
    if (typeof serial === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(serial)) {
        return serial;
    }
    if (typeof serial !== 'number' || isNaN(serial)) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const year = date_info.getUTCFullYear();
    const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date_info.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function parseTenureToDays(tenure: any): number | null {
    if (tenure === null || tenure === undefined) {
        return null;
    }

    const tenureStr = String(tenure).toUpperCase().trim();

    if (tenureStr === '') {
        return null;
    }

    let anos = 0;
    let meses = 0;
    let dias = 0;

    const anoMatch = tenureStr.match(/(\d+)\s*ANOS?/);
    if (anoMatch) {
        anos = parseInt(anoMatch[1], 10);
    }

    const mesMatch = tenureStr.match(/(\d+)\s*M[ÊE]S(ES)?/);
    if (mesMatch) {
        meses = parseInt(mesMatch[1], 10);
    }

    const diaMatch = tenureStr.match(/(\d+)\s*DIAS?/);
    if (diaMatch) {
        dias = parseInt(diaMatch[1], 10);
    }

    const totalDias = (anos * 365) + (meses * 30) + dias;

    if (totalDias === 0) {
        return null;
    }

    return totalDias;
}

export async function importExitsAction(data: any[]) {
    if (!data || data.length === 0) {
        return { success: false, message: 'Nenhum dado para importar.' };
    }

    const batch = writeBatch(db);
    const exitsCollection = collection(db, 'exits');
    let count = 0;

    for (const rawItem of data) {
        try {
            const item: { [key: string]: any } = {};
            for (const key in rawItem) {
                if (Object.prototype.hasOwnProperty.call(rawItem, key)) {
                     const newKey = String(key).toLowerCase().trim().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    item[newKey] = rawItem[key];
                }
            }


            item.nome_completo = String(item['nomecompleto'] || '').trim();
            item.tipo = String(item['tipo'] || '').trim();

            if (!item.nome_completo) {
                continue; 
            }

            item.data_desligamento = excelDateToYYYYMMDD(item['datadesligamento']);
            item.lider = String(item['lider'] || '').trim();
            item.sexo = String(item['sexo'] || '').trim();
            item.idade = Number(item['idade']) || null;
            
            item.tempo_empresa = parseTenureToDays(item['tempodeempresa']);

            if (item.tipo === 'pedido_demissao') {
                item.bairro = String(item['bairro'] || '').trim();
                item.cargo = String(item['cargo'] || '').trim();
                item.setor = String(item['setor'] || '').trim();
                item.motivo = String(item['motivo'] || '').trim();
                item.trabalhou_em_industria = String(item['trabalhouemindustria'] || '').trim();
                item.nivel_escolar = String(item['nivelescolar'] || '').trim();
                item.deslocamento = String(item['deslocamento'] || '').trim();
                item.nota_lideranca = Number(item['notalideranca']) || null;
                item.obs_lideranca = String(item['obslideranca'] || '').trim();
                item.nota_rh = Number(item['notarh']) || null;
                item.obs_rh = String(item['obsrh'] || '').trim();
                item.nota_empresa = Number(item['notaempresa']) || null;
                item.comentarios = String(item['comentarios'] || '').trim();
                item.filtro = String(item['filtro'] || '').trim();
            } else if (item.tipo === 'demissao_empresa') {
                item.turno = String(item['turno'] || '').trim();
                 item.motivo = String(item['motivodesligamento'] || item['motivo'] || '').trim();
            } else {
                continue;
            }
            
            const docRef = doc(exitsCollection);
            batch.set(docRef, { ...item, createdAt: serverTimestamp() });
            count++;

        } catch (error) {
            console.error('Error processing row, skipping:', rawItem, error);
        }
    }
    
    if (count === 0) {
        return { success: false, message: 'Nenhum registro válido encontrado para importação. Verifique o formato da planilha, os nomes das abas e se a coluna "nome completo" está preenchida.' };
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
