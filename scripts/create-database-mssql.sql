-- Script para criar banco de dados no Microsoft SQL Server
-- Farmácia Olivesma - Sistema de Gestão

USE master;
GO

-- Verificar se o banco existe e criar se não existir
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'farmacia_olivesma')
BEGIN
    CREATE DATABASE farmacia_olivesma;
    PRINT '✅ Banco de dados farmacia_olivesma criado com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠️ Banco de dados farmacia_olivesma já existe.';
END
GO

USE farmacia_olivesma;
GO

-- Tabela de usuários (funcionários)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20),
        role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'seller', 'pharmacist')),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_users_email ON users(email);
    CREATE INDEX IX_users_role ON users(role);
    
    PRINT '✅ Tabela users criada com sucesso!';
END
GO

-- Tabela de clientes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customers' AND xtype='U')
BEGIN
    CREATE TABLE customers (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) UNIQUE,
        phone NVARCHAR(20) NOT NULL UNIQUE,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        password_hash NVARCHAR(255),
        birth_date DATE,
        gender NVARCHAR(1) CHECK (gender IN ('M', 'F', 'O')),
        address NVARCHAR(500),
        municipality NVARCHAR(100),
        province NVARCHAR(100),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_customers_email ON customers(email);
    CREATE INDEX IX_customers_phone ON customers(phone);
    CREATE INDEX IX_customers_province ON customers(province);
    
    PRINT '✅ Tabela customers criada com sucesso!';
END
GO

-- Tabela de categorias
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
BEGIN
    CREATE TABLE categories (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(500),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_categories_name ON categories(name);
    
    PRINT '✅ Tabela categories criada com sucesso!';
END
GO

-- Tabela de produtos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='products' AND xtype='U')
BEGIN
    CREATE TABLE products (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        code NVARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(200) NOT NULL,
        description NVARCHAR(1000),
        category_id UNIQUEIDENTIFIER,
        price_kwanza DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2),
        stock_quantity INT NOT NULL DEFAULT 0,
        min_stock_level INT NOT NULL DEFAULT 0,
        requires_prescription BIT NOT NULL DEFAULT 0,
        active_ingredient NVARCHAR(200),
        dosage NVARCHAR(100),
        manufacturer NVARCHAR(200),
        batch_number NVARCHAR(100),
        expiry_date DATE,
        barcode NVARCHAR(100),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    
    CREATE INDEX IX_products_code ON products(code);
    CREATE INDEX IX_products_name ON products(name);
    CREATE INDEX IX_products_category ON products(category_id);
    CREATE INDEX IX_products_barcode ON products(barcode);
    
    PRINT '✅ Tabela products criada com sucesso!';
END
GO

