const bcrypt = require("bcryptjs")

// Dados iniciais para popular o banco
const initialData = {
  // Usuário administrador padrão
  admin: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "admin@farmaciaolivesma.ao",
    password: "admin123", // Será hasheada
    first_name: "Administrador",
    last_name: "Sistema",
    phone: "+244923456789",
    role: "admin",
  },

  // Cliente exemplo
  customer: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "cliente@exemplo.com",
    password: "cliente123", // Será hasheada
    first_name: "João",
    last_name: "Silva",
    phone: "+244987654321",
    address: "Rua da Independência, 123",
    municipality: "Luanda",
    province: "Luanda",
  },

  // Categorias de produtos
  categories: [
    {
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Analgésicos",
      description: "Medicamentos para alívio da dor",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440011",
      name: "Antibióticos",
      description: "Medicamentos para combater infecções bacterianas",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440012",
      name: "Vitaminas",
      description: "Suplementos vitamínicos e minerais",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440013",
      name: "Gastroenterologia",
      description: "Medicamentos para o sistema digestivo",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440014",
      name: "Cardiologia",
      description: "Medicamentos cardiovasculares",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440015",
      name: "Endocrinologia",
      description: "Medicamentos hormonais e para diabetes",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440016",
      name: "Dermatologia",
      description: "Medicamentos para a pele",
    },
  ],

  // Produtos iniciais
  products: [
    {
      id: "550e8400-e29b-41d4-a716-446655440020",
      code: "PAR500",
      name: "Paracetamol 500mg",
      description: "Analgésico e antipirético para alívio da dor e febre",
      category_id: "550e8400-e29b-41d4-a716-446655440010",
      price_kwanza: 850,
      cost_price: 600,
      stock_quantity: 100,
      min_stock_level: 10,
      requires_prescription: false,
      active_ingredient: "Paracetamol",
      dosage: "500mg",
      manufacturer: "Farmacêutica Angola",
      batch_number: "PAR2024001",
      expiry_date: "2025-12-31",
      barcode: "7891234567890",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440021",
      code: "AMO500",
      name: "Amoxicilina 500mg",
      description: "Antibiótico de amplo espectro para infecções bacterianas",
      category_id: "550e8400-e29b-41d4-a716-446655440011",
      price_kwanza: 2500,
      cost_price: 1800,
      stock_quantity: 50,
      min_stock_level: 5,
      requires_prescription: true,
      active_ingredient: "Amoxicilina",
      dosage: "500mg",
      manufacturer: "Antibióticos SA",
      batch_number: "AMO2024001",
      expiry_date: "2025-06-30",
      barcode: "7891234567891",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440022",
      code: "VIT1000",
      name: "Vitamina C 1000mg",
      description: "Suplemento vitamínico para fortalecimento do sistema imunológico",
      category_id: "550e8400-e29b-41d4-a716-446655440012",
      price_kwanza: 1200,
      cost_price: 800,
      stock_quantity: 200,
      min_stock_level: 20,
      requires_prescription: false,
      active_ingredient: "Ácido Ascórbico",
      dosage: "1000mg",
      manufacturer: "Vitaminas Angola",
      batch_number: "VIT2024001",
      expiry_date: "2026-03-31",
      barcode: "7891234567892",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440023",
      code: "OME20",
      name: "Omeprazol 20mg",
      description: "Inibidor da bomba de prótons para tratamento de úlceras",
      category_id: "550e8400-e29b-41d4-a716-446655440013",
      price_kwanza: 1800,
      cost_price: 1200,
      stock_quantity: 75,
      min_stock_level: 10,
      requires_prescription: true,
      active_ingredient: "Omeprazol",
      dosage: "20mg",
      manufacturer: "Gastro Farma",
      batch_number: "OME2024001",
      expiry_date: "2025-09-30",
      barcode: "7891234567893",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440024",
      code: "IBU400",
      name: "Ibuprofeno 400mg",
      description: "Anti-inflamatório não esteroidal para dor e inflamação",
      category_id: "550e8400-e29b-41d4-a716-446655440010",
      price_kwanza: 950,
      cost_price: 650,
      stock_quantity: 120,
      min_stock_level: 15,
      requires_prescription: false,
      active_ingredient: "Ibuprofeno",
      dosage: "400mg",
      manufacturer: "Farmacêutica Angola",
      batch_number: "IBU2024001",
      expiry_date: "2025-11-30",
      barcode: "7891234567894",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440025",
      code: "DIP500",
      name: "Dipirona 500mg",
      description: "Analgésico e antipirético de ação rápida",
      category_id: "550e8400-e29b-41d4-a716-446655440010",
      price_kwanza: 750,
      cost_price: 500,
      stock_quantity: 150,
      min_stock_level: 20,
      requires_prescription: false,
      active_ingredient: "Dipirona Sódica",
      dosage: "500mg",
      manufacturer: "Analgésicos Ltda",
      batch_number: "DIP2024001",
      expiry_date: "2025-08-31",
      barcode: "7891234567895",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440026",
      code: "AZI500",
      name: "Azitromicina 500mg",
      description: "Antibiótico macrolídeo para infecções respiratórias",
      category_id: "550e8400-e29b-41d4-a716-446655440011",
      price_kwanza: 3200,
      cost_price: 2400,
      stock_quantity: 40,
      min_stock_level: 5,
      requires_prescription: true,
      active_ingredient: "Azitromicina",
      dosage: "500mg",
      manufacturer: "Antibióticos SA",
      batch_number: "AZI2024001",
      expiry_date: "2025-07-31",
      barcode: "7891234567896",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440027",
      code: "VITB12",
      name: "Vitamina B12 250mcg",
      description: "Suplemento de cobalamina para anemia e sistema nervoso",
      category_id: "550e8400-e29b-41d4-a716-446655440012",
      price_kwanza: 1500,
      cost_price: 1000,
      stock_quantity: 80,
      min_stock_level: 10,
      requires_prescription: false,
      active_ingredient: "Cianocobalamina",
      dosage: "250mcg",
      manufacturer: "Vitaminas Angola",
      batch_number: "B122024001",
      expiry_date: "2026-01-31",
      barcode: "7891234567897",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440028",
      code: "SIM40",
      name: "Sinvastatina 40mg",
      description: "Redutor de colesterol e protetor cardiovascular",
      category_id: "550e8400-e29b-41d4-a716-446655440014",
      price_kwanza: 2800,
      cost_price: 2000,
      stock_quantity: 60,
      min_stock_level: 8,
      requires_prescription: true,
      active_ingredient: "Sinvastatina",
      dosage: "40mg",
      manufacturer: "Cardio Farma",
      batch_number: "SIM2024001",
      expiry_date: "2025-10-31",
      barcode: "7891234567898",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440029",
      code: "LOS50",
      name: "Losartana 50mg",
      description: "Anti-hipertensivo para controle da pressão arterial",
      category_id: "550e8400-e29b-41d4-a716-446655440014",
      price_kwanza: 2200,
      cost_price: 1600,
      stock_quantity: 90,
      min_stock_level: 12,
      requires_prescription: true,
      active_ingredient: "Losartana Potássica",
      dosage: "50mg",
      manufacturer: "Cardio Farma",
      batch_number: "LOS2024001",
      expiry_date: "2025-12-31",
      barcode: "7891234567899",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440030",
      code: "MET850",
      name: "Metformina 850mg",
      description: "Antidiabético oral para controle da glicemia",
      category_id: "550e8400-e29b-41d4-a716-446655440015",
      price_kwanza: 1600,
      cost_price: 1100,
      stock_quantity: 110,
      min_stock_level: 15,
      requires_prescription: true,
      active_ingredient: "Cloridrato de Metformina",
      dosage: "850mg",
      manufacturer: "Diabetes Care",
      batch_number: "MET2024001",
      expiry_date: "2025-11-30",
      barcode: "7891234567800",
    },
  ],

  // Configurações do sistema
  settings: [
    {
      setting_key: "company_name",
      setting_value: "Farmácia Olivesma",
      description: "Nome da empresa",
    },
    {
      setting_key: "company_address",
      setting_value: "Rua Principal, Luanda - Angola",
      description: "Endereço da empresa",
    },
    {
      setting_key: "company_phone",
      setting_value: "+244 923 456 789",
      description: "Telefone da empresa",
    },
    {
      setting_key: "company_email",
      setting_value: "contato@farmaciaolivesma.ao",
      description: "Email da empresa",
    },
    {
      setting_key: "tax_rate",
      setting_value: "14.00",
      description: "Taxa de IVA (%)",
    },
    {
      setting_key: "currency",
      setting_value: "AOA",
      description: "Moeda padrão",
    },
    {
      setting_key: "delivery_fee",
      setting_value: "1500.00",
      description: "Taxa de entrega padrão",
    },
    {
      setting_key: "min_order_amount",
      setting_value: "2000.00",
      description: "Valor mínimo do pedido",
    },
  ],
}

