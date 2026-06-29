import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, SESSION_MAX_AGE, cookieOptions, getAdminToken, safeEqual, createSession } from '@/lib/admin-auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// POST /api/admin/login — tukar token dengan cookie sesi httpOnly.
export async function POST(request) {
  // Rate limit ketat: redam brute-force tebak token (10 percobaan/menit/IP).
  const ip = getClientIp(request)
  const rl = rateLimit({ key: `admin-login:${ip}`, limit: 10, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: 'Terlalu banyak percobaan. Coba lagi sebentar.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const token = getAdminToken()
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Dashboard belum dikonfigurasi (ADMIN_API_TOKEN belum di-set di server).' },
      { status: 503 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const input = typeof body?.token === 'string' ? body.token : ''
  if (!safeEqual(input, token)) {
    return NextResponse.json({ success: false, error: 'Token salah.' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, createSession(), { ...cookieOptions, maxAge: SESSION_MAX_AGE })
  return res
}
