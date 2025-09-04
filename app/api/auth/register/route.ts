import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import {
  hashPassword,
  generateToken,
  isValidEmail,
  isValidPhone,
  formatPhone,
  isValidName,
  type AuthResponse,
} from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, birthDate, gender, address, municipality, province } =
      await request.json()

    console.log("📝 Tentativa de registro:", { firstName, lastName, phone, email })

    // Validações básicas
    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Nome, sobrenome, telefone e senha são obrigatórios",
        } as AuthResponse,
        { status: 400 },
      )
    }

    if (!isValidName(firstName) || !isValidName(lastName)) {
      return NextResponse.json(
        {
          success: false,
          message: "Nome e sobrenome devem ter pelo menos 2 caracteres",
        } as AuthResponse,
        { status: 400 },
      )
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Telefone inválido. Use o formato: +244 9XXXXXXXX",
        } as AuthResponse,
        { status: 400 },
      )
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Email inválido",
        } as AuthResponse,
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "A senha deve ter pelo menos 6 caracteres",
        } as AuthResponse,
        { status: 400 },
      )
    }

    // Verificar se email já existe (funcionário ou cliente)
    if (email) {
      const { data: existingUser } = await dbOperations.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Este email já está em uso por um funcionário",
          } as AuthResponse,
          { status: 409 },
        )
      }

      const { data: existingCustomer } = await dbOperations.getCustomerByEmail(email)
      if (existingCustomer) {
        return NextResponse.json(
          {
            success: false,
            message: "Este email já está em uso",
          } as AuthResponse,
          { status: 409 },
        )
      }
    }

    // Verificar se telefone já existe
    const formattedPhone = formatPhone(phone)
    const { data: existingPhone } = await dbOperations.getCustomerByPhone(formattedPhone)
    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Este telefone já está em uso",
        } as AuthResponse,
        { status: 409 },
      )
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    // Criar cliente
    const customerData = {
      email: email || null,
      phone: formattedPhone,
      first_name: firstName,
      last_name: lastName,
      password_hash: passwordHash,
      birth_date: birthDate ? new Date(birthDate) : undefined,
      gender,
      address,
      municipality,
      province,
    }

    const { data: newCustomer, error } = await dbOperations.createCustomer(customerData)

    if (error || !newCustomer) {
      console.error("❌ Erro ao criar cliente:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao criar conta. Tente novamente.",
        } as AuthResponse,
        { status: 500 },
      )
    }

    console.log("✅ Cliente criado com sucesso:", newCustomer.id)

    // Gerar token para o novo cliente
    const authUser = {
      id: newCustomer.id,
      email: newCustomer.email || "",
      first_name: newCustomer.first_name,
      last_name: newCustomer.last_name,
      role: "customer" as const,
      phone: newCustomer.phone,
      type: "customer" as const,
    }

    const token = generateToken(authUser)

    return NextResponse.json(
      {
        success: true,
        message: "Conta criada com sucesso!",
        user: authUser,
        token,
      } as AuthResponse,
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Erro no registro:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor. Tente novamente.",
      } as AuthResponse,
      { status: 500 },
    )
  }
}
