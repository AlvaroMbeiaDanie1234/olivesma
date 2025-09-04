const fs = require("fs")
const path = require("path")

function main() {
  console.log("🚀 Configurando Sistema Farmácia Olivesma - MySQL")
  console.log("=".repeat(50))

  // Verificar se .env.local existe
  const envPath = path.join(process.cwd(), ".env.local")

  if (!fs.existsSync(envPath)) {
    console.log("⚠️  Arquivo .env.local não encontrado!")
    console.log("📋 Siga estes passos:")
    console.log("   1. Copie o arquivo .env.example para .env.local")
    console.log("   2. Configure suas credenciais MySQL")
    console.log("   3. Execute este script novamente")
    return
  }

  console.log("✅ Arquivo .env.local encontrado")
  console.log("📊 Configurado para usar MySQL")

  console.log("\n📋 Próximos passos:")
  console.log("   1. Execute os scripts SQL na ordem:")
  console.log("      - scripts/create-database-mysql.sql")
  console.log("      - scripts/seed-data-mysql.sql")
  console.log("   2. Teste a conexão: npm run db:test")
  console.log("   3. Inicie o sistema: npm run dev")

  console.log("\n🔑 Credenciais padrão após executar os scripts:")
  console.log("   Admin: admin@farmaciaolivesma.ao / admin123")
  console.log("   Cliente: cliente@exemplo.com / admin123")

  console.log("\n💡 Funcionalidades implementadas:")
  console.log("   ✅ Pesquisa na página inicial")
  console.log("   ✅ POS (Ponto de Venda) completo")
  console.log("   ✅ Controle de estoque automático")
  console.log("   ✅ Sistema de autenticação")
  console.log("   ✅ Gestão de clientes")

  console.log("=".repeat(50))
}

main()
