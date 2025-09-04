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

    console.log("📋 Carregando pedidos recentes")

    const { data: orders, error } = await dbOperations.getRecentOrders(10)

    if (error) {
      console.error("❌ Erro ao carregar pedidos recentes:", error)
      return NextResponse.json({ success: false, message: "Erro ao carregar pedidos recentes" }, { status: 500 })
    }

    console.log("✅ Pedidos recentes carregados:", orders?.length || 0)

    return NextResponse.json({
      success: true,
      data: orders || [],
    })
  } catch (error) {
    console.error("❌ Erro na API de pedidos recentes:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
