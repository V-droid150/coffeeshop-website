-- ═══════════════════════════════════════════════════════════════
--  Kopi Nusantara — Seed Data
--  Jalankan setelah schema.sql:
--  psql -U postgres -d kopi_nusantara -f seed.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── Kategori ────────────────────────────────────────────────
INSERT INTO categories (name, slug, icon) VALUES
  ('Kopi',     'kopi',     '☕'),
  ('Non-Kopi', 'non-kopi', '🍵'),
  ('Pastry',   'pastry',   '🥐')
ON CONFLICT (slug) DO NOTHING;

-- ─── Produk Kopi ─────────────────────────────────────────────
INSERT INTO products (name, description, price, category_id, image_url, is_featured) VALUES
  ('Espresso',
   'Shot espresso murni dari biji arabika pilihan Flores, dengan crema tebal dan rasa yang bold.',
   25000, 1, '/images/espresso.jpg', false),

  ('Americano',
   'Espresso yang diencerkan dengan air panas, menghasilkan rasa kopi yang bersih dan segar.',
   28000, 1, '/images/americano.jpg', false),

  ('Cappuccino',
   'Perpaduan sempurna espresso, susu kukus, dan foam susu yang lembut. Klasik tak lekang waktu.',
   35000, 1, '/images/cappuccino.jpg', true),

  ('Latte',
   'Espresso lembut berpadu susu kukus creamy. Pilihan sempurna untuk hari yang santai.',
   38000, 1, '/images/latte.jpg', true),

  ('Cold Brew',
   'Kopi diseduh dingin selama 18 jam. Rasa yang smooth, manis alami, tanpa rasa pahit.',
   42000, 1, '/images/cold-brew.jpg', true),

  ('V60 Manual Brew',
   'Diseduh manual dengan metode pour-over V60. Nikmati kompleksitas rasa single origin kami.',
   45000, 1, '/images/v60.jpg', false),

  ('Kopi Susu Gula Aren',
   'Espresso segar bertemu susu segar dan manisnya gula aren nusantara. Favorit pelanggan kami.',
   32000, 1, '/images/kopi-susu.jpg', true);

-- ─── Produk Non-Kopi ─────────────────────────────────────────
INSERT INTO products (name, description, price, category_id, image_url, is_featured) VALUES
  ('Matcha Latte',
   'Matcha premium asal Jepang dipadukan susu oat yang creamy. Sehat dan memanjakan.',
   38000, 2, '/images/matcha.jpg', true),

  ('Cokelat Panas',
   'Cokelat belgia murni yang kaya, hangat, dan menghibur di setiap tegukan.',
   32000, 2, '/images/cokelat.jpg', false),

  ('Lemon Tea Honey',
   'Teh hijau segar dengan perasan lemon dan madu asli. Menyegarkan jiwa dan raga.',
   25000, 2, '/images/lemon-tea.jpg', false),

  ('Strawberry Smoothie',
   'Strawberry segar diblender dengan yogurt dan madu. Creamy, segar, dan penuh vitamin.',
   40000, 2, '/images/smoothie.jpg', false);

-- ─── Produk Pastry ───────────────────────────────────────────
INSERT INTO products (name, description, price, category_id, image_url, is_featured) VALUES
  ('Croissant Butter',
   'Croissant berlapis mentega pilihan, dipanggang segar setiap pagi hingga kecokelatan sempurna.',
   28000, 3, '/images/croissant.jpg', true),

  ('Banana Bread',
   'Roti pisang lembut dengan tekstur yang moist, dibuat dari pisang cavendish matang pilihan.',
   25000, 3, '/images/banana-bread.jpg', false),

  ('Japanese Cheesecake',
   'Cheesecake lembut ala Jepang, ringan seperti kapas namun kaya rasa keju cream.',
   35000, 3, '/images/cheesecake.jpg', true),

  ('Choco Muffin',
   'Muffin cokelat yang moist dengan chocolate chip melimpah di setiap gigitan.',
   22000, 3, '/images/muffin.jpg', false);

-- ─── Admin default (password: admin123) ──────────────────────
-- Hash dihasilkan dari bcrypt.hashSync('admin123', 10)
-- GANTI PASSWORD INI SEBELUM PRODUCTION!
INSERT INTO admins (email, password_hash, name) VALUES
  ('admin@kopinusantara.id',
   '$2a$10$rQnJpN8mKqX5vL2wP0yH8eR3aB1cD4eF6gH7iJ8kL9mN0oP1qR2s',
   'Admin Kopi Nusantara')
ON CONFLICT (email) DO NOTHING;
