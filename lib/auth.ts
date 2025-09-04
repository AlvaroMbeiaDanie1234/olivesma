import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "farmacia-olivesma-secret-key-2024"

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "seller" | "pharmacist" | "customer"
  phone?: string
  type: "employee" | "customer"
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Gerar token JWT
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

// Verificar token JWT
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      email: decoded.email,
      first_name: decoded.first_name || "",
      last_name: decoded.last_name || "",
      role: decoded.role,
      phone: decoded.phone,
      type: decoded.type,
    }
  } catch (error) {
    return null
  }
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar senha
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

// Validar telefone angolano
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+244|244)?[9][0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Formatar telefone
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")

  if (cleaned.startsWith("244")) {
    return `+${cleaned}`
  } else if (cleaned.startsWith("9") && cleaned.length === 9) {
    return `+244${cleaned}`
  }

  return phone
}

// Validar nome
export function isValidName(name: string): boolean {
  return name.trim().length >= 2
}
