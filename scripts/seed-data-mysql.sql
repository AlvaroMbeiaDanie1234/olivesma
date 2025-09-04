-- Script para inserir dados iniciais no MySQL/MariaDB
-- Farmácia Olivesma - Sistema de Gestão

USE farmacia_olivesma;

SELECT '🌱 Inserindo dados iniciais...' as message;

-- Inserir categorias
INSERT INTO categories (id, name, description, is_active, created_at) VALUES
('cat-analgesicos-001', 'Analgésicos', 'Medicamentos para alívio da dor', 1, NOW()),
('cat-antibioticos-002', 'Antibióticos', 'Medicamentos para combater infecções bacterianas', 1, NOW()),
('cat-antiinflamatorios-003', 'Anti-inflamatórios', 'Medicamentos para reduzir inflamação', 1, NOW()),
('cat-vitaminas-004', 'Vitaminas', 'Suplementos vitamínicos e minerais', 1, NOW()),
('cat-digestivos-005', 'Digestivos', 'Medicamentos para problemas digestivos', 1, NOW()),
('cat-respiratorios-006', 'Respiratórios', 'Medicamentos para problemas respiratórios', 1, NOW()),
('cat-cosmeticos-007', 'Cosméticos', 'Produtos de beleza e cuidados pessoais', 1, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT '✅ Categorias inseridas com sucesso!' as message;

-- Inserir produtos
INSERT INTO products (id, code, name, description, category_id, price_kwanza, cost_price, stock_quantity, min_stock_level, requires_prescription, active_ingredient, dosage, manufacturer, is_active, created_at, updated_at) VALUES
('prod-001', 'MED001', 'Paracetamol 500mg', 'Analgésico e antipirético para alívio da dor e febre', 'cat-analgesicos-001', 850.00, 600.00, 150, 20, 0, 'Paracetamol', '500mg', 'Farmacêutica Angola', 1, NOW(), NOW()),
('prod-002', 'MED002', 'Ibuprofeno 400mg', 'Anti-inflamatório não esteroidal para dor e inflamação', 'cat-antiinflamatorios-003', 1200.00, 850.00, 80, 15, 0, 'Ibuprofeno', '400mg', 'Medica Luanda', 1, NOW(), NOW()),
('prod-003', 'MED003', 'Amoxicilina 500mg', 'Antibiótico de amplo espectro', 'cat-antibioticos-002', 2500.00, 1800.00, 60, 10, 1, 'Amoxicilina', '500mg', 'Antibióticos SA', 1, NOW(), NOW()),
('prod-004', 'VIT001', 'Vitamina C 1000mg', 'Suplemento de vitamina C para imunidade', 'cat-vitaminas-004', 1800.00, 1200.00, 120, 25, 0, 'Ácido Ascórbico', '1000mg', 'Vitaminas Angola', 1, NOW(), NOW()),
('prod-005', 'VIT002', 'Complexo B', 'Vitaminas do complexo B para energia e metabolismo', 'cat-vitaminas-004', 2200.00, 1500.00, 90, 20, 0, 'Complexo B', 'Multivitamínico', 'Vitaminas Angola', 1, NOW(), NOW()),
('prod-006', 'MED004', 'Omeprazol 20mg', 'Inibidor da bomba de prótons para acidez estomacal', 'cat-digestivos-005', 1600.00, 1100.00, 70, 15, 1, 'Omeprazol', '20mg', 'Digestivos Lda', 1, NOW(), NOW()),
('prod-007', 'MED005', 'Dipirona 500mg', 'Analgésico e antipirético potente', 'cat-analgesicos-001', 950.00, 650.00, 100, 20, 0, 'Dipirona Sódica', '500mg', 'Farmacêutica Angola', 1, NOW(), NOW()),
('prod-008', 'MED006', 'Loratadina 10mg', 'Anti-histamínico para alergias', 'cat-respiratorios-006', 1400.00, 950.00, 85, 15, 0, 'Loratadina', '10mg', 'Alergia Free', 1, NOW(), NOW()),
('prod-009', 'MED007', 'Dextrometorfano 15mg', 'Antitussígeno para tosse seca', 'cat-respiratorios-006', 1100.00, 750.00, 65, 12, 0, 'Dextrometorfano', '15mg', 'Respirar Bem', 1, NOW(), NOW()),
('prod-010', 'COS001', 'Protetor Solar FPS 60', 'Proteção solar de alta qualidade', 'cat-cosmeticos-007', 3500.00, 2400.00, 45, 10, 0, 'Óxido de Zinco', 'FPS 60', 'Beleza Angola', 1, NOW(), NOW()),
('prod-011', 'MED008', 'Aspirina 100mg', 'Ácido acetilsalicílico para prevenção cardiovascular', 'cat-analgesicos-001', 800.00, 550.00, 110, 25, 0, 'Ácido Acetilsalicílico', '100mg', 'Cardio Saúde', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT '✅ Produtos inseridos com sucesso!' as message;

-- Inserir usuários (funcionários)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, is_active, created_at, updated_at) VALUES
('user-admin-001', 'admin@farmaciaolivesma.ao', '$2b$10$rQZ8kHWKz5.Nh8Zx5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Z', 'Administrador', 'Sistema', '+244923456789', 'admin', 1, NOW(), NOW()),
('user-seller-001', 'vendedor@farmaciaolivesma.ao', '$2b$10$rQZ8kHWKz5.Nh8Zx5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Z', 'João', 'Vendedor', '+244923456790', 'seller', 1, NOW(), NOW()),
('user-pharmacist-001', 'farmaceutico@farmaciaolivesma.ao', '$2b$10$rQZ8kHWKz5.Nh8Zx5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Z', 'Maria', 'Farmacêutica', '+244923456791', 'pharmacist', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE email = VALUES(email);

SELECT '✅ Usuários inseridos com sucesso!' as message;

-- Inserir clientes de exemplo
INSERT INTO customers (id, email, phone, first_name, last_name, password_hash, birth_date, gender, address, municipality, province, is_active, created_at, updated_at) VALUES
('customer-001', 'cliente@exemplo.com', '+244923456792', 'Ana', 'Cliente', '$2b$10$rQZ8kHWKz5.Nh8Zx5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Z', '1990-05-15', 'F', 'Rua das Flores, 123', 'Luanda', 'Luanda', 1, NOW(), NOW()),
('customer-002', 'pedro@exemplo.com', '+244923456793', 'Pedro', 'Santos', '$2b$10$rQZ8kHWKz5.Nh8Zx5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Zx5ZeJ5Z', '1985-08-22', 'M', 'Avenida Principal, 456', 'Luanda', 'Luanda', 1, NOW(), NOW()),
('customer-003', NULL, '+244923456794', 'Carla', 'Oliveira', NULL, '1992-12-10', 'F', 'Bairro Olivesma, 789', 'Luanda', 'Luanda', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE phone = VALUES(phone);

SELECT '✅ Clientes inseridos com sucesso!' as message;

-- Inserir configurações do sistema
INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES
('setting-001', 'pharmacy_name', 'Farmácia Olivesma', 'Nome da farmácia', NOW()),
('setting-002', 'pharmacy_address', 'Rua Principal, Bairro Olivesma, Luanda, Angola', 'Endereço da farmácia', NOW()),
('setting-003', 'pharmacy_phone', '+244 923 456 789', 'Telefone da farmácia', NOW()),
('setting-004', 'pharmacy_email', 'contato@farmaciaolivesma.ao', 'Email da farmácia', NOW()),
('setting-005', 'iva_rate', '14.0', 'Taxa de IVA em percentual', NOW()),
('setting-006', 'currency', 'AOA', 'Moeda utilizada (Kwanza Angolano)', NOW()),
('setting-007', 'delivery_fee', '500.00', 'Taxa de entrega padrão', NOW()),
('setting-008', 'min_order_delivery', '5000.00', 'Valor mínimo para entrega gratuita', NOW())
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

SELECT '✅ Configurações do sistema inseridas com sucesso!' as message;

SELECT '🎉 Dados iniciais inseridos com sucesso!' as message;
SELECT '📋 Resumo dos dados inseridos:' as message;
SELECT '   - 7 categorias de produtos' as message;
SELECT '   - 11 produtos com estoque' as message;
SELECT '   - 3 usuários (admin, vendedor, farmacêutico)' as message;
SELECT '   - 3 clientes de exemplo' as message;
SELECT '   - 8 configurações do sistema' as message;

SELECT '🔑 Credenciais de acesso:' as message;
SELECT '   Admin: admin@farmaciaolivesma.ao / admin123' as message;
SELECT '   Vendedor: vendedor@farmaciaolivesma.ao / admin123' as message;
SELECT '   Farmacêutico: farmaceutico@farmaciaolivesma.ao / admin123' as message;
SELECT '   Cliente: cliente@exemplo.com / admin123' as message;

SELECT '✅ Sistema pronto para uso!' as message;
