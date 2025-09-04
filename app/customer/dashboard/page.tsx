"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Phone,
  MapPin,
  DollarSign,
  Loader2,
  AlertTriangle,
  Eye,
  MessageCircle,
  LogOut,
  Edit,
  X,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  delivery_address?: string
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  product_code: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isCancellingOrder, setIsCancellingOrder] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    municipality: "",
    province: "",
  })

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    if (user.type !== "customer") {
      router.push("/login")
      return
    }

    setCustomer(user)
    loadCustomerData(user.id)
  }, [router])

  useEffect(() => {
    // Filtrar pedidos
    let filtered = orders

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.product_name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const loadCustomerData = async (customerId: string) => {
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        const customerData = result.data
        setOrders(customerData.orders || [])

        // Atualizar dados do perfil
        setProfileData({
          first_name: customerData.first_name || "",
          last_name: customerData.last_name || "",
          email: customerData.email || "",
          phone: customerData.phone || "",
          address: customerData.address || "",
          municipality: customerData.municipality || "",
          province: customerData.province || "",
        })
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error)
      setError("Erro ao carregar seus dados")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) {
      return
    }

    setIsCancellingOrder(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Pedido cancelado com sucesso!")
        // Recarregar dados
        loadCustomerData(customer.id)
        setShowOrderDetails(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error)
      setError("Erro ao cancelar pedido")
    } finally {
      setIsCancellingOrder(false)
    }
  }

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("Dados atualizados com sucesso!")

        // Atualizar dados do usuário no localStorage
        const updatedUser = { ...customer, ...profileData }
        localStorage.setItem("user_data", JSON.stringify(updatedUser))
        setCustomer(updatedUser)

        setShowEditProfile(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setError("Erro ao atualizar dados")
    } finally {
      setIsUpdatingProfile(false)
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
      case "cancelled":
        return "bg-red-100 text-red-800"
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
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "preparing":
        return <Package className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "delivered":
        return <Truck className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pt-AO") + " Kz"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const canCancelOrder = (status: string) => {
    return ["pending", "confirmed"].includes(status)
  }

  // Estatísticas do cliente
  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length
  const totalSpent = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando seus dados...</p>
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
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Loja
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Minha Conta</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {customer && (
              <div className="text-right">
                <p className="font-medium">
                  {customer.first_name} {customer.last_name}
                </p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/contact-pharmacist">
                <MessageCircle className="h-4 w-4 mr-2" />
                Farmacêutico
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {customer?.first_name}!</h2>
          <p className="text-gray-600">Gerencie seus pedidos e acompanhe suas compras</p>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Entregues</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">Compras finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">Em compras entregues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Aguardando processamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Meus Pedidos</CardTitle>
                <CardDescription>Histórico completo de suas compras</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar pedidos..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparing">Preparando</option>
                  <option value="ready">Pronto</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">Pedido #{order.order_number}</h4>
                          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                        <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                        </span>
                        {order.delivery_address && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Entrega
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        {canCancelOrder(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancellingOrder}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Preview dos itens */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.quantity}x {item.product_name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-500">+{order.items.length - 3} mais</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Nenhum pedido encontrado com os filtros aplicados"
                    : "Você ainda não fez nenhum pedido"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                    <Link href="/">Fazer Primeiro Pedido</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>Informações completas sobre seu pedido</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status e Data */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    {getStatusIcon(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="font-medium">Status do Pedido</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Data do Pedido</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Endereço de Entrega */}
              {selectedOrder.delivery_address && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Endereço de Entrega
                  </h4>
                  <p className="text-gray-600">{selectedOrder.delivery_address}</p>
                </div>
              )}

              {/* Itens do Pedido */}
              <div>
                <h4 className="font-medium mb-3">Itens do Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.product_name}</h5>
                        <p className="text-sm text-gray-500">Código: {item.product_code}</p>
                        <p className="text-sm">
                          {formatCurrency(item.unit_price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.total_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total do Pedido</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2">
                {canCancelOrder(selectedOrder.status) && (
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={isCancellingOrder}
                  >
                    {isCancellingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar Pedido
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/contact-pharmacist">
                    <Phone className="h-4 w-4 mr-2" />
                    Contatar Farmácia
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowOrderDetails(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Atualize suas informações pessoais</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Nome</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Sobrenome</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="municipality">Município</Label>
                <Input
                  id="municipality"
                  value={profileData.municipality}
                  onChange={(e) => setProfileData({ ...profileData, municipality: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="province">Província</Label>
                <Input
                  id="province"
                  value={profileData.province}
                  onChange={(e) => setProfileData({ ...profileData, province: e.target.value })}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditProfile(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
