"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ShoppingCart,
  Search,
  Phone,
  MapPin,
  Clock,
  Shield,
  Star,
  User,
  LogIn,
  UserPlus,
  Loader2,
  AlertTriangle,
  Package,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WhatsAppButton } from "@/components/whatsapp-button"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  price_kwanza: number
  stock_quantity: number
  requires_prescription: boolean
  categories?: {
    name: string
  }
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Verificar se há usuário logado
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Erro ao parsear dados do usuário:", error)
      }
    }

    // Carregar produtos e categorias
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      if (searchTerm.trim()) {
        searchParams.append("search", searchTerm.trim())
      }

      const response = await fetch(`/api/products?${searchParams}`)
      const data = await response.json()

      console.log("Resposta da API produtos:", data)

      if (data.success) {
        // Usar tanto data quanto products para compatibilidade
        const productList = data.data || data.products || []
        setProducts(productList)
        console.log("Produtos carregados:", productList.length)
      } else {
        setError(data.message || "Erro ao carregar produtos")
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      setError("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()

      console.log("Resposta da API categorias:", data)

      if (data.success) {
        // Usar tanto data quanto categories para compatibilidade
        const categoryList = data.data || data.categories || []
        setCategories(categoryList)
        console.log("Categorias carregadas:", categoryList.length)
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  // Recarregar produtos quando busca mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.categories?.name === selectedCategory
    return matchesCategory
  })

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    setIsLoggedIn(false)
    window.location.reload()
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-AO") + " Kz"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-sm text-gray-500">Sua saúde é nossa prioridade</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">
                      Olá, {user?.first_name} {user?.last_name}
                    </span>
                  </div>

                  {user?.type === "customer" && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/customer/dashboard">Minha Conta</Link>
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                        <Link href="/order">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Fazer Pedido
                        </Link>
                      </Button>
                    </>
                  )}

                  {user?.type === "employee" && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                      <Link href="/admin">Painel Admin</Link>
                    </Button>
                  )}

                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                    <Link href="/register">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Conta
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Bem-vindo à Farmácia Olivesma</h2>
          <p className="text-xl mb-8">Medicamentos de qualidade com atendimento especializado</p>
          <div className="flex justify-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                  <Link href="/register">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Criar Conta Grátis
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Já tenho conta
                  </Link>
                </Button>
              </>
            ) : user?.type === "customer" ? (
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
                <Link href="/order">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Fazer Pedido Agora
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/admin">Acessar Painel Administrativo</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Por que escolher a Farmácia Olivesma?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Medicamentos Certificados</h4>
              <p className="text-gray-600">Todos os nossos produtos são certificados e de alta qualidade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Atendimento Rápido</h4>
              <p className="text-gray-600">Processamos seus pedidos com agilidade e eficiência</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Atendimento Especializado</h4>
              <p className="text-gray-600">Farmacêuticos qualificados para orientá-lo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Nossos Produtos</h3>
            <p className="text-gray-600">Explore nossa ampla variedade de medicamentos e produtos de saúde</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar medicamentos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
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

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 max-w-2xl mx-auto" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 12).map((product) => (
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
                        <Badge className="absolute top-2 right-2 bg-red-500">Receita</Badge>
                      )}
                      {product.categories && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          {product.categories.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="text-sm mb-4 line-clamp-2">{product.description}</CardDescription>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">{formatPrice(product.price_kwanza)}</span>
                      <span className="text-sm text-gray-500">
                        {product.stock_quantity > 0 ? `${product.stock_quantity} disponível` : "Sem estoque"}
                      </span>
                    </div>

                    {isLoggedIn && user?.type === "customer" ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                        <Link href="/order">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Fazer Pedido
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                        <Link href="/register">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Criar Conta para Comprar
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Products */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h4>
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

          {/* View All Products */}
          {!loading && filteredProducts.length > 12 && (
            <div className="text-center mt-8">
              {isLoggedIn && user?.type === "customer" ? (
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/order">Ver Todos os Produtos</Link>
                </Button>
              ) : (
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/register">Criar Conta para Ver Todos</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Entre em Contato</h3>
            <p className="text-gray-600">Estamos aqui para ajudá-lo com suas necessidades de saúde</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Endereço</h4>
                  <p className="text-gray-600">
                    Rua Principal, 123
                    <br />
                    Luanda, Angola
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Telefone</h4>
                  <p className="text-gray-600">+244 923 456 789</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Horário de Funcionamento</h4>
                  <p className="text-gray-600">
                    Segunda a Sexta: 8h às 18h
                    <br />
                    Sábado: 8h às 14h
                    <br />
                    Domingo: Fechado
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Fale com nosso Farmacêutico</h4>
              <p className="text-gray-600 mb-4">
                Tem dúvidas sobre medicamentos? Nosso farmacêutico está disponível para orientá-lo.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <Link href="/contact-pharmacist">
                  <Phone className="h-4 w-4 mr-2" />
                  Contatar Farmacêutico
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">O</span>
                </div>
                <span className="text-xl font-bold">Farmácia Olivesma</span>
              </div>
              <p className="text-gray-400">
                Sua saúde é nossa prioridade. Oferecemos medicamentos de qualidade com atendimento especializado.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white">
                    Serviços
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 Rua Principal, 123, Luanda</li>
                <li>📞 +244 923 456 789</li>
                <li>✉️ contato@farmaciaolivesma.ao</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Farmácia Olivesma. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}
