import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: product, error } = await dbOperations.getProductById(params.id)

    if (error) {
      console.error("❌ Erro ao buscar produto:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar produto" }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ success: false, message: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("❌ Erro na API de produto:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const productData = await request.json()

    // Preparar dados para atualização
    const updateData: any = {}

    if (productData.code !== undefined) updateData.code = productData.code
    if (productData.name !== undefined) updateData.name = productData.name
    if (productData.description !== undefined) updateData.description = productData.description
    if (productData.category_id !== undefined) updateData.category_id = productData.category_id
    if (productData.price_kwanza !== undefined) updateData.price_kwanza = Number.parseFloat(productData.price_kwanza)
    if (productData.cost_price !== undefined)
      updateData.cost_price = productData.cost_price ? Number.parseFloat(productData.cost_price) : null
    if (productData.stock_quantity !== undefined)
      updateData.stock_quantity = Number.parseInt(productData.stock_quantity)
    if (productData.min_stock_level !== undefined)
      updateData.min_stock_level = Number.parseInt(productData.min_stock_level)
    if (productData.requires_prescription !== undefined)
      updateData.requires_prescription = productData.requires_prescription
    if (productData.active_ingredient !== undefined) updateData.active_ingredient = productData.active_ingredient
    if (productData.dosage !== undefined) updateData.dosage = productData.dosage
    if (productData.manufacturer !== undefined) updateData.manufacturer = productData.manufacturer
    if (productData.batch_number !== undefined) updateData.batch_number = productData.batch_number
    if (productData.expiry_date !== undefined) updateData.expiry_date = productData.expiry_date
    if (productData.barcode !== undefined) updateData.barcode = productData.barcode

    const { data: success, error } = await dbOperations.updateProduct(params.id, updateData)

    if (error) {
      console.error("❌ Erro ao atualizar produto:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar produto" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Produto atualizado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro na atualização de produto:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data: success, error } = await dbOperations.deleteProduct(params.id)

    if (error) {
      console.error("❌ Erro ao deletar produto:", error)
      return NextResponse.json({ success: false, message: "Erro ao deletar produto" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Produto deletado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro na deleção de produto:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
