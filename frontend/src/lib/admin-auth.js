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

// Bandingkan dua string secara timing-safe untuk mencegah timing attack.
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

// Dipakai di server component dashboard: true bila cookie sesi cocok dengan token env.
// Bila ADMIN_API_TOKEN belum di-set, selalu false (aman secara default).
export function isAdminAuthed() {
  const token = getAdminToken()
  if (!token) return false
  const session = cookies().get(ADMIN_COOKIE)?.value
  return !!session && safeEqual(session, token)
}
