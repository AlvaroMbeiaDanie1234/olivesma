"use client"

import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"

interface WhatsAppButtonProps {
  message?: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function WhatsAppButton({
  message = "Olá! Preciso de ajuda com medicamentos.",
  className = "",
  variant = "outline",
  size = "default",
}: WhatsAppButtonProps) {
  const phoneNumber = "244923456789" // Número da Farmácia Olivesma
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-green-500 hover:bg-green-600 text-white border-green-500 ${className}`}
      asChild
    >
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <Phone className="h-4 w-4 mr-2" />
        WhatsApp
      </a>
    </Button>
  )
}
