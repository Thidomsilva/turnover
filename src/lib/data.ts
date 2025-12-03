import { type ExitData } from '@/lib/types';
import { format, subMonths, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const firebaseConfig = {
  apiKey: "AIzaSyCq_Qnb-cDsWzij6bj39g-uaaKY7Ild9cw",
  authDomain: "gesto-de-turnover.firebaseapp.com",
  projectId: "gesto-de-turnover",
  storageBucket: "gesto-de-turnover.appspot.com",
  messagingSenderId: "523995517168",
  appId: "1:523995517168:web:6479f21037d1aa8ebcb235"
};

export async function getDashboardData(filters?: { year?: number, month?: number }) {
  try {
    const exitsCollection = collection(db, 'exits');
    // Busca todos os registros de desligamento, sem limite
    const querySnapshot = await getDocs(query(exitsCollection, orderBy('data_desligamento', 'desc')));
    let allExits: ExitData[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ExitData));

    const originalExitsForYearFilter = [...allExits];

    // Apply filters
    if (filters?.year) {
      allExits = allExits.filter(exit => {
        if (!exit.data_desligamento || !isValid(parseISO(exit.data_desligamento))) return false;
        return parseISO(exit.data_desligamento).getFullYear() === filters.year;
      });
    }
    if (filters?.month !== undefined && filters.month !== null) {
      allExits = allExits.filter(exit => {
        if (!exit.data_desligamento || !isValid(parseISO(exit.data_desligamento))) return false;
        return parseISO(exit.data_desligamento).getMonth() === filters.month;
      });
    }

    if (allExits.length === 0 && !filters) {
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
        exitsBySector: [],
      }
    }

    const totalExits = allExits.length;
    const totalPedidos = allExits.filter(d => d.tipo === 'pedido_demissao').length;
    const totalEmpresa = allExits.filter(d => d.tipo === 'demissao_empresa').length;
    
    const tenureDataInDays = allExits
        .map(p => p.tempo_empresa)
        .filter((days): days is number => typeof days === 'number' && !isNaN(days) && days > 0);

    const totalTenureInDays = tenureDataInDays.reduce((acc, curr) => acc + curr, 0);
    
    const avgTenureInDays = tenureDataInDays.length > 0 
        ? totalTenureInDays / tenureDataInDays.length
        : 0;
    
    // Convert average tenure from days to months for display
    const avgTenure = Math.round(avgTenureInDays / 30);

    const yearForChart = filters?.year || new Date().getFullYear();
    const monthsTemplate = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(yearForChart, i, 1);
        return { name: format(d, 'MMM', { locale: ptBR }), pedido: 0, empresa: 0 };
    });

    const exitsByMonth = allExits.reduce((acc, exit) => {
        if (!exit.data_desligamento || !isValid(parseISO(exit.data_desligamento))) return acc;
        
        try {
            const exitDate = parseISO(exit.data_desligamento);
            const exitMonthName = format(exitDate, 'MMM', { locale: ptBR });
            const monthData = acc.find(m => m.name === exitMonthName);
            if (monthData) {
                if (exit.tipo === 'pedido_demissao') {
                    monthData.pedido += 1;
                } else if (exit.tipo === 'demissao_empresa') {
                    monthData.empresa += 1;
                }
            }
        } catch (e) {
            console.warn(`Could not parse date for exit ${exit.id}: ${exit.data_desligamento}`);
        }
        return acc;
    }, monthsTemplate);


    const exitsBySector = allExits.reduce((acc, curr) => {
        const sector = curr.setor || "Não informado";
        const found = acc.find(item => item.name === sector);
        if (found) {
            found.value++;
        } else {
            acc.push({ name: sector, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a,b) => b.value - a.value);


    const exitReasons = allExits.reduce((acc, curr) => {
        const reason = curr.motivo || "Não informado";
        const found = acc.find(item => item.name === reason);
        if (found) {
            found.value++;
        } else {
            acc.push({ name: reason, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]).sort((a,b) => b.value - a.value).slice(0, 7);


    const recentExits = allExits.slice(0, 5).map(exit => ({
      name: exit.nome_completo,
      tenure: exit.tempo_empresa && typeof exit.tempo_empresa === 'number' && !isNaN(exit.tempo_empresa) ? Math.round(exit.tempo_empresa / 30) : 0,
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
      allExits: originalExitsForYearFilter, // Return all for year list
      exitsBySector,
    };
  } catch (error) {
    console.error("Failed to fetch and process dashboard data:", error);
    // In case of error, return a default empty state
    return {
      totalExits: 0,
      totalPedidos: 0,
      totalEmpresa: 0,
      avgTenure: 0,
      exitsByMonth: [],
      recentExits: [],
      exitReasons: [],
      allExits: [],
      exitsBySector: [],
    };
  }
}
