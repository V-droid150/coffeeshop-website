import { NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/supabase'
import { buildRecord } from '@/lib/products'

export const dynamic = 'force-dynamic'

// POST /api/admin/products — tambah produk baru.
export async function POST(request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const { error: vErr, record } = buildRecord(body)
  if (vErr) return NextResponse.json({ success: false, error: vErr }, { status: 400 })

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Database belum terhubung' }, { status: 503 })
  }

  const { data, error } = await supabase.from('products').insert(record).select('id').single()
  if (error) {
    console.error('[admin] create product error:', error.message)
    return NextResponse.json({ success: false, error: 'Gagal menambah produk (pastikan tabel products sudah dibuat)' }, { status: 500 })
  }
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
