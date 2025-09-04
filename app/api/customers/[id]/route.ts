import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const customerId = params.id

    // Verificar se o usuário pode acessar os dados deste cliente
    if (user.type === "customer" && user.id !== customerId) {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    console.log("👤 Buscando dados do cliente:", customerId)

    const { data: customerData, error } = await dbOperations.getCustomerWithOrders(customerId)

    if (error) {
      console.error("❌ Erro ao buscar cliente:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar dados do cliente" }, { status: 500 })
    }

    if (!customerData) {
      return NextResponse.json({ success: false, message: "Cliente não encontrado" }, { status: 404 })
    }

    console.log("✅ Dados do cliente encontrados:", customerData.id, "com", customerData.orders?.length || 0, "pedidos")

    return NextResponse.json({
      success: true,
      data: customerData,
    })
  } catch (error) {
    console.error("❌ Erro na API de cliente:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const customerId = params.id

    // Verificar se o usuário pode atualizar os dados deste cliente
    if (user.type === "customer" && user.id !== customerId) {
      return NextResponse.json({ success: false, message: "Acesso negado" }, { status: 403 })
    }

    const updateData = await request.json()

    console.log("📝 Atualizando dados do cliente:", customerId, updateData)

    const { data: success, error } = await dbOperations.updateCustomer(customerId, updateData)

    if (error || !success) {
      console.error("❌ Erro ao atualizar cliente:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar dados do cliente" }, { status: 500 })
    }

    console.log("✅ Cliente atualizado com sucesso:", customerId)

    return NextResponse.json({
      success: true,
      message: "Dados atualizados com sucesso",
    })
  } catch (error) {
    console.error("❌ Erro na API de atualização de cliente:", error)
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 })
  }
}
