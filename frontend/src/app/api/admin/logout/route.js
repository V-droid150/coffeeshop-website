import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, cookieOptions } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// POST /api/admin/logout — hapus cookie sesi.
export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions, maxAge: 0 })
  return res
}
