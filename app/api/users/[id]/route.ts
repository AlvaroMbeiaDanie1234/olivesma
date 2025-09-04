import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

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

    const userData = await request.json()

    // Preparar dados para atualização
    const updateData: any = {}

    if (userData.email !== undefined) updateData.email = userData.email
    if (userData.first_name !== undefined) updateData.first_name = userData.first_name
    if (userData.last_name !== undefined) updateData.last_name = userData.last_name
    if (userData.phone !== undefined) updateData.phone = userData.phone
    if (userData.role !== undefined) updateData.role = userData.role
    if (userData.is_active !== undefined) updateData.is_active = userData.is_active

    // Se uma nova senha foi fornecida
    if (userData.password) {
      updateData.password_hash = await bcrypt.hash(userData.password, 10)
    }

    const { data: success, error } = await dbOperations.updateUser(params.id, updateData)

    if (error) {
      console.error("❌ Erro ao atualizar usuário:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar usuário" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuário atualizado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro na atualização de usuário:", error)
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

    const { data: success, error } = await dbOperations.deleteUser(params.id)

    if (error) {
      console.error("❌ Erro ao deletar usuário:", error)
      return NextResponse.json({ success: false, message: "Erro ao deletar usuário" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Usuário deletado com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro na deleção de usuário:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
