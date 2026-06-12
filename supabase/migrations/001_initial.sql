-- =============================================
-- BY CLARA — Schema inicial
-- =============================================

-- EXTENSÃO para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PRODUTOS
-- =============================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  images        TEXT[] DEFAULT '{}',
  colors        TEXT[] DEFAULT '{}',
  allow_custom_name BOOLEAN DEFAULT false,
  custom_name_label TEXT DEFAULT 'Escrever no bracelete',
  weight_grams  INTEGER DEFAULT 15,
  stock         INTEGER DEFAULT 0,
  active        BOOLEAN DEFAULT true,
  featured      BOOLEAN DEFAULT false,
  position      INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BANNERS
-- =============================================
CREATE TABLE banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url   TEXT NOT NULL,
  title       TEXT,
  subtitle    TEXT,
  link        TEXT,
  position    INTEGER DEFAULT 0,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PEDIDOS
-- =============================================
CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_email    TEXT,

  cep               TEXT NOT NULL,
  logradouro        TEXT NOT NULL,
  numero            TEXT NOT NULL,
  complemento       TEXT,
  bairro            TEXT NOT NULL,
  cidade            TEXT NOT NULL,
  estado            TEXT NOT NULL,

  shipping_type     TEXT NOT NULL CHECK (shipping_type IN ('local','pac','sedex','retirada')),
  shipping_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_label    TEXT,

  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(10,2) NOT NULL,
  total             NUMERIC(10,2) NOT NULL,

  pix_txid          TEXT UNIQUE,
  pix_expires_at    TIMESTAMPTZ,

  status            TEXT NOT NULL DEFAULT 'aguardando_pagamento'
                    CHECK (status IN (
                      'aguardando_pagamento',
                      'pagamento_confirmado',
                      'em_producao',
                      'enviado',
                      'entregue',
                      'cancelado'
                    )),

  admin_notes       TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONFIGURAÇÕES DA LOJA
-- =============================================
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('store_open',          'true',          'Loja aberta para pedidos'),
  ('whatsapp_number',     '5562996394315', 'WhatsApp para contato'),
  ('frete_local_preco',   '0',             'Preço do frete local em Itaberaí (0 = grátis)'),
  ('frete_local_label',   'Entrega local (Itaberaí-GO)', 'Descrição do frete local'),
  ('peso_embalagem_g',    '30',            'Peso extra da embalagem em gramas'),
  ('prazo_producao_dias', '3',             'Dias úteis para produzir o pedido'),
  ('mensagem_pix',        'Pulseira By Clara 💕', 'Mensagem que aparece no Pix');

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON products FOR SELECT USING (active = true);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_select" ON banners FOR SELECT USING (active = true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);

-- =============================================
-- STORAGE BUCKETS (executar no Supabase Storage UI)
-- =============================================
-- Bucket "products" — Public: true
-- Bucket "banners"  — Public: true

-- =============================================
-- TRIGGER: updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
