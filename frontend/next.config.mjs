/** @type {import('next').NextConfig} */

// ── Content-Security-Policy (mode ENFORCING / aktif memblokir) ────────────────
// CSP ini BENAR-BENAR memblokir sumber daya di luar allowlist. Allowlist sudah
// diverifikasi mencakup SEMUA yang dipakai situs, jadi tampilan & popup Midtrans
// tetap utuh:
//   • Midtrans Snap  → script-src + frame-src + connect-src + form-action
//   • Google Fonts   → style-src (fonts.googleapis.com) + font-src (fonts.gstatic.com)
//                      (di-@import dari globals.css — WAJIB ada, kalau tidak font rusak)
//   • Gambar Unsplash → img-src
//   • Supabase        → connect-src (untuk jaga-jaga bila dipanggil dari browser)
// Catatan: 'unsafe-inline' & 'unsafe-eval' dipertahankan karena Next.js (script
// hydration/RSC tanpa nonce) & framer-motion membutuhkannya. Penajaman lebih
// lanjut (nonce/hash, buang unsafe-eval) bisa dilakukan nanti bila diperlukan.
const csp = [
  "default-src 'self'",
  // Next.js & framer-motion butuh inline/eval; Midtrans Snap dimuat dari domain Midtrans.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.midtrans.com",
  // 'unsafe-inline' utk style framer-motion/Tailwind; fonts.googleapis.com utk CSS Google Fonts.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // blob: dipakai sebagian library utk render gambar; Unsplash = gambar menu.
  "img-src 'self' data: blob: https://images.unsplash.com https://*.midtrans.com",
  // fonts.gstatic.com = file .woff2 dari Google Fonts.
  "font-src 'self' data: https://fonts.gstatic.com",
  // Supabase dipanggil dari server; Web3Forms dipanggil dari browser (form kontak).
  "connect-src 'self' https://*.midtrans.com https://*.supabase.co https://api.web3forms.com",
  // Popup pembayaran Midtrans berupa iframe.
  "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com https://*.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  // Midtrans diizinkan untuk berjaga bila Snap mengirim form dari dokumen utama.
  "form-action 'self' https://*.midtrans.com",
  "frame-ancestors 'self'",
].join('; ')

// ── Security headers (aman, standar industri) ────────────────────────────────
const securityHeaders = [
  // Paksa HTTPS selama 2 tahun (Vercel selalu HTTPS).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Cegah situs di-embed orang lain (anti-clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Cegah browser menebak-nebak tipe konten (anti MIME-sniffing).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Jangan bocorkan URL lengkap ke situs lain.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Matikan akses fitur sensitif yang tidak dipakai.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Content-Security-Policy', value: csp },
]

const nextConfig = {
  // Backend menyatu di dalam Next.js (route handler di src/app/api/*),
  // jadi tidak perlu proxy/rewrite ke server eksternal.
  poweredByHeader: false, // sembunyikan header 'X-Powered-By: Next.js'
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
