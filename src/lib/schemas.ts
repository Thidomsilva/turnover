
import { z } from 'zod';

export const exitFormSchema = z.object({
  tipo: z.enum(['pedido_demissao', 'demissao_empresa'], {
    required_error: 'O tipo de desligamento é obrigatório.',
  }),
  nome_completo: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  data_admissao: z.string().optional().nullable(),
  data_desligamento: z.string().min(1, { message: 'A data de desligamento é obrigatória.' }),
  lider: z.string().min(1, { message: 'O líder é obrigatório.' }),
  setor: z.string().min(1, { message: 'O setor é obrigatório.' }),
  cargo: z.string().min(1, { message: 'O cargo é obrigatório.' }),
  motivo: z.string().min(1, { message: 'O motivo é obrigatório.' }),
  nota_lideranca: z.coerce.number().min(1).max(10).optional(),
  nota_rh: z.coerce.number().min(1).max(10).optional(),
  nota_empresa: z.coerce.number().min(1).max(10).optional(),
  comentarios: z.string().optional(),
}).refine((data) => {
    if (data.data_admissao && data.data_desligamento) {
        return new Date(data.data_desligamento) > new Date(data.data_admissao);
    }
    return true;
}, {
  message: "A data de desligamento deve ser posterior à data de admissão.",
  path: ["data_desligamento"],
});


export const userFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome é obrigatório.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});
