# 🚀 Deploy Kopi Nusantara (Vercel + Render)

Aplikasi ini full-stack, jadi di-deploy di dua tempat:

| Bagian | Host | Kenapa |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Dukungan Next.js terbaik, gratis |
| Backend (Express API) | **Render** | Bisa menjalankan server Node, gratis |

> Urutannya: **deploy backend dulu** → dapat URL-nya → baru deploy frontend pakai URL itu.

---

## 1️⃣ Backend → Render

1. Buka https://render.com → daftar/login pakai akun GitHub.
2. Klik **New +** → **Blueprint**.
3. Pilih repository **`coffeeshop-website`**.
4. Render mendeteksi `render.yaml` otomatis → klik **Apply**.
5. Tunggu build selesai (±2–3 menit). Service akan online di URL seperti:
   ```
   https://kopi-nusantara-backend.onrender.com
   ```
6. Tes: buka `https://<url-render>/api/health` → harus muncul `{"status":"OK ..."}`.

> Catatan: free plan Render "tidur" setelah ±15 menit tidak dipakai. Request
> pertama setelah tidur butuh ±30 detik untuk bangun (cold start). Wajar untuk demo.
> Data order disimpan di memory, jadi ter-reset tiap restart.

---

## 2️⃣ Frontend → Vercel

1. Buka https://vercel.com → daftar/login pakai akun GitHub.
2. **Add New… → Project** → import repo **`coffeeshop-website`**.
3. Di halaman konfigurasi:
   - **Root Directory**: klik **Edit** → pilih **`frontend`**  ← penting!
   - Framework otomatis terdeteksi: **Next.js**.
4. Buka bagian **Environment Variables**, tambahkan 2 variabel (isi dengan URL Render dari langkah 1):
   ```
   NEXT_PUBLIC_API_URL = https://kopi-nusantara-backend.onrender.com
   API_URL             = https://kopi-nusantara-backend.onrender.com
   ```
5. Klik **Deploy**. Setelah selesai, situs live di:
   ```
   https://coffeeshop-website-xxxx.vercel.app
   ```

---

## 3️⃣ Selesai

Buka URL Vercel → beranda, menu (dengan foto produk), dan checkout online
(delivery/pickup) sudah berfungsi memanggil backend di Render.

### Update ke depan
Cukup `git push` ke `master` — Vercel & Render auto-redeploy.

### Kalau mau pakai PostgreSQL beneran (bukan in-memory)
- Tambah PostgreSQL di Render, jalankan `backend/src/db/schema.sql` + `seed.sql`.
- Ganti `startCommand` di `render.yaml` jadi `node server.js`.
- Tambah env DB (`DB_HOST`, `DB_USER`, dst) + `JWT_SECRET` di Render.
