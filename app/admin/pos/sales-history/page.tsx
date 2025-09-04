"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, Eye, Printer, Calendar, DollarSign, ShoppingCart, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function SalesHistory() {
  const [sales, setSales] = useState<any[]>([])
  const [filteredSales, setFilteredSales] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSales()
  }, [])

  useEffect(() => {
    // Filtrar vendas baseado no termo de busca
    const filtered = sales.filter(
      (sale) =>
        sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_phone || "").includes(searchTerm),
    )
    setFilteredSales(filtered)
  }, [sales, searchTerm])

  const loadSales = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/sales", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        const salesData = result.data || []
        setSales(salesData)
        console.log("Vendas carregadas:", salesData.length)
      } else {
        console.error("Erro ao carregar vendas:", result.message)
      }
    } catch (error) {
      console.error("Erro ao carregar vendas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSales()
    setRefreshing(false)
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: "Dinheiro",
      card: "Cartão",
      transfer: "Transferência",
      multicaixa: "Multicaixa",
    }
    return methods[method as keyof typeof methods] || method
  }

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      cash: "bg-green-100 text-green-800",
      card: "bg-blue-100 text-blue-800",
      transfer: "bg-purple-100 text-purple-800",
      multicaixa: "bg-orange-100 text-orange-800",
    }
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const generateReceiptPDF = (sale: any) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo Térmico - ${sale.sale_number}</title>
        <style>
          @page { 
            size: 80mm auto; 
            margin: 0; 
            padding: 0;
          }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 11px; 
            margin: 0; 
            padding: 8px;
            width: 72mm;
            line-height: 1.2;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 14px; }
          .small { font-size: 9px; }
          .line { 
            border-top: 1px dashed #000; 
            margin: 8px 0; 
            height: 1px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .item-row {
            margin: 4px 0;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 1px;
          }
          .item-details {
            font-size: 9px;
            color: #666;
          }
          .total-section {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #000;
          }
          .final-total {
            font-size: 16px;
            font-weight: bold;
            margin: 8px 0;
            padding: 4px 0;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          .footer {
            margin-top: 12px;
            font-size: 9px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="bold large">FARMACIA OLIVESMA</div>
          <div class="small">Rua Principal, Luanda - Angola</div>
          <div class="small">Tel: +244 923 456 789</div>
          <div class="small">NIF: 123456789</div>
        </div>

        <div class="line"></div>

        <div class="center bold">RECIBO DE VENDA</div>
        <div class="small">Nº: ${sale.sale_number}</div>
        <div class="small">Data: ${new Date(sale.created_at).toLocaleString("pt-AO")}</div>
        <div class="small">Operador: ${sale.cashier_first_name || "Sistema"} ${sale.cashier_last_name || ""}</div>
        ${sale.customer_first_name ? `<div class="small">Cliente: ${sale.customer_first_name} ${sale.customer_last_name}</div>` : ""}

        <div class="line"></div>

        <div class="final-total center">
          TOTAL: ${sale.total_amount.toLocaleString("pt-AO")} Kz
        </div>

        <div class="row">
          <span>Pagamento:</span>
          <span>${getPaymentMethodLabel(sale.payment_method)}</span>
        </div>

        <div class="line"></div>

        <div class="footer">
          <div class="bold">OBRIGADO PELA PREFERENCIA!</div>
          <div>Volte sempre!</div>
          <div class="small">Este documento nao serve como fatura fiscal</div>
          <div class="small">Reimpresso em ${new Date().toLocaleString("pt-AO")}</div>
        </div>
      </body>
      </html>
    `

    // Criar e abrir PDF térmico
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalTransactions = filteredSales.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico de vendas...</p>
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
            <Link href="/admin/pos" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Caixa
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Histórico de Vendas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalSales.toLocaleString("pt-AO")} Kz</div>
              <p className="text-xs text-muted-foreground">Valor total das vendas filtradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Número de vendas realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalTransactions > 0 ? (totalSales / totalTransactions).toLocaleString("pt-AO") : "0"} Kz
              </div>
              <p className="text-xs text-muted-foreground">Valor médio por venda</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por número da venda, cliente ou telefone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Venda</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        {searchTerm ? "Nenhuma venda encontrada" : "Nenhuma venda registrada"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.sale_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(sale.created_at).toLocaleDateString("pt-AO")}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.created_at).toLocaleTimeString("pt-AO")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sale.customer_first_name ? (
                          <div>
                            <div className="text-sm font-medium">
                              {sale.customer_first_name} {sale.customer_last_name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Cliente não identificado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sale.cashier_first_name || "Sistema"} {sale.cashier_last_name || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(sale.payment_method)}>
                          {getPaymentMethodLabel(sale.payment_method)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {sale.total_amount.toLocaleString("pt-AO")} Kz
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes da Venda - {sale.sale_number}</DialogTitle>
                                <DialogDescription>
                                  Venda realizada em {new Date(sale.created_at).toLocaleString("pt-AO")}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Sale Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Informações da Venda</h4>
                                    <div className="space-y-1 text-sm">
                                      <div>
                                        <span className="text-gray-500">Número:</span> {sale.sale_number}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Data:</span>{" "}
                                        {new Date(sale.created_at).toLocaleString("pt-AO")}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Vendedor:</span>{" "}
                                        {sale.cashier_first_name || "Sistema"} {sale.cashier_last_name || ""}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Pagamento:</span>{" "}
                                        <Badge className={getPaymentMethodColor(sale.payment_method)}>
                                          {getPaymentMethodLabel(sale.payment_method)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Cliente</h4>
                                    {sale.customer_first_name ? (
                                      <div className="space-y-1 text-sm">
                                        <div>
                                          <span className="text-gray-500">Nome:</span> {sale.customer_first_name}{" "}
                                          {sale.customer_last_name}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">Cliente não identificado</p>
                                    )}
                                  </div>
                                </div>

                                {/* Total */}
                                <div className="border-t pt-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Total da Venda:</span>
                                    <span className="text-xl font-bold text-green-600">
                                      {sale.total_amount.toLocaleString("pt-AO")} Kz
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" size="sm" onClick={() => generateReceiptPDF(sale)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
