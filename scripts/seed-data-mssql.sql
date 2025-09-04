-- Script para inserir dados iniciais no SQL Server
-- Farmácia Olivesma - Sistema de Gestão

USE farmacia_olivesma;
GO

PRINT '🌱 Inserindo dados iniciais...';

-- Inserir categorias
IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Analgésicos')
BEGIN
    INSERT INTO categories (id, name, description, is_active, created_at) VALUES
    (NEWID(), 'Analgésicos', 'Medicamentos para alívio da dor', 1, GETDATE()),
    (NEWID(), 'Antibióticos', 'Medicamentos para combater infecções bacterianas', 1, GETDATE()),
    (NEWID(), 'Anti-inflamatórios', 'Medicamentos para reduzir inflamação', 1, GETDATE()),
    (NEWID(), 'Vitaminas', 'Suplementos vitamínicos e minerais', 1, GETDATE()),
    (NEWID(), 'Digestivos', 'Medicamentos para problemas digestivos', 1, GETDATE()),
    (NEWID(), 'Respiratórios', 'Medicamentos para problemas respiratórios', 1, GETDATE()),
    (NEWID(), 'Cosméticos', 'Produtos de beleza e cuidados pessoais', 1, GETDATE());
    
    PRINT '✅ Categorias inseridas com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠️ Categorias já existem no banco de dados.';
END
GO

