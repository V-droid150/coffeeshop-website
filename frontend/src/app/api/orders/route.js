import { NextResponse } from 'next/server'
import { products, DELIVERY_FEE, FULFILLMENT_TYPES, PAYMENT_METHODS } from '@/lib/menu-data'

export const dynamic = 'force-dynamic'

// Order disimpan in-memory (per instance). Untuk demo/portofolio sudah cukup —
// konfirmasi order tetap muncul dari respons. Persistensi nyata butuh database.
const orders = []

// POST /api/orders — KHUSUS ORDER ONLINE (delivery / pickup)
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

  // ── Validasi khusus order online ──
  if (!customer_name || !customer_phone) {
    return NextResponse.json({ success: false, error: 'Nama dan nomor telepon wajib diisi' }, { status: 400 })
  }
  if (!items?.length) {
    return NextResponse.json({ success: false, error: 'Pesanan tidak boleh kosong' }, { status: 400 })
  }
  if (!FULFILLMENT_TYPES.includes(fulfillment_type)) {
    return NextResponse.json({ success: false, error: 'Metode pengantaran tidak valid (delivery / pickup)' }, { status: 400 })
  }
  if (fulfillment_type === 'delivery' && !delivery_address?.trim()) {
    return NextResponse.json({ success: false, error: 'Alamat pengantaran wajib diisi untuk delivery' }, { status: 400 })
  }
  if (!PAYMENT_METHODS.includes(payment_method)) {
    return NextResponse.json({ success: false, error: 'Metode pembayaran tidak valid' }, { status: 400 })
  }

  // Hitung subtotal dari harga server (jangan percaya harga dari client)
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

  const order = {
    id: orders.length + 1,
    customer_name, customer_phone, customer_email: customer_email || null,
    fulfillment_type,
    delivery_address: fulfillment_type === 'delivery' ? delivery_address.trim() : null,
    payment_method, notes: notes || null,
    items, subtotal, delivery_fee, total_amount: total,
    status: 'pending', created_at: new Date(),
  }
  orders.push(order)

  return NextResponse.json({
    success: true,
    data: { order_id: order.id, subtotal, delivery_fee, total, status: 'pending', fulfillment_type, payment_method },
  }, { status: 201 })
}

export function GET() {
  return NextResponse.json({ success: true, data: orders })
}
