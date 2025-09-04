-- Script para criar banco de dados no MySQL/MariaDB
-- Farmácia Olivesma - Sistema de Gestão

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS farmacia_olivesma
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

SELECT '✅ Banco de dados farmacia_olivesma criado com sucesso!' as message;

USE farmacia_olivesma;

-- Tabela de usuários (funcionários)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'seller', 'pharmacist') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

SELECT '✅ Tabela users criada com sucesso!' as message;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    birth_date DATE,
    gender ENUM('M', 'F', 'O'),
    address VARCHAR(500),
    municipality VARCHAR(100),
    province VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customers_email (email),
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_province (province)
);

SELECT '✅ Tabela customers criada com sucesso!' as message;

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_categories_name (name)
);

SELECT '✅ Tabela categories criada com sucesso!' as message;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    price_kwanza DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 0,
    requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
    active_ingredient VARCHAR(200),
    dosage VARCHAR(100),
    manufacturer VARCHAR(200),
    batch_number VARCHAR(100),
    expiry_date DATE,
    barcode VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_products_code (code),
    INDEX idx_products_name (name),
    INDEX idx_products_category (category_id),
    INDEX idx_products_barcode (barcode)
);

SELECT '✅ Tabela products criada com sucesso!' as message;

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36),
    status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_address VARCHAR(500),
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(36),
    confirmed_by VARCHAR(36),
    confirmed_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id),
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_date (created_at)
);

SELECT '✅ Tabela orders criada com sucesso!' as message;

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id)
);

SELECT '✅ Tabela order_items criada com sucesso!' as message;

-- Tabela de vendas (caixa)
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(36) PRIMARY KEY,
    sale_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36),
    cashier_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'transfer', 'multicaixa') NOT NULL,
    payment_reference VARCHAR(100),
    change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    receipt_printed BOOLEAN NOT NULL DEFAULT FALSE,
    saft_exported BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id),
    INDEX idx_sales_number (sale_number),
    INDEX idx_sales_customer (customer_id),
    INDEX idx_sales_cashier (cashier_id),
    INDEX idx_sales_date (created_at)
);

SELECT '✅ Tabela sales criada com sucesso!' as message;

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(36) PRIMARY KEY,
    sale_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    iva_rate DECIMAL(5,2) NOT NULL DEFAULT 14.00,
    iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_sale_items_sale (sale_id),
    INDEX idx_sale_items_product (product_id)
);

SELECT '✅ Tabela sale_items criada com sucesso!' as message;

-- Tabela de movimentação de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    reference_type ENUM('sale', 'order', 'purchase', 'adjustment'),
    reference_id VARCHAR(36),
    notes VARCHAR(500),
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_stock_movements_product (product_id),
    INDEX idx_stock_movements_type (movement_type),
    INDEX idx_stock_movements_date (created_at)
);

SELECT '✅ Tabela stock_movements criada com sucesso!' as message;

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(500),
    updated_by VARCHAR(36),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_system_settings_key (setting_key)
);

SELECT '✅ Tabela system_settings criada com sucesso!' as message;

-- Tabela de caixa
CREATE TABLE IF NOT EXISTS cash_registers (
    id VARCHAR(36) PRIMARY KEY,
    opened_by VARCHAR(36) NOT NULL,
    opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_by VARCHAR(36),
    closed_at TIMESTAMP NULL,
    initial_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(10,2),
    total_sales DECIMAL(10,2),
    total_transactions INT,
    status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    notes VARCHAR(500),
    
    FOREIGN KEY (opened_by) REFERENCES users(id),
    FOREIGN KEY (closed_by) REFERENCES users(id),
    INDEX idx_cash_registers_status (status),
    INDEX idx_cash_registers_date (opened_at)
);

SELECT '✅ Tabela cash_registers criada com sucesso!' as message;

SELECT '🎉 Banco de dados MySQL/MariaDB criado com sucesso!' as message;
SELECT '📋 Próximos passos:' as message;
SELECT '   1. Execute o script de dados iniciais (seed-data-mysql.sql)' as message;
SELECT '   2. Configure as variáveis de ambiente no arquivo .env.local' as message;
SELECT '   3. Inicie a aplicação com: npm run dev' as message;
