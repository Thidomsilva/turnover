import { type ExitData, type PedidoDemissao } from '@/lib/types';
import { subMonths, format } from 'date-fns';

export const MOCK_EXIT_DATA: ExitData[] = [
  {
    id: '1',
    tipo: 'pedido_demissao',
    data_desligamento: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    tempo_empresa: '2 anos',
    nome_completo: 'Ana Silva',
    bairro: 'Centro',
    idade: 28,
    sexo: 'Feminino',
    cargo: 'Analista de Marketing',
    setor: 'Marketing',
    lider: 'Carlos Pereira',
    motivo: 'Oportunidade melhor',
    trabalhou_em_industria: false,
    nivel_escolar: 'Superior Completo',
    deslocamento: '30 min',
    nota_lideranca: 8,
    obs_lideranca: 'Bom líder, mas pouco feedback.',
    nota_rh: 7,
    obs_rh: 'Processo de saída tranquilo.',
    nota_empresa: 7,
    comentarios: 'A empresa é boa, mas o salário estava defasado.',
  },
  {
    id: '2',
    tipo: 'demissao_empresa',
    data_desligamento: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    nome_completo: 'João Santos',
    lider: 'Mariana Lima',
    turno: 'Manhã',
    sexo: 'Masculino',
    idade: 35,
    tempo_empresa: '3 anos',
    motivo_desligamento: 'Baixo desempenho',
  },
  {
    id: '3',
    tipo: 'pedido_demissao',
    data_desligamento: format(subMonths(new Date(), 2), 'yyyy-MM-dd'),
    tempo_empresa: '1 ano',
    nome_completo: 'Mariana Costa',
    bairro: 'Zona Sul',
    idade: 24,
    sexo: 'Feminino',
    cargo: 'Desenvolvedora Jr',
    setor: 'Tecnologia',
    lider: 'Ricardo Alves',
    motivo: 'Falta de plano de carreira',
    trabalhou_em_industria: true,
    nivel_escolar: 'Superior Incompleto',
    deslocamento: '1 hora',
    nota_lideranca: 6,
    obs_lideranca: 'Liderança ausente.',
    nota_rh: 8,
    obs_rh: 'RH sempre prestativo.',
    nota_empresa: 6,
    comentarios: 'Falta de oportunidades de crescimento.',
  },
  {
    id: '4',
    tipo: 'demissao_empresa',
    data_desligamento: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    nome_completo: 'Pedro Oliveira',
    lider: 'Carlos Pereira',
    turno: 'Tarde',
    sexo: 'Masculino',
    idade: 42,
    tempo_empresa: '5 anos',
    motivo_desligamento: 'Reestruturação do setor',
  },
  {
    id: '5',
    tipo: 'pedido_demissao',
    data_desligamento: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    tempo_empresa: '6 meses',
    nome_completo: 'Juliana Ferreira',
    bairro: 'Zona Norte',
    idade: 22,
    sexo: 'Feminino',
    cargo: 'Assistente Administrativo',
    setor: 'Administrativo',
    lider: 'Sofia Martins',
    motivo: 'Ambiente de trabalho',
    trabalhou_em_industria: false,
    nivel_escolar: 'Médio Completo',
    deslocamento: '45 min',
    nota_lideranca: 5,
    obs_lideranca: 'Liderança despreparada.',
    nota_rh: 6,
    obs_rh: 'Pouco apoio do RH.',
    nota_empresa: 5,
    comentarios: 'Clima organizacional pesado e falta de reconhecimento.',
  },
  {
    id: '6',
    tipo: 'pedido_demissao',
    data_desligamento: format(subMonths(new Date(), 4), 'yyyy-MM-dd'),
    tempo_empresa: '4 anos',
    nome_completo: 'Lucas Martins',
    bairro: 'Centro',
    idade: 31,
    sexo: 'Masculino',
    cargo: 'Gerente de Vendas',
    setor: 'Vendas',
    lider: 'Diretoria',
    motivo: 'Outros',
    trabalhou_em_industria: true,
    nivel_escolar: 'Pós-graduação',
    deslocamento: '20 min',
    nota_lideranca: 9,
    obs_lideranca: 'Gestão excelente',
    nota_rh: 8,
    obs_rh: '',
    nota_empresa: 8,
    comentarios: 'Mudança de cidade por motivos pessoais.',
  },
];

export function getDashboardData() {
  const totalExits = MOCK_EXIT_DATA.length;
  const totalPedidos = MOCK_EXIT_DATA.filter(d => d.tipo === 'pedido_demissao').length;
  const totalEmpresa = MOCK_EXIT_DATA.filter(d => d.tipo === 'demissao_empresa').length;
  
  const pedidos = MOCK_EXIT_DATA.filter(d => d.tipo === 'pedido_demissao') as PedidoDemissao[];
  const avgTenureInYears = pedidos.reduce((acc, curr) => {
    const years = parseFloat(curr.tempo_empresa.split(' ')[0]);
    return acc + (isNaN(years) ? 0 : years);
  }, 0) / (pedidos.length || 1);
  const avgTenure = Math.round(avgTenureInYears * 12);


  const exitsByMonth = MOCK_EXIT_DATA.reduce((acc, curr) => {
    const month = format(new Date(curr.data_desligamento), 'MMM');
    const found = acc.find(item => item.name === month);
    if (found) {
      found.total++;
    } else {
      acc.push({ name: month, total: 1 });
    }
    return acc;
  }, [] as { name: string; total: number }[]).reverse();


  const exitReasons = pedidos.reduce((acc, curr) => {
      const reason = curr.motivo;
      const found = acc.find(item => item.reason === reason);
      if (found) {
          found.count++;
      } else {
          acc.push({ reason, count: 1 });
      }
      return acc;
  }, [] as { reason: string; count: number }[]).sort((a,b) => b.count - a.count);

  const exitsByType = [
      { type: 'Pedido de Demissão', value: totalPedidos, fill: 'hsl(var(--chart-1))' },
      { type: 'Demissão pela Empresa', value: totalEmpresa, fill: 'hsl(var(--chart-2))' }
  ]

  const recentExits = MOCK_EXIT_DATA.slice(0, 5).map(exit => ({
    name: exit.nome_completo,
    email: `${exit.nome_completo.split(' ')[0].toLowerCase()}@example.com`,
    role: exit.tipo === 'pedido_demissao' ? exit.cargo : 'N/A',
    type: exit.tipo === 'pedido_demissao' ? 'Pedido' : 'Empresa',
  }));

  return {
    totalExits,
    totalPedidos,
    totalEmpresa,
    avgTenure,
    exitsByMonth,
    recentExits,
    exitReasons,
    exitsByType
  };
}
