"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, MapPin, User, Package, Truck, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form states
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    neighborhood: "",
    municipality: "",
    province: "Luanda",
    reference: "",
  })

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Carregar carrinho do localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Verificar se usuário está logado
    const userSession = localStorage.getItem("userSession")
    if (userSession) {
      const user = JSON.parse(userSession)
      setIsLoggedIn(true)
      setContactInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }

    setLoading(false)
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 15000 ? 0 : 2500 // Frete grátis acima de 15.000 Kz
  const total = subtotal + deliveryFee

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      alert("Por favor, aceite os termos e condições")
      return
    }

    if (cart.length === 0) {
      alert("Seu carrinho está vazio")
      return
    }

    setIsSubmitting(true)

    try {
      // Simular processamento do pedido
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const orderData = {
        id: `PED-${Date.now()}`,
        items: cart,
        contactInfo,
        deliveryAddress,
        subtotal,
        deliveryFee,
        total,
        status: "pending",
        createdAt: new Date().toISOString(),
        paymentMethod: "cash_on_delivery", // Pagamento na entrega
      }

      // Salvar pedido no localStorage (em produção seria enviado para API)
      const existingOrders = JSON.parse(localStorage.getItem("userOrders") || "[]")
      existingOrders.unshift(orderData)
      localStorage.setItem("userOrders", JSON.stringify(existingOrders))

      // Limpar carrinho
      localStorage.removeItem("cart")
      setCart([])

      // Redirecionar para página de sucesso
      router.push(`/order?id=${orderData.id}`)
    } catch (error) {
      alert("Erro ao processar pedido. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Loja
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">O</span>
                </div>
                <span className="text-lg font-bold text-green-600">Farmácia Olivesma</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos ao carrinho antes de finalizar o pedido</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Carrinho
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-lg font-bold text-green-600">Farmácia Olivesma</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Logado</span>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Fazer Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

          {/* Login Prompt for Non-logged Users */}
          {!isLoggedIn && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium">Faça login para uma experiência melhor</p>
                    <p className="text-blue-600 text-sm">
                      Com login você pode acompanhar seus pedidos e ter acesso ao histórico de compras
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="border-blue-300 text-blue-700 bg-transparent">
                    <Link href="/login">Fazer Login</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* Informações de Contato */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações de Contato
                    </CardTitle>
                    <CardDescription>
                      Precisamos dessas informações para entrar em contato sobre seu pedido
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input
                          id="firstName"
                          required
                          value={contactInfo.firstName}
                          onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <Input
                          id="lastName"
                          required
                          value={contactInfo.lastName}
                          onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
                          placeholder="Seu sobrenome"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        required
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder="+244 9XX XXX XXX"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Endereço de Entrega */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Endereço de Entrega
                    </CardTitle>
                    <CardDescription>Onde você gostaria de receber seu pedido?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">Rua/Avenida *</Label>
                      <Input
                        id="street"
                        required
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        placeholder="Nome da rua e número"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          required
                          value={deliveryAddress.neighborhood}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, neighborhood: e.target.value })}
                          placeholder="Nome do bairro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="municipality">Município *</Label>
                        <Select
                          value={deliveryAddress.municipality}
                          onValueChange={(value) => setDeliveryAddress({ ...deliveryAddress, municipality: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o município" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="luanda">Luanda</SelectItem>
                            <SelectItem value="cacuaco">Cacuaco</SelectItem>
                            <SelectItem value="viana">Viana</SelectItem>
                            <SelectItem value="cazenga">Cazenga</SelectItem>
                            <SelectItem value="kilamba-kiaxi">Kilamba Kiaxi</SelectItem>
                            <SelectItem value="talatona">Talatona</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="province">Província</Label>
                      <Input
                        id="province"
                        value={deliveryAddress.province}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, province: e.target.value })}
                        placeholder="Luanda"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference">Ponto de Referência</Label>
                      <Input
                        id="reference"
                        value={deliveryAddress.reference}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, reference: e.target.value })}
                        placeholder="Ex: Próximo ao mercado, em frente à escola..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Termos e Condições */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      />
                      <div className="text-sm">
                        <Label htmlFor="terms" className="cursor-pointer">
                          Aceito os{" "}
                          <Link href="/terms" className="text-green-600 hover:underline">
                            termos e condições
                          </Link>{" "}
                          e a{" "}
                          <Link href="/privacy" className="text-green-600 hover:underline">
                            política de privacidade
                          </Link>
                        </Label>
                        <p className="text-gray-500 mt-1">
                          Ao finalizar o pedido, você concorda com nossos termos de uso e política de privacidade.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botão de Finalizar */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                  disabled={!termsAccepted || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando Pedido...
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5 mr-2" />
                      Finalizar Pedido
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Produtos */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          {(item.price * item.quantity).toLocaleString("pt-AO")} Kz
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totais */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{subtotal.toLocaleString("pt-AO")} Kz</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Taxa de Entrega:
                      </span>
                      <span>
                        {deliveryFee === 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            Grátis
                          </Badge>
                        ) : (
                          `${deliveryFee.toLocaleString("pt-AO")} Kz`
                        )}
                      </span>
                    </div>
                    {deliveryFee === 0 && (
                      <p className="text-xs text-green-600">🎉 Frete grátis para pedidos acima de 15.000 Kz</p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">{total.toLocaleString("pt-AO")} Kz</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Informação de Pagamento */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">💰</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Pagamento na Entrega</p>
                        <p className="text-xs text-blue-600">Você pagará quando receber o pedido</p>
                      </div>
                    </div>
                  </div>

                  {/* Tempo de Entrega */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Truck className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-sm">Entrega Estimada</p>
                        <p className="text-xs text-green-600">2-4 horas úteis em Luanda</p>
                      </div>
                    </div>
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
