"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Customer {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  address?: string
  municipality?: string
  province?: string
  birth_date?: string
  gender?: string
  is_active: boolean
  created_at: string
  orders?: Order[]
}

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

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

    loadCustomers()
  }, [router])

  useEffect(() => {
    // Filtrar clientes
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredCustomers(filtered)
    }
  }, [searchTerm, customers])

  const loadCustomers = async () => {
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setCustomers(result.data || [])
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
      setError("Erro ao carregar clientes")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCustomerDetails = async (customerId: string) => {
    setIsLoadingDetails(true)
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
        setSelectedCustomer(result.data)
        setShowDetailsDialog(true)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do cliente:", error)
      setError("Erro ao carregar detalhes do cliente")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pt-AO") + " Kz"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-AO")
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando clientes...</p>
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
                <p className="text-xs text-gray-500">Gestão de Clientes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
            <p className="text-gray-600 mt-2">Gerencie os clientes da farmácia</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/admin/customers/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
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

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes ({filteredCustomers.length})</CardTitle>
            <CardDescription>Todos os clientes cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            {customer.first_name} {customer.last_name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {customer.phone}
                            </span>
                            {customer.email && (
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {customer.email}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(customer.created_at)}
                            </span>
                          </div>
                          {customer.address && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {customer.address}
                              {customer.municipality && `, ${customer.municipality}`}
                              {customer.province && `, ${customer.province}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={customer.is_active ? "default" : "secondary"}>
                          {customer.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadCustomerDetails(customer.id)}
                          disabled={isLoadingDetails}
                        >
                          {isLoadingDetails ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/customers/${customer.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Cliente - {selectedCustomer?.first_name} {selectedCustomer?.last_name}
            </DialogTitle>
            <DialogDescription>Informações completas do cliente e histórico de pedidos</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                      <p className="font-medium">
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone</label>
                      <p className="font-medium">{selectedCustomer.phone}</p>
                    </div>
                    {selectedCustomer.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="font-medium">{selectedCustomer.email}</p>
                      </div>
                    )}
                    {selectedCustomer.birth_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                        <p className="font-medium">{formatDate(selectedCustomer.birth_date)}</p>
                      </div>
                    )}
                    {selectedCustomer.gender && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Gênero</label>
                        <p className="font-medium">{selectedCustomer.gender}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge variant={selectedCustomer.is_active ? "default" : "secondary"}>
                          {selectedCustomer.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cliente desde</label>
                      <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCustomer.address ? (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Endereço</label>
                          <p className="font-medium">{selectedCustomer.address}</p>
                        </div>
                        {selectedCustomer.municipality && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Município</label>
                            <p className="font-medium">{selectedCustomer.municipality}</p>
                          </div>
                        )}
                        {selectedCustomer.province && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Província</label>
                            <p className="font-medium">{selectedCustomer.province}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">Endereço não informado</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <ShoppingBag className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                        <p className="text-2xl font-bold">{selectedCustomer.orders?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            selectedCustomer.orders
                              ?.filter((o) => o.status === "delivered")
                              .reduce((sum, o) => sum + o.total_amount, 0) || 0,
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pedidos Entregues</p>
                        <p className="text-2xl font-bold">
                          {selectedCustomer.orders?.filter((o) => o.status === "delivered").length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Pedidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">Pedido #{order.order_number}</h4>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                              <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                            </div>
                          </div>

                          {/* Itens do Pedido */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Itens:</p>
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                <span>
                                  {item.quantity}x {item.product_name}
                                </span>
                                <span className="font-medium">{formatCurrency(item.total_price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum pedido realizado ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href={`/admin/customers/${selectedCustomer.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Cliente
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowDetailsDialog(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
