
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useRef, useState, useTransition } from 'react';

import { OverviewChart } from '@/components/overview-chart';
import { RecentExits } from '@/components/recent-exits';
import { StatCard } from '@/components/stat-card';
import { ExitTypeChart } from '@/components/exit-type-chart';
import { getDashboardData } from '@/lib/data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FileDown, PlusCircle, Upload, FileText, BrainCircuit, Loader2, BarChartBig, Trash2 } from 'lucide-react';
import ExitForm from '@/components/exit-form';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { importExitsAction, clearAllExitsAction } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { type ExitData } from '@/lib/types';
import { format, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExitsBySectorChart } from '@/components/exits-by-sector-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyExits, setMonthlyExits] = useState<ExitData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const availableYears = Array.from(new Set(data?.allExits.map(e => e.data_desligamento ? new Date(e.data_desligamento).getFullYear().toString() : new Date().getFullYear().toString()) || [new Date().getFullYear().toString()])).sort().reverse();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const year = filterYear ? parseInt(filterYear, 10) : undefined;
        const month = filterMonth !== 'all' ? parseInt(filterMonth, 10) : undefined;

        const dashboardData = await getDashboardData({ year, month });
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível buscar os dados do dashboard.",
            variant: "destructive",
        })
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast, filterYear, filterMonth]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target?.result, { type: 'binary' });
      
      const sheetNames = workbook.SheetNames;
      
      const normalizeString = (str: string) => {
        return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
      }

      const pedidosSheetName = sheetNames.find(name => normalizeString(name) === 'pedidodemissao');
      const demitidosSheetName = sheetNames.find(name => normalizeString(name) === 'demissaoempresa');

      if (!pedidosSheetName && !demitidosSheetName) {
        toast({
            title: "Erro de Importação",
            description: "A planilha deve conter as abas 'pedido demissao' e/ou 'demissao empresa'. Verifique os nomes das abas e tente novamente.",
            variant: 'destructive',
        });
        return;
      }

      const processSheet = (sheetName: string) => {
          const sheet = workbook.Sheets[sheetName];
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
          if (rows.length < 2) return [];

          const header = rows[0].map(h => typeof h === 'string' ? h.toLowerCase().trim().replace(/\s+/g, '') : String(h).toLowerCase().trim().replace(/\s+/g, ''));
          const dataRows = rows.slice(1);
          
          return dataRows.map(row => {
              const rowData: { [key: string]: any } = {};
              header.forEach((key, index) => {
                  rowData[key] = row[index];
              });
              return rowData;
          });
      };
      
      const pedidosData = pedidosSheetName ? processSheet(pedidosSheetName) : [];
      const demitidosData = demitidosSheetName ? processSheet(demitidosSheetName) : [];

      const allData = [
        ...pedidosData.map((row: any) => ({ ...row, tipo: 'pedido_demissao' })),
        ...demitidosData.map((row: any) => ({ ...row, tipo: 'demissao_empresa' })),
      ];

      startTransition(async () => {
        const result = await importExitsAction(allData);
        if (result.success) {
            toast({
                title: "Sucesso!",
                description: result.message,
            });
            setTimeout(() => window.location.reload(), 1000);
        } else {
             toast({
                title: "Erro",
                description: result.message || "Ocorreu um erro ao importar.",
                variant: 'destructive',
            });
        }
      });
    };
    reader.readAsBinaryString(file);
    if(e.target) e.target.value = '';
  }

  const handleBarClick = (month: string) => {
    if (!data?.allExits) return;
    
    const parsedMonth = parse(month, 'MMM', new Date(), { locale: ptBR });
    
    const exitsInMonth = data.allExits.filter(exit => {
      if (!exit.data_desligamento) return false;
      try {
        const exitDate = parseISO(exit.data_desligamento);
        return exitDate.getMonth() === parsedMonth.getMonth();
      } catch {
        return false;
      }
    });

    const fullMonthName = format(parsedMonth, 'MMMM', { locale: ptBR });
    const capitalizedMonth = fullMonthName.charAt(0).toUpperCase() + fullMonthName.slice(1);


    setSelectedMonth(capitalizedMonth);
    setMonthlyExits(exitsInMonth);
    setIsModalOpen(true);
  };

  const handleClearData = () => {
    startTransition(async () => {
        const result = await clearAllExitsAction();
        if (result.success) {
            toast({
                title: "Sucesso!",
                description: result.message,
            });
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast({
                title: "Erro",
                description: result.message || "Ocorreu um erro ao limpar os dados.",
                variant: 'destructive',
            });
        }
    });
  }

  if (loading && !data) {
    return (
        <div className="flex items-center justify-center h-full min-h-[80vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Carregando dados...</p>
        </div>
    );
  }

  if (!data || data.totalExits === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4 border-2 border-dashed rounded-lg bg-card">
          <BarChartBig className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bem-vindo à Gestão de Turnover!</h2>
          <p className="text-muted-foreground mb-6">Ainda não há dados de desligamento para exibir.</p>
           <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Registrar Primeiro Desligamento
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Cadastro de Desligamento</SheetTitle>
                  <SheetDescription>
                    Preencha os campos abaixo para registrar um novo desligamento.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <ExitForm />
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="lg" onClick={handleImportClick} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isPending ? 'Importando...' : 'Importar Histórico'}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
          </div>
      </div>
    );
  }

  const {
    totalExits,
    totalPedidos,
    totalEmpresa,
    avgTenure,
    exitsByMonth,
    recentExits,
    exitsByType,
    exitsBySector
  } = data;

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={handleImportClick} disabled={isPending || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {loading ? 'Carregando...' : (isPending ? 'Importando...' : 'Importar Histórico')}
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
          <Button variant="outline" size="sm" disabled={loading}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
            <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" disabled={loading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Desligamento
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Cadastro de Desligamento</SheetTitle>
                <SheetDescription>
                  Preencha os campos abaixo para registrar um novo desligamento.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <ExitForm />
              </div>
            </SheetContent>
          </Sheet>
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button variant="destructive" size="sm" disabled={isPending || loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Dados
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente todos os dados de desligamento do banco de dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} disabled={isPending || loading}>
                  {isPending || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <div className='flex justify-between items-center'>
            <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="reports">
                    Relatórios
                </TabsTrigger>
                <TabsTrigger value="analytics">
                    Análise Preditiva
                </TabsTrigger>
            </TabsList>
            <div className='flex items-center space-x-2'>
                <Select value={filterMonth} onValueChange={setFilterMonth} disabled={loading}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Meses</SelectItem>
                        <SelectItem value="0">Janeiro</SelectItem>
                        <SelectItem value="1">Fevereiro</SelectItem>
                        <SelectItem value="2">Março</SelectItem>
                        <SelectItem value="3">Abril</SelectItem>
                        <SelectItem value="4">Maio</SelectItem>
                        <SelectItem value="5">Junho</SelectItem>
                        <SelectItem value="6">Julho</SelectItem>
                        <SelectItem value="7">Agosto</SelectItem>
                        <SelectItem value="8">Setembro</SelectItem>
                        <SelectItem value="9">Outubro</SelectItem>
                        <SelectItem value="10">Novembro</SelectItem>
                        <SelectItem value="11">Dezembro</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={filterYear} onValueChange={setFilterYear} disabled={loading}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total de Desligamentos" value={totalExits.toString()} description="Total de saídas no período" icon="Users" />
            <StatCard title="Pedidos de Demissão" value={totalPedidos.toString()} description="Iniciados pelo colaborador" icon="UserMinus" />
            <StatCard title="Demissões pela Empresa" value={totalEmpresa.toString()} description="Iniciados pela empresa" icon="UserX" />
            <StatCard title="Tempo Médio de Casa" value={`${avgTenure} meses`} description="Duração média no cargo" icon="Clock" />
          </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Rotatividade por Mês</CardTitle>
                <CardDescription>Clique em uma barra para ver detalhes.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart data={exitsByMonth} onBarClick={handleBarClick} />
              </CardContent>
            </Card>
             <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Rotatividade por Setor</CardTitle>
                <CardDescription>Total de desligamentos em cada setor.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ExitsBySectorChart data={exitsBySector} />
              </CardContent>
            </Card>
          </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 h-full">
              <CardHeader>
                <CardTitle>Desligamentos Recentes</CardTitle>
                <CardDescription>
                  As últimas saídas registradas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentExits data={recentExits} />
              </CardContent>
            </Card>
            <div className="col-span-4 lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Tipos de Desligamento</CardTitle>
                  <CardDescription>
                    Comparativo entre pedidos e demissões.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExitTypeChart data={exitsByType} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Exporte relatórios detalhados sobre os desligamentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Relatório Geral de Turnover</h3>
                    <p className="text-sm text-muted-foreground">Inclui todos os dados de desligamento do período selecionado.</p>
                  </div>
                </div>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
               <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Relatório por Motivo</h3>
                    <p className="text-sm text-muted-foreground">Agrupa os desligamentos pelos motivos informados.</p>
                  </div>
                </div>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Preditiva de Turnover</CardTitle>
              <CardDescription>
                Utilize IA para prever quais colaboradores têm maior risco de saída.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Em breve</h3>
                <p className="text-muted-foreground">
                  Estamos trabalhando para trazer recursos de análise preditiva e identificar tendências de turnover.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desligamentos em {selectedMonth}</DialogTitle>
            <DialogDescription>
              Lista de colaboradores que saíram neste mês.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {monthlyExits.length > 0 ? (
              monthlyExits.map((exit) => (
                <div key={exit.id} className="flex items-center space-x-4 p-2 rounded-md hover:bg-secondary">
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${exit.nome_completo.charAt(0)}`} />
                    <AvatarFallback>{exit.nome_completo.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="text-sm font-medium leading-none">{exit.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">
                      {exit.cargo}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {exit.tipo === 'pedido_demissao' ? 'Pedido' : 'Empresa'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center col-span-full">Nenhum desligamento neste mês.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

    