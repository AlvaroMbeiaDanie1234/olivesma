"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [reportData, setReportData] = useState<any>(null)
  const [reportType, setReportType] = useState("sales")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [periodType, setPeriodType] = useState("custom")

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

    // Definir datas padrão (último mês)
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

    setStartDate(lastMonth.toISOString().split("T")[0])
    setEndDate(endOfLastMonth.toISOString().split("T")[0])
  }, [router])

  useEffect(() => {
    // Atualizar datas baseado no tipo de período
    const today = new Date()

    switch (periodType) {
      case "daily":
        setStartDate(today.toISOString().split("T")[0])
        setEndDate(today.toISOString().split("T")[0])
        break
      case "weekly":
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        setStartDate(weekStart.toISOString().split("T")[0])
        setEndDate(today.toISOString().split("T")[0])
        break
      case "monthly":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        setStartDate(monthStart.toISOString().split("T")[0])
        setEndDate(today.toISOString().split("T")[0])
        break
      case "custom":
        // Manter datas atuais
        break
    }
  }, [periodType])

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError("Selecione as datas de início e fim")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Data de início deve ser anterior à data de fim")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("auth_token")
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: periodType,
      })

      const response = await fetch(`/api/reports/sales?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setReportData(result.data)
        setSuccess("Relatório gerado com sucesso!")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      setError("Erro ao gerar relatório")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSAFT = async () => {
    if (!startDate || !endDate) {
      setError("Selecione as datas de início e fim")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const params = new URLSearchParams({
        startDate,
        endDate,
        type: "sales",
      })

      const response = await fetch(`/api/reports/saft?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `SAFT_AO_${startDate}_${endDate}.xml`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess("Arquivo SAF-T gerado e baixado com sucesso!")
      } else {
        const result = await response.json()
        setError(result.message || "Erro ao gerar SAF-T")
      }
    } catch (error) {
      console.error("Erro ao gerar SAF-T:", error)
      setError("Erro ao gerar arquivo SAF-T")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!reportData) {
      setError("Gere um relatório primeiro")
      return
    }

    // Criar conteúdo HTML para impressão
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Vendas - Farmácia Olivesma</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #16a34a; font-size: 24px; font-weight: bold; }
          .period { color: #666; margin-top: 10px; }
          .summary { display: flex; justify-content: space-around; margin: 30px 0; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #16a34a; }
          .summary-label { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .currency { text-align: right; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Farmácia Olivesma</div>
          <h2>Relatório de Vendas</h2>
          <div class="period">Período: ${formatDate(startDate)} a ${formatDate(endDate)}</div>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${reportData.summary.total_sales}</div>
            <div class="summary-label">Total de Vendas</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${formatCurrency(reportData.summary.total_revenue)}</div>
            <div class="summary-label">Receita Total</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${formatCurrency(reportData.summary.average_sale)}</div>
            <div class="summary-label">Venda Média</div>
          </div>
        </div>

        <h3>Produtos Mais Vendidos</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código</th>
              <th>Quantidade</th>
              <th>Receita</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topProducts
              .map(
                (product: any) => `
              <tr>
                <td>${product.name}</td>
                <td>${product.code}</td>
                <td>${product.total_quantity}</td>
                <td class="currency">${formatCurrency(product.total_revenue)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>Relatório gerado em ${new Date().toLocaleDateString("pt-AO")} às ${new Date().toLocaleTimeString("pt-AO")}</p>
          <p>Farmácia Olivesma - Sistema de Gestão</p>
        </div>
      </body>
      </html>
    `

    // Abrir janela de impressão
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pt-AO") + " Kz"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-AO")
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
                <p className="text-xs text-gray-500">Relatórios e SAF-T</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
            <p className="text-gray-600 mt-2">Gere relatórios de vendas e arquivos SAF-T para Angola</p>
          </div>
        </div>

        {/* Alertas */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações do Relatório */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Configure os parâmetros do relatório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportType">Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Relatório de Vendas</SelectItem>
                    <SelectItem value="products">Produtos Mais Vendidos</SelectItem>
                    <SelectItem value="customers">Clientes Ativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="periodType">Período</Label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Hoje</SelectItem>
                    <SelectItem value="weekly">Esta Semana</SelectItem>
                    <SelectItem value="monthly">Este Mês</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {periodType === "custom" && (
                <>
                  <div>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Data de Fim</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <Button
                  onClick={generateReport}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </Button>

                {reportData && (
                  <Button onClick={exportToPDF} variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                )}

                <Button onClick={generateSAFT} disabled={isLoading} variant="outline" className="w-full bg-transparent">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando SAF-T...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar SAF-T (AO)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados do Relatório */}
          <div className="lg:col-span-2 space-y-6">
            {reportData ? (
              <>
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{reportData.summary.total_sales}</div>
                      <p className="text-xs text-muted-foreground">Vendas no período</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(reportData.summary.total_revenue)}</div>
                      <p className="text-xs text-muted-foreground">IVA incluído</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Venda Média</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(reportData.summary.average_sale)}</div>
                      <p className="text-xs text-muted-foreground">Por transação</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Produtos Mais Vendidos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos Mais Vendidos</CardTitle>
                    <CardDescription>Top 10 produtos por quantidade vendida</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Receita</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.topProducts.map((product: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.code}</TableCell>
                            <TableCell className="text-right">{product.total_quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(product.total_revenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Detalhes das Vendas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes das Vendas</CardTitle>
                    <CardDescription>Últimas {reportData.sales.length} vendas do período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.sales.slice(0, 20).map((sale: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{sale.sale_number}</TableCell>
                            <TableCell>{formatDate(sale.created_at)}</TableCell>
                            <TableCell>
                              {sale.customer_first_name && sale.customer_last_name
                                ? `${sale.customer_first_name} ${sale.customer_last_name}`
                                : "Consumidor Final"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {sale.payment_method === "cash" && "Dinheiro"}
                                {sale.payment_method === "card" && "Cartão"}
                                {sale.payment_method === "transfer" && "Transferência"}
                                {sale.payment_method === "multicaixa" && "Multicaixa"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.total_amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    Configure os parâmetros e clique em "Gerar Relatório" para visualizar os dados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Informações sobre SAF-T */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Sobre o SAF-T Angola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">O que é o SAF-T?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  O Standard Audit File for Tax (SAF-T) é um arquivo padronizado que contém um conjunto abrangente de
                  dados contábeis de uma empresa, exigido pela Administração Geral Tributária de Angola para fins
                  fiscais.
                </p>
                <h4 className="font-medium mb-2">Dados Incluídos:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Informações da empresa</li>
                  <li>• Clientes e fornecedores</li>
                  <li>• Produtos e serviços</li>
                  <li>• Documentos de venda</li>
                  <li>• Movimentos contábeis</li>
                  <li>• Pagamentos e recebimentos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Conformidade Fiscal</h4>
                <p className="text-sm text-gray-600 mb-4">
                  O arquivo gerado está em conformidade com a versão 1.01_01 do SAF-T Angola, incluindo todos os campos
                  obrigatórios e validações necessárias.
                </p>
                <h4 className="font-medium mb-2">Formato do Arquivo:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formato: XML</li>
                  <li>• Codificação: UTF-8</li>
                  <li>• Versão: AO_1.01_01</li>
                  <li>• Validação: Automática</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
