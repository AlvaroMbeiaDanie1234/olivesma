"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Printer,
  Search,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface CashSession {
  id: string
  cashier_name: string
  opening_time: string
  closing_time?: string
  opening_amount: number
  closing_amount?: number
  total_sales: number
  sales_count: number
  status: "open" | "closed"
  sales?: any[]
}

export default function ClosingHistoryPage() {
  const [closingHistory, setClosingHistory] = useState<CashSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    loadClosingHistory()
  }, [])

  const loadClosingHistory = () => {
    const history = JSON.parse(localStorage.getItem("cashClosingHistory") || "[]")
    setClosingHistory(history)
  }

  const filteredHistory = closingHistory.filter(
    (session) =>
      session.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: "Dinheiro",
      card: "Cartão",
      transfer: "Transferência",
      multicaixa: "Multicaixa",
    }
    return methods[method as keyof typeof methods] || method
  }

  const generateClosingReport = (session: CashSession, sales: any[]) => {
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Fechamento de Caixa - ${session.id}</title>
        <style>
          @page { 
            size: A4; 
            margin: 2cm;
          }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            margin: 0; 
            padding: 0;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #16a34a; 
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
          }
          .session-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
          }
          .info-value {
            color: #16a34a;
            font-weight: bold;
          }
          .sales-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .sales-table th,
          .sales-table td {
            padding: 10px;
            text-align: left;
            border: 1px solid #d1d5db;
          }
          .sales-table th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .sales-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .summary {
            background-color: #ecfdf5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #16a34a;
          }
          .summary h3 {
            color: #16a34a;
            margin: 0 0 15px 0;
          }
          .total-row {
            font-size: 16px;
            font-weight: bold;
            background-color: #16a34a !important;
            color: white;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
          }
          .reprint-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="reprint-notice">
          ⚠️ REIMPRESSÃO - Relatório gerado novamente em ${new Date().toLocaleString("pt-AO")}
        </div>

        <div class="header">
          <div class="company-name">FARMÁCIA OLIVESMA</div>
          <div>Rua Principal, Luanda - Angola</div>
          <div>Tel: +244 923 456 789 | NIF: 123456789</div>
          <div class="report-title">RELATÓRIO DE FECHAMENTO DE CAIXA</div>
        </div>

        <div class="session-info">
          <h3>Informações da Sessão</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ID da Sessão:</span>
              <span class="info-value">${session.id}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Operador:</span>
              <span class="info-value">${session.cashier_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Abertura:</span>
              <span class="info-value">${new Date(session.opening_time).toLocaleString("pt-AO")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fechamento:</span>
              <span class="info-value">${session.closing_time ? new Date(session.closing_time).toLocaleString("pt-AO") : "N/A"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Inicial:</span>
              <span class="info-value">${session.opening_amount.toLocaleString("pt-AO")} Kz</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Final:</span>
              <span class="info-value">${(session.closing_amount || 0).toLocaleString("pt-AO")} Kz</span>
            </div>
          </div>
        </div>

        <div class="summary">
          <h3>Resumo de Vendas</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Total de Vendas:</span>
              <span class="info-value">${sales.length}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Total Vendido:</span>
              <span class="info-value">${session.total_sales.toLocaleString("pt-AO")} Kz</span>
            </div>
            <div class="info-item">
              <span class="info-label">Diferença de Caixa:</span>
              <span class="info-value">${((session.closing_amount || 0) - session.opening_amount - session.total_sales).toLocaleString("pt-AO")} Kz</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Esperado:</span>
              <span class="info-value">${(session.opening_amount + session.total_sales).toLocaleString("pt-AO")} Kz</span>
            </div>
          </div>
        </div>

        ${
          sales.length > 0
            ? `
        <h3>Detalhes das Vendas</h3>
        <table class="sales-table">
          <thead>
            <tr>
              <th>Nº Venda</th>
              <th>Horário</th>
              <th>Cliente</th>
              <th>Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${sales
              .map(
                (sale) => `
              <tr>
                <td>${sale.saleNumber}</td>
                <td>${new Date(sale.timestamp).toLocaleString("pt-AO")}</td>
                <td>${sale.customerPhone || "Balcão"}</td>
                <td>${getPaymentMethodLabel(sale.paymentMethod)}</td>
                <td>${sale.total.toLocaleString("pt-AO")} Kz</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total-row">
              <td colspan="4"><strong>TOTAL GERAL</strong></td>
              <td><strong>${session.total_sales.toLocaleString("pt-AO")} Kz</strong></td>
            </tr>
          </tbody>
        </table>
        `
            : "<p>Nenhuma venda realizada nesta sessão.</p>"
        }

        <div class="footer">
          <p>Relatório gerado automaticamente em ${session.closing_time ? new Date(session.closing_time).toLocaleString("pt-AO") : new Date().toLocaleString("pt-AO")}</p>
          <p>© 2024 Farmácia Olivesma - Sistema de Gestão</p>
        </div>
      </body>
      </html>
    `

    // Abrir relatório para impressão
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const handleReprintReport = (session: CashSession) => {
    generateClosingReport(session, session.sales || [])
  }

  const calculateSessionDuration = (openingTime: string, closingTime?: string) => {
    if (!closingTime) return "Em andamento"

    const start = new Date(openingTime)
    const end = new Date(closingTime)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffHours}h ${diffMinutes}min`
  }

  const getTotalSalesAmount = () => {
    return closingHistory.reduce((sum, session) => sum + session.total_sales, 0)
  }

  const getTotalSalesCount = () => {
    return closingHistory.reduce((sum, session) => sum + session.sales_count, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/pos" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao POS
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Histórico de Fechamentos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Histórico de Fechamentos</h2>
            <p className="text-gray-600 mt-2">Visualize e reimprima relatórios de fechamento de caixa</p>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closingHistory.length}</div>
              <p className="text-xs text-muted-foreground">Sessões fechadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalSalesAmount().toLocaleString("pt-AO")} Kz</div>
              <p className="text-xs text-muted-foreground">Em todas as sessões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalSalesCount()}</div>
              <p className="text-xs text-muted-foreground">Transações realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar por operador ou ID da sessão</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Digite para buscar..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Fechamentos */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fechamento encontrado</h3>
                <p className="text-gray-500">
                  {closingHistory.length === 0
                    ? "Ainda não há fechamentos de caixa registrados"
                    : "Nenhum resultado encontrado para sua busca"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold">{session.id}</h3>
                        <Badge variant="secondary">
                          <User className="h-3 w-3 mr-1" />
                          {session.cashier_name}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {calculateSessionDuration(session.opening_time, session.closing_time)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Abertura:</span>
                          <p className="font-medium">{new Date(session.opening_time).toLocaleString("pt-AO")}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fechamento:</span>
                          <p className="font-medium">
                            {session.closing_time
                              ? new Date(session.closing_time).toLocaleString("pt-AO")
                              : "Em andamento"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendas:</span>
                          <p className="font-medium text-blue-600">{session.sales_count} transações</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Vendido:</span>
                          <p className="font-medium text-green-600">{session.total_sales.toLocaleString("pt-AO")} Kz</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Valor Inicial:</span>
                          <p className="font-medium">{session.opening_amount.toLocaleString("pt-AO")} Kz</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor Final:</span>
                          <p className="font-medium">{(session.closing_amount || 0).toLocaleString("pt-AO")} Kz</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Diferença:</span>
                          <p
                            className={`font-medium ${
                              ((session.closing_amount || 0) - session.opening_amount - session.total_sales) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {(
                              (session.closing_amount || 0) -
                              session.opening_amount -
                              session.total_sales
                            ).toLocaleString("pt-AO")}{" "}
                            Kz
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button variant="outline" size="sm" onClick={() => handleReprintReport(session)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Reimprimir
                      </Button>

                      <Dialog
                        open={isDetailOpen && selectedSession?.id === session.id}
                        onOpenChange={(open) => {
                          setIsDetailOpen(open)
                          if (!open) setSelectedSession(null)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSession(session)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Sessão - {session.id}</DialogTitle>
                            <DialogDescription>Informações completas do fechamento de caixa</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Informações da Sessão */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-3">Informações da Sessão</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Operador:</span>
                                  <p className="font-medium">{session.cashier_name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Duração:</span>
                                  <p className="font-medium">
                                    {calculateSessionDuration(session.opening_time, session.closing_time)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Abertura:</span>
                                  <p className="font-medium">
                                    {new Date(session.opening_time).toLocaleString("pt-AO")}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Fechamento:</span>
                                  <p className="font-medium">
                                    {session.closing_time
                                      ? new Date(session.closing_time).toLocaleString("pt-AO")
                                      : "Em andamento"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Resumo Financeiro */}
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-3 text-green-800">Resumo Financeiro</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Valor Inicial:</span>
                                  <p className="font-bold text-lg">
                                    {session.opening_amount.toLocaleString("pt-AO")} Kz
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Valor Final:</span>
                                  <p className="font-bold text-lg">
                                    {(session.closing_amount || 0).toLocaleString("pt-AO")} Kz
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Vendido:</span>
                                  <p className="font-bold text-lg text-green-600">
                                    {session.total_sales.toLocaleString("pt-AO")} Kz
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Diferença:</span>
                                  <p
                                    className={`font-bold text-lg ${
                                      ((session.closing_amount || 0) - session.opening_amount - session.total_sales) >=
                                      0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {(
                                      (session.closing_amount || 0) -
                                      session.opening_amount -
                                      session.total_sales
                                    ).toLocaleString("pt-AO")}{" "}
                                    Kz
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Lista de Vendas */}
                            {session.sales && session.sales.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3">Vendas Realizadas ({session.sales.length})</h4>
                                <div className="max-h-60 overflow-y-auto border rounded-lg">
                                  <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr>
                                        <th className="text-left p-3 font-medium">Nº Venda</th>
                                        <th className="text-left p-3 font-medium">Horário</th>
                                        <th className="text-left p-3 font-medium">Cliente</th>
                                        <th className="text-left p-3 font-medium">Pagamento</th>
                                        <th className="text-right p-3 font-medium">Valor</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {session.sales.map((sale, index) => (
                                        <tr key={index} className="border-t">
                                          <td className="p-3">{sale.saleNumber}</td>
                                          <td className="p-3">{new Date(sale.timestamp).toLocaleString("pt-AO")}</td>
                                          <td className="p-3">{sale.customerPhone || "Balcão"}</td>
                                          <td className="p-3">{getPaymentMethodLabel(sale.paymentMethod)}</td>
                                          <td className="p-3 text-right font-medium">
                                            {sale.total.toLocaleString("pt-AO")} Kz
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end space-x-2 mt-6">
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                              Fechar
                            </Button>
                            <Button onClick={() => handleReprintReport(session)}>
                              <Printer className="h-4 w-4 mr-2" />
                              Reimprimir Relatório
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
