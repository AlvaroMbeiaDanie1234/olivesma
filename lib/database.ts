import mysql from "mysql2/promise"

// Configurações de banco de dados
interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
}

// Configuração padrão baseada nas variáveis de ambiente
let dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  database: process.env.DB_NAME || "farmacia_olivesma",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
}

// Pool de conexão MySQL
let mysqlPool: mysql.Pool | null = null

// Função para carregar configurações do sistema
export function loadDatabaseConfig() {
  if (typeof window === "undefined") {
    dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      database: process.env.DB_NAME || "farmacia_olivesma",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    }
  }
}

// Inicializar conexão com MySQL
async function initMySQLConnection() {
  try {
    if (mysqlPool) {
      await mysqlPool.end()
    }

    const config: mysql.PoolOptions = {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
    }

    mysqlPool = mysql.createPool(config)

    // Testar conexão
    const connection = await mysqlPool.getConnection()
    await connection.ping()
    connection.release()
    console.log("✅ Conectado ao MySQL")
    return mysqlPool
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error)
    throw error
  }
}

// Função para obter conexão ativa
export async function getConnection() {
  loadDatabaseConfig()

  if (!mysqlPool) {
    await initMySQLConnection()
  }
  return mysqlPool
}

// Função para testar conexão
export async function testConnection(): Promise<{ success: boolean; message: string; config?: any }> {
  try {
    loadDatabaseConfig()

    const pool = await initMySQLConnection()
    const [rows] = await pool!.execute("SELECT 1 as test, NOW() as current_time")
    return {
      success: true,
      message: `Conexão MySQL estabelecida com sucesso! Servidor: ${dbConfig.host}:${dbConfig.port}`,
      config: {
        type: "MySQL",
        server: `${dbConfig.host}:${dbConfig.port}`,
        database: dbConfig.database,
        user: dbConfig.user,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro na conexão: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      config: {
        type: "MySQL",
        attempted_server: `${dbConfig.host}:${dbConfig.port}`,
        database: dbConfig.database,
      },
    }
  }
}

// Tipos TypeScript para as tabelas
export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  phone?: string
  role: "admin" | "seller" | "pharmacist"
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Customer {
  id: string
  email?: string
  phone: string
  first_name: string
  last_name: string
  password_hash?: string
  birth_date?: Date
  gender?: string
  address?: string
  municipality?: string
  province?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: Date
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
  expiry_date?: Date
  barcode?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
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
  confirmed_at?: Date
  delivered_at?: Date
  created_at: Date
  updated_at: Date
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
  created_at: Date
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
  created_at: Date
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
  created_at: Date
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value?: string
  description?: string
  updated_by?: string
  updated_at: Date
}

// Operações de banco de dados
export const dbOperations = {
  // Usuários (funcionários)
  async getUserByEmail(email: string): Promise<{ data: User | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", [email])

      return {
        data: (rows as any[]).length > 0 ? (rows as any[])[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createUser(userData: Partial<User>): Promise<{ data: User | null; error: any }> {
    try {
      const pool = await getConnection()
      const id = crypto.randomUUID()

      await pool!.execute(
        `
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
        [
          id,
          userData.email,
          userData.password_hash,
          userData.first_name,
          userData.last_name,
          userData.phone || null,
          userData.role,
        ],
      )

      return {
        data: {
          id,
          ...userData,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        } as User,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()

      const fields = []
      const values = []

      if (userData.email !== undefined) {
        fields.push("email = ?")
        values.push(userData.email)
      }
      if (userData.first_name !== undefined) {
        fields.push("first_name = ?")
        values.push(userData.first_name)
      }
      if (userData.last_name !== undefined) {
        fields.push("last_name = ?")
        values.push(userData.last_name)
      }
      if (userData.phone !== undefined) {
        fields.push("phone = ?")
        values.push(userData.phone)
      }
      if (userData.role !== undefined) {
        fields.push("role = ?")
        values.push(userData.role)
      }
      if (userData.password_hash !== undefined) {
        fields.push("password_hash = ?")
        values.push(userData.password_hash)
      }
      if (userData.is_active !== undefined) {
        fields.push("is_active = ?")
        values.push(userData.is_active)
      }

      fields.push("updated_at = NOW()")
      values.push(userId)

      const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`

      await pool!.execute(query, values)

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async deleteUser(userId: string): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()
      await pool!.execute("UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?", [userId])

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async getAllUsers(): Promise<{ data: User[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(`
        SELECT * FROM users 
        WHERE is_active = 1 
        ORDER BY first_name, last_name
      `)

      return { data: rows as User[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Clientes
  async getCustomerByEmail(email: string): Promise<{ data: Customer | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute("SELECT * FROM customers WHERE email = ? AND is_active = 1", [email])

      return {
        data: (rows as any[]).length > 0 ? (rows as any[])[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getCustomerByPhone(phone: string): Promise<{ data: Customer | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute("SELECT * FROM customers WHERE phone = ? AND is_active = 1", [phone])

      return {
        data: (rows as any[]).length > 0 ? (rows as any[])[0] : null,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getCustomerWithOrders(customerId: string): Promise<{ data: any | null; error: any }> {
    try {
      const pool = await getConnection()

      // Buscar cliente
      const [customerRows] = await pool!.execute("SELECT * FROM customers WHERE id = ?", [customerId])

      if ((customerRows as any[]).length === 0) {
        return { data: null, error: null }
      }

      const customer = (customerRows as any[])[0]

      // Buscar pedidos do cliente com itens
      const [orderRows] = await pool!.execute(
        `
        SELECT o.*, 
               COUNT(oi.id) as total_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `,
        [customerId],
      )

      // Para cada pedido, buscar os itens
      const ordersWithItems = []
      for (const order of orderRows as any[]) {
        const [itemRows] = await pool!.execute(
          `
          SELECT oi.*, p.name as product_name, p.code as product_code
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `,
          [order.id],
        )

        ordersWithItems.push({
          ...order,
          items: itemRows,
        })
      }

      return {
        data: {
          ...customer,
          orders: ordersWithItems,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createCustomer(customerData: Partial<Customer>): Promise<{ data: Customer | null; error: any }> {
    try {
      const pool = await getConnection()
      const id = crypto.randomUUID()

      await pool!.execute(
        `
        INSERT INTO customers (id, phone, first_name, last_name, email, password_hash, birth_date,
                             gender, address, municipality, province, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
        [
          id,
          customerData.phone,
          customerData.first_name,
          customerData.last_name,
          customerData.email || null,
          customerData.password_hash || null,
          customerData.birth_date || null,
          customerData.gender || null,
          customerData.address || null,
          customerData.municipality || null,
          customerData.province || null,
        ],
      )

      return {
        data: {
          id,
          ...customerData,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        } as Customer,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateCustomer(customerId: string, customerData: Partial<Customer>): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()

      const fields = []
      const values = []

      if (customerData.first_name !== undefined) {
        fields.push("first_name = ?")
        values.push(customerData.first_name)
      }
      if (customerData.last_name !== undefined) {
        fields.push("last_name = ?")
        values.push(customerData.last_name)
      }
      if (customerData.email !== undefined) {
        fields.push("email = ?")
        values.push(customerData.email)
      }
      if (customerData.phone !== undefined) {
        fields.push("phone = ?")
        values.push(customerData.phone)
      }
      if (customerData.address !== undefined) {
        fields.push("address = ?")
        values.push(customerData.address)
      }
      if (customerData.municipality !== undefined) {
        fields.push("municipality = ?")
        values.push(customerData.municipality)
      }
      if (customerData.province !== undefined) {
        fields.push("province = ?")
        values.push(customerData.province)
      }
      if (customerData.birth_date !== undefined) {
        fields.push("birth_date = ?")
        values.push(customerData.birth_date)
      }
      if (customerData.gender !== undefined) {
        fields.push("gender = ?")
        values.push(customerData.gender)
      }
      if (customerData.is_active !== undefined) {
        fields.push("is_active = ?")
        values.push(customerData.is_active)
      }

      fields.push("updated_at = NOW()")
      values.push(customerId)

      const query = `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`

      await pool!.execute(query, values)

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async getAllCustomers(): Promise<{ data: Customer[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(`
        SELECT * FROM customers 
        WHERE is_active = 1 
        ORDER BY first_name, last_name
      `)

      return { data: rows as Customer[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Produtos
  async getProducts(search?: string): Promise<{ data: Product[] | null; error: any }> {
    try {
      const pool = await getConnection()

      let query = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
      `

      const params: any[] = []

      if (search) {
        query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.active_ingredient LIKE ? OR p.code LIKE ?)`
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm, searchTerm)
      }

      query += ` ORDER BY p.name`

      const [rows] = await pool!.execute(query, params)

      const products = (rows as any[]).map((row) => ({
        ...row,
        categories: row.category_name
          ? {
              id: row.category_id,
              name: row.category_name,
              description: row.category_description,
            }
          : undefined,
      }))

      return { data: products, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getProductById(id: string): Promise<{ data: Product | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(
        `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = 1
      `,
        [id],
      )

      if ((rows as any[]).length === 0) {
        return { data: null, error: null }
      }

      const row = (rows as any[])[0]
      const product = {
        ...row,
        categories: row.category_name
          ? {
              id: row.category_id,
              name: row.category_name,
              description: row.category_description,
            }
          : undefined,
      }

      return { data: product, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createProduct(productData: Partial<Product>): Promise<{ data: Product | null; error: any }> {
    try {
      const pool = await getConnection()
      const id = crypto.randomUUID()

      await pool!.execute(
        `
        INSERT INTO products (id, code, name, description, category_id, price_kwanza, cost_price, 
                             stock_quantity, min_stock_level, requires_prescription, active_ingredient,
                             dosage, manufacturer, batch_number, expiry_date, barcode, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
        [
          id,
          productData.code,
          productData.name,
          productData.description || null,
          productData.category_id || null,
          productData.price_kwanza,
          productData.cost_price || null,
          productData.stock_quantity || 0,
          productData.min_stock_level || 0,
          productData.requires_prescription || false,
          productData.active_ingredient || null,
          productData.dosage || null,
          productData.manufacturer || null,
          productData.batch_number || null,
          productData.expiry_date || null,
          productData.barcode || null,
        ],
      )

      return {
        data: {
          id,
          ...productData,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        } as Product,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateProduct(productId: string, productData: Partial<Product>): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()

      const fields = []
      const values = []

      if (productData.code !== undefined) {
        fields.push("code = ?")
        values.push(productData.code)
      }
      if (productData.name !== undefined) {
        fields.push("name = ?")
        values.push(productData.name)
      }
      if (productData.description !== undefined) {
        fields.push("description = ?")
        values.push(productData.description)
      }
      if (productData.category_id !== undefined) {
        fields.push("category_id = ?")
        values.push(productData.category_id)
      }
      if (productData.price_kwanza !== undefined) {
        fields.push("price_kwanza = ?")
        values.push(productData.price_kwanza)
      }
      if (productData.cost_price !== undefined) {
        fields.push("cost_price = ?")
        values.push(productData.cost_price)
      }
      if (productData.stock_quantity !== undefined) {
        fields.push("stock_quantity = ?")
        values.push(productData.stock_quantity)
      }
      if (productData.min_stock_level !== undefined) {
        fields.push("min_stock_level = ?")
        values.push(productData.min_stock_level)
      }
      if (productData.requires_prescription !== undefined) {
        fields.push("requires_prescription = ?")
        values.push(productData.requires_prescription)
      }
      if (productData.active_ingredient !== undefined) {
        fields.push("active_ingredient = ?")
        values.push(productData.active_ingredient)
      }
      if (productData.dosage !== undefined) {
        fields.push("dosage = ?")
        values.push(productData.dosage)
      }
      if (productData.manufacturer !== undefined) {
        fields.push("manufacturer = ?")
        values.push(productData.manufacturer)
      }
      if (productData.batch_number !== undefined) {
        fields.push("batch_number = ?")
        values.push(productData.batch_number)
      }
      if (productData.expiry_date !== undefined) {
        fields.push("expiry_date = ?")
        values.push(productData.expiry_date)
      }
      if (productData.barcode !== undefined) {
        fields.push("barcode = ?")
        values.push(productData.barcode)
      }

      fields.push("updated_at = NOW()")
      values.push(productId)

      const query = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`

      await pool!.execute(query, values)

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async deleteProduct(productId: string): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()
      await pool!.execute("UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?", [productId])

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async updateProductStock(productId: string, newStock: number): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()
      await pool!.execute("UPDATE products SET stock_quantity = ?, updated_at = NOW() WHERE id = ?", [
        newStock,
        productId,
      ])

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  // Categorias
  async getCategories(): Promise<{ data: Category[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(`
        SELECT * FROM categories 
        WHERE is_active = 1 
        ORDER BY name
      `)

      return { data: rows as Category[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createCategory(categoryData: Partial<Category>): Promise<{ data: Category | null; error: any }> {
    try {
      const pool = await getConnection()
      const id = crypto.randomUUID()

      await pool!.execute(
        `
        INSERT INTO categories (id, name, description, is_active, created_at)
        VALUES (?, ?, ?, 1, NOW())
      `,
        [id, categoryData.name, categoryData.description || null],
      )

      return {
        data: {
          id,
          ...categoryData,
          is_active: true,
          created_at: new Date(),
        } as Category,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Pedidos
  async createOrder(orderData: Partial<Order>): Promise<{ data: Order | null; error: any }> {
    try {
      const pool = await getConnection()
      const id = crypto.randomUUID()

      await pool!.execute(
        `
        INSERT INTO orders (id, order_number, customer_id, status, total_amount, iva_amount, subtotal,
                           delivery_address, delivery_fee, notes, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
        [
          id,
          orderData.order_number,
          orderData.customer_id || null,
          orderData.status || "pending",
          orderData.total_amount,
          orderData.iva_amount,
          orderData.subtotal,
          orderData.delivery_address || null,
          orderData.delivery_fee || 0,
          orderData.notes || null,
          orderData.created_by || null,
        ],
      )

      return {
        data: {
          id,
          ...orderData,
          created_at: new Date(),
          updated_at: new Date(),
        } as Order,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createOrderItems(orderItems: Partial<OrderItem>[]): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()

      for (const item of orderItems) {
        const id = crypto.randomUUID()
        await pool!.execute(
          `
          INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `,
          [id, item.order_id, item.product_id, item.quantity, item.unit_price, item.total_price],
        )
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async getAllOrders(): Promise<{ data: Order[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(`
        SELECT o.*, 
               c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone,
               u.first_name as created_by_first_name, u.last_name as created_by_last_name,
               COUNT(oi.id) as total_items
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN users u ON o.created_by = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `)

      return { data: rows as Order[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getOrderById(orderId: string): Promise<{ data: any | null; error: any }> {
    try {
      const pool = await getConnection()

      // Buscar pedido
      const [orderRows] = await pool!.execute(
        `
        SELECT o.*, 
               c.first_name as customer_first_name, c.last_name as customer_last_name, 
               c.phone as customer_phone, c.email as customer_email,
               u.first_name as created_by_first_name, u.last_name as created_by_last_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN users u ON o.created_by = u.id
        WHERE o.id = ?
      `,
        [orderId],
      )

      if ((orderRows as any[]).length === 0) {
        return { data: null, error: null }
      }

      const order = (orderRows as any[])[0]

      // Buscar itens do pedido
      const [itemRows] = await pool!.execute(
        `
        SELECT oi.*, p.name as product_name, p.code as product_code
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `,
        [orderId],
      )

      return {
        data: {
          ...order,
          items: itemRows,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateOrderStatus(orderId: string, status: string, userId?: string): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()

      let query = "UPDATE orders SET status = ?, updated_at = NOW()"
      const params: any[] = [status, orderId]

      if (status === "confirmed" && userId) {
        query += ", confirmed_by = ?, confirmed_at = NOW()"
        params.splice(1, 0, userId)
      } else if (status === "delivered") {
        query += ", delivered_at = NOW()"
      }

      query += " WHERE id = ?"

      await pool!.execute(query, params)

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  // Vendas (POS)
  async createSale(saleData: Partial<Sale>): Promise<{ data: Sale | null; error: any }> {
    try {
      const pool = await getConnection()
      const id = crypto.randomUUID()

      await pool!.execute(
        `
        INSERT INTO sales (id, sale_number, customer_id, cashier_id, total_amount, iva_amount, subtotal,
                          payment_method, payment_reference, change_amount, receipt_printed, saft_exported, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
      `,
        [
          id,
          saleData.sale_number,
          saleData.customer_id || null,
          saleData.cashier_id,
          saleData.total_amount,
          saleData.iva_amount,
          saleData.subtotal,
          saleData.payment_method,
          saleData.payment_reference || null,
          saleData.change_amount,
        ],
      )

      return {
        data: {
          id,
          ...saleData,
          receipt_printed: false,
          saft_exported: false,
          created_at: new Date(),
        } as Sale,
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async createSaleItems(saleItems: Partial<SaleItem>[]): Promise<{ data: boolean; error: any }> {
    try {
      const pool = await getConnection()

      for (const item of saleItems) {
        const id = crypto.randomUUID()
        await pool!.execute(
          `
          INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price, iva_rate, iva_amount, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
          [
            id,
            item.sale_id,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.total_price,
            item.iva_rate,
            item.iva_amount,
          ],
        )
      }

      return { data: true, error: null }
    } catch (error) {
      return { data: false, error }
    }
  },

  async getSales(limit = 50): Promise<{ data: Sale[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(
        `
        SELECT s.*, 
               c.first_name as customer_first_name, c.last_name as customer_last_name,
               u.first_name as cashier_first_name, u.last_name as cashier_last_name
        FROM sales s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.cashier_id = u.id
        ORDER BY s.created_at DESC
        LIMIT ?
      `,
        [limit],
      )

      return { data: rows as Sale[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Relatórios
  async getSalesReport(startDate?: string, endDate?: string, type?: string): Promise<{ data: any | null; error: any }> {
    try {
      const pool = await getConnection()

      let dateFilter = ""
      const params: any[] = []

      if (startDate && endDate) {
        dateFilter = "WHERE DATE(s.created_at) BETWEEN ? AND ?"
        params.push(startDate, endDate)
      } else if (type === "daily") {
        dateFilter = "WHERE DATE(s.created_at) = CURDATE()"
      } else if (type === "monthly") {
        dateFilter = "WHERE MONTH(s.created_at) = MONTH(NOW()) AND YEAR(s.created_at) = YEAR(NOW())"
      }

      // Vendas por período
      const [salesRows] = await pool!.execute(
        `
        SELECT s.*, si.*, p.name as product_name, p.code as product_code,
               c.first_name as customer_first_name, c.last_name as customer_last_name
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        LEFT JOIN products p ON si.product_id = p.id
        LEFT JOIN customers c ON s.customer_id = c.id
        ${dateFilter}
        ORDER BY s.created_at DESC
      `,
        params,
      )

      // Produtos mais vendidos
      const [topProductsRows] = await pool!.execute(
        `
        SELECT p.name, p.code, SUM(si.quantity) as total_quantity, SUM(si.total_price) as total_revenue
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        LEFT JOIN sales s ON si.sale_id = s.id
        ${dateFilter.replace("s.created_at", "s.created_at")}
        GROUP BY p.id, p.name, p.code
        ORDER BY total_quantity DESC
        LIMIT 10
      `,
        params,
      )

      // Resumo financeiro
      const [summaryRows] = await pool!.execute(
        `
        SELECT 
          COUNT(*) as total_sales,
          SUM(total_amount) as total_revenue,
          SUM(iva_amount) as total_iva,
          SUM(subtotal) as total_subtotal,
          AVG(total_amount) as average_sale
        FROM sales s
        ${dateFilter}
      `,
        params,
      )

      return {
        data: {
          sales: salesRows,
          topProducts: topProductsRows,
          summary: (summaryRows as any[])[0],
          period: { startDate, endDate, type },
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // SAF-T Data
  async generateSAFTData(startDate: string, endDate: string, type: string): Promise<{ data: any | null; error: any }> {
    try {
      const pool = await getConnection()

      // Vendas com itens
      const [salesRows] = await pool!.execute(
        `
        SELECT s.*, si.*, p.name as product_name, p.code as product_code,
               c.first_name as customer_first_name, c.last_name as customer_last_name,
               u.first_name as cashier_first_name, u.last_name as cashier_last_name
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        LEFT JOIN products p ON si.product_id = p.id
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN users u ON s.cashier_id = u.id
        WHERE DATE(s.created_at) BETWEEN ? AND ?
        ORDER BY s.created_at
      `,
        [startDate, endDate],
      )

      // Clientes
      const [customersRows] = await pool!.execute(
        `
        SELECT DISTINCT c.*
        FROM customers c
        INNER JOIN sales s ON c.id = s.customer_id
        WHERE DATE(s.created_at) BETWEEN ? AND ?
      `,
        [startDate, endDate],
      )

      // Produtos
      const [productsRows] = await pool!.execute(
        `
        SELECT DISTINCT p.*, cat.name as category_name
        FROM products p
        LEFT JOIN categories cat ON p.category_id = cat.id
        INNER JOIN sale_items si ON p.id = si.product_id
        INNER JOIN sales s ON si.sale_id = s.id
        WHERE DATE(s.created_at) BETWEEN ? AND ?
      `,
        [startDate, endDate],
      )

      // Agrupar vendas por sale_id
      const salesMap = new Map()
      for (const row of salesRows as any[]) {
        if (!salesMap.has(row.sale_id || row.id)) {
          salesMap.set(row.sale_id || row.id, {
            ...row,
            items: [],
          })
        }
        if (row.product_id) {
          salesMap.get(row.sale_id || row.id).items.push({
            product_id: row.product_id,
            product_name: row.product_name,
            product_code: row.product_code,
            quantity: row.quantity,
            unit_price: row.unit_price,
            total_price: row.total_price,
            iva_rate: row.iva_rate,
            iva_amount: row.iva_amount,
          })
        }
      }

      const sales = Array.from(salesMap.values())

      // Pagamentos (baseado nas vendas)
      const payments = sales.map((sale: any) => ({
        id: sale.id,
        reference: sale.sale_number,
        method: sale.payment_method,
        amount: sale.total_amount,
        customer_id: sale.customer_id,
        cashier_id: sale.cashier_id,
        created_at: sale.created_at,
      }))

      // Totais
      const totalSales = sales.reduce((sum: number, sale: any) => sum + sale.total_amount, 0)
      const totalPayments = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)

      return {
        data: {
          startDate,
          endDate,
          type,
          sales,
          customers: customersRows,
          products: productsRows,
          payments,
          totalSales,
          totalPayments,
          accounts: [
            { id: "11", description: "Caixa", standard_id: "11" },
            { id: "211", description: "Clientes", standard_id: "211" },
            { id: "221", description: "Fornecedores", standard_id: "221" },
            { id: "71", description: "Vendas", standard_id: "71" },
          ],
          suppliers: [], // Adicionar fornecedores se necessário
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Configurações do sistema
  async getSystemSettings(): Promise<{ data: SystemSetting[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute("SELECT * FROM system_settings ORDER BY setting_key")

      return { data: rows as SystemSetting[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Estatísticas
  async getDashboardStats(): Promise<{ data: any | null; error: any }> {
    try {
      const pool = await getConnection()

      // Total de usuários
      const [userRows] = await pool!.execute("SELECT COUNT(*) as total FROM users WHERE is_active = 1")
      const totalUsers = (userRows as any[])[0].total

      // Total de produtos
      const [productRows] = await pool!.execute("SELECT COUNT(*) as total FROM products WHERE is_active = 1")
      const totalProducts = (productRows as any[])[0].total

      // Total de pedidos este mês
      const [orderRows] = await pool!.execute(`
        SELECT COUNT(*) as total FROM orders 
        WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
      `)
      const totalOrders = (orderRows as any[])[0].total

      // Total de vendas este mês
      const [saleRows] = await pool!.execute(`
        SELECT COUNT(*) as total FROM sales 
        WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
      `)
      const totalSales = (saleRows as any[])[0].total

      // Produtos com estoque baixo
      const [lowStockRows] = await pool!.execute(`
        SELECT COUNT(*) as total FROM products 
        WHERE stock_quantity <= min_stock_level AND is_active = 1
      `)
      const lowStockProducts = (lowStockRows as any[])[0].total

      // Pedidos pendentes
      const [pendingRows] = await pool!.execute("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'")
      const pendingOrders = (pendingRows as any[])[0].total

      // Receita hoje
      const [todayRevenueRows] = await pool!.execute(`
        SELECT COALESCE(SUM(total_amount), 0) as total FROM sales 
        WHERE DATE(created_at) = CURDATE()
      `)
      const todayRevenue = (todayRevenueRows as any[])[0].total

      // Receita mensal
      const [monthlyRevenueRows] = await pool!.execute(`
        SELECT COALESCE(SUM(total_amount), 0) as total FROM sales 
        WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())
      `)
      const monthlyRevenue = (monthlyRevenueRows as any[])[0].total

      return {
        data: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalSales,
          lowStockProducts,
          pendingOrders,
          todayRevenue,
          monthlyRevenue,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getRecentOrders(limit = 10): Promise<{ data: any[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(
        `
        SELECT o.*, 
               c.first_name as customer_first_name, c.last_name as customer_last_name,
               TIME(o.created_at) as time
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE DATE(o.created_at) = CURDATE()
        ORDER BY o.created_at DESC
        LIMIT ?
      `,
        [limit],
      )

      return { data: rows as any[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getLowStockProducts(limit = 10): Promise<{ data: any[] | null; error: any }> {
    try {
      const pool = await getConnection()
      const [rows] = await pool!.execute(
        `
        SELECT name, stock_quantity, min_stock_level
        FROM products 
        WHERE stock_quantity <= min_stock_level AND is_active = 1
        ORDER BY (stock_quantity / min_stock_level) ASC
        LIMIT ?
      `,
        [limit],
      )

      return { data: rows as any[], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },
}

// Função para verificar se o banco está configurado
export function isDatabaseConfigured(): boolean {
  if (typeof window !== "undefined") {
    return false
  }

  loadDatabaseConfig()
  return !!(dbConfig.host && dbConfig.database)
}

// Exportar configuração atual
export function getCurrentDatabaseConfig(): DatabaseConfig {
  loadDatabaseConfig()
  return { ...dbConfig }
}
