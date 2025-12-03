
'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("user")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("auth/user-not-found");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Este é um método inseguro de verificar senha, apenas para fins de demonstração
      // Em produção, use o Firebase Authentication.
      if (userData.senha !== password) {
         throw new Error("auth/wrong-password");
      }
      
      const userToStore = {
        uid: userDoc.id,
        email: userData.email,
        name: userData.nome,
        role: userData.role
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userToStore));
      }
      
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso.",
      });

      router.push('/dashboard');

    } catch (error: any) {
      let message = "Ocorreu um erro no login.";
      if (error.message === 'auth/user-not-found' || error.message === 'auth/wrong-password') {
        message = "Email ou senha inválidos.";
      }
      toast({
        title: "Erro de autenticação",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex flex-col justify-center items-center gap-4 mb-2">
                <img src="/logoprincipal.png" alt="Logo principal" className="h-48 w-auto mb-2" />
                <CardTitle>Gestão de Turnover</CardTitle>
            </div>
            <CardDescription>
              Entre com seu email e senha para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
