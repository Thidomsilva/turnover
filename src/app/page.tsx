import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MainNav } from '@/components/main-nav';
import { Search } from '@/components/search';
import { UserNav } from '@/components/user-nav';
import { OverviewChart } from '@/components/overview-chart';
import { RecentExits } from '@/components/recent-exits';
import { StatCard } from '@/components/stat-card';
import { AiInsightsCard } from '@/components/ai-insights-card';
import { ExitTypeChart } from '@/components/exit-type-chart';
import { getDashboardData } from '@/lib/data';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FileDown, PlusCircle, Upload } from 'lucide-react';
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
    <div className="flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 md:px-8">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Importar Histórico
            </Button>
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
            <TabsTrigger value="reports" disabled>
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled>
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
                </CardHeader>
                <CardContent>
                  <RecentExits data={recentExits} />
                </CardContent>
              </Card>
              <div className="col-span-4 lg:col-span-3">
                 <AiInsightsCard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