-- Tabela de pedidos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
BEGIN
    CREATE TABLE orders (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        order_number NVARCHAR(50) NOT NULL UNIQUE,
        customer_id UNIQUEIDENTIFIER,
        status NVARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
        total_amount DECIMAL(10,2) NOT NULL,
        iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_address NVARCHAR(500),
        delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
        notes NVARCHAR(1000),
        created_by UNIQUEIDENTIFIER,
        confirmed_by UNIQUEIDENTIFIER,
        confirmed_at DATETIME2,
        delivered_at DATETIME2,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (confirmed_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_orders_number ON orders(order_number);
    CREATE INDEX IX_orders_customer ON orders(customer_id);
    CREATE INDEX IX_orders_status ON orders(status);
    CREATE INDEX IX_orders_date ON orders(created_at);
    
    PRINT '✅ Tabela orders criada com sucesso!';
END
GO

-- Tabela de itens do pedido
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
BEGIN
    CREATE TABLE order_items (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        order_id UNIQUEIDENTIFIER NOT NULL,
        product_id UNIQUEIDENTIFIER NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    CREATE INDEX IX_order_items_order ON order_items(order_id);
    CREATE INDEX IX_order_items_product ON order_items(product_id);
    
    PRINT '✅ Tabela order_items criada com sucesso!';
END
GO

-- Tabela de vendas (caixa)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sales' AND xtype='U')
BEGIN
    CREATE TABLE sales (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        sale_number NVARCHAR(50) NOT NULL UNIQUE,
        customer_id UNIQUEIDENTIFIER,
        cashier_id UNIQUEIDENTIFIER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        subtotal DECIMAL(10,2) NOT NULL,
        payment_method NVARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'multicaixa')),
        payment_reference NVARCHAR(100),
        change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        receipt_printed BIT NOT NULL DEFAULT 0,
        saft_exported BIT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (cashier_id) REFERENCES users(id)
    );
    
    CREATE INDEX IX_sales_number ON sales(sale_number);
    CREATE INDEX IX_sales_customer ON sales(customer_id);
    CREATE INDEX IX_sales_cashier ON sales(cashier_id);
    CREATE INDEX IX_sales_date ON sales(created_at);
    
    PRINT '✅ Tabela sales criada com sucesso!';
END
GO

-- Tabela de itens da venda
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sale_items' AND xtype='U')
BEGIN
    CREATE TABLE sale_items (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        sale_id UNIQUEIDENTIFIER NOT NULL,
        product_id UNIQUEIDENTIFIER NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        iva_rate DECIMAL(5,2) NOT NULL DEFAULT 14.00,
        iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    CREATE INDEX IX_sale_items_sale ON sale_items(sale_id);
    CREATE INDEX IX_sale_items_product ON sale_items(product_id);
    
    PRINT '✅ Tabela sale_items criada com sucesso!';
END
GO

-- Tabela de movimentação de estoque
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='stock_movements' AND xtype='U')
BEGIN
    CREATE TABLE stock_movements (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        product_id UNIQUEIDENTIFIER NOT NULL,
        movement_type NVARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
        quantity INT NOT NULL,
        reference_type NVARCHAR(20) CHECK (reference_type IN ('sale', 'order', 'purchase', 'adjustment')),
        reference_id UNIQUEIDENTIFIER,
        notes NVARCHAR(500),
        created_by UNIQUEIDENTIFIER,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_stock_movements_product ON stock_movements(product_id);
    CREATE INDEX IX_stock_movements_type ON stock_movements(movement_type);
    CREATE INDEX IX_stock_movements_date ON stock_movements(created_at);
    
    PRINT '✅ Tabela stock_movements criada com sucesso!';
END
GO

-- Tabela de configurações do sistema
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='system_settings' AND xtype='U')
BEGIN
    CREATE TABLE system_settings (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        setting_key NVARCHAR(100) NOT NULL UNIQUE,
        setting_value NVARCHAR(1000),
        description NVARCHAR(500),
        updated_by UNIQUEIDENTIFIER,
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_system_settings_key ON system_settings(setting_key);
    
    PRINT '✅ Tabela system_settings criada com sucesso!';
END
GO

-- Tabela de caixa
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cash_registers' AND xtype='U')
BEGIN
    CREATE TABLE cash_registers (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        opened_by UNIQUEIDENTIFIER NOT NULL,
        opened_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        closed_by UNIQUEIDENTIFIER,
        closed_at DATETIME2,
        initial_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        final_amount DECIMAL(10,2),
        total_sales DECIMAL(10,2),
        total_transactions INT,
        status NVARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
        notes NVARCHAR(500),
        FOREIGN KEY (opened_by) REFERENCES users(id),
        FOREIGN KEY (closed_by) REFERENCES users(id)
    );
    
    CREATE INDEX IX_cash_registers_status ON cash_registers(status);
    CREATE INDEX IX_cash_registers_date ON cash_registers(opened_at);
    
    PRINT '✅ Tabela cash_registers criada com sucesso!';
END
GO

-- Triggers para atualizar updated_at automaticamente
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_users_updated_at
    ON users
    AFTER UPDATE
    AS
    BEGIN
        UPDATE users 
        SET updated_at = GETDATE()
        FROM users u
        INNER JOIN inserted i ON u.id = i.id
    END
    ')
    PRINT '✅ Trigger tr_users_updated_at criado com sucesso!';
END
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_customers_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_customers_updated_at
    ON customers
    AFTER UPDATE
    AS
    BEGIN
        UPDATE customers 
        SET updated_at = GETDATE()
        FROM customers c
        INNER JOIN inserted i ON c.id = i.id
    END
    ')
    PRINT '✅ Trigger tr_customers_updated_at criado com sucesso!';
END
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_products_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_products_updated_at
    ON products
    AFTER UPDATE
    AS
    BEGIN
        UPDATE products 
        SET updated_at = GETDATE()
        FROM products p
        INNER JOIN inserted i ON p.id = i.id
    END
    ')
    PRINT '✅ Trigger tr_products_updated_at criado com sucesso!';
END
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_orders_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER tr_orders_updated_at
    ON orders
    AFTER UPDATE
    AS
    BEGIN
        UPDATE orders 
        SET updated_at = GETDATE()
        FROM orders o
        INNER JOIN inserted i ON o.id = i.id
    END
    ')
    PRINT '✅ Trigger tr_orders_updated_at criado com sucesso!';
END
GO

-- Trigger para controle de estoque nas vendas
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_sale_items_stock_control')
BEGIN
    EXEC('
    CREATE TRIGGER tr_sale_items_stock_control
    ON sale_items
    AFTER INSERT
    AS
    BEGIN
        -- Reduzir estoque
        UPDATE products 
        SET stock_quantity = stock_quantity - i.quantity
        FROM products p
        INNER JOIN inserted i ON p.id = i.product_id
        
        -- Registrar movimentação de estoque
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_at)
        SELECT i.product_id, ''out'', i.quantity, ''sale'', i.sale_id, GETDATE()
        FROM inserted i
    END
    ')
    PRINT '✅ Trigger tr_sale_items_stock_control criado com sucesso!';
END
GO

PRINT '🎉 Banco de dados SQL Server criado com sucesso!';
PRINT '📋 Próximos passos:';
PRINT '   1. Execute o script de dados iniciais (seed-data-mssql.sql)';
PRINT '   2. Configure as variáveis de ambiente no arquivo .env.local';
PRINT '   3. Inicie a aplicação com: npm run dev';
