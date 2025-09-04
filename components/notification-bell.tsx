"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Package, ShoppingCart, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface Notification {
  id: string
  type: "order" | "stock" | "sale" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simular notificações (em produção, viria de uma API)
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "stock",
        title: "Estoque Baixo",
        message: "Paracetamol 500mg está com apenas 5 unidades",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        read: false,
        priority: "high",
      },
      {
        id: "2",
        type: "order",
        title: "Novo Pedido",
        message: "Pedido #PD1234 recebido de Maria Silva",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        read: false,
        priority: "medium",
      },
      {
        id: "3",
        type: "sale",
        title: "Venda Realizada",
        message: "Venda de 2.500 Kz processada no POS",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        read: true,
        priority: "low",
      },
      {
        id: "4",
        type: "stock",
        title: "Produto Esgotado",
        message: "Ibuprofeno 400mg está sem estoque",
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
        read: false,
        priority: "high",
      },
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)

    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      // Adicionar nova notificação ocasionalmente
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? "order" : "stock",
          title: Math.random() > 0.5 ? "Novo Pedido" : "Alerta de Estoque",
          message: Math.random() > 0.5 ? "Novo pedido recebido" : "Produto com estoque baixo",
          timestamp: new Date(),
          read: false,
          priority: "medium",
        }

        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]) // Manter apenas 10
        setUnreadCount((prev) => prev + 1)
      }
    }, 30000) // A cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case "stock":
        return <Package className="h-4 w-4 text-orange-500" />
      case "sale":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "system":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Agora"
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 p-3 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs ${getPriorityColor(notification.priority)}`}>●</span>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimestamp(notification.timestamp)}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-sm text-gray-500 cursor-pointer">
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
