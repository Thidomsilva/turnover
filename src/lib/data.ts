import { type ExitData, type PedidoDemissao } from '@/lib/types';
import { format, subMonths, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export async function getDashboardData() {
  const exitsCollection = collection(db, 'exits');
  const querySnapshot = await getDocs(query(exitsCollection, orderBy('data_desligamento', 'desc')));
  
  const allExits: ExitData[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
  } as ExitData));

  const totalExits = allExits.length;
  const totalPedidos = allExits.filter(d => d.tipo === 'pedido_demissao').length;
  const totalEmpresa = allExits.filter(d => d.tipo === 'demissao_empresa').length;
  
  const pedidos = allExits.filter(d => d.tipo === 'pedido_demissao') as PedidoDemissao[];
  const avgTenureInYears = pedidos.reduce((acc, curr) => {
    if (!curr.tempo_empresa) return acc;
    // Assuming tempo_empresa is a number in years now
    const years = parseFloat(String(curr.tempo_empresa));
    return acc + (isNaN(years) ? 0 : years);
  }, 0) / (pedidos.length || 1);
  const avgTenure = Math.round(avgTenureInYears * 12);


  const exitsByMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return { name: format(d, 'MMM', { locale: ptBR }), total: 0 };
  }).reverse();

  allExits.forEach(exit => {
    try {
        const exitMonth = format(new Date(exit.data_desligamento), 'MMM', { locale: ptBR });
        const monthData = exitsByMonth.find(m => m.name === exitMonth);
        if (monthData) {
            monthData.total += 1;
        }
    } catch (e) {
        console.warn(`Invalid date format for exit ${exit.id}: ${exit.data_desligamento}`);
    }
  });

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

  const recentExits = allExits.slice(0, 5).map(exit => ({
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
    exitsByType,
    allExits, // Pass all exits to the component for filtering
  };
}
