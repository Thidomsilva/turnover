
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lightbulb, Loader2, BrainCircuit } from 'lucide-react';
import { getAiInsights } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

export function AiInsightsCard() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateInsights = async () => {
    setLoading(true);
    setError('');
    setInsights('');
    try {
      const result = await getAiInsights();
      if (result.error) {
        setError(result.error);
      } else {
        setInsights(result.insights || '');
      }
    } catch (e) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise com Inteligência Artificial</CardTitle>
        <CardDescription>
          Use a IA para extrair insights valiosos dos dados de pedidos de demissão.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : insights ? (
          <div className="prose prose-sm max-w-full text-foreground dark:prose-invert">
             {insights.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Gere Insights com IA</h3>
                <p className="text-muted-foreground">
                  Clique no botão abaixo para analisar os dados de pedidos de demissão e descobrir tendências, problemas e oportunidades de melhoria.
                </p>
              </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Analisando...' : 'Gerar Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}

    