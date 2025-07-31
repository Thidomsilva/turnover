import { type ExitData, type PedidoDemissao } from '@/lib/types';
import { format, subMonths } from 'date-fns';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export async function getDashboardData() {
  const exitsCollection = collection(db, 'exits');
  const querySnapshot = await getDocs(query(exitsCollection, orderBy('data_desligamento', 'desc')));
  
  const MOCK_EXIT_DATA: ExitData[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
  } as ExitData));

  const totalExits = MOCK_EXIT_DATA.length;
  const totalPedidos = MOCK_EXIT_DATA.filter(d => d.tipo === 'pedido_demissao').length;
  const totalEmpresa = MOCK_EXIT_DATA.filter(d => d.tipo === 'demissao_empresa').length;
  
  const pedidos = MOCK_EXIT_DATA.filter(d => d.tipo === 'pedido_demissao') as PedidoDemissao[];
  const avgTenureInYears = pedidos.reduce((acc, curr) => {
    if (!curr.tempo_empresa) return acc;
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
