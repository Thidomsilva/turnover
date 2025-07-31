

import { type ExitData, type PedidoDemissao } from '@/lib/types';
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export async function getDashboardData() {
  try {
    const exitsCollection = collection(db, 'exits');
    const querySnapshot = await getDocs(query(exitsCollection, orderBy('data_desligamento', 'desc')));
    
    const allExits: ExitData[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ExitData));

    if (allExits.length === 0) {
      return {
        totalExits: 0,
        totalPedidos: 0,
        totalEmpresa: 0,
        avgTenure: 0,
        exitsByMonth: [],
        recentExits: [],
        exitReasons: [],
        exitsByType: [],
        allExits: [],
      }
    }

    const totalExits = allExits.length;
    const totalPedidos = allExits.filter(d => d.tipo === 'pedido_demissao').length;
    const totalEmpresa = allExits.filter(d => d.tipo === 'demissao_empresa').length;
    
    // Filter for valid tenure data (in days) and calculate the average.
    const tenureDataInDays = allExits
        .map(p => p.tempo_empresa)
        .filter((days): days is number => typeof days === 'number' && isFinite(days) && days > 0);

    const totalTenureInDays = tenureDataInDays.reduce((acc, curr) => acc + curr, 0);
    
    // Calculate average tenure in months
    const avgTenureInDays = tenureDataInDays.length > 0 
        ? totalTenureInDays / tenureDataInDays.length
        : 0;
    
    const avgTenure = Math.round(avgTenureInDays / 30.44); // Convert average days to months

    // Initialize the last 6 months for the overview chart
    const exitsByMonth = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), i);
      return { name: format(d, 'MMM', { locale: ptBR }), total: 0 };
    }).reverse();

    // Populate exits count for each month
    allExits.forEach(exit => {
      if (!exit.data_desligamento || typeof exit.data_desligamento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(exit.data_desligamento)) {
          return;
      }
      
      try {
          const exitDate = parseISO(exit.data_desligamento);
          const exitMonth = format(exitDate, 'MMM', { locale: ptBR });
          const monthData = exitsByMonth.find(m => m.name === exitMonth);
          if (monthData) {
              monthData.total += 1;
          }
      } catch (e) {
          console.warn(`Could not parse date for exit ${exit.id}: ${exit.data_desligamento}`);
      }
    });

    const exitReasons = (allExits.filter(e => e.tipo === 'pedido_demissao') as PedidoDemissao[]).reduce((acc, curr) => {
        const reason = curr.motivo;
        if (!reason) return acc;
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
      email: `${exit.nome_completo.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
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
      allExits,
    };
  } catch (error) {
    console.error("Failed to fetch and process dashboard data:", error);
    // Return a safe, empty state if any unexpected error occurs
    return {
      totalExits: 0,
      totalPedidos: 0,
      totalEmpresa: 0,
      avgTenure: 0,
      exitsByMonth: [],
      recentExits: [],
      exitReasons: [],
      exitsByType: [],
      allExits: [],
    };
  }
}
