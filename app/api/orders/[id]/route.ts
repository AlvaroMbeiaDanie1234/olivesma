import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { extractTokenFromHeader, requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)
    const user = requireAuth(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Token de acesso inválido ou expirado" }, { status: 401 })
    }

    const { data: order, error } = await dbOperations.getOrderById(params.id)

    if (error) {
      console.error("Erro ao buscar pedido:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar pedido" }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ success: false, message: "Pedido não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Erro na API de pedido:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)
    const user = requireAuth(token)

    if (!user || user.type !== "employee") {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, message: "Status é obrigatório" }, { status: 400 })
    }

    const { data: success, error } = await dbOperations.updateOrderStatus(params.id, status, user.id)

    if (error || !success) {
      console.error("Erro ao atualizar status do pedido:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar status do pedido" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Status do pedido atualizado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
