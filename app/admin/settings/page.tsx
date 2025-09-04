"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Settings,
  Building,
  Database,
  FileText,
  Upload,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Play,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SystemSettings {
  // Informações da Empresa
  company_name: string
  company_slogan: string
  company_logo: string
  company_nif: string
  company_regime: string
  company_address: string
  company_phone: string
  company_email: string
  company_website: string

  // Configurações de Sistema
  system_currency: string
  system_language: string
  system_timezone: string
  tax_rate: number

  // Configurações de Banco de Dados
  database_type: string
  database_host: string
  database_port: string
  database_name: string
  database_user: string
  database_password: string

  // Configurações de Impressão
  receipt_header: string
  receipt_footer: string
  invoice_template: string
  report_template: string

  // Configurações de Notificação
  email_notifications: boolean
  sms_notifications: boolean
  whatsapp_notifications: boolean
  low_stock_alert: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    // Informações da Empresa
    company_name: "Farmácia Olivesma",
    company_slogan: "Sua saúde é nossa prioridade",
    company_logo: "",
    company_nif: "123456789",
    company_regime: "Regime Geral",
    company_address: "Rua Principal, Luanda - Angola",
    company_phone: "+244 923 456 789",
    company_email: "contato@farmaciaolivesma.ao",
    company_website: "www.farmaciaolivesma.ao",

    // Configurações de Sistema
    system_currency: "AOA",
    system_language: "pt-AO",
    system_timezone: "Africa/Luanda",
    tax_rate: 14.0,

    // Configurações de Banco de Dados
    database_type: "mssql",
    database_host: "localhost",
    database_port: "1433",
    database_name: "farmacia_olivesma",
    database_user: "",
    database_password: "",

    // Configurações de Impressão
    receipt_header: "FARMÁCIA OLIVESMA\nRua Principal, Luanda - Angola\nTel: +244 923 456 789",
    receipt_footer: "Obrigado pela preferência!\nVolte sempre!",
    invoice_template: "default",
    report_template: "default",

    // Configurações de Notificação
    email_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: true,
    low_stock_alert: 10,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isInitializingDatabase, setIsInitializingDatabase] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionMessage, setConnectionMessage] = useState("")
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }

    // Carregar logo se existir
    const savedLogo = localStorage.getItem("companyLogo")
    if (savedLogo) {
      setLogoPreview(savedLogo)
      setSettings((prev) => ({ ...prev, company_logo: savedLogo }))
    }
  }

  const handleInputChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
        setSettings((prev) => ({ ...prev, company_logo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionMessage("")

    try {
      // Salvar configurações temporariamente para teste
      localStorage.setItem("systemSettings", JSON.stringify(settings))

      // Fazer requisição para API de teste
      const response = await fetch("/api/test-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: settings.database_type,
          host: settings.database_host,
          port: settings.database_port,
          database: settings.database_name,
          user: settings.database_user,
          password: settings.database_password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("success")
        setConnectionMessage(result.message)
      } else {
        setConnectionStatus("error")
        setConnectionMessage(result.message)
      }
    } catch (error) {
      setConnectionStatus("error")
      setConnectionMessage("Erro ao testar conexão: " + (error instanceof Error ? error.message : "Erro desconhecido"))
    } finally {
      setIsTestingConnection(false)
    }
  }

  const initializeDatabase = async () => {
    setIsInitializingDatabase(true)

    try {
      // Salvar configurações primeiro
      localStorage.setItem("systemSettings", JSON.stringify(settings))

      // Fazer requisição para API de inicialização
      const response = await fetch("/api/initialize-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: settings.database_type,
          host: settings.database_host,
          port: settings.database_port,
          database: settings.database_name,
          user: settings.database_user,
          password: settings.database_password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Banco de dados inicializado com sucesso!\n\n" + result.message)
        setConnectionStatus("success")
        setConnectionMessage("Banco inicializado e conectado")
      } else {
        alert("Erro ao inicializar banco de dados:\n" + result.message)
        setConnectionStatus("error")
        setConnectionMessage(result.message)
      }
    } catch (error) {
      const errorMessage =
        "Erro ao inicializar banco: " + (error instanceof Error ? error.message : "Erro desconhecido")
      alert(errorMessage)
      setConnectionStatus("error")
      setConnectionMessage(errorMessage)
    } finally {
      setIsInitializingDatabase(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)

    try {
      // Salvar no localStorage
      localStorage.setItem("systemSettings", JSON.stringify(settings))

      // Salvar logo separadamente
      if (settings.company_logo) {
        localStorage.setItem("companyLogo", settings.company_logo)
      }

      // Salvar no banco de dados se conectado
      if (connectionStatus === "success") {
        const response = await fetch("/api/save-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        })

        if (!response.ok) {
          throw new Error("Erro ao salvar no banco de dados")
        }
      }

      alert("Configurações salvas com sucesso!")
    } catch (error) {
      alert("Erro ao salvar configurações. Tente novamente.\n" + (error instanceof Error ? error.message : ""))
    } finally {
      setIsSaving(false)
    }
  }

  const generatePreviewDocument = () => {
    const previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pré-visualização - ${settings.company_name}</title>
        <style>
          @page { 
            size: A4; 
            margin: 2cm;
          }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            margin: 0; 
            padding: 0;
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            max-height: 80px;
            margin-bottom: 15px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #16a34a; 
            margin-bottom: 5px;
          }
          .company-slogan {
            font-size: 14px;
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
          }
          .company-info {
            font-size: 11px;
            color: #333;
            line-height: 1.3;
          }
          .document-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .info-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 15px 0;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
          }
          .info-value {
            color: #16a34a;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 20px;
          }
          .preview-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
            color: #92400e;
          }
          .database-info {
            background-color: #dbeafe;
            border: 1px solid #3b82f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .database-title {
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="preview-notice">
          📋 PRÉ-VISUALIZAÇÃO - Exemplo de documento com as configurações atuais
        </div>

        <div class="header">
          ${
            settings.company_logo
              ? `<img src="${settings.company_logo}" alt="Logo" class="logo" />`
              : '<div style="height: 80px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border-radius: 4px;">LOGO DA EMPRESA</div>'
          }
          <div class="company-name">${settings.company_name}</div>
          <div class="company-slogan">${settings.company_slogan}</div>
          <div class="company-info">
            ${settings.company_address}<br>
            Tel: ${settings.company_phone} | Email: ${settings.company_email}<br>
            NIF: ${settings.company_nif} | ${settings.company_regime}
          </div>
          <div class="document-title">DOCUMENTO DE EXEMPLO</div>
        </div>

        <div class="database-info">
          <div class="database-title">🗄️ Configuração do Banco de Dados</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">${settings.database_type.toUpperCase()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Servidor:</span>
              <span class="info-value">${settings.database_host}:${settings.database_port}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Banco:</span>
              <span class="info-value">${settings.database_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value">${connectionStatus === "success" ? "✅ Conectado" : connectionStatus === "error" ? "❌ Erro" : "⏳ Não testado"}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Configurações do Sistema</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nome da Empresa:</span>
              <span class="info-value">${settings.company_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Slogan:</span>
              <span class="info-value">${settings.company_slogan}</span>
            </div>
            <div class="info-item">
              <span class="info-label">NIF:</span>
              <span class="info-value">${settings.company_nif}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Regime:</span>
              <span class="info-value">${settings.company_regime}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Moeda:</span>
              <span class="info-value">${settings.system_currency}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Taxa de IVA:</span>
              <span class="info-value">${settings.tax_rate}%</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Informações de Contato</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Endereço:</span>
              <span class="info-value">${settings.company_address}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Telefone:</span>
              <span class="info-value">${settings.company_phone}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${settings.company_email}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Website:</span>
              <span class="info-value">${settings.company_website}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Documento gerado automaticamente em ${new Date().toLocaleString("pt-AO")}</p>
          <p>© 2024 ${settings.company_name} - Sistema de Gestão</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(previewContent)
      printWindow.document.close()
      printWindow.focus()
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `configuracoes_${settings.company_name.toLowerCase().replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">Farmácia Olivesma</h1>
                <p className="text-xs text-gray-500">Configurações do Sistema</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={generatePreviewDocument}>
              <Eye className="h-4 w-4 mr-2" />
              Pré-visualizar
            </Button>
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={saveSettings} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h2>
            <p className="text-gray-600 mt-2">Configure as informações da empresa e parâmetros do sistema</p>
          </div>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="database">Banco de Dados</TabsTrigger>
            <TabsTrigger value="printing">Impressão</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          {/* Configurações da Empresa */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo da Empresa */}
                <div className="space-y-4">
                  <Label>Logo da Empresa</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {logoPreview ? (
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo"
                          width={120}
                          height={80}
                          className="object-contain"
                        />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">Logo</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} className="mb-2" />
                      <p className="text-sm text-gray-500">Recomendado: PNG ou JPG, máximo 2MB, dimensões 300x200px</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nome da Empresa *</Label>
                    <Input
                      id="company_name"
                      value={settings.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Nome da sua farmácia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_slogan">Slogan</Label>
                    <Input
                      id="company_slogan"
                      value={settings.company_slogan}
                      onChange={(e) => handleInputChange("company_slogan", e.target.value)}
                      placeholder="Slogan da empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_nif">NIF *</Label>
                    <Input
                      id="company_nif"
                      value={settings.company_nif}
                      onChange={(e) => handleInputChange("company_nif", e.target.value)}
                      placeholder="Número de Identificação Fiscal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_regime">Regime Fiscal</Label>
                    <Select
                      value={settings.company_regime}
                      onValueChange={(value) => handleInputChange("company_regime", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regime Geral">Regime Geral</SelectItem>
                        <SelectItem value="Regime Simplificado">Regime Simplificado</SelectItem>
                        <SelectItem value="Regime de Exclusão">Regime de Exclusão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Informações de Contato */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Informações de Contato</h4>

                  <div className="space-y-2">
                    <Label htmlFor="company_address">Endereço Completo</Label>
                    <Textarea
                      id="company_address"
                      value={settings.company_address}
                      onChange={(e) => handleInputChange("company_address", e.target.value)}
                      placeholder="Endereço completo da empresa"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">Telefone</Label>
                      <Input
                        id="company_phone"
                        value={settings.company_phone}
                        onChange={(e) => handleInputChange("company_phone", e.target.value)}
                        placeholder="+244 923 456 789"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        type="email"
                        value={settings.company_email}
                        onChange={(e) => handleInputChange("company_email", e.target.value)}
                        placeholder="contato@empresa.ao"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_website">Website</Label>
                      <Input
                        id="company_website"
                        value={settings.company_website}
                        onChange={(e) => handleInputChange("company_website", e.target.value)}
                        placeholder="www.empresa.ao"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações do Sistema */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="system_currency">Moeda</Label>
                    <Select
                      value={settings.system_currency}
                      onValueChange={(value) => handleInputChange("system_currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AOA">Kwanza Angolano (AOA)</SelectItem>
                        <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Taxa de IVA (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.1"
                      value={settings.tax_rate}
                      onChange={(e) => handleInputChange("tax_rate", Number.parseFloat(e.target.value))}
                      placeholder="14.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="system_language">Idioma</Label>
                    <Select
                      value={settings.system_language}
                      onValueChange={(value) => handleInputChange("system_language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-AO">Português (Angola)</SelectItem>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="system_timezone">Fuso Horário</Label>
                    <Select
                      value={settings.system_timezone}
                      onValueChange={(value) => handleInputChange("system_timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Luanda">África/Luanda (WAT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/Sao_Paulo">América/São_Paulo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações do Banco de Dados */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Configurações do Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Suporte Completo</strong> - Microsoft SQL Server e MySQL integrados
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="database_type">Tipo de Banco</Label>
                    <Select
                      value={settings.database_type}
                      onValueChange={(value) => handleInputChange("database_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mssql">Microsoft SQL Server</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database_host">Servidor/Host</Label>
                    <Input
                      id="database_host"
                      value={settings.database_host}
                      onChange={(e) => handleInputChange("database_host", e.target.value)}
                      placeholder="localhost ou IP do servidor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database_port">Porta</Label>
                    <Input
                      id="database_port"
                      value={settings.database_port}
                      onChange={(e) => handleInputChange("database_port", e.target.value)}
                      placeholder={
                        settings.database_type === "mysql" ? "3306 (padrão MySQL)" : "1433 (padrão SQL Server)"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database_name">Nome do Banco</Label>
                    <Input
                      id="database_name"
                      value={settings.database_name}
                      onChange={(e) => handleInputChange("database_name", e.target.value)}
                      placeholder="farmacia_olivesma"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database_user">Usuário</Label>
                    <Input
                      id="database_user"
                      value={settings.database_user}
                      onChange={(e) => handleInputChange("database_user", e.target.value)}
                      placeholder="usuário do banco"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="database_password">Senha</Label>
                    <Input
                      id="database_password"
                      type="password"
                      value={settings.database_password}
                      onChange={(e) => handleInputChange("database_password", e.target.value)}
                      placeholder="senha do banco"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Testar Conexão</h4>
                      <p className="text-sm text-gray-600">Verifique se a conexão com o banco está funcionando</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {connectionStatus === "success" && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      )}
                      {connectionStatus === "error" && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Erro
                        </Badge>
                      )}
                      <Button variant="outline" onClick={testDatabaseConnection} disabled={isTestingConnection}>
                        {isTestingConnection ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Database className="h-4 w-4 mr-2" />
                        )}
                        {isTestingConnection ? "Testando..." : "Testar"}
                      </Button>
                    </div>
                  </div>

                  {connectionMessage && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        connectionStatus === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {connectionMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Inicializar Banco de Dados</h4>
                      <p className="text-sm text-gray-600">Criar tabelas e dados iniciais no banco</p>
                    </div>
                    <Button
                      onClick={initializeDatabase}
                      disabled={isInitializingDatabase || connectionStatus !== "success"}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isInitializingDatabase ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isInitializingDatabase ? "Inicializando..." : "Inicializar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Impressão */}
          <TabsContent value="printing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Configurações de Impressão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receipt_header">Cabeçalho dos Recibos</Label>
                    <Textarea
                      id="receipt_header"
                      value={settings.receipt_header}
                      onChange={(e) => handleInputChange("receipt_header", e.target.value)}
                      placeholder="Texto que aparece no topo dos recibos"
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">
                      Este texto aparecerá no cabeçalho de todos os recibos térmicos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt_footer">Rodapé dos Recibos</Label>
                    <Textarea
                      id="receipt_footer"
                      value={settings.receipt_footer}
                      onChange={(e) => handleInputChange("receipt_footer", e.target.value)}
                      placeholder="Texto que aparece no final dos recibos"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">Mensagem de agradecimento ou informações adicionais</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_template">Template de Faturas</Label>
                      <Select
                        value={settings.invoice_template}
                        onValueChange={(value) => handleInputChange("invoice_template", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Padrão</SelectItem>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="classic">Clássico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="report_template">Template de Relatórios</Label>
                      <Select
                        value={settings.report_template}
                        onValueChange={(value) => handleInputChange("report_template", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Padrão</SelectItem>
                          <SelectItem value="detailed">Detalhado</SelectItem>
                          <SelectItem value="summary">Resumido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por Email</h4>
                      <p className="text-sm text-gray-600">Receber alertas e relatórios por email</p>
                    </div>
                    <Button
                      variant={settings.email_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("email_notifications", !settings.email_notifications)}
                    >
                      {settings.email_notifications ? "Ativado" : "Desativado"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por SMS</h4>
                      <p className="text-sm text-gray-600">Receber alertas importantes por SMS</p>
                    </div>
                    <Button
                      variant={settings.sms_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("sms_notifications", !settings.sms_notifications)}
                    >
                      {settings.sms_notifications ? "Ativado" : "Desativado"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por WhatsApp</h4>
                      <p className="text-sm text-gray-600">Receber alertas via WhatsApp Business</p>
                    </div>
                    <Button
                      variant={settings.whatsapp_notifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("whatsapp_notifications", !settings.whatsapp_notifications)}
                    >
                      {settings.whatsapp_notifications ? "Ativado" : "Desativado"}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="low_stock_alert">Alerta de Estoque Baixo</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="low_stock_alert"
                        type="number"
                        value={settings.low_stock_alert}
                        onChange={(e) => handleInputChange("low_stock_alert", Number.parseInt(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">unidades ou menos</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Receber alerta quando o estoque de um produto atingir este valor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
