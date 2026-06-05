import { NextResponse } from 'next/server'
import { DELIVERY_FEE, FULFILLMENT_TYPES, PAYMENT_METHODS } from '@/lib/menu-data'
import { getProducts } from '@/lib/products'
import { getSupabase } from '@/lib/supabase'
import { getSnap } from '@/lib/midtrans'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Fallback in-memory bila Supabase belum dikonfigurasi (situs tetap jalan).
const memoryOrders = []

// Batas panjang input — cegah payload raksasa & data sampah masuk database.
const MAX = { name: 100, phone: 25, email: 254, address: 500, notes: 1000, items: 50 }

// Nomor WhatsApp: wajib diawali +62 atau 0, sisanya angka (8–13 digit).
const PHONE_RE = /^(\+62|0)[0-9]{8,13}$/

// POST /api/orders — order online (delivery/pickup) + pembayaran (online via Midtrans / COD)
export async function POST(request) {
  // ── Rate limit: maks 20 order/menit per IP ──────────────────────────────────
  const ip = getClientIp(request)
  const rl = rateLimit({ key: `orders:${ip}`, limit: 20, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

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
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: false, error: 'Pesanan tidak boleh kosong' }, { status: 400 })
  }
  // ── Batas panjang input ─────────────────────────────────────────────────────
  if (String(customer_name).length > MAX.name)        return NextResponse.json({ success: false, error: 'Nama terlalu panjang' }, { status: 400 })
  if (String(customer_phone).length > MAX.phone)      return NextResponse.json({ success: false, error: 'Nomor telepon terlalu panjang' }, { status: 400 })
  // Normalisasi (buang spasi/strip, '+' hanya di depan) lalu wajib lolos format.
  const cleanPhone = String(customer_phone).replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
  if (!PHONE_RE.test(cleanPhone)) {
    return NextResponse.json({ success: false, error: 'Nomor WhatsApp tidak valid (harus diawali +62 atau 0)' }, { status: 400 })
  }
  if (customer_email && String(customer_email).length > MAX.email) return NextResponse.json({ success: false, error: 'Email terlalu panjang' }, { status: 400 })
  if (delivery_address && String(delivery_address).length > MAX.address) return NextResponse.json({ success: false, error: 'Alamat terlalu panjang' }, { status: 400 })
  if (notes && String(notes).length > MAX.notes)      return NextResponse.json({ success: false, error: 'Catatan terlalu panjang' }, { status: 400 })
  if (items.length > MAX.items)                        return NextResponse.json({ success: false, error: 'Terlalu banyak jenis item dalam satu pesanan' }, { status: 400 })
  if (!FULFILLMENT_TYPES.includes(fulfillment_type)) {
    return NextResponse.json({ success: false, error: 'Metode pengantaran tidak valid' }, { status: 400 })
  }
  if (fulfillment_type === 'delivery' && !delivery_address?.trim()) {
    return NextResponse.json({ success: false, error: 'Alamat pengantaran wajib diisi untuk delivery' }, { status: 400 })
  }
  if (!PAYMENT_METHODS.includes(payment_method)) {
    return NextResponse.json({ success: false, error: 'Metode pembayaran tidak valid' }, { status: 400 })
  }
  // Email opsional. Bila diisi, rapikan spasi & validasi format — email tak valid
  // (mis. ada spasi) akan ditolak Midtrans dan menggagalkan SELURUH transaksi.
  const cleanEmail = customer_email?.trim() || null
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ success: false, error: 'Format email tidak valid (atau kosongkan)' }, { status: 400 })
  }

  // ── Hitung dari harga server ────────────────────────────────────────────────
  // Sumber produk otoritatif: DB bila tabel `products` ada, kalau tidak data statik.
  const allProducts = await getProducts()
  const productMap = Object.fromEntries(allProducts.map(p => [p.id, p]))
  let subtotal = 0
  for (const item of items) {
    const p = productMap[item.product_id]
    if (!p) {
      return NextResponse.json({ success: false, error: `Produk id ${item.product_id} tidak ditemukan` }, { status: 400 })
    }
    // Quantity wajib bilangan bulat positif & wajar — cegah total negatif/NaN & order sampah.
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return NextResponse.json({ success: false, error: `Jumlah untuk "${p.name}" tidak valid (harus 1–99)` }, { status: 400 })
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
      customer_name, customer_phone: cleanPhone, customer_email: cleanEmail,
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
        phone: cleanPhone,
        email: cleanEmail || undefined,
        shipping_address: addr ? { address: addr } : undefined,
      },
    })
    return NextResponse.json({
      success: true,
      data: { ...baseData, midtrans_order_id: midtransOrderId, snap_token: tx.token, snap_redirect_url: tx.redirect_url },
    }, { status: 201 })
  } catch (err) {
    // Ambil alasan asli dari Midtrans (error_messages/status_message) untuk diagnosa.
    const apiResp = err?.ApiResponse
    const reason = (Array.isArray(apiResp?.error_messages) && apiResp.error_messages.join('; '))
      || apiResp?.status_message
      || err?.message
      || 'unknown'
    console.error('[orders] midtrans error:', err?.httpStatusCode || '', reason)
    // Rollback: hapus order yang sudah tersimpan agar tidak tertinggal order "yatim"
    // (berstatus pending tapi tanpa transaksi pembayaran).
    if (supabase) {
      await supabase.from('order_items').delete().eq('order_id', orderId)
      await supabase.from('orders').delete().eq('id', orderId)
    }
    // Pesan generik untuk user; alasan asli tetap tercatat di log server (di atas).
    return NextResponse.json({ success: false, error: 'Gagal membuat transaksi pembayaran' }, { status: 502 })
  }
}

// GET /api/orders — daftar semua order. BERISI DATA PRIBADI pelanggan
// (nama, telepon, email, alamat), jadi WAJIB dilindungi.
// Kirim header `Authorization: Bearer <ADMIN_API_TOKEN>`. Bila ADMIN_API_TOKEN
// belum di-set di environment, endpoint ditolak (aman secara default).
export async function GET(request) {
  const token = process.env.ADMIN_API_TOKEN
  const auth = request.headers.get('authorization')
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: true, data: memoryOrders })
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
