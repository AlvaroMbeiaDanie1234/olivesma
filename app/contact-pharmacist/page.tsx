"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Phone, MessageSquare, Clock, User } from "lucide-react"
import Link from "next/link"

export default function ContactPharmacistPage() {
  const handleWhatsAppContact = (type: string) => {
    const messages = {
      general: "Olá! Gostaria de falar com um farmacêutico para esclarecimento de dúvidas.",
      prescription: "Olá! Preciso de orientação sobre medicamentos com receita médica.",
      dosage: "Olá! Gostaria de orientação sobre dosagem de medicamentos.",
      interaction: "Olá! Preciso saber sobre interações medicamentosas.",
      emergency: "Olá! Preciso de orientação farmacêutica urgente.",
    }

    const message = messages[type as keyof typeof messages] || messages.general
    const whatsappUrl = `https://wa.me/244923456789?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Site
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="text-lg font-bold text-green-600">Farmácia Olivesma</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Fale com Nosso Farmacêutico</h1>
            <p className="text-gray-600">
              Nossa equipe de farmacêuticos está disponível para esclarecer suas dúvidas sobre medicamentos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contato Rápido via WhatsApp
                  </CardTitle>
                  <CardDescription>Escolha o tipo de consulta para um atendimento mais direcionado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                    onClick={() => handleWhatsAppContact("general")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Consulta Geral
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleWhatsAppContact("prescription")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Medicamentos com Receita
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleWhatsAppContact("dosage")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Orientação sobre Dosagem
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleWhatsAppContact("interaction")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Interações Medicamentosas
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 bg-transparent"
                    onClick={() => handleWhatsAppContact("emergency")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Orientação Urgente
                  </Button>
                </CardContent>
              </Card>

              {/* Service Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Horários de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Segunda - Sexta:</span>
                      <span className="font-medium">6h - 22h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span className="font-medium">7h - 20h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span className="font-medium">8h - 18h</span>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-800 text-xs">
                        <strong>Atendimento 24h:</strong> Para emergências farmacêuticas, entre em contato via WhatsApp
                        a qualquer hora.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Envie sua Dúvida</CardTitle>
                  <CardDescription>Preencha o formulário abaixo e entraremos em contato via WhatsApp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                      <Input id="phone" placeholder="+244 923 456 789" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="consultation-type">Tipo de Consulta</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Consulta Geral</SelectItem>
                        <SelectItem value="prescription">Medicamentos com Receita</SelectItem>
                        <SelectItem value="dosage">Orientação sobre Dosagem</SelectItem>
                        <SelectItem value="interaction">Interações Medicamentosas</SelectItem>
                        <SelectItem value="side-effects">Efeitos Colaterais</SelectItem>
                        <SelectItem value="emergency">Orientação Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="medication">Medicamento (se aplicável)</Label>
                    <Input id="medication" placeholder="Nome do medicamento" />
                  </div>

                  <div>
                    <Label htmlFor="question">Sua Dúvida</Label>
                    <Textarea id="question" placeholder="Descreva sua dúvida ou situação..." rows={4} />
                  </div>

                  <div>
                    <Label htmlFor="urgency">Nível de Urgência</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa - Posso aguardar</SelectItem>
                        <SelectItem value="medium">Média - Gostaria de resposta hoje</SelectItem>
                        <SelectItem value="high">Alta - Preciso de resposta rápida</SelectItem>
                        <SelectItem value="urgent">Urgente - É uma emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleWhatsAppContact("general")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Enviar via WhatsApp
                  </Button>

                  <div className="text-center text-xs text-gray-600">
                    <p>🔒 Suas informações são confidenciais</p>
                    <p>📱 Resposta garantida em até 30 minutos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
