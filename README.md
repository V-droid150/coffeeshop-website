# ☕ Kopi Nusantara — Coffee Shop Website

Website coffee shop full-stack dengan tema **Warm & Cozy**.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + Framer Motion |
| Backend  | Node.js + Express.js |
| Database | PostgreSQL |
| Auth     | JWT (admin dashboard) |

## Struktur Proyek

```
coffeeshop/
├── frontend/          # Next.js App
│   └── src/
│       ├── app/           # Pages (SSR)
│       │   ├── page.jsx       → Beranda (Hero + Featured Menu)
│       │   ├── menu/          → Halaman Menu (fetch dari API)
│       │   └── checkout/      → Checkout & Order
│       ├── components/    # UI Components
│       ├── context/       # CartContext (global state)
│       └── lib/api.js     # Semua fetch ke backend
│
└── backend/           # Express REST API
    ├── server.js
    └── src/
        ├── routes/        # products, orders, categories, auth
        ├── middleware/    # JWT authenticate
        └── db/            # pool.js, schema.sql, seed.sql
```

## API Endpoints

```
GET  /api/products          → Semua produk (optional ?category=kopi&featured=true)
GET  /api/products/:id      → Detail produk
POST /api/products          → Tambah produk [AUTH]
PUT  /api/products/:id      → Edit produk [AUTH]
DELETE /api/products/:id    → Hapus produk [AUTH]

GET  /api/categories        → Semua kategori

POST /api/orders            → Buat pesanan ONLINE (delivery/pickup + metode bayar)
GET  /api/orders            → Semua pesanan [AUTH]
PATCH /api/orders/:id/status → Update status [AUTH] (pending→preparing→ready→delivering→completed)

POST /api/auth/login        → Login admin
```

## Setup Development

### 1. Database PostgreSQL
```bash
createdb kopi_nusantara
psql -U postgres -d kopi_nusantara -f backend/src/db/schema.sql
psql -U postgres -d kopi_nusantara -f backend/src/db/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env     # isi nilai di .env
npm install
npm run dev              # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev              # http://localhost:3000
```

## Deploy ke VPS

```bash
# Install dependencies
apt install -y nodejs npm postgresql nginx

# Setup database
sudo -u postgres createdb kopi_nusantara
sudo -u postgres psql kopi_nusantara < backend/src/db/schema.sql
sudo -u postgres psql kopi_nusantara < backend/src/db/seed.sql

# Backend (PM2)
cd backend && npm install --production
pm2 start server.js --name kopi-backend

# Frontend (build + PM2)
cd frontend && npm install && npm run build
pm2 start npm --name kopi-frontend -- start

# Nginx reverse proxy
# /api/* → localhost:5000
# /*     → localhost:3000
```

---
Built with ☕ by VinSite — Professional Website Maker
