-- Dados iniciais para o sistema da Farmácia Olivesma

-- Inserir configurações do sistema
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('company_name', 'Farmácia Olivesma', 'Nome da empresa'),
('company_nif', '123456789', 'NIF da empresa'),
('company_address', 'Rua Principal, Luanda - Angola', 'Endereço da empresa'),
('company_phone', '+244 923 456 789', 'Telefone da empresa'),
('company_email', 'contato@farmaciaolivesma.ao', 'Email da empresa'),
('iva_rate', '14.00', 'Taxa de IVA padrão em Angola'),
('currency', 'AOA', 'Moeda - Kwanza Angolano'),
('delivery_fee_luanda', '2000', 'Taxa de entrega em Luanda'),
('min_order_free_delivery', '50000', 'Valor mínimo para entrega gratuita'),
('whatsapp_api_token', '', 'Token da API do WhatsApp para notificações');

-- Inserir usuário administrador padrão
INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('admin@farmaciaolivesma.ao', '$2b$10$example_hash', 'Administrador', 'Sistema', '+244 923 456 789', 'admin'),
('vendedor@farmaciaolivesma.ao', '$2b$10$example_hash', 'João', 'Vendedor', '+244 912 345 678', 'seller'),
('farmaceutico@farmaciaolivesma.ao', '$2b$10$example_hash', 'Maria', 'Farmacêutica', '+244 934 567 890', 'pharmacist');

-- Inserir categorias de produtos
INSERT INTO categories (name, description) VALUES
('Analgésicos', 'Medicamentos para alívio da dor'),
('Antibióticos', 'Medicamentos para combate a infecções bacterianas'),
('Anti-inflamatórios', 'Medicamentos para redução de inflamação'),
('Vitaminas e Suplementos', 'Vitaminas e suplementos nutricionais'),
('Gastroenterologia', 'Medicamentos para problemas digestivos'),
('Cardiologia', 'Medicamentos para problemas cardíacos'),
('Dermatologia', 'Medicamentos para problemas de pele'),
('Respiratório', 'Medicamentos para problemas respiratórios'),
('Diabetes', 'Medicamentos para controle do diabetes'),
('Higiene e Cuidados', 'Produtos de higiene e cuidados pessoais');

-- Inserir produtos de exemplo
INSERT INTO products (code, name, description, category_id, price_kwanza, cost_price, stock_quantity, requires_prescription, active_ingredient, dosage, manufacturer) VALUES
('MED001', 'Paracetamol 500mg', 'Analgésico e antipirético', (SELECT id FROM categories WHERE name = 'Analgésicos'), 850.00, 600.00, 150, false, 'Paracetamol', '500mg', 'Farmacêutica Nacional'),
('MED002', 'Amoxicilina 500mg', 'Antibiótico de amplo espectro', (SELECT id FROM categories WHERE name = 'Antibióticos'), 2500.00, 1800.00, 75, true, 'Amoxicilina', '500mg', 'Laboratórios Unidos'),
('MED003', 'Ibuprofeno 400mg', 'Anti-inflamatório não esteroidal', (SELECT id FROM categories WHERE name = 'Anti-inflamatórios'), 1200.00, 850.00, 120, false, 'Ibuprofeno', '400mg', 'Farmacêutica Nacional'),
('MED004', 'Vitamina C 1000mg', 'Suplemento vitamínico', (SELECT id FROM categories WHERE name = 'Vitaminas e Suplementos'), 1200.00, 800.00, 200, false, 'Ácido Ascórbico', '1000mg', 'VitaHealth'),
('MED005', 'Omeprazol 20mg', 'Inibidor da bomba de prótons', (SELECT id FROM categories WHERE name = 'Gastroenterologia'), 1800.00, 1200.00, 90, true, 'Omeprazol', '20mg', 'Gastro Pharma'),
('MED006', 'Losartana 50mg', 'Anti-hipertensivo', (SELECT id FROM categories WHERE name = 'Cardiologia'), 2200.00, 1500.00, 60, true, 'Losartana Potássica', '50mg', 'Cardio Med'),
('MED007', 'Cetirizina 10mg', 'Anti-histamínico', (SELECT id FROM categories WHERE name = 'Dermatologia'), 950.00, 650.00, 100, false, 'Cetirizina', '10mg', 'Alergia Free'),
('MED008', 'Salbutamol 100mcg', 'Broncodilatador', (SELECT id FROM categories WHERE name = 'Respiratório'), 3500.00, 2400.00, 45, true, 'Salbutamol', '100mcg/dose', 'Respira Bem'),
('MED009', 'Metformina 850mg', 'Antidiabético', (SELECT id FROM categories WHERE name = 'Diabetes'), 1600.00, 1100.00, 80, true, 'Metformina', '850mg', 'Diabetes Control'),
('MED010', 'Álcool Gel 70%', 'Antisséptico para mãos', (SELECT id FROM categories WHERE name = 'Higiene e Cuidados'), 650.00, 400.00, 300, false, 'Álcool Etílico', '70%', 'Clean Hands');