// Função para gerar hash da senha
async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

// Função para gerar scripts SQL
async function generateSQLScripts() {
  const adminPasswordHash = await hashPassword(initialData.admin.password)
  const customerPasswordHash = await hashPassword(initialData.customer.password)

  // Script para SQL Server
  const sqlServerScript = `
-- Inserir usuário administrador
IF NOT EXISTS (SELECT 1 FROM users WHERE email = '${initialData.admin.email}')
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at)
    VALUES ('${initialData.admin.id}', '${initialData.admin.email}', '${adminPasswordHash}', 
            '${initialData.admin.first_name}', '${initialData.admin.last_name}', '${initialData.admin.phone}', 
            '${initialData.admin.role}', 1, GETDATE(), GETDATE());
END

-- Inserir cliente exemplo
IF NOT EXISTS (SELECT 1 FROM customers WHERE email = '${initialData.customer.email}')
BEGIN
    INSERT INTO customers (id, email, phone, first_name, last_name, password_hash, address, municipality, province, is_active, created_at, updated_at)
    VALUES ('${initialData.customer.id}', '${initialData.customer.email}', '${initialData.customer.phone}',
            '${initialData.customer.first_name}', '${initialData.customer.last_name}', '${customerPasswordHash}',
            '${initialData.customer.address}', '${initialData.customer.municipality}', '${initialData.customer.province}',
            1, GETDATE(), GETDATE());
END

-- Inserir categorias
${initialData.categories
  .map(
    (cat) => `
IF NOT EXISTS (SELECT 1 FROM categories WHERE id = '${cat.id}')
BEGIN
    INSERT INTO categories (id, name, description, is_active, created_at)
    VALUES ('${cat.id}', '${cat.name}', '${cat.description}', 1, GETDATE());
END`,
  )
  .join("\n")}

-- Inserir produtos
${initialData.products
  .map(
    (product) => `
IF NOT EXISTS (SELECT 1 FROM products WHERE id = '${product.id}')
BEGIN
    INSERT INTO products (id, code, name, description, category_id, price_kwanza, cost_price, stock_quantity, 
                         min_stock_level, requires_prescription, active_ingredient, dosage, manufacturer, 
                         batch_number, expiry_date, barcode, is_active, created_at, updated_at)
    VALUES ('${product.id}', '${product.code}', '${product.name}', '${product.description}', '${product.category_id}',
            ${product.price_kwanza}, ${product.cost_price}, ${product.stock_quantity}, ${product.min_stock_level},
            ${product.requires_prescription ? 1 : 0}, '${product.active_ingredient}', '${product.dosage}',
            '${product.manufacturer}', '${product.batch_number}', '${product.expiry_date}', '${product.barcode}',
            1, GETDATE(), GETDATE());
END`,
  )
  .join("\n")}

-- Inserir configurações do sistema
${initialData.settings
  .map(
    (setting) => `
IF NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = '${setting.setting_key}')
BEGIN
    INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at)
    VALUES (NEWID(), '${setting.setting_key}', '${setting.setting_value}', '${setting.description}', GETDATE());
