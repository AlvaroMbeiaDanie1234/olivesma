"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Package,
  Home,
  LogOut,
  History,
  Printer,
  DollarSign,
  Lock,
  Unlock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  code: string
  name: string
  price_kwanza: number
  stock_quantity: number
  requires_prescription: boolean
  categories?: {
    name: string
  }
}

interface CartItem extends Product {
  quantity: number
  total: number
}

interface CashSession {
  id: string
  cashier_name: string
  opening_time: string
  opening_amount: number
  status: "open" | "closed"
}

export default function POSSystem() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showCashDialog, setShowCashDialog] = useState(false)
  const [showCloseCashDialog, setShowCloseCashDialog] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [cashReceived, setCashReceived] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [lastSale, setLastSale] = useState<any>(null)
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [openingAmount, setOpeningAmount] = useState("")
  const [closingAmount, setClosingAmount] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Cálculos do carrinho CORRIGIDOS
  const subtotal = cart.reduce((sum, item) => sum + item.price_kwanza * item.quantity, 0)
  const ivaRate = 0.14 // 14% IVA Angola
  const ivaAmount = subtotal * ivaRate
  const total = subtotal + ivaAmount
  const change = paymentMethod === "cash" ? Math.max(0, Number.parseFloat(cashReceived || "0") - total) : 0

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

    setCurrentUser(user)
    checkCashSession()
    loadProducts()
  }, [router])

  useEffect(() => {
    // Filtrar produtos baseado na busca
    if (searchTerm.trim() === "") {
      setFilteredProducts(products.slice(0, 20)) // Mostrar apenas 20 produtos inicialmente
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered.slice(0, 50)) // Máximo 50 resultados
    }
  }, [searchTerm, products])

  const checkCashSession = () => {
    const session = localStorage.getItem("current_cash_session")
    if (session) {
      setCurrentSession(JSON.parse(session))
    }
  }

  const openCashSession = () => {
    if (!openingAmount || Number.parseFloat(openingAmount) < 0) {
      setError("Valor de abertura inválido")
      return
    }

    const session: CashSession = {
      id: `CAIXA-${Date.now()}`,
      cashier_name: `${currentUser.first_name} ${currentUser.last_name}`,
      opening_time: new Date().toISOString(),
      opening_amount: Number.parseFloat(openingAmount),
      status: "open",
    }

    localStorage.setItem("current_cash_session", JSON.stringify(session))
    setCurrentSession(session)
    setShowCashDialog(false)
    setOpeningAmount("")
    setSuccess("Caixa aberto com sucesso!")
  }

  const closeCashSession = () => {
    if (!currentSession) return

    if (!closingAmount || Number.parseFloat(closingAmount) < 0) {
      setError("Valor de fechamento inválido")
      return
    }

    const closedSession = {
      ...currentSession,
      status: "closed" as const,
      closing_time: new Date().toISOString(),
      closing_amount: Number.parseFloat(closingAmount),
      total_sales: getTotalSalesAmount(),
      sales_count: getTotalSalesCount(),
      sales: getSalesFromSession(),
    }

    // Salvar no histórico
    const history = JSON.parse(localStorage.getItem("cashClosingHistory") || "[]")
    history.push(closedSession)
    localStorage.setItem("cashClosingHistory", JSON.stringify(history))

    // Remover sessão atual
    localStorage.removeItem("current_cash_session")
    setCurrentSession(null)
    setShowCloseCashDialog(false)
    setClosingAmount("")
    setSuccess("Caixa fechado com sucesso!")

    // Gerar relatório de fechamento
    generateClosingReport(closedSession)
  }

  const getTotalSalesAmount = () => {
    const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]")
    const sessionSales = sales.filter((sale: any) => sale.session_id === currentSession?.id)
    return sessionSales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0)
  }

  const getTotalSalesCount = () => {
    const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]")
    return sales.filter((sale: any) => sale.session_id === currentSession?.id).length
  }

  const getSalesFromSession = () => {
    const sales = JSON.parse(localStorage.getItem("pos_sales") || "[]")
    return sales.filter((sale: any) => sale.session_id === currentSession?.id)
  }

  const generateClosingReport = (session: any) => {
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Fechamento - ${session.id}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 0; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #16a34a; margin-bottom: 10px; }
          .report-title { font-size: 18px; font-weight: bold; margin: 20px 0; }
          .session-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
          .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .info-label { font-weight: bold; color: #374151; }
          .info-value { color: #16a34a; font-weight: bold; }
          .summary { background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
          .summary h3 { color: #16a34a; margin: 0 0 15px 0; }
          .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 20px; }
        </style>
      </head>
      <body>
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
              <span class="info-value">${new Date(session.closing_time).toLocaleString("pt-AO")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Inicial:</span>
              <span class="info-value">${session.opening_amount.toLocaleString("pt-AO")} Kz</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Final:</span>
              <span class="info-value">${session.closing_amount.toLocaleString("pt-AO")} Kz</span>
            </div>
          </div>
        </div>

        <div class="summary">
          <h3>Resumo de Vendas</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Total de Vendas:</span>
              <span class="info-value">${session.sales_count}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Total Vendido:</span>
              <span class="info-value">${session.total_sales.toLocaleString("pt-AO")} Kz</span>
            </div>
            <div class="info-item">
              <span class="info-label">Diferença de Caixa:</span>
              <span class="info-value">${(session.closing_amount - session.opening_amount - session.total_sales).toLocaleString("pt-AO")} Kz</span>
            </div>
            <div class="info-item">
              <span class="info-label">Valor Esperado:</span>
              <span class="info-value">${(session.opening_amount + session.total_sales).toLocaleString("pt-AO")} Kz</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Relatório gerado automaticamente em ${new Date(session.closing_time).toLocaleString("pt-AO")}</p>
          <p>© 2024 Farmácia Olivesma - Sistema de Gestão</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  const loadProducts = async () => {
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        const productList = result.data || result.products || []
        setProducts(productList)
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      setError("Erro ao carregar produtos")
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    if (!currentSession) {
      setError("Abra o caixa antes de fazer vendas")
      return
    }

    if (product.stock_quantity <= 0) {
      setError("Produto sem estoque disponível")
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        setError("Quantidade solicitada excede o estoque disponível")
        return
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price_kwanza,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
          total: product.price_kwanza,
        },
      ])
    }

    setError("")
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && newQuantity > product.stock_quantity) {
      setError("Quantidade solicitada excede o estoque disponível")
      return
    }

    setCart(
      cart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price_kwanza,
            }
          : item,
      ),
    )
    setError("")
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setError("")
    setSuccess("")
  }

  const handlePayment = () => {
    if (!currentSession) {
      setError("Abra o caixa antes de fazer vendas")
      return
    }

    if (cart.length === 0) {
      setError("Carrinho vazio")
      return
    }

    setShowPaymentDialog(true)
  }

  const processSale = async () => {
    if (!paymentMethod) {
      setError("Selecione um método de pagamento")
      return
    }

    if (paymentMethod === "cash") {
      const received = Number.parseFloat(cashReceived || "0")
      if (received < total) {
        setError("Valor recebido insuficiente")
        return
      }
    }

    if (paymentMethod !== "cash" && !paymentReference.trim()) {
      setError("Referência de pagamento é obrigatória")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")

      const saleData = {
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price_kwanza,
        })),
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
        change_amount: change,
        customer_id: customerPhone ? await findCustomerByPhone(customerPhone) : null,
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      })

      const result = await response.json()

      if (result.success) {
        // Salvar venda na sessão local
        const posSales = JSON.parse(localStorage.getItem("pos_sales") || "[]")
        const saleRecord = {
          ...result.data,
          session_id: currentSession?.id,
          items: cart.map((item) => ({
            ...item,
            product_name: item.name,
            product_code: item.code,
          })),
          customer_phone: customerPhone,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          change_amount: change,
          subtotal: subtotal,
          iva_amount: ivaAmount,
          total_amount: total,
          timestamp: new Date().toISOString(),
        }
        posSales.push(saleRecord)
        localStorage.setItem("pos_sales", JSON.stringify(posSales))

        setLastSale(saleRecord)
        setSuccess(`Venda realizada com sucesso! Número: ${result.data.sale_number}`)

        // Mostrar recibo
        setShowReceiptDialog(true)

        // Limpar formulário
        clearCart()
        setShowPaymentDialog(false)
        setPaymentMethod("")
        setPaymentReference("")
        setCashReceived("")
        setCustomerPhone("")

        // Recarregar produtos para atualizar estoque
        loadProducts()
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao processar venda:", error)
      setError("Erro ao processar venda")
    } finally {
      setIsProcessing(false)
    }
  }

  const findCustomerByPhone = async (phone: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/customers?phone=${phone}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      return result.success && result.data ? result.data.id : null
    } catch (error) {
      return null
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("pt-AO") + " Kz"
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      cash: "Dinheiro",
      card: "Cartão",
      transfer: "Transferência",
      multicaixa: "Multicaixa Express",
    }
    return methods[method as keyof typeof methods] || method
  }

  const printReceipt = () => {
    if (!lastSale) return

    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo Térmico - ${lastSale.sale_number}</title>
        <style>
          @page { size: 80mm auto; margin: 0; padding: 0; }
          body { font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 8px; width: 72mm; line-height: 1.2; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 14px; }
          .small { font-size: 9px; }
          .line { border-top: 1px dashed #000; margin: 8px 0; height: 1px; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .item-row { margin: 4px 0; }
          .item-name { font-weight: bold; margin-bottom: 1px; }
          .item-details { font-size: 9px; color: #666; }
          .total-section { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #000; }
          .final-total { font-size: 16px; font-weight: bold; margin: 8px 0; padding: 4px 0; border-top: 2px solid #000; border-bottom: 2px solid #000; }
          .footer { margin-top: 12px; font-size: 9px; text-align: center; }
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
        <div class="small">Nº: ${lastSale.sale_number}</div>
        <div class="small">Data: ${new Date(lastSale.created_at || new Date()).toLocaleString("pt-AO")}</div>
        <div class="small">Operador: ${currentSession?.cashier_name}</div>
        <div class="small">Caixa: ${currentSession?.id}</div>
        ${lastSale.customer_phone ? `<div class="small">Cliente: ${lastSale.customer_phone}</div>` : ""}

        <div class="line"></div>

        ${(lastSale.items || [])
          .map(
            (item: any) => `
          <div class="item-row">
            <div class="item-name">${item.product_name || item.name}</div>
            <div class="item-details">${item.product_code || item.code}</div>
            <div class="row">
              <span>${item.quantity} x ${item.price_kwanza.toLocaleString("pt-AO")} Kz</span>
              <span class="bold">${(item.quantity * item.price_kwanza).toLocaleString("pt-AO")} Kz</span>
            </div>
          </div>
        `,
          )
          .join("")}

        <div class="total-section">
          <div class="row">
            <span>Subtotal:</span>
            <span>${lastSale.subtotal.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div class="row">
            <span>IVA (14%):</span>
            <span>${lastSale.iva_amount.toLocaleString("pt-AO")} Kz</span>
          </div>
          <div class="final-total center">
            TOTAL: ${lastSale.total_amount.toLocaleString("pt-AO")} Kz
          </div>
        </div>

        <div class="row">
          <span>Pagamento:</span>
          <span>${getPaymentMethodLabel(lastSale.payment_method)}</span>
        </div>

        ${
          lastSale.change_amount > 0
            ? `
        <div class="row">
          <span>Troco:</span>
          <span>${lastSale.change_amount.toLocaleString("pt-AO")} Kz</span>
        </div>
        `
            : ""
        }

        <div class="line"></div>

        <div class="footer">
          <div class="bold">OBRIGADO PELA PREFERENCIA!</div>
          <div>Volte sempre!</div>
          <div class="small">Este documento nao serve como fatura fiscal</div>
          <div class="small">Impresso em ${new Date().toLocaleString("pt-AO")}</div>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    router.push("/login")
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
                <p className="text-xs text-gray-500">Sistema POS</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentSession ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Unlock className="h-3 w-3 mr-1" />
                Caixa Aberto: {currentSession.id}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <Lock className="h-3 w-3 mr-1" />
                Caixa Fechado
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <ShoppingCart className="h-3 w-3 mr-1" />
              {cart.length} itens
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Total: {formatCurrency(total)}
            </Badge>
            {!currentSession ? (
              <Button onClick={() => setShowCashDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Abrir Caixa
              </Button>
            ) : (
              <Button onClick={() => setShowCloseCashDialog(true)} variant="outline">
                <Lock className="h-4 w-4 mr-2" />
                Fechar Caixa
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/pos/sales-history">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/pos/closing-history">
                <DollarSign className="h-4 w-4 mr-2" />
                Fechamentos
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Página Inicial
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Produtos */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos por nome ou código..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={loadProducts} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                Atualizar
              </Button>
            </div>
          </div>

          {/* Alertas */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Lista de Produtos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  product.stock_quantity <= 0 ? "opacity-50" : ""
                } ${!currentSession ? "pointer-events-none opacity-50" : ""}`}
                onClick={() => addToCart(product)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium line-clamp-2">{product.name}</CardTitle>
                    {product.requires_prescription && (
                      <Badge variant="outline" className="text-xs">
                        Receita
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    Código: {product.code}
                    {product.categories && <span className="block">Categoria: {product.categories.name}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-green-600">{formatCurrency(product.price_kwanza)}</p>
                      <p className="text-xs text-gray-500">
                        Estoque: {product.stock_quantity}
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <span className="text-orange-500 ml-1">⚠️</span>
                        )}
                        {product.stock_quantity <= 0 && <span className="text-red-500 ml-1">❌</span>}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={product.stock_quantity <= 0 || !currentSession}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{searchTerm ? "Nenhum produto encontrado" : "Nenhum produto disponível"}</p>
            </div>
          )}

          {!currentSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle className="text-center">Caixa Fechado</CardTitle>
                  <CardDescription className="text-center">Abra o caixa para começar a fazer vendas</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => setShowCashDialog(true)} className="bg-green-600 hover:bg-green-700">
                    <Unlock className="h-4 w-4 mr-2" />
                    Abrir Caixa
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Carrinho */}
        <div className="w-96 bg-white border-l shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrinho de Compras
            </h2>
            {currentSession && <p className="text-sm text-gray-500 mt-1">Caixa: {currentSession.id}</p>}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Carrinho vazio</p>
                <p className="text-sm text-gray-400">
                  {currentSession ? "Adicione produtos para começar" : "Abra o caixa primeiro"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-500">Código: {item.code}</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(item.price_kwanza)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (14%):</span>
                  <span>{formatCurrency(ivaAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handlePayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!currentSession}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Finalizar Venda
                </Button>
                <Button variant="outline" onClick={clearCart} className="w-full bg-transparent">
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Abertura de Caixa */}
      <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogDescription>Informe o valor inicial do caixa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="openingAmount">Valor Inicial (Kz)</Label>
              <Input
                id="openingAmount"
                type="number"
                placeholder="0.00"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Operador:</strong> {currentUser?.first_name} {currentUser?.last_name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Data/Hora:</strong> {new Date().toLocaleString("pt-AO")}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCashDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={openCashSession} className="flex-1 bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Abrir Caixa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Fechamento de Caixa */}
      <Dialog open={showCloseCashDialog} onOpenChange={setShowCloseCashDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogDescription>Informe o valor final do caixa</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentSession && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor Inicial:</span>
                  <span className="font-medium">{formatCurrency(currentSession.opening_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total de Vendas:</span>
                  <span className="font-medium">{formatCurrency(getTotalSalesAmount())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Número de Vendas:</span>
                  <span className="font-medium">{getTotalSalesCount()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Valor Esperado:</span>
                  <span className="text-green-600">
                    {formatCurrency(currentSession.opening_amount + getTotalSalesAmount())}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="closingAmount">Valor Final Contado (Kz)</Label>
              <Input
                id="closingAmount"
                type="number"
                placeholder="0.00"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />
            </div>

            {closingAmount && currentSession && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Diferença:</span>
                  <span
                    className={`font-medium ${
                      (Number.parseFloat(closingAmount) - currentSession.opening_amount - getTotalSalesAmount()) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      Number.parseFloat(closingAmount) - currentSession.opening_amount - getTotalSalesAmount(),
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCloseCashDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={closeCashSession} className="flex-1 bg-red-600 hover:bg-red-700">
                <Lock className="h-4 w-4 mr-2" />
                Fechar Caixa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pagamento</DialogTitle>
            <DialogDescription>Selecione o método de pagamento e confirme a venda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resumo da Venda */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (14%):</span>
                  <span>{formatCurrency(ivaAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Cliente (Opcional) */}
            <div>
              <Label htmlFor="customerPhone">Cliente (Opcional)</Label>
              <Input
                id="customerPhone"
                placeholder="Telefone do cliente"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            {/* Método de Pagamento */}
            <div>
              <Label htmlFor="paymentMethod">Método de Pagamento *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center">
                      <Banknote className="h-4 w-4 mr-2" />
                      Dinheiro
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cartão
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Transferência
                    </div>
                  </SelectItem>
                  <SelectItem value="multicaixa">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Multicaixa Express
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos específicos por método */}
            {paymentMethod === "cash" && (
              <div>
                <Label htmlFor="cashReceived">Valor Recebido *</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
                {change > 0 && <p className="text-sm text-green-600 mt-1">Troco: {formatCurrency(change)}</p>}
              </div>
            )}

            {paymentMethod && paymentMethod !== "cash" && (
              <div>
                <Label htmlFor="paymentReference">Referência do Pagamento *</Label>
                <Input
                  id="paymentReference"
                  placeholder="Número da transação, comprovativo, etc."
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={processSale} disabled={isProcessing} className="flex-1 bg-green-600 hover:bg-green-700">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Venda
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog do Recibo */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Venda Realizada com Sucesso!</DialogTitle>
            <DialogDescription>Recibo da venda #{lastSale?.sale_number}</DialogDescription>
          </DialogHeader>

          {lastSale && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg text-sm">
                <div className="text-center mb-4">
                  <h3 className="font-bold">FARMÁCIA OLIVESMA</h3>
                  <p className="text-xs text-gray-600">Recibo de Venda</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Número:</span>
                    <span className="font-medium">{lastSale.sale_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span>{new Date().toLocaleString("pt-AO")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caixa:</span>
                    <span>{currentSession?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operador:</span>
                    <span>{currentSession?.cashier_name}</span>
                  </div>
                  {lastSale.customer_phone && (
                    <div className="flex justify-between">
                      <span>Cliente:</span>
                      <span>{lastSale.customer_phone}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-300 my-3 pt-3">
                  {lastSale.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs mb-1">
                      <span>
                        {item.quantity}x {item.product_name}
                      </span>
                      <span>{formatCurrency(item.quantity * item.price_kwanza)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(lastSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (14%):</span>
                    <span>{formatCurrency(lastSale.iva_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span className="text-green-600">{formatCurrency(lastSale.total_amount)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between">
                    <span>Pagamento:</span>
                    <span>{getPaymentMethodLabel(lastSale.payment_method)}</span>
                  </div>
                  {lastSale.change_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Troco:</span>
                      <span>{formatCurrency(lastSale.change_amount)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={printReceipt} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Recibo
                </Button>
                <Button variant="outline" onClick={() => setShowReceiptDialog(false)} className="flex-1">
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
