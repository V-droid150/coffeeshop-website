import { NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/supabase'
import { buildRecord } from '@/lib/products'

export const dynamic = 'force-dynamic'

function parseId(params) {
  const id = Number(params?.id)
  return Number.isInteger(id) && id > 0 ? id : null
}

// PATCH /api/admin/products/[id] — ubah produk.
export async function PATCH(request, { params }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const id = parseId(params)
  if (!id) return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const { error: vErr, record } = buildRecord(body)
  if (vErr) return NextResponse.json({ success: false, error: vErr }, { status: 400 })

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: false, error: 'Database belum terhubung' }, { status: 503 })

  const { error } = await supabase.from('products').update(record).eq('id', id)
  if (error) {
    console.error('[admin] update product error:', error.message)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui produk' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

// DELETE /api/admin/products/[id] — hapus produk. Order lama tidak terpengaruh
// (order_items menyimpan snapshot nama & harga saat pemesanan).
export async function DELETE(request, { params }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const id = parseId(params)
  if (!id) return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 })

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: false, error: 'Database belum terhubung' }, { status: 503 })

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    console.error('[admin] delete product error:', error.message)
    return NextResponse.json({ success: false, error: 'Gagal menghapus produk' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
