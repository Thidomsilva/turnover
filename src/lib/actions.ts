
'use server';

import { generateExitInsights, type ExitDataInput } from '@/ai/flows/generate-exit-insights';
import type { PedidoDemissao } from './types';
import { exitFormSchema } from './schemas';
import { z } from 'zod';
import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, writeBatch, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { differenceInDays, parseISO } from 'date-fns';

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
        const admissionDate = parseISO(data_admissao);
        const exitDate = parseISO(data_desligamento);
        const tenureInDays = differenceInDays(exitDate, admissionDate);

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

function excelDateToYYYYMMDD(serial: any): string | null {
    if (!serial) return null;
    if (typeof serial === 'string') {
        // Handle cases like 'YYYY-MM-DD' or 'MM/DD/YYYY'
        if (/^\d{4}-\d{2}-\d{2}$/.test(serial)) return serial;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(serial)) {
            const [month, day, year] = serial.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    if (typeof serial !== 'number' || isNaN(serial)) {
      return null;
    }
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
            
            item.nome_completo = String(item['nomecompleto'] || '').trim();
            if (!item.nome_completo) continue;

            const admissionDateStr = excelDateToYYYYMMDD(item['dataadmissao']);
            const exitDateStr = excelDateToYYYYMMDD(item['datadesligamento']);

            if (!admissionDateStr || !exitDateStr) {
                errors.push(`Registro '${item.nome_completo}' ignorado: data de admissão ou desligamento inválida.`);
                continue;
            }
            
            const admissionDate = parseISO(admissionDateStr);
            const exitDate = parseISO(exitDateStr);

            if (exitDate <= admissionDate) {
                 errors.push(`Registro '${item.nome_completo}' ignorado: data de desligamento deve ser posterior à de admissão.`);
                continue;
            }
            
            const tenureInDays = differenceInDays(exitDate, admissionDate);

            item.data_admissao = admissionDateStr;
            item.data_desligamento = exitDateStr;
            item.tempo_empresa = tenureInDays;
            
            item.tipo = String(item['tipo'] || '').trim();
            item.lider = String(item['lider'] || '').trim();
            item.sexo = String(item['sexo'] || '').trim();
            item.idade = Number(item['idade']) || null;
            item.motivo = String(item['motivo'] || item['motivodesligamento'] || '').trim();
            
            if (item.tipo === 'pedido_demissao') {
                item.bairro = String(item['bairro'] || '').trim();
                item.cargo = String(item['cargo'] || '').trim();
                item.setor = String(item['setor'] || '').trim();
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
            }
            
            const docRef = doc(exitsCollection);
            // We need to clean up the object to avoid saving undefined/extra fields
            const dataToSave = {
                nome_completo: item.nome_completo,
                tipo: item.tipo,
                data_admissao: item.data_admissao,
                data_desligamento: item.data_desligamento,
                tempo_empresa: item.tempo_empresa,
                lider: item.lider,
                sexo: item.sexo,
                idade: item.idade,
                motivo: item.motivo,
                bairro: item.bairro,
                cargo: item.cargo,
                setor: item.setor,
                trabalhou_em_industria: item.trabalhou_em_industria,
                nivel_escolar: item.nivel_escolar,
                deslocamento: item.deslocamento,
                nota_lideranca: item.nota_lideranca,
                obs_lideranca: item.obs_lideranca,
                nota_rh: item.nota_rh,
                obs_rh: item.obs_rh,
                nota_empresa: item.nota_empresa,
                comentarios: item.comentarios,
                filtro: item.filtro,
                turno: item.turno,
                createdAt: serverTimestamp()
            };

            batch.set(docRef, dataToSave);
            count++;

        } catch (error) {
            console.error('Error processing row, skipping:', rawItem, error);
            errors.push(`Erro ao processar a linha para '${rawItem['Nome Completo'] || 'desconhecido'}'.`);
        }
    }
    
    if (count === 0) {
        return { success: false, message: 'Nenhum registro válido encontrado para importação. Verifique se as colunas "Nome Completo", "Data Admissao" e "Data Desligamento" estão preenchidas corretamente.' };
    }

    try {
        await batch.commit();
        revalidatePath('/dashboard');
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
