import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    console.log("📋 Buscando pedidos para usuário:", user.id, user.type)

    const { data: orders, error } = await dbOperations.getAllOrders()

    if (error) {
      console.error("❌ Erro ao buscar pedidos:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar pedidos" }, { status: 500 })
    }

    // Se for cliente, filtrar apenas seus pedidos
    let filteredOrders = orders || []
    if (user.type === "customer") {
      filteredOrders = filteredOrders.filter((order) => order.customer_id === user.id)
    }

    console.log("✅ Pedidos encontrados:", filteredOrders.length)

    return NextResponse.json({
      success: true,
      data: filteredOrders,
    })
  } catch (error) {
    console.error("❌ Erro na API de pedidos:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user || user.type !== "customer") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const orderData = await request.json()
    console.log("📦 Criando pedido:", orderData)

    // Validações
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ success: false, message: "Pedido deve ter pelo menos um item" }, { status: 400 })
    }

    if (!orderData.delivery_address) {
      return NextResponse.json({ success: false, message: "Endereço de entrega é obrigatório" }, { status: 400 })
    }

    // Gerar número do pedido
    const orderNumber = `PED-${Date.now()}`

    // Calcular totais
    let subtotal = 0
    const validatedItems = []

    for (const item of orderData.items) {
      // Verificar se o produto existe e tem estoque
      const { data: product, error: productError } = await dbOperations.getProductById(item.product_id)

      if (productError || !product) {
        return NextResponse.json(
          { success: false, message: `Produto ${item.product_id} não encontrado` },
          { status: 400 },
        )
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Estoque insuficiente para ${product.name}` },
          { status: 400 },
        )
      }

      const itemTotal = product.price_kwanza * item.quantity
      subtotal += itemTotal

      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price_kwanza,
        total_price: itemTotal,
      })
    }

    // Calcular IVA (14% em Angola)
    const ivaRate = 0.14
    const ivaAmount = subtotal * ivaRate
    const totalAmount = subtotal + ivaAmount

    // Criar pedido (sem created_by para clientes)
    const { data: order, error: orderError } = await dbOperations.createOrder({
      order_number: orderNumber,
      customer_id: user.id,
      status: "pending",
      total_amount: totalAmount,
      iva_amount: ivaAmount,
      subtotal: subtotal,
      delivery_address: orderData.delivery_address,
      delivery_fee: 0,
      notes: orderData.notes || null,
      created_by: null, // Cliente não é funcionário
    })

    if (orderError || !order) {
      console.error("❌ Erro ao criar pedido:", orderError)
      return NextResponse.json({ success: false, message: "Erro ao criar pedido" }, { status: 500 })
    }

    // Criar itens do pedido
    const itemsWithOrderId = validatedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await dbOperations.createOrderItems(itemsWithOrderId)

    if (itemsError) {
      console.error("❌ Erro ao criar itens do pedido:", itemsError)
      return NextResponse.json({ success: false, message: "Erro ao criar itens do pedido" }, { status: 500 })
    }

    console.log("✅ Pedido criado com sucesso:", order.id)

    return NextResponse.json({
      success: true,
      message: "Pedido criado com sucesso",
      data: {
        ...order,
        items: itemsWithOrderId,
      },
    })
  } catch (error) {
    console.error("❌ Erro na criação de pedido:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: "ID do pedido e status são obrigatórios" }, { status: 400 })
    }

    const { data: success, error } = await dbOperations.updateOrderStatus(orderId, status, user.id)

    if (error) {
      console.error("❌ Erro ao atualizar status do pedido:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar status do pedido" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Status do pedido atualizado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro na atualização do pedido:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
