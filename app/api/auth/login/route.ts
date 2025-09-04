import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyPassword, generateToken, isValidEmail, type AuthResponse } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    console.log("🔐 Tentativa de login:", { identifier, hasPassword: !!password })

    // Validações básicas
    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/telefone e senha são obrigatórios",
        } as AuthResponse,
        { status: 400 },
      )
    }

    let user = null
    let userType = null

    // Determinar se é email ou telefone
    if (isValidEmail(identifier)) {
      console.log("📧 Buscando por email:", identifier)

      // Primeiro verificar funcionários (admin, seller, pharmacist)
      const { data: employee, error: employeeError } = await dbOperations.getUserByEmail(identifier)

      if (employeeError) {
        console.error("❌ Erro ao buscar funcionário:", employeeError)
      }

      if (employee) {
        console.log("👨‍💼 Funcionário encontrado:", {
          id: employee.id,
          email: employee.email,
          role: employee.role,
          hasPassword: !!employee.password_hash,
          isActive: employee.is_active,
        })
        user = employee
        userType = "employee"
      } else {
        console.log("🔍 Funcionário não encontrado, buscando cliente...")

        // Se não encontrou funcionário, buscar cliente
        const { data: customer, error: customerError } = await dbOperations.getCustomerByEmail(identifier)

        if (customerError) {
          console.error("❌ Erro ao buscar cliente:", customerError)
        }

        if (customer) {
          console.log("👤 Cliente encontrado:", {
            id: customer.id,
            email: customer.email,
            hasPassword: !!customer.password_hash,
            isActive: customer.is_active,
          })
          user = customer
          userType = "customer"
        }
      }
    } else {
      console.log("📱 Buscando por telefone:", identifier)

      // É telefone - só verificar clientes
      const { data: customer, error: customerError } = await dbOperations.getCustomerByPhone(identifier)

      if (customerError) {
        console.error("❌ Erro ao buscar cliente por telefone:", customerError)
      }

      if (customer) {
        console.log("👤 Cliente encontrado por telefone:", {
          id: customer.id,
          phone: customer.phone,
          hasPassword: !!customer.password_hash,
          isActive: customer.is_active,
        })
        user = customer
        userType = "customer"
      }
    }

    if (!user) {
      console.log("❌ Usuário não encontrado para:", identifier)
      return NextResponse.json(
        {
          success: false,
          message: "Email/telefone ou senha incorretos",
        } as AuthResponse,
        { status: 401 },
      )
    }

    console.log("✅ Usuário encontrado:", {
      id: user.id,
      type: userType,
      hasPasswordHash: !!user.password_hash,
      isActive: user.is_active,
      passwordHashLength: user.password_hash?.length || 0,
    })

    // Verificar se tem senha configurada
    if (!user.password_hash) {
      console.log("❌ Usuário sem senha configurada")
      return NextResponse.json(
        {
          success: false,
          message: "Conta sem senha configurada. Entre em contato com o suporte.",
        } as AuthResponse,
        { status: 401 },
      )
    }

    // Verificar se a conta está ativa
    if (!user.is_active) {
      console.log("❌ Conta desativada")
      return NextResponse.json(
        {
          success: false,
          message: "Conta desativada. Entre em contato com o administrador",
        } as AuthResponse,
        { status: 401 },
      )
    }

    console.log("🔑 Verificando senha...")
    console.log("Password fornecida:", password)
    console.log("Hash no banco:", user.password_hash.substring(0, 20) + "...")

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      console.log("❌ Senha incorreta para usuário:", user.id)
      return NextResponse.json(
        {
          success: false,
          message: "Email/telefone ou senha incorretos",
        } as AuthResponse,
        { status: 401 },
      )
    }

    console.log("✅ Senha correta!")

    // Gerar token para funcionário ou cliente
    const authUser = {
      id: user.id,
      email: user.email || "",
      first_name: user.first_name,
      last_name: user.last_name,
      role: userType === "employee" ? user.role : "customer",
      phone: user.phone,
      type: userType as "employee" | "customer",
    }

    console.log("🎫 Gerando token para:", authUser)

    const token = generateToken(authUser)

    console.log("✅ Login realizado com sucesso para:", userType, user.role || "customer")

    return NextResponse.json({
      success: true,
      message: "Login realizado com sucesso",
      user: authUser,
      token,
    } as AuthResponse)
  } catch (error) {
    console.error("❌ Erro no login:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor. Tente novamente.",
      } as AuthResponse,
      { status: 500 },
    )
  }
}
