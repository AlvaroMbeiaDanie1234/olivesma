"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Database,
  Stethoscope,
  Loader2,
  RefreshCw,
  Home,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    if (user.type !== "employee") {
      router.push("/login")
      return
    }

    loadDashboardData()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")

      // Carregar estatísticas
      const statsResponse = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json()
        if (statsResult.success) {
          setStats(statsResult.data)
        }
      }

      // Carregar pedidos recentes
      const ordersResponse = await fetch("/api/dashboard/recent-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json()
        if (ordersResult.success) {
          setRecentOrders(ordersResult.data)
        }
      }

      // Carregar produtos com estoque baixo
      const lowStockResponse = await fetch("/api/dashboard/low-stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (lowStockResponse.ok) {
        const lowStockResult = await lowStockResponse.json()
        if (lowStockResult.success) {
          setLowStockProducts(lowStockResult.data)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
      setError("Erro ao carregar dados do dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-purple-100 text-purple-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "delivered":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Pronto"
      case "delivered":
        return "Entregue"
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pt-AO") + " Kz"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Dashboard Administrativo</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentTime.toLocaleDateString("pt-AO")}</p>
              <p className="text-xs text-gray-500">{currentTime.toLocaleTimeString("pt-AO")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Página Inicial
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao Dashboard</h2>
            <p className="text-gray-600">Gerencie sua farmácia de forma eficiente e organizada</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Usuários ativos no sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Pedidos este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">Vendas realizadas</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Vendas do dia atual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Vendas deste mês</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Button asChild className="h-20 bg-green-600 hover:bg-green-700">
              <Link href="/admin/pos" className="flex flex-col items-center justify-center">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Sistema POS
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/products" className="flex flex-col items-center justify-center">
                <Package className="h-6 w-6 mb-2" />
                Produtos
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/orders" className="flex flex-col items-center justify-center">
                <FileText className="h-6 w-6 mb-2" />
                Pedidos
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-20 bg-transparent">
              <Link href="/admin/reports" className="flex flex-col items-center justify-center">
                <BarChart3 className="h-6 w-6 mb-2" />
                Relatórios
              </Link>
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Últimos pedidos realizados hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-medium">
                              {order.customer_first_name ? order.customer_first_name.charAt(0) : "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {order.customer_first_name && order.customer_last_name
                                ? `${order.customer_first_name} ${order.customer_last_name}`
                                : "Cliente não identificado"}
                            </p>
                            <p className="text-sm text-gray-500">{order.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                          <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum pedido hoje</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/admin/orders">Ver Todos os Pedidos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts and Notifications */}
            <div className="space-y-6">
              {/* Low Stock Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                    Estoque Baixo
                  </CardTitle>
                  <CardDescription>Produtos que precisam de reposição</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">Mín: {product.min_stock_level}</p>
                          </div>
                          <Badge variant="destructive">{product.stock_quantity}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Todos os produtos com estoque adequado</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <Link href="/admin/products">Gerenciar Estoque</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 text-blue-500 mr-2" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Banco de Dados</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sistema POS</span>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup</span>
                      <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <Link href="/admin/diagnostics">Diagnósticos</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/admin/users">
                        <Users className="h-4 w-4 mr-2" />
                        Usuários
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/admin/customers">
                        <Users className="h-4 w-4 mr-2" />
                        Clientes
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/admin/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/contact-pharmacist">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Farmacêutico
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="w-full justify-start">
                      <Link href="/admin/pos/sales-history">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Histórico de Vendas
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
