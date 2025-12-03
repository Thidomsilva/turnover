
'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in (e.g., page reload), redirect to the dashboard.
    if (typeof window !== "undefined" && localStorage.getItem("user")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      // 1. Authenticate with Firebase Auth service
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Fetch additional user data (name, role) from Firestore using the AUTH UID
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userToStore = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'Usuário', 
        role: 'Usuário',
      };

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userToStore.name = userData.name;
        userToStore.role = userData.role;
      } else {
        // This case is unlikely if user creation is handled correctly, but it's a good safeguard.
        console.warn(`User data not found in Firestore for UID: ${firebaseUser.uid}. Using default data.`);
      }

      // 4. Save to localStorage to maintain the session
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userToStore));
      }
      
      toast({
        title: "Sucesso!",
        description: "Login realizado com sucesso.",
      });

      // 5. Redirect to the dashboard
      router.push('/dashboard');

    } catch (error: any) {
      let message = "Ocorreu um erro no login. Verifique suas credenciais.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Email ou senha inválidos.";
      } else if (error.code === 'auth/configuration-not-found') {
         message = "Erro de configuração do Firebase. Verifique o console.";
      }
      console.error("Login error:", error.code, error.message);
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
