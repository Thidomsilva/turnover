export interface PedidoDemissao {
  id: string;
  tipo: 'pedido_demissao';
  data_admissao: string;
  data_desligamento: string;
  tempo_empresa: number; // in days
  nome_completo: string;
  bairro: string;
  idade: number;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  cargo: string;
  setor: string;
  lider: string;
  motivo: string;
  trabalhou_em_industria: boolean;
  nivel_escolar: string;
  deslocamento: string;
  nota_lideranca: number;
  obs_lideranca: string;
  nota_rh: number;
  obs_rh: string;
  nota_empresa: number;
  comentarios: string;
  filtro?: string;
}

export interface DemissaoEmpresa {
  id: string;
  tipo: 'demissao_empresa';
  data_admissao: string;
  data_desligamento: string;
  nome_completo: string;
  lider: string;
  turno: 'Manhã' | 'Tarde' | 'Noite';
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  idade: number;
  tempo_empresa: number; // in days
  motivo: string;
}

export type ExitData = PedidoDemissao | DemissaoEmpresa;
