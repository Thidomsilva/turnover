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
import { Lightbulb, Loader2 } from 'lucide-react';
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          <span>Insights com IA</span>
        </CardTitle>
        <CardDescription>
          Analise os dados de desligamento para identificar padrões e problemas potenciais.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4 text-sm text-muted-foreground min-h-[120px]">
          {loading && <Skeleton className="h-24 w-full" />}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {insights && <p className="whitespace-pre-wrap">{insights}</p>}
          {!loading && !insights && !error && (
            <p>
              Clique no botão abaixo para que a IA analise todos os dados de "pedidos de demissão" e gere um relatório com observações importantes para o RH e a gestão.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateInsights} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Insights'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
