const { testConnection } = require("../lib/database")

async function main() {
  console.log("🔍 Testando conexão com banco de dados MySQL...")
  console.log("=".repeat(50))

  try {
    const result = await testConnection()

    if (result.success) {
      console.log("✅ SUCESSO!")
      console.log(`📝 ${result.message}`)

      if (result.config) {
        console.log("\n📊 Configuração:")
        console.log(`   Tipo: ${result.config.type}`)
        console.log(`   Servidor: ${result.config.server}`)
        console.log(`   Database: ${result.config.database}`)
        if (result.config.user) {
          console.log(`   Usuário: ${result.config.user}`)
        }
      }

      console.log("\n🎉 O banco de dados MySQL está funcionando corretamente!")
    } else {
      console.log("❌ ERRO!")
      console.log(`📝 ${result.message}`)

      if (result.config) {
        console.log("\n📊 Configuração tentada:")
        console.log(`   Tipo: ${result.config.type}`)
        console.log(`   Servidor: ${result.config.attempted_server}`)
        console.log(`   Database: ${result.config.database}`)
      }

      console.log("\n💡 Verifique:")
      console.log("   1. Se o MySQL está rodando")
      console.log("   2. Se as configurações no .env.local estão corretas")
      console.log("   3. Se as tabelas foram criadas")
      console.log("   4. Se o usuário tem permissões adequadas")
    }
  } catch (error) {
    console.log("❌ ERRO INESPERADO!")
    console.log(`📝 ${error.message}`)
  }

  console.log("=".repeat(50))
}

main()
