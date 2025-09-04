import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

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

    const { data: users, error } = await dbOperations.getAllUsers()

    if (error) {
      console.error("❌ Erro ao buscar usuários:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar usuários" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: users || [],
    })
  } catch (error) {
    console.error("❌ Erro na API de usuários:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Validações
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name || !userData.role) {
      return NextResponse.json(
        { success: false, message: "Email, senha, nome, sobrenome e função são obrigatórios" },
        { status: 400 },
      )
    }

    // Verificar se o email já existe
    const { data: existingUser } = await dbOperations.getUserByEmail(userData.email)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email já está em uso" }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const { data: newUser, error } = await dbOperations.createUser({
      email: userData.email,
      password_hash: hashedPassword,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      role: userData.role,
    })

    if (error) {
      console.error("❌ Erro ao criar usuário:", error)
      return NextResponse.json({ success: false, message: "Erro ao criar usuário" }, { status: 500 })
    }

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = newUser!

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ Erro na criação de usuário:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
