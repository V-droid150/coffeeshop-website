import crypto from 'crypto'
import { cookies } from 'next/headers'

// Nama cookie sesi admin & masa berlaku (8 jam).
export const ADMIN_COOKIE = 'kopi_admin'
export const SESSION_MAX_AGE = 60 * 60 * 8

// Cookie aman hanya HTTPS di production; di localhost (http) dibiarkan agar bisa diuji.
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
}

// Token admin diambil dari env (server-only, tidak pernah ikut ke bundle browser).
// Sengaja memakai ADMIN_API_TOKEN yang sama dengan proteksi GET /api/orders.
export function getAdminToken() {
  return process.env.ADMIN_API_TOKEN || ''
}

// Kunci konstan untuk menyeragamkan panjang input sebelum timingSafeEqual.
const SAFE_EQUAL_KEY = 'kopi-safe-equal-v1'

// Bandingkan dua string secara timing-safe TANPA membocorkan panjang (HMAC →
// digest selalu 32 byte, jadi timingSafeEqual aman walau panjang input beda).
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const ha = crypto.createHmac('sha256', SAFE_EQUAL_KEY).update(a).digest()
  const hb = crypto.createHmac('sha256', SAFE_EQUAL_KEY).update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

// ── Signed session (stateless, aman untuk serverless) ───────────────────────
// Cookie TIDAK lagi menyimpan token mentah; menyimpan `${exp}.${signature}`
// di mana signature = HMAC(ADMIN_API_TOKEN, exp). Tanpa token, tak bisa dipalsukan.
function signValue(value) {
  return crypto.createHmac('sha256', getAdminToken()).update(value).digest('base64url')
}

export function createSession() {
  const exp = String(Date.now() + SESSION_MAX_AGE * 1000)
  return `${exp}.${signValue(exp)}`
}

export function verifySession(value) {
  if (typeof value !== 'string') return false
  const dot = value.indexOf('.')
  if (dot < 1) return false
  const exp = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  if (!/^\d+$/.test(exp)) return false
  if (Number(exp) < Date.now()) return false           // sesi kedaluwarsa
  const expected = signValue(exp)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// Dipakai di server component dashboard: true bila cookie sesi cocok dengan token env.
// Bila ADMIN_API_TOKEN belum di-set, selalu false (aman secara default).
export function isAdminAuthed() {
  const token = getAdminToken()
  if (!token) return false
  const session = cookies().get(ADMIN_COOKIE)?.value
  return !!session && verifySession(session)
}
