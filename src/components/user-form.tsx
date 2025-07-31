
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { userFormSchema } from '@/lib/schemas';
import { addUserAction, getUsersAction } from '@/lib/actions';
import { DialogClose } from './ui/dialog';

const extendedUserFormSchema = userFormSchema.extend({
  role: z.enum(['Administrador', 'Usuário']),
});

export default function UserForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    async function checkFirstUser() {
      const users = await getUsersAction();
      setIsFirstUser(users.length === 0);
    }
    checkFirstUser();
  }, []);


  const form = useForm<z.infer<typeof extendedUserFormSchema>>({
    resolver: zodResolver(extendedUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Usuário',
    },
  });

  function onSubmit(data: z.infer<typeof extendedUserFormSchema>) {
    
    let role: 'Administrador' | 'Usuário' = 'Usuário';
    if (isFirstUser || data.email === 'thiago@sagacy.com.br') {
        role = 'Administrador';
    }

    startTransition(async () => {
        const result = await addUserAction({ ...data, role });
        if (result.success) {
            toast({
                title: "Sucesso!",
                description: result.message,
            });
            form.reset();
            closeRef.current?.click();
             // Simple way to refresh user list
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Ex: joao.silva@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Usuário
        </Button>
        <DialogClose ref={closeRef} className="hidden" />
      </form>
    </Form>
  );
}
