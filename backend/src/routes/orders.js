const express      = require('express')
const router       = express.Router()
const pool         = require('../db/pool')
const authenticate = require('../middleware/authenticate')

// Ongkos kirim flat untuk delivery (pickup = gratis)
const DELIVERY_FEE     = 10000
const FULFILLMENT_TYPES = ['delivery', 'pickup']
const PAYMENT_METHODS   = ['transfer', 'ewallet', 'cod']

// ── POST /api/orders — KHUSUS ORDER ONLINE ──────────────────────────────────────
// Body: {
//   customer_name, customer_phone, customer_email?,
//   fulfillment_type: 'delivery'|'pickup',
//   delivery_address?  (wajib jika delivery),
//   payment_method: 'transfer'|'ewallet'|'cod',
//   notes?, items: [{ product_id, quantity }]
// }
router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      customer_name, customer_phone, customer_email,
      fulfillment_type, delivery_address, payment_method,
      notes, items,
    } = req.body

    // ── Validasi khusus order online ──────────────────────────────────────────
    if (!customer_name || !customer_phone) {
      return res.status(400).json({ success: false, error: 'Nama dan nomor telepon wajib diisi' })
    }
    if (!items?.length) {
      return res.status(400).json({ success: false, error: 'Pesanan tidak boleh kosong' })
    }
    if (!FULFILLMENT_TYPES.includes(fulfillment_type)) {
      return res.status(400).json({ success: false, error: 'Metode pengantaran tidak valid (delivery / pickup)' })
    }
    if (fulfillment_type === 'delivery' && !delivery_address?.trim()) {
      return res.status(400).json({ success: false, error: 'Alamat pengantaran wajib diisi untuk delivery' })
    }
    if (!PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({ success: false, error: 'Metode pembayaran tidak valid' })
    }

    await client.query('BEGIN')

    // Ambil harga produk dari DB (jangan percaya harga dari client)
    const productIds = items.map(i => i.product_id)
    const { rows: products } = await client.query(
      'SELECT id, name, price FROM products WHERE id = ANY($1) AND is_available = TRUE',
      [productIds]
    )

    // Validasi semua produk ditemukan
    if (products.length !== productIds.length) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, error: 'Beberapa produk tidak tersedia' })
    }

    // Hitung subtotal dari harga server + ongkir
    const productMap = Object.fromEntries(products.map(p => [p.id, p]))
    let subtotal = 0
    for (const item of items) {
      subtotal += productMap[item.product_id].price * item.quantity
    }
    const delivery_fee = fulfillment_type === 'delivery' ? DELIVERY_FEE : 0
    const total = subtotal + delivery_fee

    // Buat order
    const { rows: [order] } = await client.query(
      `INSERT INTO orders
         (customer_name, customer_phone, customer_email, fulfillment_type, delivery_address,
          payment_method, notes, subtotal, delivery_fee, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        customer_name, customer_phone, customer_email || null,
        fulfillment_type, fulfillment_type === 'delivery' ? delivery_address.trim() : null,
        payment_method, notes || null, subtotal, delivery_fee, total,
      ]
    )

    // Buat order_items
    for (const item of items) {
      const prod = productMap[item.product_id]
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_order)
         VALUES ($1,$2,$3,$4,$5)`,
        [order.id, item.product_id, prod.name, item.quantity, prod.price]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({
      success: true,
      data: {
        order_id: order.id, subtotal, delivery_fee, total,
        status: order.status, fulfillment_type, payment_method,
      },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[POST /orders]', err.message)
    res.status(500).json({ success: false, error: 'Gagal membuat pesanan' })
  } finally {
    client.release()
  }
})

// ── GET /api/orders  (admin only) ────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query
    let query = `
      SELECT o.*,
        json_agg(json_build_object(
          'product_name', oi.product_name,
          'quantity',     oi.quantity,
          'price',        oi.price_at_order
        )) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
    `
    const params = []
    if (status) { params.push(status); query += ` WHERE o.status = $1` }
    query += ` GROUP BY o.id ORDER BY o.created_at DESC`

    const { rows } = await pool.query(query, params)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// ── PATCH /api/orders/:id/status  (admin only) ───────────────────────────────
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending','preparing','ready','delivering','completed','cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status tidak valid' })
    }
    const { rows } = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Order tidak ditemukan' })
    res.json({ success: true, data: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

module.exports = router
