import { type NextRequest, NextResponse } from "next/server"
import { dbOperations } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Lista de configurações para salvar no banco
    const settingsToSave = [
      { key: "company_name", value: settings.company_name },
      { key: "company_slogan", value: settings.company_slogan },
      { key: "company_nif", value: settings.company_nif },
      { key: "company_regime", value: settings.company_regime },
      { key: "company_address", value: settings.company_address },
      { key: "company_phone", value: settings.company_phone },
      { key: "company_email", value: settings.company_email },
      { key: "company_website", value: settings.company_website },
      { key: "system_currency", value: settings.system_currency },
      { key: "system_language", value: settings.system_language },
      { key: "system_timezone", value: settings.system_timezone },
      { key: "tax_rate", value: settings.tax_rate.toString() },
      { key: "receipt_header", value: settings.receipt_header },
      { key: "receipt_footer", value: settings.receipt_footer },
      { key: "invoice_template", value: settings.invoice_template },
      { key: "report_template", value: settings.report_template },
      { key: "email_notifications", value: settings.email_notifications.toString() },
      { key: "sms_notifications", value: settings.sms_notifications.toString() },
      { key: "whatsapp_notifications", value: settings.whatsapp_notifications.toString() },
      { key: "low_stock_alert", value: settings.low_stock_alert.toString() },
    ]

    // Salvar cada configuração no banco
    for (const setting of settingsToSave) {
      const { error } = await dbOperations.updateSystemSetting(setting.key, setting.value)
      if (error) {
        throw new Error(`Erro ao salvar ${setting.key}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso no banco de dados",
    })
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Erro ao salvar configurações: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      },
      { status: 500 },
    )
  }
}
