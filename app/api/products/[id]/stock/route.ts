import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Token de autorização necessário" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const { stock_quantity } = await request.json()

    if (typeof stock_quantity !== "number" || stock_quantity < 0) {
      return NextResponse.json({ success: false, message: "Quantidade de estoque inválida" }, { status: 400 })
    }

    const { data: success, error } = await dbOperations.updateProductStock(params.id, stock_quantity)

    if (error) {
      console.error("Erro ao atualizar estoque:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar estoque" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Estoque atualizado com sucesso",
    })
  } catch (error) {
    console.error("Erro na atualização de estoque:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
