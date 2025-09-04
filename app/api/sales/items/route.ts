import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Token de autorização necessário" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const { items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, message: "Lista de itens inválida" }, { status: 400 })
    }

    const { data: success, error } = await dbOperations.createSaleItems(items)

    if (error) {
      console.error("Erro ao criar itens da venda:", error)
      return NextResponse.json({ success: false, message: "Erro ao criar itens da venda" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Itens da venda criados com sucesso",
    })
  } catch (error) {
    console.error("Erro na criação de itens da venda:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
