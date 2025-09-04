import { type NextRequest, NextResponse } from "next/server"
import { setupInitialData } from "@/scripts/setup-database-data"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Salvar configurações temporariamente no processo
    process.env.DB_TYPE = body.type
    process.env.DB_HOST = body.host
    process.env.DB_PORT = body.port
    process.env.DB_NAME = body.database
    process.env.DB_USER = body.user
    process.env.DB_PASSWORD = body.password

    await setupInitialData()

    return NextResponse.json({
      success: true,
      message:
        "Banco de dados inicializado com sucesso!\n\n" +
        "✅ Tabelas criadas\n" +
        "✅ Usuário administrador criado\n" +
        "✅ Categorias padrão criadas\n" +
        "✅ Produtos de exemplo adicionados\n" +
        "✅ Configurações do sistema definidas",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Erro ao inicializar banco: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    })
  }
}
