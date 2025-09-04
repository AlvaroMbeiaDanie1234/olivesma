"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, MapPin, Phone, CreditCard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Paracetamol 500mg",
      price: 850,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
      category: "Analgésicos",
      prescription: false,
    },
    {
      id: 2,
      name: "Vitamina C 1000mg",
      price: 1200,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      category: "Vitaminas",
      prescription: false,
    },
  ])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter((item) => item.id !== id))
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 50000 ? 0 : 2000 // Entrega gratuita acima de 50.000 Kz
  const iva = subtotal * 0.14 // IVA de 14%
  const total = subtotal + deliveryFee + iva

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-lg font-bold text-green-600">Farmácia Olivesma</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Seu Carrinho ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Seu carrinho está vazio</h3>
                    <p className="text-gray-500 mb-6">Adicione alguns medicamentos para continuar</p>
                    <Button asChild>
                      <Link href="/">Explorar Produtos</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">{item.category}</Badge>
                                {item.prescription && <Badge variant="destructive">Receita Médica</Badge>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-gray-500">{item.price.toLocaleString("pt-AO")} Kz cada</div>
                              <div className="font-bold text-green-600">
                                {(item.price * item.quantity).toLocaleString("pt-AO")} Kz
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString("pt-AO")} Kz</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxa de Entrega:</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      `${deliveryFee.toLocaleString("pt-AO")} Kz`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>IVA (14%):</span>
                  <span>{iva.toLocaleString("pt-AO")} Kz</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">{total.toLocaleString("pt-AO")} Kz</span>
                </div>

                {subtotal < 50000 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    💡 Adicione mais {(50000 - subtotal).toLocaleString("pt-AO")} Kz para entrega gratuita!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="João" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Silva" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                  <Input id="phone" placeholder="+244 923 456 789" />
                </div>

                <div>
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input id="email" type="email" placeholder="joao@email.com" />
                </div>
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
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Textarea id="address" placeholder="Rua, número, bairro, município..." rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="municipality">Município</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="luanda">Luanda</SelectItem>
                        <SelectItem value="benguela">Benguela</SelectItem>
                        <SelectItem value="huambo">Huambo</SelectItem>
                        <SelectItem value="lobito">Lobito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="province">Província</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="luanda">Luanda</SelectItem>
                        <SelectItem value="benguela">Benguela</SelectItem>
                        <SelectItem value="huambo">Huambo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea id="notes" placeholder="Ponto de referência, instruções especiais..." rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro na Entrega</SelectItem>
                    <SelectItem value="multicaixa">Multicaixa Express</SelectItem>
                    <SelectItem value="transfer">Transferência Bancária</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              disabled={cartItems.length === 0}
              asChild
            >
              <Link href="/checkout">Finalizar Pedido - {total.toLocaleString("pt-AO")} Kz</Link>
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>🔒 Seus dados estão seguros conosco</p>
              <p>📱 Você receberá confirmação via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
