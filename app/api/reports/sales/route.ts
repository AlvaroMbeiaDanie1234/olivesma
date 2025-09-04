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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    console.log("📊 Gerando relatório de vendas:", { startDate, endDate, type })

    const { data: reportData, error } = await dbOperations.getSalesReport(
      startDate || undefined,
      endDate || undefined,
      type || undefined,
    )

    if (error) {
      console.error("❌ Erro ao gerar relatório:", error)
      return NextResponse.json({ success: false, message: "Erro ao gerar relatório" }, { status: 500 })
    }

    console.log("✅ Relatório gerado com sucesso")

    return NextResponse.json({
      success: true,
      data: reportData,
    })
  } catch (error) {
    console.error("❌ Erro na API de relatórios:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
