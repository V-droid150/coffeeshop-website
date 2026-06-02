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
- Tanpa env pembayaran, order tetap tercatat (in-memory) — situs tetap jalan.

---

# 💳 Mengaktifkan Pembayaran (Midtrans Sandbox + Supabase)

Pembayaran online (QRIS/GoPay/VA/kartu) lewat **Midtrans Snap**, status order disimpan di **Supabase**.

## A. Supabase (database)
1. https://supabase.com → **New project** (login GitHub). Catat password DB.
2. Setelah project siap → menu **SQL Editor** → tempel isi `frontend/supabase-schema.sql` → **Run**.
3. **Project Settings → API**, salin:
   - `Project URL`  → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key (Reveal) → `SUPABASE_SERVICE_ROLE_KEY`  *(RAHASIA)*

## B. Midtrans (payment gateway, Sandbox)
1. https://dashboard.midtrans.com → daftar → pastikan toggle **Environment = Sandbox**.
2. **Settings → Access Keys**, salin:
   - `Server Key` → `MIDTRANS_SERVER_KEY`  *(RAHASIA)*
   - `Client Key` → `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
3. **Settings → Configuration → Payment Notification URL**, isi:
   ```
   https://<domain-vercel-anda>/api/payment/notification
   ```

## C. Set Environment Variables di Vercel
Vercel → project → **Settings → Environment Variables**, tambahkan (lihat `frontend/.env.local.example`):
```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
MIDTRANS_SERVER_KEY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```
Lalu **Redeploy** (Deployments → ⋯ → Redeploy).

## D. Uji coba (Sandbox)
- Checkout → **Bayar Online** → popup Midtrans muncul → pilih QRIS/GoPay.
- Pakai simulator/kartu tes Midtrans (mis. kartu `4811 1111 1111 1114`, CVV `123`, exp bebas).
- Status pembayaran terupdate otomatis via webhook → tabel `orders` di Supabase.

> Naik ke **produksi** (uang asli): verifikasi bisnis di Midtrans, ganti key produksi,
> set `MIDTRANS_IS_PRODUCTION=true` (& `NEXT_PUBLIC_...=true`), update Notification URL.
