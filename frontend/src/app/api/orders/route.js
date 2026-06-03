import { NextResponse } from 'next/server'
import { products, DELIVERY_FEE, FULFILLMENT_TYPES, PAYMENT_METHODS } from '@/lib/menu-data'
import { getSupabase } from '@/lib/supabase'
import { getSnap } from '@/lib/midtrans'

export const dynamic = 'force-dynamic'

// Fallback in-memory bila Supabase belum dikonfigurasi (situs tetap jalan).
const memoryOrders = []

// POST /api/orders — order online (delivery/pickup) + pembayaran (online via Midtrans / COD)
export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
  }

  const {
    customer_name, customer_phone, customer_email,
    fulfillment_type, delivery_address, payment_method,
    notes, items,
  } = body

  // ── Validasi ──────────────────────────────────────────────────────────────
  if (!customer_name || !customer_phone) {
    return NextResponse.json({ success: false, error: 'Nama dan nomor telepon wajib diisi' }, { status: 400 })
  }
  if (!items?.length) {
    return NextResponse.json({ success: false, error: 'Pesanan tidak boleh kosong' }, { status: 400 })
  }
  if (!FULFILLMENT_TYPES.includes(fulfillment_type)) {
    return NextResponse.json({ success: false, error: 'Metode pengantaran tidak valid' }, { status: 400 })
  }
  if (fulfillment_type === 'delivery' && !delivery_address?.trim()) {
    return NextResponse.json({ success: false, error: 'Alamat pengantaran wajib diisi untuk delivery' }, { status: 400 })
  }
  if (!PAYMENT_METHODS.includes(payment_method)) {
    return NextResponse.json({ success: false, error: 'Metode pembayaran tidak valid' }, { status: 400 })
  }

  // ── Hitung dari harga server ────────────────────────────────────────────────
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))
  let subtotal = 0
  for (const item of items) {
    const p = productMap[item.product_id]
    if (!p) {
      return NextResponse.json({ success: false, error: `Produk id ${item.product_id} tidak ditemukan` }, { status: 400 })
    }
    subtotal += p.price * item.quantity
  }
  const delivery_fee = fulfillment_type === 'delivery' ? DELIVERY_FEE : 0
  const total = subtotal + delivery_fee

  const addr = fulfillment_type === 'delivery' ? delivery_address.trim() : null
  const supabase = getSupabase()

  // ── Simpan order (Supabase bila ada, kalau tidak in-memory) ─────────────────
  let orderId
  // ID unik untuk Midtrans — tidak bergantung id DB, jadi bisa di-set langsung saat insert.
  const midtransOrderId = `KOPI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  if (supabase) {
    const { data: order, error } = await supabase.from('orders').insert({
      customer_name, customer_phone, customer_email: customer_email || null,
      fulfillment_type, delivery_address: addr, payment_method,
      notes: notes || null, subtotal, delivery_fee, total_amount: total,
      status: 'pending', payment_status: payment_method === 'cod' ? 'unpaid' : 'pending',
      midtrans_order_id: midtransOrderId,
    }).select('id').single()

    if (error) {
      console.error('[orders] supabase insert error:', error.message)
      return NextResponse.json({ success: false, error: 'Gagal menyimpan pesanan' }, { status: 500 })
    }
    orderId = order.id

    // Cek error insert order_items — kalau gagal, batalkan order agar tak ada order tanpa item.
    const { error: itemsError } = await supabase.from('order_items').insert(items.map(i => {
      const p = productMap[i.product_id]
      return { order_id: orderId, product_id: p.id, product_name: p.name, quantity: i.quantity, price_at_order: p.price }
    }))
    if (itemsError) {
      console.error('[orders] supabase order_items insert error:', itemsError.message)
      await supabase.from('orders').delete().eq('id', orderId) // rollback sederhana
      return NextResponse.json({ success: false, error: 'Gagal menyimpan item pesanan' }, { status: 500 })
    }
  } else {
    orderId = memoryOrders.length + 1
    memoryOrders.push({ id: orderId, total, payment_method })
  }

  const baseData = { order_id: orderId, subtotal, delivery_fee, total, status: 'pending', fulfillment_type, payment_method }

  // ── COD atau Midtrans belum dikonfigurasi → tanpa popup ─────────────────────
  const snap = getSnap()
  if (payment_method === 'cod' || !snap) {
    return NextResponse.json({ success: true, data: { ...baseData, snap_token: null } }, { status: 201 })
  }

  // ── Online → buat transaksi Snap Midtrans ───────────────────────────────────
  const item_details = items.map(i => {
    const p = productMap[i.product_id]
    return { id: String(p.id), price: p.price, quantity: i.quantity, name: p.name.slice(0, 50) }
  })
  if (delivery_fee > 0) {
    item_details.push({ id: 'ongkir', price: delivery_fee, quantity: 1, name: 'Ongkos kirim' })
  }

  try {
    const tx = await snap.createTransaction({
      transaction_details: { order_id: midtransOrderId, gross_amount: total },
      item_details,
      customer_details: {
        first_name: customer_name,
        phone: customer_phone,
        email: customer_email || undefined,
        shipping_address: addr ? { address: addr } : undefined,
      },
    })
    return NextResponse.json({
      success: true,
      data: { ...baseData, midtrans_order_id: midtransOrderId, snap_token: tx.token, snap_redirect_url: tx.redirect_url },
    }, { status: 201 })
  } catch (err) {
    console.error('[orders] midtrans error:', err.message)
    return NextResponse.json({ success: false, error: 'Gagal membuat transaksi pembayaran' }, { status: 502 })
  }
}

export async function GET() {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: true, data: memoryOrders })
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
