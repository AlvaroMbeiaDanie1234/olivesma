import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    console.log("🔍 Buscando produtos, termo:", search)

    const { data: products, error } = await dbOperations.getProducts(search || undefined)

    if (error) {
      console.error("❌ Erro ao buscar produtos:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar produtos" }, { status: 500 })
    }

    console.log("✅ Produtos encontrados:", products?.length || 0)

    return NextResponse.json({
      success: true,
      data: products || [],
      products: products || [], // Para compatibilidade
    })
  } catch (error) {
    console.error("❌ Erro na API de produtos:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    console.log("📦 Criando produto:", productData)

    // Validações
    if (!productData.code || !productData.name || !productData.price_kwanza) {
      return NextResponse.json({ success: false, message: "Código, nome e preço são obrigatórios" }, { status: 400 })
    }

    const { data: product, error } = await dbOperations.createProduct(productData)

    if (error) {
      console.error("❌ Erro ao criar produto:", error)
      return NextResponse.json({ success: false, message: "Erro ao criar produto" }, { status: 500 })
    }

    console.log("✅ Produto criado com sucesso:", product?.id)

    return NextResponse.json({
      success: true,
      message: "Produto criado com sucesso",
      data: product,
    })
  } catch (error) {
    console.error("❌ Erro na criação de produto:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
