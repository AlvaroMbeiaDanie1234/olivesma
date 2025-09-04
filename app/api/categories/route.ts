import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("📂 Buscando categorias")

    const { data: categories, error } = await dbOperations.getCategories()

    if (error) {
      console.error("❌ Erro ao buscar categorias:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar categorias" }, { status: 500 })
    }

    console.log("✅ Categorias encontradas:", categories?.length || 0)

    return NextResponse.json({
      success: true,
      data: categories || [],
      categories: categories || [], // Para compatibilidade
    })
  } catch (error) {
    console.error("❌ Erro na API de categorias:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const categoryData = await request.json()
    console.log("📂 Criando categoria:", categoryData)

    if (!categoryData.name) {
      return NextResponse.json({ success: false, message: "Nome da categoria é obrigatório" }, { status: 400 })
    }

    const { data: category, error } = await dbOperations.createCategory(categoryData)

    if (error) {
      console.error("❌ Erro ao criar categoria:", error)
      return NextResponse.json({ success: false, message: "Erro ao criar categoria" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Categoria criada com sucesso",
      data: category,
    })
  } catch (error) {
    console.error("❌ Erro na criação de categoria:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
