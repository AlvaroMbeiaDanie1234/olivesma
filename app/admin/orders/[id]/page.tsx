"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Phone, MapPin, Package, Clock, User, CreditCard, MessageSquare, Printer, Save } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [orderStatus, setOrderStatus] = useState("pending")
  const [whatsappMessage, setWhatsappMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mock order data
  const [order, setOrder] = useState({
    id: params.id,
    orderNumber: "PED-001",
    customer: {
      name: "Maria Silva",
      phone: "+244 923 456 789",
      email: "maria.silva@email.com",
    },
    address: {
      street: "Rua das Flores, 123",
      municipality: "Luanda",
      province: "Luanda",
      notes: "Próximo ao mercado central, casa azul",
    },
    items: [
      {
        id: 1,
        name: "Paracetamol 500mg",
        price: 850,
        quantity: 2,
        image: "/placeholder.svg?height=60&width=60",
        category: "Analgésicos",
        prescription: false,
      },
      {
        id: 2,
        name: "Vitamina C 1000mg",
        price: 1200,
        quantity: 3,
        image: "/placeholder.svg?height=60&width=60",
        category: "Vitaminas",
        prescription: false,
      },
      {
        id: 3,
        name: "Omeprazol 20mg",
        price: 1800,
        quantity: 1,
        image: "/placeholder.svg?height=60&width=60",
        category: "Gastroenterologia",
        prescription: true,
      },
    ],
    subtotal: 7300,
    deliveryFee: 2000,
    iva: 1022,
    total: 10322,
    paymentMethod: "cash",
    status: "pending",
    createdAt: "2024-01-25T10:30:00Z",
    updatedAt: "2024-01-25T10:30:00Z",
    notes: "Entregar preferencialmente pela manhã",
    timeline: [
      {
        status: "pending",
        timestamp: "2024-01-25T10:30:00Z",
        description: "Pedido criado",
      },
    ],
  })

  useEffect(() => {
    // Carregar dados do pedido do localStorage
    const savedOrders = localStorage.getItem("pharmacy_orders")
    if (savedOrders) {
      const orders = JSON.parse(savedOrders)
      const foundOrder = orders.find((o: any) => o.orderNumber === params.id)
      if (foundOrder) {
        setOrder(foundOrder)
        setOrderStatus(foundOrder.status)
      }
    }
  }, [params.id])

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

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: "💵 Dinheiro na Entrega",
      multicaixa: "💳 Multicaixa Express",
      transfer: "🏦 Transferência Bancária",
      card: "💳 Cartão de Débito/Crédito",
    }
    return methods[method as keyof typeof methods] || method
  }

  const handleStatusUpdate = async () => {
    setIsLoading(true)

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedOrder = {
        ...order,
        status: orderStatus,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...order.timeline,
          {
            status: orderStatus,
            timestamp: new Date().toISOString(),
            description: getStatusDescription(orderStatus),
          },
        ],
      }

      // Atualizar no localStorage
      const savedOrders = localStorage.getItem("pharmacy_orders") || "[]"
      const orders = JSON.parse(savedOrders)
      const orderIndex = orders.findIndex((o: any) => o.orderNumber === order.orderNumber)

      if (orderIndex >= 0) {
        orders[orderIndex] = updatedOrder
      } else {
        orders.push(updatedOrder)
      }

      localStorage.setItem("pharmacy_orders", JSON.stringify(orders))

      // Atualizar estado local
      setOrder(updatedOrder)

      toast({
        title: "Status Atualizado!",
        description: `Pedido ${order.orderNumber} foi atualizado para: ${getStatusBadge(orderStatus).props.children}`,
      })

      // Enviar notificação automática por WhatsApp
      const autoMessage = `Olá ${order.customer.name}! Seu pedido ${order.orderNumber} foi atualizado para: ${getStatusBadge(orderStatus).props.children}. Farmácia Olivesma.`
      const phoneNumber = order.customer.phone.replace(/\D/g, "")
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(autoMessage)}`

      // Abrir WhatsApp em nova aba
      setTimeout(() => {
        window.open(whatsappUrl, "_blank")
      }, 1500)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusDescription = (status: string) => {
    const descriptions = {
      pending: "Pedido aguardando confirmação",
      confirmed: "Pedido confirmado pela farmácia",
      preparing: "Medicamentos sendo preparados",
      ready: "Pedido pronto para entrega",
      delivered: "Pedido entregue ao cliente",
      cancelled: "Pedido cancelado",
    }
    return descriptions[status as keyof typeof descriptions] || "Status atualizado"
  }

  const handlePrintOrder = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pedido ${order.orderNumber} - Farmácia Olivesma</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #16a34a; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #16a34a; 
              margin-bottom: 5px;
            }
            .subtitle { 
              color: #666; 
              font-size: 14px;
            }
            .section { 
              margin-bottom: 25px; 
              padding: 15px; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px;
            }
            .section-title { 
              font-weight: bold; 
              font-size: 16px; 
              color: #16a34a; 
              margin-bottom: 10px; 
              border-bottom: 1px solid #e5e7eb; 
              padding-bottom: 5px;
            }
            .order-info { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 20px;
            }
            .status { 
              padding: 4px 12px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold;
            }
            .status.pending { background: #fef3c7; color: #92400e; }
            .status.confirmed { background: #dbeafe; color: #1e40af; }
            .status.preparing { background: #e9d5ff; color: #7c3aed; }
            .status.ready { background: #d1fae5; color: #065f46; }
            .status.delivered { background: #d1fae5; color: #065f46; }
            .status.cancelled { background: #fee2e2; color: #dc2626; }
            .item { 
              display: flex; 
              justify-content: space-between; 
              padding: 8px 0; 
              border-bottom: 1px solid #f3f4f6;
            }
            .item:last-child { border-bottom: none; }
            .totals { 
              margin-top: 15px; 
              padding-top: 15px; 
              border-top: 2px solid #e5e7eb;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px;
            }
            .total-final { 
              font-weight: bold; 
              font-size: 18px; 
              color: #16a34a; 
              border-top: 1px solid #16a34a; 
              padding-top: 10px; 
              margin-top: 10px;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
              color: #666; 
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏥 Farmácia Olivesma</div>
            <div class="subtitle">Sua saúde é nossa prioridade</div>
            <div style="margin-top: 10px;">
              <strong>Pedido: ${order.orderNumber}</strong> | 
              Data: ${new Date(order.createdAt).toLocaleDateString("pt-AO")} às ${new Date(order.createdAt).toLocaleTimeString("pt-AO")}
            </div>
          </div>

          <div class="order-info">
            <div>
              <strong>Status Atual:</strong>
              <span class="status ${order.status}">${getStatusBadge(order.status).props.children}</span>
            </div>
            <div>
              <strong>Total:</strong> 
              <span style="font-size: 18px; color: #16a34a; font-weight: bold;">
                ${order.total.toLocaleString("pt-AO")} Kz
              </span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">👤 Informações do Cliente</div>
            <div><strong>Nome:</strong> ${order.customer.name}</div>
            <div><strong>Telefone:</strong> ${order.customer.phone}</div>
            ${order.customer.email ? `<div><strong>Email:</strong> ${order.customer.email}</div>` : ""}
          </div>

          <div class="section">
            <div class="section-title">📍 Endereço de Entrega</div>
            <div>${order.address.street}</div>
            <div>${order.address.municipality}, ${order.address.province}</div>
            ${order.address.notes ? `<div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 4px;"><strong>Observações:</strong> ${order.address.notes}</div>` : ""}
          </div>

          <div class="section">
            <div class="section-title">📦 Itens do Pedido</div>
            ${order.items
              .map(
                (item) => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong>
                  <div style="font-size: 12px; color: #666;">
                    ${item.category} ${item.prescription ? "| ⚠️ Receita Médica" : ""}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div>${item.price.toLocaleString("pt-AO")} Kz × ${item.quantity}</div>
                  <div style="font-weight: bold;">${(item.price * item.quantity).toLocaleString("pt-AO")} Kz</div>
                </div>
              </div>
            `,
              )
              .join("")}

            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${order.subtotal.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div class="total-row">
                <span>Taxa de Entrega:</span>
                <span>${order.deliveryFee.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div class="total-row">
                <span>IVA (14%):</span>
                <span>${order.iva.toLocaleString("pt-AO")} Kz</span>
              </div>
              <div class="total-row total-final">
                <span>TOTAL:</span>
                <span>${order.total.toLocaleString("pt-AO")} Kz</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">💳 Informações de Pagamento</div>
            <div><strong>Método:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</div>
            ${order.notes ? `<div style="margin-top: 8px;"><strong>Observações:</strong> ${order.notes}</div>` : ""}
          </div>

          ${
            order.timeline.length > 1
              ? `
            <div class="section">
              <div class="section-title">📋 Histórico do Pedido</div>
              ${order.timeline
                .map(
                  (event) => `
                <div style="margin-bottom: 8px; padding: 8px; background: #f9fafb; border-radius: 4px;">
                  <div style="font-weight: bold;">${event.description}</div>
                  <div style="font-size: 12px; color: #666;">
                    ${new Date(event.timestamp).toLocaleDateString("pt-AO")} às ${new Date(event.timestamp).toLocaleTimeString("pt-AO")}
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }

          <div class="footer">
            <div><strong>Farmácia Olivesma</strong></div>
            <div>Telefone: +244 923 456 789 | Email: contato@farmaciaolivesma.ao</div>
            <div>Endereço: Rua Principal, Luanda, Angola</div>
            <div style="margin-top: 10px;">Impresso em: ${new Date().toLocaleString("pt-AO")}</div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Aguardar o carregamento e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }

    toast({
      title: "Imprimindo Pedido",
      description: `Pedido ${order.orderNumber} está sendo preparado para impressão.`,
    })
  }

  const handleSendWhatsApp = () => {
    const message =
      whatsappMessage ||
      `Olá ${order.customer.name}! Seu pedido ${order.orderNumber} foi atualizado para: ${getStatusBadge(orderStatus).props.children}. Farmácia Olivesma.`
    const phoneNumber = order.customer.phone.replace(/\D/g, "")
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleCancelOrder = () => {
    if (confirm("Tem certeza que deseja cancelar este pedido?")) {
      setOrderStatus("cancelled")
      handleStatusUpdate()
    }
  }

  const handleDuplicateOrder = () => {
    const duplicatedOrder = {
      ...order,
      id: Date.now().toString(),
      orderNumber: `PED-${String(Date.now()).slice(-3)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          description: "Pedido duplicado criado",
        },
      ],
    }

    const savedOrders = localStorage.getItem("pharmacy_orders") || "[]"
    const orders = JSON.parse(savedOrders)
    orders.push(duplicatedOrder)
    localStorage.setItem("pharmacy_orders", JSON.stringify(orders))

    toast({
      title: "Pedido Duplicado!",
      description: `Novo pedido ${duplicatedOrder.orderNumber} foi criado baseado neste pedido.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Pedidos
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Detalhes do Pedido</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Order Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Pedido {order.orderNumber}</h2>
              <p className="text-gray-600 mt-2">
                Criado em {new Date(order.createdAt).toLocaleDateString("pt-AO")} às{" "}
                {new Date(order.createdAt).toLocaleTimeString("pt-AO")}
              </p>
              {order.updatedAt !== order.createdAt && (
                <p className="text-gray-500 text-sm">
                  Última atualização: {new Date(order.updatedAt).toLocaleDateString("pt-AO")} às{" "}
                  {new Date(order.updatedAt).toLocaleTimeString("pt-AO")}
                </p>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-2xl font-bold text-green-600 mt-2">{order.total.toLocaleString("pt-AO")} Kz</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nome</Label>
                      <p className="font-medium">{order.customer.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                      <p className="font-medium">{order.customer.phone}</p>
                    </div>
                  </div>
                  {order.customer.email && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="font-medium">{order.customer.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.address.street}</p>
                    <p className="text-gray-600">
                      {order.address.municipality}, {order.address.province}
                    </p>
                    {order.address.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-blue-800">Observações:</Label>
                        <p className="text-blue-700">{order.address.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{item.category}</Badge>
                            {item.prescription && <Badge variant="destructive">Receita Médica</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.price.toLocaleString("pt-AO")} Kz × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {(item.price * item.quantity).toLocaleString("pt-AO")} Kz
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{order.subtotal.toLocaleString("pt-AO")} Kz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span>{order.deliveryFee.toLocaleString("pt-AO")} Kz</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (14%):</span>
                      <span>{order.iva.toLocaleString("pt-AO")} Kz</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">{order.total.toLocaleString("pt-AO")} Kz</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Informações de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                  {order.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-4">
                      <Label className="text-sm font-medium text-gray-600">Observações do Cliente:</Label>
                      <p className="text-gray-700 mt-1">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions Panel */}
            <div className="space-y-6">
              {/* Status Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Atualizar Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status do Pedido</Label>
                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="preparing">Preparando</SelectItem>
                        <SelectItem value="ready">Pronto para Entrega</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleStatusUpdate}
                    disabled={isLoading || orderStatus === order.status}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Salvando..." : "Salvar Status"}
                  </Button>
                </CardContent>
              </Card>

              {/* WhatsApp Communication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Comunicação WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp-message">Mensagem Personalizada</Label>
                    <Textarea
                      id="whatsapp-message"
                      placeholder={`Olá ${order.customer.name}! Seu pedido ${order.orderNumber} foi atualizado...`}
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleSendWhatsApp}>
                    <Phone className="h-4 w-4 mr-2" />
                    Enviar WhatsApp
                  </Button>

                  <div className="text-xs text-gray-600 text-center">Enviará para: {order.customer.phone}</div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handlePrintOrder}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Pedido
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    📧 Enviar por Email
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={handleDuplicateOrder}
                  >
                    📋 Duplicar Pedido
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 bg-transparent"
                    onClick={handleCancelOrder}
                  >
                    ❌ Cancelar Pedido
                  </Button>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            index === order.timeline.length - 1 ? "bg-green-600" : "bg-gray-300"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium text-sm">{event.description}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(event.timestamp).toLocaleDateString("pt-AO")} às{" "}
                            {new Date(event.timestamp).toLocaleTimeString("pt-AO")}
                          </p>
                        </div>
                      </div>
                    ))}
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
