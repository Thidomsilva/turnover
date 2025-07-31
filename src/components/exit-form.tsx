'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { exitFormSchema } from '@/lib/schemas';
import { addExitAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { SheetClose } from './ui/sheet';

export default function ExitForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const closeRef = React.useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof exitFormSchema>>({
    resolver: zodResolver(exitFormSchema),
    defaultValues: {
      tipo: 'pedido_demissao',
      nome_completo: '',
      data_desligamento: new Date().toISOString().split('T')[0],
      lider: '',
      setor: '',
      cargo: '',
      motivo: '',
      nota_lideranca: 5,
      nota_rh: 5,
      nota_empresa: 5,
      comentarios: '',
    },
  });

  function onSubmit(data: z.infer<typeof exitFormSchema>) {
    startTransition(async () => {
        const result = await addExitAction(data);
        if (result.success) {
            toast({
                title: "Sucesso!",
                description: result.message,
            });
            form.reset();
            closeRef.current?.click();
            // This is a simple way to refresh the page and show the new data.
            window.location.reload();
        } else {
             toast({
                title: "Erro",
                description: result.message || "Ocorreu um erro ao salvar.",
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Desligamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de desligamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pedido_demissao">Pedido de Demissão</SelectItem>
                  <SelectItem value="demissao_empresa">Demissão pela Empresa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome Completo do Colaborador</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="data_desligamento"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Data do Desligamento</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Analista Financeiro" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="setor"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Setor</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Financeiro" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="lider"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Líder Direto</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Maria Oliveira" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="motivo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Motivo do Desligamento</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Nova proposta" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <h3 className="text-lg font-medium pt-4 border-t">Avaliações</h3>
        <p className="text-sm text-muted-foreground -mt-4">Visível apenas para "Pedido de Demissão".</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="nota_lideranca"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nota Liderança (1-10)</FormLabel>
                <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="nota_rh"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nota RH (1-10)</FormLabel>
                <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="nota_empresa"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nota Empresa (1-10)</FormLabel>
                <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

         <FormField
          control={form.control}
          name="comentarios"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentários Adicionais</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deixe aqui suas observações sobre a empresa, liderança ou RH."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Desligamento
        </Button>
        <SheetClose ref={closeRef} className="hidden" />
      </form>
    </Form>
  );
}
