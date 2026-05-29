-- ═══════════════════════════════════════════════════════════════
--  Kopi Nusantara — Database Schema
--  Jalankan: psql -U postgres -d kopi_nusantara -f schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── Kategori produk ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL      PRIMARY KEY,
  name       VARCHAR(50) NOT NULL,
  slug       VARCHAR(50) UNIQUE NOT NULL,
  icon       VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Produk (menu) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL          PRIMARY KEY,
  name         VARCHAR(100)    NOT NULL,
  description  TEXT,
  price        DECIMAL(12, 0)  NOT NULL,
  category_id  INTEGER         REFERENCES categories(id) ON DELETE SET NULL,
  image_url    TEXT            DEFAULT '/images/placeholder.jpg',
  is_available BOOLEAN         DEFAULT TRUE,
  is_featured  BOOLEAN         DEFAULT FALSE,
  stock        INTEGER         DEFAULT 999,
  created_at   TIMESTAMPTZ     DEFAULT NOW(),
  updated_at   TIMESTAMPTZ     DEFAULT NOW()
);

-- ─── Pesanan ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL          PRIMARY KEY,
  customer_name   VARCHAR(100)    NOT NULL,
  customer_email  VARCHAR(100),
  customer_phone  VARCHAR(20),
  table_number    VARCHAR(10),
  notes           TEXT,
  total_amount    DECIMAL(12, 0)  NOT NULL,
  status          VARCHAR(20)     DEFAULT 'pending'
                                  CHECK (status IN ('pending','preparing','ready','completed','cancelled')),
  created_at      TIMESTAMPTZ     DEFAULT NOW()
);

-- ─── Item dalam pesanan ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              SERIAL          PRIMARY KEY,
  order_id        INTEGER         REFERENCES orders(id) ON DELETE CASCADE,
  product_id      INTEGER         REFERENCES products(id) ON DELETE SET NULL,
  product_name    VARCHAR(100)    NOT NULL,  -- snapshot nama saat pesan
  quantity        INTEGER         NOT NULL CHECK (quantity > 0),
  price_at_order  DECIMAL(12, 0)  NOT NULL   -- snapshot harga saat pesan
);

-- ─── Admin ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL        PRIMARY KEY,
  email         VARCHAR(100)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  name          VARCHAR(100),
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- ─── Index untuk performa ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created     ON orders(created_at DESC);
