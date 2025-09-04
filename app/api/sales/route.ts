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

    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const { data: sales, error } = await dbOperations.getSales(limit)

    if (error) {
      console.error("❌ Erro ao buscar vendas:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar vendas" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: sales || [],
    })
  } catch (error) {
    console.error("❌ Erro na API de vendas:", error)
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

    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const saleData = await request.json()

    // Validações
    if (!saleData.items || saleData.items.length === 0) {
      return NextResponse.json({ success: false, message: "Venda deve ter pelo menos um item" }, { status: 400 })
    }

    if (!saleData.payment_method) {
      return NextResponse.json({ success: false, message: "Método de pagamento é obrigatório" }, { status: 400 })
    }

    // Gerar número da venda
    const saleNumber = `VEN-${Date.now()}`

    // Calcular totais
    let subtotal = 0
    const validatedItems = []
    const ivaRate = 0.14 // 14% IVA Angola

    for (const item of saleData.items) {
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

      const itemTotal = item.unit_price * item.quantity
      const itemIva = itemTotal * ivaRate
      subtotal += itemTotal

      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: itemTotal,
        iva_rate: ivaRate,
        iva_amount: itemIva,
      })

      // Atualizar estoque
      await dbOperations.updateProductStock(item.product_id, product.stock_quantity - item.quantity)
    }

    const ivaAmount = subtotal * ivaRate
    const totalAmount = subtotal + ivaAmount

    // Criar venda
    const { data: sale, error: saleError } = await dbOperations.createSale({
      sale_number: saleNumber,
      customer_id: saleData.customer_id || null,
      cashier_id: user.id,
      total_amount: totalAmount,
      iva_amount: ivaAmount,
      subtotal: subtotal,
      payment_method: saleData.payment_method,
      payment_reference: saleData.payment_reference,
      change_amount: saleData.change_amount || 0,
    })

    if (saleError || !sale) {
      console.error("❌ Erro ao criar venda:", saleError)
      return NextResponse.json({ success: false, message: "Erro ao criar venda" }, { status: 500 })
    }

    // Criar itens da venda
    const itemsWithSaleId = validatedItems.map((item) => ({
      ...item,
      sale_id: sale.id,
    }))

    const { error: itemsError } = await dbOperations.createSaleItems(itemsWithSaleId)

    if (itemsError) {
      console.error("❌ Erro ao criar itens da venda:", itemsError)
      return NextResponse.json({ success: false, message: "Erro ao criar itens da venda" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Venda realizada com sucesso",
      data: {
        ...sale,
        items: itemsWithSaleId,
      },
    })
  } catch (error) {
    console.error("❌ Erro na criação de venda:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
