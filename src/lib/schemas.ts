import { z } from 'zod';

export const exitFormSchema = z.object({
  tipo: z.enum(['pedido_demissao', 'demissao_empresa'], {
    required_error: 'O tipo de desligamento é obrigatório.',
  }),
  nome_completo: z.string().min(3, { message: 'O nome completo é obrigatório.' }),
  data_desligamento: z.string().min(1, { message: 'A data é obrigatória.' }),
  lider: z.string().min(1, { message: 'O líder é obrigatório.' }),
  setor: z.string().min(1, { message: 'O setor é obrigatório.' }),
  cargo: z.string().min(1, { message: 'O cargo é obrigatório.' }),
  motivo: z.string().min(1, { message: 'O motivo é obrigatório.' }),
  nota_lideranca: z.coerce.number().min(1).max(10),
  nota_rh: z.coerce.number().min(1).max(10),
  nota_empresa: z.coerce.number().min(1).max(10),
  comentarios: z.string().optional(),
});
