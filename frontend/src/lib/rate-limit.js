// Rate limiter in-memory sederhana (fixed window).
//
// CATATAN: ini "best-effort" di lingkungan serverless (Vercel) — state disimpan
// per-instance dan bisa ter-reset saat instance baru dibuat. Cukup untuk meredam
// spam/banjir request biasa tanpa biaya & tanpa dependency. Untuk proteksi
// produksi skala besar, gunakan store terdistribusi seperti Upstash Redis.

const buckets = new Map()

/**
 * @param {{ key: string, limit: number, windowMs: number }} opts
 * @returns {{ ok: boolean, remaining?: number, retryAfter?: number }}
 */
export function rateLimit({ key, limit, windowMs }) {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now > entry.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    maybeCleanup(now)
    return { ok: true, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.reset - now) / 1000)) }
  }
  return { ok: true, remaining: limit - entry.count }
}

// Buang entri kedaluwarsa agar Map tidak membengkak (dipanggil sesekali).
function maybeCleanup(now) {
  if (buckets.size < 5000) return
  for (const [k, v] of buckets) {
    if (now > v.reset) buckets.delete(k)
  }
}

// Ambil IP klien dari header yang di-set Vercel/proxy.
export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
