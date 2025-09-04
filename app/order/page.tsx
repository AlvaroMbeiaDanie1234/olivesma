"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, User, LogIn, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  price_kwanza: number
  stock_quantity: number
  requires_prescription: boolean
  active_ingredient?: string
  dosage?: string
  manufacturer?: string
  categories?: {
    name: string
  }
}

interface CartItem extends Product {
  quantity: number
}

export default function OrderPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    // Verificar se o cliente está logado
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (!token || !userData) {
      setIsLoggedIn(false)
      setLoading(false)
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.type === "customer") {
        setIsLoggedIn(true)
        setUser(parsedUser)
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error("Erro ao parsear dados do usuário:", error)
      setIsLoggedIn(false)
    }

    setLoading(false)
  }, [])

  // Buscar produtos
  useEffect(() => {
    if (!isLoggedIn) return

    const fetchProducts = async () => {
      try {
        const searchParams = new URLSearchParams()
        if (searchTerm.trim()) {
          searchParams.append("search", searchTerm.trim())
        }

        const response = await fetch(`/api/products?${searchParams}`)
        const data = await response.json()

        console.log("Resposta da API produtos (order):", data)

        if (data.success) {
          // Usar tanto data quanto products para compatibilidade
          const productList = data.data || data.products || []
          setProducts(productList)
        } else {
          setError(data.message)
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setError("Erro ao carregar produtos")
      }
    }

    const timeoutId = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, isLoggedIn])

  // Buscar categorias
  useEffect(() => {
    if (!isLoggedIn) return

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()

        if (data.success) {
          // Usar tanto data quanto categories para compatibilidade
          const categoryList = data.data || data.categories || []
          setCategories(categoryList)
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error)
      }
    }

    fetchCategories()
  }, [isLoggedIn])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categories?.name === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    const existingItem = cart.find((item) => item.id === productId)
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)))
    } else {
      setCart(cart.filter((item) => item.id !== productId))
    }
  }

  const getCartItemQuantity = (productId: string) => {
    const item = cart.find((item) => item.id === productId)
    return item ? item.quantity : 0
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price_kwanza * item.quantity, 0)
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert("Adicione produtos ao carrinho primeiro")
      return
    }

    if (!deliveryAddress.trim()) {
      alert("Informe o endereço de entrega")
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        customer_id: user.id,
        delivery_address: deliveryAddress,
        notes: notes,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price_kwanza,
        })),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        alert("Pedido realizado com sucesso! Você será redirecionado para sua conta.")
        router.push("/customer/dashboard")
      } else {
        alert("Erro ao realizar pedido: " + result.message)
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error)
      alert("Erro ao realizar pedido. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-AO") + " Kz"
  }

  // Se não estiver logado, mostrar prompt de login
  if (!loading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-600">Acesso Necessário</CardTitle>
            <CardDescription>Você precisa ter uma conta de cliente para fazer pedidos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Para garantir a segurança e permitir o acompanhamento dos seus pedidos, é necessário criar uma conta ou
              fazer login como cliente.
            </p>

            <div className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <Link href="/register">
                  <User className="h-4 w-4 mr-2" />
                  Criar Conta de Cliente
                </Link>
              </Button>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Já tenho conta
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Site
                </Link>
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>✅ Acompanhe seus pedidos em tempo real</p>
              <p>✅ Histórico completo de compras</p>
              <p>✅ Checkout mais rápido</p>
              <p>✅ Ofertas exclusivas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
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
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao site
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-lg font-bold text-green-600">Farmácia Olivesma</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-600" />
                <span>Olá, {user?.first_name}</span>
              </div>
              <Button variant="outline" asChild>
                <Link href="/customer/dashboard">Minha Conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fazer Pedido</h1>
            <p className="text-gray-600">Escolha seus medicamentos e adicione ao carrinho</p>
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Nome do medicamento..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {cart.length > 0 && (
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Carrinho ({cartItemsCount} itens)</h3>
                      <div className="space-y-2 mb-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="truncate">{item.name}</span>
                            <span className="font-medium">{item.quantity}x</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-lg font-bold text-green-600 mb-4">Total: {formatPrice(cartTotal)}</div>

                      {/* Endereço de entrega */}
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="delivery-address">Endereço de Entrega *</Label>
                        <Textarea
                          id="delivery-address"
                          placeholder="Informe seu endereço completo..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          required
                        />
                      </div>

                      {/* Observações */}
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          placeholder="Observações adicionais (opcional)..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting || !deliveryAddress.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando Pedido...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Enviar Pedido
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 mt-2 text-center">
                        * Pedido será enviado para análise da farmácia
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-4">
                      <div className="relative">
                        <Image
                          src="/placeholder.svg?height=200&width=200"
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover rounded-md"
                        />
                        {product.requires_prescription && (
                          <Badge className="absolute top-2 right-2 bg-red-500">Receita Médica</Badge>
                        )}
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          {product.categories?.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                      <CardDescription className="text-sm mb-4">{product.description}</CardDescription>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">{formatPrice(product.price_kwanza)}</span>
                        <span className="text-sm text-gray-500">Estoque: {product.stock_quantity}</span>
                      </div>

                      {getCartItemQuantity(product.id) > 0 ? (
                        <div className="flex items-center justify-between">
                          <Button size="sm" variant="outline" onClick={() => removeFromCart(product.id)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium px-4">{getCartItemQuantity(product.id)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product)}
                            disabled={getCartItemQuantity(product.id) >= product.stock_quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_quantity === 0 ? "Sem Estoque" : "Adicionar ao Carrinho"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">Tente ajustar os filtros ou buscar por outro termo</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 lg:hidden">
          <div className="bg-green-600 text-white rounded-full p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="font-medium">{cartItemsCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
