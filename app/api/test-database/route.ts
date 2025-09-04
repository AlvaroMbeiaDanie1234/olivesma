import { NextResponse } from "next/server"
import { testConnection } from "@/lib/database"

export async function GET() {
  try {
    const result = await testConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        config: result.config,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          config: result.config,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
