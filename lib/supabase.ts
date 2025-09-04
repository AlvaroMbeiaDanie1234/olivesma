import { createClient } from "@supabase/supabase-js"

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Só criar o cliente se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Flag para verificar se o Supabase está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Tipos TypeScript baseados nas tabelas do banco
export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
  role: "admin" | "seller" | "pharmacist"
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email?: string
  phone: string
  first_name: string
  last_name: string
  birth_date?: string
  gender?: string
  address?: string
  municipality?: string
  province?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  code: string
  name: string
  description?: string
  category_id?: string
  price_kwanza: number
  cost_price?: number
  stock_quantity: number
  min_stock_level: number
  requires_prescription: boolean
  active_ingredient?: string
  dosage?: string
  manufacturer?: string
  batch_number?: string
  expiry_date?: string
  barcode?: string
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  total_amount: number
  iva_amount: number
  subtotal: number
  delivery_address?: string
  delivery_fee: number
  notes?: string
  created_by?: string
  confirmed_by?: string
  confirmed_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  customers?: Customer
  users?: User
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  products?: Product
}

export interface Sale {
  id: string
  sale_number: string
  customer_id?: string
  cashier_id: string
  total_amount: number
  iva_amount: number
  subtotal: number
  payment_method: "cash" | "card" | "transfer" | "multicaixa"
  payment_reference?: string
  change_amount: number
  receipt_printed: boolean
  saft_exported: boolean
  created_at: string
  customers?: Customer
  users?: User
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  iva_rate: number
  iva_amount: number
  created_at: string
  products?: Product
}

export interface StockMovement {
  id: string
  product_id: string
  movement_type: "in" | "out" | "adjustment"
  quantity: number
  reference_type?: "sale" | "order" | "purchase" | "adjustment"
  reference_id?: string
  notes?: string
  created_by?: string
  created_at: string
  products?: Product
  users?: User
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value?: string
  description?: string
  updated_by?: string
  updated_at: string
}

// Funções utilitárias para interagir com o banco
export const dbOperations = {
  // Produtos
  async getProducts() {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .eq("is_active", true)
      .order("name")

    return { data, error }
  },

  async getProductById(id: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .eq("id", id)
      .single()

    return { data, error }
  },

  async updateProductStock(productId: string, newQuantity: number) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase.from("products").update({ stock_quantity: newQuantity }).eq("id", productId)

    return { data, error }
  },

  // Clientes
  async getCustomerByPhone(phone: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase.from("customers").select("*").eq("phone", phone).single()

    return { data, error }
  },

  async createCustomer(customerData: Partial<Customer>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase.from("customers").insert(customerData).select().single()

    return { data, error }
  },

  // Vendas
  async createSale(saleData: Partial<Sale>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase.from("sales").insert(saleData).select().single()

    return { data, error }
  },

  async createSaleItems(saleItems: Partial<SaleItem>[]) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase.from("sale_items").insert(saleItems).select()

    return { data, error }
  },

  async getSales(limit = 50) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          phone
        ),
        users (
          id,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async getSaleWithItems(saleId: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          phone
        ),
        users (
          id,
          first_name,
          last_name
        )
      `)
      .eq("id", saleId)
      .single()

    if (saleError) return { data: null, error: saleError }

    const { data: items, error: itemsError } = await supabase
      .from("sale_items")
      .select(`
        *,
        products (
          id,
          code,
          name
        )
      `)
      .eq("sale_id", saleId)

    return {
      data: sale ? { ...sale, items: items || [] } : null,
      error: itemsError,
    }
  },

  // Pedidos
  async getOrders(limit = 50) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          phone,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async getOrderWithItems(orderId: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          phone,
          email
        )
      `)
      .eq("id", orderId)
      .single()

    if (orderError) return { data: null, error: orderError }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        products (
          id,
          code,
          name
        )
      `)
      .eq("order_id", orderId)

    return {
      data: order ? { ...order, items: items || [] } : null,
      error: itemsError,
    }
  },

  async updateOrderStatus(orderId: string, status: string, userId?: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "confirmed" && userId) {
      updateData.confirmed_by = userId
      updateData.confirmed_at = new Date().toISOString()
    }

    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("orders").update(updateData).eq("id", orderId).select().single()

    return { data, error }
  },

  // Configurações do sistema
  async getSystemSettings() {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase.from("system_settings").select("*").order("setting_key")

    return { data, error }
  },

  async getSystemSetting(key: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .single()

    return { data, error }
  },

  async updateSystemSetting(key: string, value: string, userId?: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase não configurado" } }
    }

    const { data, error } = await supabase
      .from("system_settings")
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return { data, error }
  },
}
