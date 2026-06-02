# 🚀 Deploy Kopi Nusantara ke Vercel

Aplikasi ini **mandiri** — backend (API menu & order) menyatu di dalam Next.js
sebagai route handler (`frontend/src/app/api/*`). Jadi cukup **deploy ke Vercel saja**:
gratis, tanpa kartu kredit, tanpa server terpisah.

> Folder `backend/` (Express + PostgreSQL) tetap ada sebagai alternatif standalone,
> tapi **tidak diperlukan** untuk deploy ke Vercel.

---

## Langkah deploy

### 1. Buat akun Vercel
1. Buka **https://vercel.com**
2. **Sign Up** → **Continue with GitHub** → login → **Authorize**

### 2. Import project
1. Dashboard → **Add New… → Project**
2. Cari repo **`coffeeshop-website`** → **Import**

### 3. Konfigurasi (penting ⚠️)
- **Root Directory** → klik **Edit** → pilih **`frontend`**
- **Framework Preset** otomatis terdeteksi: **Next.js**
- **Environment Variables**: *(kosongkan — tidak perlu apa pun)*

### 4. Deploy
- Klik **Deploy**, tunggu ±1–2 menit
- Situs live di: `https://coffeeshop-website-xxxx.vercel.app`

---

## ✅ Cek hasil
Buka URL Vercel:
- **Beranda** → hero + section "Tempat & Layanan"
- **Menu** → foto produk tampil rapi
- **Checkout** → tambah item → form delivery/pickup + pembayaran berfungsi

## Update ke depan
Cukup `git push` ke `master` — Vercel auto-redeploy.

## Catatan
- Data produk bersifat statis (di `frontend/src/lib/menu-data.js`).
- Order divalidasi & dihitung di server (route handler), namun **tidak disimpan
  permanen** (in-memory per request) — cukup untuk demo/portofolio. Untuk simpan
  permanen, hubungkan database (mis. Vercel Postgres) di route handler `api/orders`.
