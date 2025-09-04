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

    console.log("📦 Carregando produtos com estoque baixo")

    const { data: products, error } = await dbOperations.getLowStockProducts(10)

    if (error) {
      console.error("❌ Erro ao carregar produtos com estoque baixo:", error)
      return NextResponse.json(
        { success: false, message: "Erro ao carregar produtos com estoque baixo" },
        { status: 500 },
      )
    }

    console.log("✅ Produtos com estoque baixo carregados:", products?.length || 0)

    return NextResponse.json({
      success: true,
      data: products || [],
    })
  } catch (error) {
    console.error("❌ Erro na API de estoque baixo:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
