const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  database: process.env.DB_NAME || "farmacia_olivesma",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
}

async function setupInitialData() {
  let connection

  try {
    console.log("🔗 Conectando ao banco de dados...")
    connection = await mysql.createConnection(dbConfig)

    console.log("✅ Conectado ao MySQL")

    // 1. Criar usuário administrador
    console.log("👨‍💼 Criando usuário administrador...")

    const adminPassword = "admin123"
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

    const adminId = "admin-001"

    // Verificar se admin já existe
    const [existingAdmin] = await connection.execute("SELECT id FROM users WHERE email = ?", [
      "admin@farmaciaolivesma.ao",
    ])

    if (existingAdmin.length === 0) {
      await connection.execute(
        `
        INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
        [adminId, "admin@farmaciaolivesma.ao", adminPasswordHash, "Administrador", "Sistema", "+244923456789", "admin"],
      )
      console.log("✅ Administrador criado com sucesso")
    } else {
      console.log("ℹ️ Administrador já existe")
    }

    // 2. Criar cliente de teste
    console.log("👤 Criando cliente de teste...")

    const clientPassword = "cliente123"
    const clientPasswordHash = await bcrypt.hash(clientPassword, 12)

    const clientId = "client-001"

    // Verificar se cliente já existe
    const [existingClient] = await connection.execute("SELECT id FROM customers WHERE email = ?", ["cliente@teste.com"])

    if (existingClient.length === 0) {
      await connection.execute(
        `
        INSERT INTO customers (id, phone, first_name, last_name, email, password_hash, address, municipality, province, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
        [
          clientId,
          "+244987654321",
          "João",
          "Silva",
          "cliente@teste.com",
          clientPasswordHash,
          "Rua das Flores, 123, Bairro Olivesma",
          "Luanda",
          "Luanda",
        ],
      )
      console.log("✅ Cliente de teste criado com sucesso")
    } else {
      console.log("ℹ️ Cliente de teste já existe")
    }

    // 3. Verificar dados criados
    console.log("🔍 Verificando dados criados...")

    const [adminCheck] = await connection.execute(
      "SELECT id, email, first_name, last_name, role FROM users WHERE email = ?",
      ["admin@farmaciaolivesma.ao"],
    )

    const [clientCheck] = await connection.execute(
      "SELECT id, email, first_name, last_name FROM customers WHERE email = ?",
      ["cliente@teste.com"],
    )

    console.log("📊 Dados verificados:")
    console.log("Admin:", adminCheck[0])
    console.log("Cliente:", clientCheck[0])

    console.log("🎉 Setup inicial concluído com sucesso!")
    console.log("")
    console.log("📋 CREDENCIAIS PARA TESTE:")
    console.log("👨‍💼 ADMINISTRADOR:")
    console.log("   Email: admin@farmaciaolivesma.ao")
    console.log("   Senha: admin123")
    console.log("")
    console.log("👤 CLIENTE:")
    console.log("   Email: cliente@teste.com")
    console.log("   Senha: cliente123")
    console.log("")
  } catch (error) {
    console.error("❌ Erro no setup inicial:", error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexão fechada")
    }
  }
}

// Executar setup
if (require.main === module) {
  setupInitialData()
    .then(() => {
      console.log("✅ Setup concluído")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Erro:", error)
      process.exit(1)
    })
}

module.exports = { setupInitialData }
