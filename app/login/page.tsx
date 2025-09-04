"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2, ArrowLeft, User, Shield } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("🔐 Tentando fazer login com:", formData.identifier)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log("📡 Resposta do login:", result)

      if (result.success) {
        // Salvar dados do usuário
        localStorage.setItem("auth_token", result.token)
        localStorage.setItem("user_data", JSON.stringify(result.user))

        console.log("✅ Login realizado com sucesso:", result.user)

        // Redirecionar baseado no tipo de usuário
        if (result.user.type === "employee") {
          console.log("👨‍💼 Redirecionando funcionário para admin")
          router.push("/admin")
        } else {
          console.log("👤 Redirecionando cliente para homepage")
          router.push("/")
        }
      } else {
        setError(result.message)
        console.log("❌ Erro no login:", result.message)
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error)
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <h1 className="text-2xl font-bold text-green-600">Farmácia Olivesma</h1>
          </div>
          <p className="text-gray-600">Entre na sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Digite suas credenciais para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="identifier">Email ou Telefone</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="seu@email.com ou +244 9XX XXX XXX"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator />
              <div className="mt-6 space-y-4">
                <div className="text-center text-sm text-gray-600">
                  <p>Não tem uma conta?</p>
                  <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                    Criar conta grátis
                  </Link>
                </div>

                <div className="text-center">
                  <Link href="/customer/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credenciais de teste */}
        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-gray-500">
            <p>Credenciais para teste:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Administrador</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Email: admin@farmaciaolivesma.ao</p>
                <p>Senha: admin123</p>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Cliente</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Email: cliente@teste.com</p>
                <p>Senha: cliente123</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
