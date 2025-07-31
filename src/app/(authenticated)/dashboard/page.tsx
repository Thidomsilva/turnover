import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { OverviewChart } from '@/components/overview-chart';
import { RecentExits } from '@/components/recent-exits';
import { StatCard } from '@/components/stat-card';
import { AiInsightsCard } from '@/components/ai-insights-card';
import { ExitTypeChart } from '@/components/exit-type-chart';
import { getDashboardData } from '@/lib/data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FileDown, PlusCircle, Upload, FileText, BrainCircuit } from 'lucide-react';
import ExitForm from '@/components/exit-form';

export default function DashboardPage() {
  const {
    totalExits,
    totalPedidos,
    totalEmpresa,
    avgTenure,
    exitsByMonth,
    recentExits,
    exitReasons,
    exitsByType
  } = getDashboardData();
  
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Histórico
          </Button>
          <input type="file" id="file-upload" className="hidden" />
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
            <Sheet>
            <SheetTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Desligamento
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
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
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="reports">
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Análise Preditiva
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total de Desligamentos" value={totalExits.toString()} description="Total de saídas no período" icon="Users" />
            <StatCard title="Pedidos de Demissão" value={totalPedidos.toString()} description="Iniciados pelo colaborador" icon="UserMinus" />
            <StatCard title="Demissões pela Empresa" value={totalEmpresa.toString()} description="Iniciados pela empresa" icon="UserX" />
            <StatCard title="Tempo Médio de Casa" value={`${avgTenure} meses`} description="Duração média no cargo" icon="Clock" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral de Rotatividade</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart data={exitsByMonth} />
              </CardContent>
            </Card>
            <div className="col-span-4 lg:col-span-3 space-y-4 flex flex-col">
              <Card className="flex-grow">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 h-full">
              <CardHeader>
                <CardTitle>Desligamentos Recentes</CardTitle>
                <CardDescription>
                  As últimas {recentExits.length} saídas registradas.
                </CardDescription>
              </Header>
              <CardContent>
                <RecentExits data={recentExits} />
              </CardContent>
            </Card>
            <div className="col-span-4 lg:col-span-3">
                <AiInsightsCard />
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
    </>
  );
}