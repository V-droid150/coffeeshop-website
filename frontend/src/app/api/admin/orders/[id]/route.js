import { NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Status pesanan yang valid (selaras dengan CHECK di supabase-schema.sql).
export const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'delivering', 'completed', 'cancelled']

// PATCH /api/admin/orders/[id] — ubah status pesanan. Hanya untuk admin (cek cookie sesi).
export async function PATCH(request, { params }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const id = Number(params.id)
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const { status } = body || {}
  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, error: 'Status tidak valid' }, { status: 400 })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database belum terhubung' }, { status: 503 })
  }

  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select('id')
  if (error) {
    console.error('[admin] update status error:', error.message)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui status' }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
