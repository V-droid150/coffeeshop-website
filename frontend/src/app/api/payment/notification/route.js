import { NextResponse } from 'next/server'
import { getCoreApi } from '@/lib/midtrans'
import { getSupabase } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Webhook Midtrans → set URL ini di dashboard Midtrans:
//   https://<domain-vercel-anda>/api/payment/notification
export async function POST(request) {
  // Rate limit longgar (300/menit/IP) — meredam banjir tanpa memblokir retry sah
  // Midtrans. Notifikasi tetap diverifikasi signature di bawah, jadi yang palsu ditolak.
  const ip = getClientIp(request)
  const rl = rateLimit({ key: `webhook:${ip}`, limit: 300, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ ok: false, error: 'rate limited' }, { status: 429 })

  const core = getCoreApi()
  if (!core) return NextResponse.json({ ok: false, error: 'not configured' }, { status: 500 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 })
  }

  // Verifikasi notifikasi ke Midtrans (cek signature & ambil status resmi)
  let status
  try {
    status = await core.transaction.notification(body)
  } catch (err) {
    console.error('[webhook] verifikasi gagal:', err.message)
    return NextResponse.json({ ok: false, error: 'invalid notification' }, { status: 403 })
  }

  const { order_id, transaction_status, fraud_status } = status

  let payment_status = 'pending'
  if (transaction_status === 'capture') {
    payment_status = fraud_status === 'accept' ? 'paid' : 'pending'
  } else if (transaction_status === 'settlement') {
    payment_status = 'paid'
  } else if (transaction_status === 'pending') {
    payment_status = 'pending'
  } else if (transaction_status === 'expire') {
    payment_status = 'expired'
  } else if (['cancel', 'deny'].includes(transaction_status)) {
    payment_status = 'failed'
  }

  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('midtrans_order_id', order_id)
    if (error) console.error('[webhook] update gagal:', error.message)
  }

  // Wajib balas 200 agar Midtrans tidak retry terus
  return NextResponse.json({ ok: true })
}
