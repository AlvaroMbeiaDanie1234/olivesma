"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, Phone } from "lucide-react"
import Link from "next/link"

export default function OrdersManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [orders] = useState([
    {
      id: "PED-001",
      customer: "Maria Silva",
      phone: "+244 923 456 789",
      email: "maria.silva@email.com",
      total: 15500,
      status: "pending",
      date: "2024-01-25",
      items: 3,
      municipality: "Luanda",
      address: "Rua das Flores, 123",
    },
    {
      id: "PED-002",
      customer: "João Santos",
      phone: "+244 912 345 678",
      email: "joao.santos@email.com",
      total: 8900,
      status: "confirmed",
      date: "2024-01-25",
      items: 2,
      municipality: "Luanda",
      address: "Avenida Principal, 456",
    },
    {
      id: "PED-003",
      customer: "Ana Costa",
      phone: "+244 934 567 890",
      email: "ana.costa@email.com",
      total: 22300,
      status: "delivered",
      date: "2024-01-24",
      items: 5,
      municipality: "Benguela",
      address: "Bairro Operário, 789",
    },
    {
      id: "PED-004",
      customer: "Pedro Oliveira",
      phone: "+244 945 678 901",
      email: "pedro.oliveira@email.com",
      total: 12750,
      status: "preparing",
      date: "2024-01-24",
      items: 4,
      municipality: "Luanda",
      address: "Zona Industrial, 321",
    },
    {
      id: "PED-005",
      customer: "Carla Mendes",
      phone: "+244 956 789 012",
      email: "carla.mendes@email.com",
      total: 6800,
      status: "cancelled",
      date: "2024-01-23",
      items: 2,
      municipality: "Huambo",
      address: "Centro da Cidade, 654",
    },
    {
      id: "PED-006",
      customer: "Miguel Fernandes",
      phone: "+244 967 890 123",
      email: "miguel.fernandes@email.com",
      total: 18900,
      status: "ready",
      date: "2024-01-23",
      items: 6,
      municipality: "Luanda",
      address: "Bairro Popular, 987",
    },
    {
      id: "PED-007",
      customer: "Sofia Rodrigues",
      phone: "+244 978 901 234",
      email: "sofia.rodrigues@email.com",
      total: 9500,
      status: "pending",
      date: "2024-01-22",
      items: 3,
      municipality: "Lobito",
      address: "Marginal, 147",
    },
    {
      id: "PED-008",
      customer: "Ricardo Lima",
      phone: "+244 989 012 345",
      email: "ricardo.lima@email.com",
      total: 14200,
      status: "confirmed",
      date: "2024-01-22",
      items: 4,
      municipality: "Luanda",
      address: "Vila Alice, 258",
    },
    {
      id: "PED-009",
      customer: "Beatriz Santos",
      phone: "+244 990 123 456",
      email: "beatriz.santos@email.com",
      total: 7300,
      status: "delivered",
      date: "2024-01-21",
      items: 2,
      municipality: "Benguela",
      address: "Restinga, 369",
    },
    {
      id: "PED-010",
      customer: "Fernando Costa",
      phone: "+244 901 234 567",
      email: "fernando.costa@email.com",
      total: 21500,
      status: "preparing",
      date: "2024-01-21",
      items: 7,
      municipality: "Luanda",
      address: "Maianga, 741",
    },
    {
      id: "PED-011",
      customer: "Lucia Pereira",
      phone: "+244 912 345 678",
      email: "lucia.pereira@email.com",
      total: 13400,
      status: "pending",
      date: "2024-01-20",
      items: 3,
      municipality: "Luanda",
      address: "Ingombota, 852",
    },
    {
      id: "PED-012",
      customer: "Carlos Neto",
      phone: "+244 923 456 789",
      email: "carlos.neto@email.com",
      total: 19800,
      status: "confirmed",
      date: "2024-01-20",
      items: 5,
      municipality: "Huambo",
      address: "Centro, 963",
    },
    {
      id: "PED-013",
      customer: "Isabel Martins",
      phone: "+244 934 567 890",
      email: "isabel.martins@email.com",
      total: 11200,
      status: "delivered",
      date: "2024-01-19",
      items: 4,
      municipality: "Benguela",
      address: "Lobito, 741",
    },
    {
      id: "PED-014",
      customer: "Roberto Silva",
      phone: "+244 945 678 901",
      email: "roberto.silva@email.com",
      total: 8700,
      status: "cancelled",
      date: "2024-01-19",
      items: 2,
      municipality: "Luanda",
      address: "Viana, 159",
    },
    {
      id: "PED-015",
      customer: "Amanda Costa",
      phone: "+244 956 789 012",
      email: "amanda.costa@email.com",
      total: 16300,
      status: "ready",
      date: "2024-01-18",
      items: 6,
      municipality: "Luanda",
      address: "Talatona, 357",
    },
  ])

  // Filtros e busca
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone.includes(searchTerm) ||
        order.municipality.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      const matchesDate = (() => {
        if (dateFilter === "all") return true
        const orderDate = new Date(order.date)
        const today = new Date()

        switch (dateFilter) {
          case "today":
            return orderDate.toDateString() === today.toDateString()
          case "yesterday":
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            return orderDate.toDateString() === yesterday.toDateString()
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return orderDate >= weekAgo
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return orderDate >= monthAgo
          default:
            return true
        }
      })()

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchTerm, statusFilter, dateFilter])

  // Paginação
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset página quando filtros mudam
  useState(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmado", variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      preparing: { label: "Preparando", variant: "default" as const, color: "bg-purple-100 text-purple-800" },
      ready: { label: "Pronto", variant: "default" as const, color: "bg-green-100 text-green-800" },
      delivered: { label: "Entregue", variant: "default" as const, color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelado", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleWhatsAppContact = (phone: string, orderNumber: string) => {
    const message = `Olá! Sobre seu pedido ${orderNumber} na Farmácia Olivesma. Como posso ajudá-lo?`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  // Estatísticas dos pedidos filtrados
  const stats = useMemo(() => {
    const totalValue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = filteredOrders.length
    const pendingOrders = filteredOrders.filter((o) => o.status === "pending").length
    const deliveredOrders = filteredOrders.filter((o) => o.status === "delivered").length

    return {
      totalValue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
    }
  }, [filteredOrders])

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
                <p className="text-xs text-gray-500">Gestão de Pedidos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestão de Pedidos</h2>
            <p className="text-gray-600 mt-2">Gerencie todos os pedidos recebidos no sistema</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-gray-500">No período selecionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalValue.toLocaleString("pt-AO")} Kz</div>
              <p className="text-xs text-gray-500">Soma dos pedidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <p className="text-xs text-gray-500">Aguardando confirmação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Entregues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
              <p className="text-xs text-gray-500">Pedidos finalizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Pedidos</CardTitle>
                <CardDescription>Todos os pedidos recebidos no sistema</CardDescription>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Pronto</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="yesterday">Ontem</SelectItem>
                    <SelectItem value="week">7 dias</SelectItem>
                    <SelectItem value="month">30 dias</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.municipality}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.items} itens</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {order.total.toLocaleString("pt-AO")} Kz
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString("pt-AO")}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 bg-transparent"
                            onClick={() => handleWhatsAppContact(order.phone, order.id)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Nenhum pedido encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)} de {filteredOrders.length} pedidos
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
