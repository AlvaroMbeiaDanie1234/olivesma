"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  Server,
  Package,
  Users,
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { dbOperations, isDatabaseConfigured } from "@/lib/database"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    const results: DiagnosticResult[] = []

    // 1. Verificar configuração do banco de dados
    if (isDatabaseConfigured()) {
      results.push({
        name: "Configuração do Banco",
        status: "success",
        message: "Banco de dados configurado",
        details: "Configurações de conexão estão definidas",
      })
    } else {
      results.push({
        name: "Configuração do Banco",
        status: "error",
        message: "Banco de dados não configurado",
        details: "Configure as credenciais do banco em /admin/settings",
      })
    }

    // 2. Testar conexão com banco
    if (isDatabaseConfigured()) {
      try {
        const { data, error } = await dbOperations.getProducts()
        if (error) {
          results.push({
            name: "Conexão com Banco",
            status: "error",
            message: "Erro na conexão",
            details: error.message,
          })
        } else {
          results.push({
            name: "Conexão com Banco",
            status: "success",
            message: "Conexão estabelecida com sucesso",
            details: `Encontrados ${data?.length || 0} produtos`,
          })
        }
      } catch (error) {
        results.push({
          name: "Conexão com Banco",
          status: "error",
          message: "Erro de conexão",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    } else {
      results.push({
        name: "Conexão com Banco",
        status: "warning",
        message: "Usando dados mock",
        details: "Configure o banco para usar dados reais",
      })
    }

    // 3. Verificar dados de produtos
    if (isDatabaseConfigured()) {
      try {
        const { data: products } = await dbOperations.getProducts()
        if (!products || products.length === 0) {
          results.push({
            name: "Dados de Produtos",
            status: "warning",
            message: "Nenhum produto encontrado",
            details: "Execute o script de inicialização para popular o banco",
          })
        } else {
          results.push({
            name: "Dados de Produtos",
            status: "success",
            message: `${products.length} produtos encontrados`,
            details: "Dados de produtos estão disponíveis",
          })
        }
      } catch (error) {
        results.push({
          name: "Dados de Produtos",
          status: "error",
          message: "Erro ao verificar produtos",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // 4. Verificar categorias
    if (isDatabaseConfigured()) {
      try {
        const { data: categories } = await dbOperations.getCategories()
        if (!categories || categories.length === 0) {
          results.push({
            name: "Categorias",
            status: "warning",
            message: "Nenhuma categoria encontrada",
            details: "Execute o script de inicialização para criar categorias",
          })
        } else {
          results.push({
            name: "Categorias",
            status: "success",
            message: `${categories.length} categorias encontradas`,
            details: "Categorias de produtos estão disponíveis",
          })
        }
      } catch (error) {
        results.push({
          name: "Categorias",
          status: "error",
          message: "Erro ao verificar categorias",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // 5. Verificar usuários
    if (isDatabaseConfigured()) {
      try {
        const { data: users } = await dbOperations.getUsers()
        if (!users || users.length === 0) {
          results.push({
            name: "Usuários do Sistema",
            status: "warning",
            message: "Nenhum usuário encontrado",
            details: "Execute o script de inicialização para criar usuário admin",
          })
        } else {
          results.push({
            name: "Usuários do Sistema",
            status: "success",
            message: `${users.length} usuários encontrados`,
            details: "Usuários do sistema estão configurados",
          })
        }
      } catch (error) {
        results.push({
          name: "Usuários do Sistema",
          status: "error",
          message: "Erro ao verificar usuários",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    // 6. Verificar configurações do sistema
    if (isDatabaseConfigured()) {
      try {
        const { data: settings } = await dbOperations.getSystemSettings()
        if (!settings || settings.length === 0) {
          results.push({
            name: "Configurações do Sistema",
            status: "warning",
            message: "Nenhuma configuração encontrada",
            details: "Execute o script de inicialização para criar configurações padrão",
          })
        } else {
          results.push({
            name: "Configurações do Sistema",
            status: "success",
            message: `${settings.length} configurações encontradas`,
            details: "Configurações do sistema estão disponíveis",
          })
        }
      } catch (error) {
        results.push({
          name: "Configurações do Sistema",
          status: "error",
          message: "Erro ao verificar configurações",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        })
      }
    }

    setDiagnostics(results)
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await runDiagnostics()
    setRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">OK</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Desconhecido</Badge>
    }
  }

  const successCount = diagnostics.filter((d) => d.status === "success").length
  const errorCount = diagnostics.filter((d) => d.status === "error").length
  const warningCount = diagnostics.filter((d) => d.status === "warning").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Diagnóstico do Sistema</p>
              </div>
            </div>
          </div>

          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico do Sistema</h2>
            <p className="text-gray-600">Verificação do status de todos os componentes do sistema</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Verificações</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{diagnostics.length}</div>
                <p className="text-xs text-muted-foreground">Componentes verificados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <p className="text-xs text-muted-foreground">Funcionando corretamente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avisos</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <p className="text-xs text-muted-foreground">Requerem atenção</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erros</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <p className="text-xs text-muted-foreground">Precisam ser corrigidos</p>
              </CardContent>
            </Card>
          </div>

          {/* Diagnostics Results */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados do Diagnóstico</CardTitle>
              <CardDescription>Status detalhado de cada componente do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2">Executando diagnósticos...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnostics.map((diagnostic, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(diagnostic.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{diagnostic.name}</h4>
                          {getStatusBadge(diagnostic.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{diagnostic.message}</p>
                        {diagnostic.details && <p className="text-xs text-gray-500">{diagnostic.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Links úteis para configuração e manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild className="justify-start bg-transparent">
                  <Link href="/admin/pos">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Testar Sistema POS
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start bg-transparent">
                  <Link href="/admin/products">
                    <Package className="h-4 w-4 mr-2" />
                    Gerenciar Produtos
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start bg-transparent">
                  <Link href="/admin/orders">
                    <Server className="h-4 w-4 mr-2" />
                    Ver Pedidos
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start bg-transparent">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {errorCount > 0 && (
            <Card className="mt-8 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Instruções para Correção</CardTitle>
                <CardDescription>Siga estes passos para resolver os problemas encontrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">1. Se o banco não está configurado:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>Acesse /admin/settings</li>
                      <li>Vá para aba "Banco de Dados"</li>
                      <li>Configure tipo, host, porta, nome, usuário e senha</li>
                      <li>Teste a conexão</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">2. Se não há dados no banco:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>Em /admin/settings, clique em "Inicializar Banco"</li>
                      <li>Ou execute manualmente os scripts SQL</li>
                      <li>Verifique se as tabelas foram criadas</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">3. Se há erro de conexão:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>Verifique se o servidor de banco está rodando</li>
                      <li>Confirme se as credenciais estão corretas</li>
                      <li>Teste a conectividade de rede</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
