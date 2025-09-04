import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("🔍 Testando conexão com Supabase...")
console.log("URL:", supabaseUrl)
console.log("Key:", supabaseKey ? "Configurada ✅" : "Não configurada ❌")

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log("\n📊 Testando conexão com o banco...")

    // Teste 1: Verificar se consegue conectar
    const { data, error } = await supabase.from("products").select("count").limit(1)

    if (error) {
      console.error("❌ Erro na conexão:", error.message)

      if (error.message.includes('relation "products" does not exist')) {
        console.log('\n💡 A tabela "products" não existe. Execute os scripts SQL primeiro!')
        console.log("1. Vá para o Supabase Dashboard")
        console.log("2. Acesse SQL Editor")
        console.log("3. Execute o script create-database.sql")
        console.log("4. Execute o script seed-data.sql")
      }

      return false
    }

    console.log("✅ Conexão estabelecida com sucesso!")

    // Teste 2: Verificar tabelas principais
    console.log("\n📋 Verificando tabelas...")

    const tables = ["products", "categories", "customers", "sales", "orders"]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("count").limit(1)
        if (error) {
          console.log(`❌ Tabela "${table}": ${error.message}`)
        } else {
          console.log(`✅ Tabela "${table}": OK`)
        }
      } catch (err) {
        console.log(`❌ Tabela "${table}": Erro na verificação`)
      }
    }

    // Teste 3: Verificar dados de exemplo
    console.log("\n📦 Verificando dados de exemplo...")

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price_kwanza")
      .limit(3)

    if (productsError) {
      console.log("❌ Erro ao buscar produtos:", productsError.message)
    } else {
      console.log(`✅ Encontrados ${products?.length || 0} produtos`)
      if (products && products.length > 0) {
        products.forEach((product) => {
          console.log(`   - ${product.name}: ${product.price_kwanza} Kz`)
        })
      }
    }

    const { data: categories, error: categoriesError } = await supabase.from("categories").select("id, name").limit(3)

    if (categoriesError) {
      console.log("❌ Erro ao buscar categorias:", categoriesError.message)
    } else {
      console.log(`✅ Encontradas ${categories?.length || 0} categorias`)
      if (categories && categories.length > 0) {
        categories.forEach((category) => {
          console.log(`   - ${category.name}`)
        })
      }
    }

    console.log("\n🎉 Teste de conexão concluído!")
    return true
  } catch (error) {
    console.error("❌ Erro inesperado:", error)
    return false
  }
}

testConnection()
