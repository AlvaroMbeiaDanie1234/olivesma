import { NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function GET() {
  try {
    const { data: customers, error } = await dbOperations.getAllCustomers()

    if (error) {
      console.error("Erro ao buscar clientes:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Erro ao buscar clientes",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: customers || [],
      count: customers?.length || 0,
    })
  } catch (error) {
    console.error("Erro interno ao buscar clientes:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
