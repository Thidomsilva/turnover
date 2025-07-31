
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
import React from 'react';
import { userFormSchema } from '@/lib/schemas';
import { DialogClose } from './ui/dialog';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


export default function UserForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof userFormSchema>) {
    startTransition(async () => {
      try {
        const { name, email, password } = data;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        const role = email.toLowerCase() === 'thiago@sagacy.com.br' ? 'Administrador' : 'Usuário';

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name,
            email,
            role,
        });

        toast({
            title: "Sucesso!",
            description: "Usuário criado com sucesso.",
        });
        form.reset();
        router.refresh();
        closeRef.current?.click();

      } catch (error: any) {
        console.error("Error creating user:", error);
        let message = "Ocorreu um erro ao salvar.";
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este email já está em uso por outra conta.';
        } else if (error.code === 'auth/weak-password') {
            message = 'A senha é muito fraca. Tente uma mais forte.';
        } else if (error.code === 'auth/configuration-not-found') {
            message = 'Erro de configuração do Firebase. Verifique o console.';
        }
        toast({
            title: "Erro",
            description: message,
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