END`,
  )
  .join("\n")}

PRINT 'Dados iniciais inseridos com sucesso no SQL Server!';
`

  // Script para MySQL
  const mysqlScript = `
-- Inserir usuário administrador
INSERT IGNORE INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at)
VALUES ('${initialData.admin.id}', '${initialData.admin.email}', '${adminPasswordHash}', 
        '${initialData.admin.first_name}', '${initialData.admin.last_name}', '${initialData.admin.phone}', 
        '${initialData.admin.role}', TRUE, NOW(), NOW());

-- Inserir cliente exemplo
INSERT IGNORE INTO customers (id, email, phone, first_name, last_name, password_hash, address, municipality, province, is_active, created_at, updated_at)
VALUES ('${initialData.customer.id}', '${initialData.customer.email}', '${initialData.customer.phone}',
        '${initialData.customer.first_name}', '${initialData.customer.last_name}', '${customerPasswordHash}',
        '${initialData.customer.address}', '${initialData.customer.municipality}', '${initialData.customer.province}',
        TRUE, NOW(), NOW());

-- Inserir categorias
${initialData.categories
  .map(
    (cat) => `
INSERT IGNORE INTO categories (id, name, description, is_active, created_at)
VALUES ('${cat.id}', '${cat.name}', '${cat.description}', TRUE, NOW());`,
  )
  .join("\n")}

-- Inserir produtos
${initialData.products
  .map(
    (product) => `
INSERT IGNORE INTO products (id, code, name, description, category_id, price_kwanza, cost_price, stock_quantity, 
                            min_stock_level, requires_prescription, active_ingredient, dosage, manufacturer, 
                            batch_number, expiry_date, barcode, is_active, created_at, updated_at)
VALUES ('${product.id}', '${product.code}', '${product.name}', '${product.description}', '${product.category_id}',
        ${product.price_kwanza}, ${product.cost_price}, ${product.stock_quantity}, ${product.min_stock_level},
        ${product.requires_prescription}, '${product.active_ingredient}', '${product.dosage}',
        '${product.manufacturer}', '${product.batch_number}', '${product.expiry_date}', '${product.barcode}',
        TRUE, NOW(), NOW());`,
  )
  .join("\n")}

-- Inserir configurações do sistema
${initialData.settings
  .map(
    (setting) => `
INSERT IGNORE INTO system_settings (id, setting_key, setting_value, description, updated_at)
VALUES (UUID(), '${setting.setting_key}', '${setting.setting_value}', '${setting.description}', NOW());`,
  )
  .join("\n")}

SELECT 'Dados iniciais inseridos com sucesso no MySQL!' as message;
`

  return {
    sqlServer: sqlServerScript,
    mysql: mysqlScript,
  }
}

// Exportar para uso em outros scripts
module.exports = {
  initialData,
  hashPassword,
  generateSQLScripts,
}

// Se executado diretamente, gerar os scripts
if (require.main === module) {
  generateSQLScripts()
    .then((scripts) => {
      console.log("=== SCRIPT SQL SERVER ===")
      console.log(scripts.sqlServer)
      console.log("\n=== SCRIPT MYSQL ===")
      console.log(scripts.mysql)
    })
    .catch(console.error)
}