-- Inserir usuário administrador
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@farmaciaolivesma.ao')
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
    (NEWID(), 'admin@farmaciaolivesma.ao', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/HK', 'Administrador', 'Sistema', '+244923456789', 'admin', 1, GETDATE(), GETDATE());
    
    PRINT '✅ Usuário administrador criado com sucesso!';
    PRINT '   Email: admin@farmaciaolivesma.ao';
    PRINT '   Senha: admin123';
END
ELSE
BEGIN
    PRINT '⚠️ Usuário administrador já existe.';
END
GO

-- Inserir funcionários de exemplo
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'vendedor@farmaciaolivesma.ao')
BEGIN
    INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
    (NEWID(), 'vendedor@farmaciaolivesma.ao', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/HK', 'João', 'Vendedor', '+244934567890', 'seller', 1, GETDATE(), GETDATE()),
    (NEWID(), 'farmaceutico@farmaciaolivesma.ao', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/HK', 'Maria', 'Farmacêutica', '+244945678901', 'pharmacist', 1, GETDATE(), GETDATE());
    
    PRINT '✅ Funcionários de exemplo criados com sucesso!';
    PRINT '   Vendedor: vendedor@farmaciaolivesma.ao / admin123';
    PRINT '   Farmacêutico: farmaceutico@farmaciaolivesma.ao / admin123';
END
ELSE
BEGIN
    PRINT '⚠️ Funcionários de exemplo já existem.';
END
GO

-- Inserir cliente de exemplo
IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 'cliente@exemplo.com')
BEGIN
    INSERT INTO customers (id, email, phone, first_name, last_name, password_hash, birth_date, gender, address, municipality, province, is_active, created_at, updated_at) VALUES
    (NEWID(), 'cliente@exemplo.com', '+244923456789', 'Cliente', 'Exemplo', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3/HK', '1990-01-01', 'M', 'Rua Principal, Bairro Central', 'Luanda', 'Luanda', 1, GETDATE(), GETDATE());
    
    PRINT '✅ Cliente de exemplo criado com sucesso!';
    PRINT '   Email: cliente@exemplo.com';
    PRINT '   Telefone: +244923456789';
    PRINT '   Senha: cliente123';
END
ELSE
BEGIN
    PRINT '⚠️ Cliente de exemplo já existe.';
END
GO

-- Inserir produtos de exemplo
DECLARE @analgesicos_id UNIQUEIDENTIFIER = (SELECT id FROM categories WHERE name = 'Analgésicos');
DECLARE @antibioticos_id UNIQUEIDENTIFIER = (SELECT id FROM categories WHERE name = 'Antibióticos');
DECLARE @vitaminas_id UNIQUEIDENTIFIER = (SELECT id FROM categories WHERE name = 'Vitaminas');
DECLARE @digestivos_id UNIQUEIDENTIFIER = (SELECT id FROM categories WHERE name = 'Digestivos');
DECLARE @respiratorios_id UNIQUEIDENTIFIER = (SELECT id FROM categories WHERE name = 'Respiratórios');

IF NOT EXISTS (SELECT 1 FROM products WHERE code = 'PARA500')
BEGIN
    INSERT INTO products (id, code, name, description, category_id, price_kwanza, cost_price, stock_quantity, min_stock_level, requires_prescription, active_ingredient, dosage, manufacturer, batch_number, expiry_date, barcode, is_active, created_at, updated_at) VALUES
    (NEWID(), 'PARA500', 'Paracetamol 500mg', 'Analgésico e antipirético para alívio da dor e febre', @analgesicos_id, 850.00, 600.00, 100, 20, 0, 'Paracetamol', '500mg', 'Farmacêutica Angola', 'LOT001', '2025-12-31', '7891234567890', 1, GETDATE(), GETDATE()),
    (NEWID(), 'DIPI500', 'Dipirona 500mg', 'Analgésico e antipirético potente', @analgesicos_id, 650.00, 450.00, 80, 15, 0, 'Dipirona Sódica', '500mg', 'Farmacêutica Angola', 'LOT002', '2025-11-30', '7891234567891', 1, GETDATE(), GETDATE()),
    (NEWID(), 'AMOXI500', 'Amoxicilina 500mg', 'Antibiótico de amplo espectro', @antibioticos_id, 1200.00, 800.00, 50, 10, 1, 'Amoxicilina', '500mg', 'Farmacêutica Angola', 'LOT003', '2025-10-31', '7891234567892', 1, GETDATE(), GETDATE()),
    (NEWID(), 'VITC1000', 'Vitamina C 1000mg', 'Suplemento vitamínico para imunidade', @vitaminas_id, 2500.00, 1800.00, 120, 25, 0, 'Ácido Ascórbico', '1000mg', 'Vitaminas Angola', 'LOT004', '2026-06-30', '7891234567893', 1, GETDATE(), GETDATE()),
    (NEWID(), 'OMEP20', 'Omeprazol 20mg', 'Inibidor da bomba de prótons para gastrite', @digestivos_id, 1800.00, 1200.00, 60, 12, 1, 'Omeprazol', '20mg', 'Farmacêutica Angola', 'LOT005', '2025-09-30', '7891234567894', 1, GETDATE(), GETDATE()),
    (NEWID(), 'XAROPE200', 'Xarope Expectorante 200ml', 'Xarope para tosse e expectoração', @respiratorios_id, 1500.00, 1000.00, 40, 8, 0, 'Guaifenesina', '200ml', 'Farmacêutica Angola', 'LOT006', '2025-08-31', '7891234567895', 1, GETDATE(), GETDATE()),
    (NEWID(), 'IBUP400', 'Ibuprofeno 400mg', 'Anti-inflamatório não esteroidal', @analgesicos_id, 950.00, 650.00, 75, 15, 0, 'Ibuprofeno', '400mg', 'Farmacêutica Angola', 'LOT007', '2025-07-31', '7891234567896', 1, GETDATE(), GETDATE()),
    (NEWID(), 'MULTIVIT', 'Multivitamínico Completo', 'Complexo vitamínico e mineral', @vitaminas_id, 3200.00, 2200.00, 90, 18, 0, 'Multivitamínico', '30 cápsulas', 'Vitaminas Angola', 'LOT008', '2026-05-31', '7891234567897', 1, GETDATE(), GETDATE()),
    (NEWID(), 'AZITRO500', 'Azitromicina 500mg', 'Antibiótico macrolídeo', @antibioticos_id, 1800.00, 1200.00, 35, 7, 1, 'Azitromicina', '500mg', 'Farmacêutica Angola', 'LOT009', '2025-12-15', '7891234567898', 1, GETDATE(), GETDATE()),
    (NEWID(), 'SIMETICONA', 'Simeticona 40mg', 'Antiflatulento para gases intestinais', @digestivos_id, 1100.00, 750.00, 65, 13, 0, 'Simeticona', '40mg', 'Farmacêutica Angola', 'LOT010', '2025-11-15', '7891234567899', 1, GETDATE(), GETDATE()),
    (NEWID(), 'LORATADINA', 'Loratadina 10mg', 'Anti-histamínico para alergias', @respiratorios_id, 1350.00, 900.00, 55, 11, 0, 'Loratadina', '10mg', 'Farmacêutica Angola', 'LOT011', '2025-10-15', '7891234567800', 1, GETDATE(), GETDATE());
    
    PRINT '✅ Produtos de exemplo inseridos com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠️ Produtos de exemplo já existem.';
END
GO

-- Inserir configurações do sistema
IF NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'pharmacy_name')
BEGIN
    INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES
    (NEWID(), 'pharmacy_name', 'Farmácia Olivesma', 'Nome da farmácia', GETDATE()),
    (NEWID(), 'pharmacy_address', 'Rua Principal, Bairro Olivesma, Luanda, Angola', 'Endereço da farmácia', GETDATE()),
    (NEWID(), 'pharmacy_phone', '+244 923 456 789', 'Telefone da farmácia', GETDATE()),
    (NEWID(), 'pharmacy_email', 'contato@farmaciaolivesma.ao', 'Email da farmácia', GETDATE()),
    (NEWID(), 'iva_rate', '14.00', 'Taxa de IVA em percentual', GETDATE()),
    (NEWID(), 'delivery_fee', '500.00', 'Taxa de entrega padrão em Kwanza', GETDATE()),
    (NEWID(), 'min_order_value', '2000.00', 'Valor mínimo do pedido em Kwanza', GETDATE()),
    (NEWID(), 'working_hours', 'Segunda a Sexta: 7:00-19:00, Sábado: 8:00-17:00, Domingo: 9:00-15:00', 'Horário de funcionamento', GETDATE());
    
    PRINT '✅ Configurações do sistema inseridas com sucesso!';
END
ELSE
BEGIN
    PRINT '⚠️ Configurações do sistema já existem.';
END
GO

PRINT '🎉 Dados iniciais inseridos com sucesso!';
PRINT '';
PRINT '🔑 CREDENCIAIS DE ACESSO:';
PRINT '   👨‍💼 ADMINISTRADOR:';
PRINT '      Email: admin@farmaciaolivesma.ao';
PRINT '      Senha: admin123';
PRINT '';
PRINT '   👤 CLIENTE EXEMPLO:';
PRINT '      Email: cliente@exemplo.com';
PRINT '      Telefone: +244923456789';
PRINT '      Senha: cliente123';
PRINT '';
PRINT '   👨‍💼 FUNCIONÁRIOS:';
PRINT '      Vendedor: vendedor@farmaciaolivesma.ao / admin123';
PRINT '      Farmacêutico: farmaceutico@farmaciaolivesma.ao / admin123';
PRINT '';
PRINT '📊 DADOS INSERIDOS:';
PRINT '   - 7 Categorias de produtos';
PRINT '   - 11 Produtos com estoque';
PRINT '   - 4 Usuários (1 admin, 1 vendedor, 1 farmacêutico, 1 cliente)';
PRINT '   - 8 Configurações do sistema';
PRINT '';
PRINT '✅ Sistema pronto para uso!';