-- Inserir alguns clientes de exemplo
INSERT INTO customers (email, phone, first_name, last_name, birth_date, gender, address, municipality, province) VALUES
('maria.silva@email.com', '+244 923 456 789', 'Maria', 'Silva', '1985-03-15', 'female', 'Rua das Flores, 123', 'Luanda', 'Luanda'),
('joao.santos@email.com', '+244 912 345 678', 'João', 'Santos', '1978-07-22', 'male', 'Avenida Principal, 456', 'Luanda', 'Luanda'),
('ana.costa@email.com', '+244 934 567 890', 'Ana', 'Costa', '1992-11-08', 'female', 'Bairro Operário, 789', 'Benguela', 'Benguela'),
('pedro.oliveira@email.com', '+244 945 678 901', 'Pedro', 'Oliveira', '1980-05-30', 'male', 'Zona Industrial, 321', 'Huambo', 'Huambo');

-- Inserir alguns pedidos de exemplo
INSERT INTO orders (order_number, customer_id, status, total_amount, iva_amount, subtotal, delivery_address, delivery_fee, created_by) VALUES
('PED-001', (SELECT id FROM customers WHERE email = 'maria.silva@email.com'), 'pending', 15500.00, 1900.00, 13600.00, 'Rua das Flores, 123, Luanda', 2000.00, (SELECT id FROM users WHERE email = 'admin@farmaciaolivesma.ao')),
('PED-002', (SELECT id FROM customers WHERE email = 'joao.santos@email.com'), 'confirmed', 8900.00, 1090.00, 7810.00, 'Avenida Principal, 456, Luanda', 0.00, (SELECT id FROM users WHERE email = 'admin@farmaciaolivesma.ao')),
('PED-003', (SELECT id FROM customers WHERE email = 'ana.costa@email.com'), 'delivered', 22300.00, 2730.00, 19570.00, 'Bairro Operário, 789, Benguela', 5000.00, (SELECT id FROM users WHERE email = 'admin@farmaciaolivesma.ao'));

-- Inserir itens dos pedidos
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
-- Pedido PED-001
((SELECT id FROM orders WHERE order_number = 'PED-001'), (SELECT id FROM products WHERE code = 'MED001'), 2, 850.00, 1700.00),
((SELECT id FROM orders WHERE order_number = 'PED-001'), (SELECT id FROM products WHERE code = 'MED004'), 3, 1200.00, 3600.00),
((SELECT id FROM orders WHERE order_number = 'PED-001'), (SELECT id FROM products WHERE code = 'MED005'), 1, 1800.00, 1800.00),

-- Pedido PED-002
((SELECT id FROM orders WHERE order_number = 'PED-002'), (SELECT id FROM products WHERE code = 'MED003'), 2, 1200.00, 2400.00),
((SELECT id FROM orders WHERE order_number = 'PED-002'), (SELECT id FROM products WHERE code = 'MED007'), 1, 950.00, 950.00),

-- Pedido PED-003
((SELECT id FROM orders WHERE order_number = 'PED-003'), (SELECT id FROM products WHERE code = 'MED002'), 3, 2500.00, 7500.00),
((SELECT id FROM orders WHERE order_number = 'PED-003'), (SELECT id FROM products WHERE code = 'MED006'), 2, 2200.00, 4400.00),
((SELECT id FROM orders WHERE order_number = 'PED-003'), (SELECT id FROM products WHERE code = 'MED009'), 1, 1600.00, 1600.00);

-- Inserir algumas vendas de exemplo no caixa
INSERT INTO sales (sale_number, customer_id, cashier_id, total_amount, iva_amount, subtotal, payment_method) VALUES
('VEN-001', (SELECT id FROM customers WHERE email = 'pedro.oliveira@email.com'), (SELECT id FROM users WHERE email = 'vendedor@farmaciaolivesma.ao'), 5700.00, 700.00, 5000.00, 'cash'),
('VEN-002', NULL, (SELECT id FROM users WHERE email = 'vendedor@farmaciaolivesma.ao'), 2850.00, 350.00, 2500.00, 'card'),
('VEN-003', (SELECT id FROM customers WHERE email = 'maria.silva@email.com'), (SELECT id FROM users WHERE email = 'admin@farmaciaolivesma.ao'), 11400.00, 1400.00, 10000.00, 'multicaixa');

-- Inserir itens das vendas
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price, iva_rate, iva_amount) VALUES
-- Venda VEN-001
((SELECT id FROM sales WHERE sale_number = 'VEN-001'), (SELECT id FROM products WHERE code = 'MED001'), 3, 850.00, 2550.00, 14.00, 314.00),
((SELECT id FROM sales WHERE sale_number = 'VEN-001'), (SELECT id FROM products WHERE code = 'MED004'), 2, 1200.00, 2400.00, 14.00, 295.00),
((SELECT id FROM sales WHERE sale_number = 'VEN-001'), (SELECT id FROM products WHERE code = 'MED010'), 1, 650.00, 650.00, 14.00, 80.00),

-- Venda VEN-002
((SELECT id FROM sales WHERE sale_number = 'VEN-002'), (SELECT id FROM products WHERE code = 'MED002'), 1, 2500.00, 2500.00, 14.00, 307.00),

-- Venda VEN-003
((SELECT id FROM sales WHERE sale_number = 'VEN-003'), (SELECT id FROM products WHERE code = 'MED005'), 2, 1800.00, 3600.00, 14.00, 443.00),
((SELECT id FROM sales WHERE sale_number = 'VEN-003'), (SELECT id FROM products WHERE code = 'MED006'), 3, 2200.00, 6600.00, 14.00, 812.00),
((SELECT id FROM sales WHERE sale_number = 'VEN-003'), (SELECT id FROM products WHERE code = 'MED007'), 1, 950.00, 950.00, 14.00, 117.00);
