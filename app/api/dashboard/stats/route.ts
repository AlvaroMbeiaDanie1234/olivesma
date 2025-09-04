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

    console.log("📊 Carregando estatísticas do dashboard")

    const { data: stats, error } = await dbOperations.getDashboardStats()

    if (error) {
      console.error("❌ Erro ao carregar estatísticas:", error)
      return NextResponse.json({ success: false, message: "Erro ao carregar estatísticas" }, { status: 500 })
    }

    console.log("✅ Estatísticas carregadas:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("❌ Erro na API de estatísticas:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
