/** @type {import('next').NextConfig} */

// ── Content-Security-Policy (mode LAPORAN / Report-Only) ──────────────────────
// Tidak memblokir apa pun — hanya mencatat pelanggaran di console browser, jadi
// AMAN dan tidak akan merusak popup Midtrans. Allowlist sudah mencakup Midtrans
// (script + iframe popup), gambar Unsplash, dan koneksi Supabase. Setelah yakin
// tidak ada pelanggaran sah, ganti header-nya jadi 'Content-Security-Policy'
// (tanpa -Report-Only) untuk benar-benar memblokir.
const cspReportOnly = [
  "default-src 'self'",
  // Next.js & framer-motion butuh inline; Midtrans Snap dimuat dari domain Midtrans.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com https://*.midtrans.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://images.unsplash.com https://*.midtrans.com",
  "font-src 'self' data:",
  // Supabase dipanggil dari server, tapi diizinkan juga bila suatu saat dari browser.
  "connect-src 'self' https://*.midtrans.com https://*.supabase.co",
  // Popup pembayaran Midtrans berupa iframe.
  "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com https://*.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
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
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
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
