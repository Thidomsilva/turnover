import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex flex-col justify-center items-center gap-2 mb-2">
                <Image src="https://firebasestudio.ai/api/image-proxy/R1JQUElTQUdZQ1lTT0xVQ09FU0VNUFJFU0FSSUFJUy5wbmc?expires=1720743609&signature=C8gQ~2B59H-xYv2hH~R-zVqW-68Q-B5jS~eHlW67b-1vHnQ7X1X6h8V0vGq2uSjCj1D3R3Yv3F8q7l9h7A7H6e5i4l3I2S1B0M9p8i7c6g5f4d3c2b1a" alt="Logotipo Grupo Sagacy" width={250} height={100} />
                <CardTitle className="text-2xl pt-4">Gestão de Turnover</CardTitle>
            </div>
            <CardDescription>
              Entre com seu email e senha para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" />
            </div>
             <Button asChild className="w-full">
              <Link href="/dashboard">Entrar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
