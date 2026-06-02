/**
 * server.dev.js — Development server dengan in-memory data
 * Tidak butuh PostgreSQL. Jalankan: node server.dev.js
 * Untuk production, gunakan server.js + PostgreSQL.
 */
require('dotenv').config()
const express = require('express')
const cors    = require('express')
const app     = express()
const PORT    = process.env.PORT || 5000

app.use(require('cors')({ origin: '*' }))
app.use(express.json())

// ── In-memory "database" ──────────────────────────────────────────────────────
const categories = [
  { id: 1, name: 'Kopi',     slug: 'kopi',     icon: '☕' },
  { id: 2, name: 'Non-Kopi', slug: 'non-kopi', icon: '🍵' },
  { id: 3, name: 'Pastry',   slug: 'pastry',   icon: '🥐' },
]

let products = [
  { id:1, image_url:'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',  name:'Espresso',            description:'Shot espresso murni dari biji arabika pilihan Flores, dengan crema tebal dan rasa yang bold.',          price:25000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:false },
  { id:2, image_url:'https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=800&q=80',  name:'Americano',           description:'Espresso yang diencerkan dengan air panas, menghasilkan rasa kopi yang bersih dan segar.',              price:28000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:false },
  { id:3, image_url:'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',  name:'Cappuccino',          description:'Perpaduan sempurna espresso, susu kukus, dan foam susu yang lembut. Klasik tak lekang waktu.',          price:35000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:4, image_url:'https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&w=800&q=80',  name:'Latte',               description:'Espresso lembut berpadu susu kukus creamy. Pilihan sempurna untuk hari yang santai.',                   price:38000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:5, image_url:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',  name:'Cold Brew',           description:'Kopi diseduh dingin selama 18 jam. Rasa yang smooth, manis alami, tanpa rasa pahit.',                  price:42000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:6, image_url:'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&w=800&q=80',  name:'V60 Manual Brew',     description:'Diseduh manual dengan metode pour-over V60. Nikmati kompleksitas rasa single origin kami.',            price:45000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:false },
  { id:7, image_url:'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',  name:'Kopi Susu Gula Aren', description:'Espresso segar bertemu susu segar dan manisnya gula aren nusantara. Favorit pelanggan kami.',          price:32000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:8, image_url:'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',  name:'Matcha Latte',        description:'Matcha premium asal Jepang dipadukan susu oat yang creamy. Sehat dan memanjakan.',                     price:38000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:true  },
  { id:9, image_url:'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',  name:'Hot Chocolate',       description:'Cokelat Belgia murni yang kaya, hangat, dan menghibur di setiap tegukan.',                             price:32000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:false },
  { id:10, image_url:'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', name:'Lemon Tea Honey',     description:'Teh hijau segar dengan perasan lemon dan madu asli. Menyegarkan jiwa dan raga.',                       price:25000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:false },
  { id:11, image_url:'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80', name:'Strawberry Smoothie', description:'Strawberry segar diblender dengan yogurt dan madu. Creamy, segar, dan penuh vitamin.',                 price:40000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:false },
  { id:12, image_url:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', name:'Croissant Butter',    description:'Croissant berlapis mentega pilihan, dipanggang segar setiap pagi hingga kecokelatan sempurna.',        price:28000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:true  },
  { id:13, image_url:'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=800&q=80', name:'Banana Bread',        description:'Roti pisang lembut dengan tekstur yang moist, dibuat dari pisang cavendish matang pilihan.',           price:25000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:false },
  { id:14, image_url:'https://images.unsplash.com/photo-1567171466295-4afa63d45416?auto=format&fit=crop&w=800&q=80', name:'Japanese Cheesecake', description:'Cheesecake lembut ala Jepang, ringan seperti kapas namun kaya rasa keju cream.',                      price:35000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:true  },
  { id:15, image_url:'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80', name:'Choco Muffin',        description:'Muffin cokelat yang moist dengan chocolate chip melimpah di setiap gigitan.',                          price:22000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:false },
]

let orders  = []
let nextId  = products.length + 1

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'OK (dev mode — in-memory)', timestamp: new Date() }))

// ── Categories ────────────────────────────────────────────────────────────────
app.get('/api/categories', (_, res) => res.json({ success: true, data: categories }))

// ── Products ──────────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  let data = products.filter(p => p.is_available)
  const { category, featured, search } = req.query
  if (category)          data = data.filter(p => p.category_slug === category)
  if (featured === 'true') data = data.filter(p => p.is_featured)
  if (search)            data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  res.json({ success: true, data })
})

app.get('/api/products/:id', (req, res) => {
  const p = products.find(p => p.id === +req.params.id)
  if (!p) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
  res.json({ success: true, data: p })
})

app.post('/api/products', (req, res) => {
  const p = { id: nextId++, is_available: true, is_featured: false, ...req.body }
  products.push(p); res.status(201).json({ success: true, data: p })
})

app.put('/api/products/:id', (req, res) => {
  const i = products.findIndex(p => p.id === +req.params.id)
  if (i < 0) return res.status(404).json({ success: false, error: 'Tidak ditemukan' })
  products[i] = { ...products[i], ...req.body }
  res.json({ success: true, data: products[i] })
})

app.delete('/api/products/:id', (req, res) => {
  const before = products.length
  products = products.filter(p => p.id !== +req.params.id)
  if (products.length === before) return res.status(404).json({ success: false, error: 'Tidak ditemukan' })
  res.json({ success: true, message: 'Produk dihapus' })
})

// ── Orders (KHUSUS ORDER ONLINE: delivery / pickup) ─────────────────────────────
const DELIVERY_FEE      = 10000
const FULFILLMENT_TYPES = ['delivery', 'pickup']
const PAYMENT_METHODS   = ['transfer', 'ewallet', 'cod']

app.post('/api/orders', (req, res) => {
  const {
    customer_name, customer_phone, customer_email,
    fulfillment_type, delivery_address, payment_method,
    notes, items,
  } = req.body

  // Validasi khusus order online
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

  const productMap = Object.fromEntries(products.map(p => [p.id, p]))
  let subtotal = 0
  for (const item of items) {
    const p = productMap[item.product_id]
    if (!p) return res.status(400).json({ success: false, error: `Produk id ${item.product_id} tidak ditemukan` })
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
  res.status(201).json({
    success: true,
    data: { order_id: order.id, subtotal, delivery_fee, total, status: 'pending', fulfillment_type, payment_method },
  })
})

app.get('/api/orders', (_, res) => res.json({ success: true, data: orders }))

// ── Auth (dev bypass) ─────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (email === 'admin@kopinusantara.id' && password === 'admin123') {
    return res.json({ success: true, token: 'dev-token', admin: { email, name: 'Admin Dev' } })
  }
  res.status(401).json({ success: false, error: 'Kredensial salah' })
})

app.listen(PORT, () => {
  console.log(`☕  Kopi Nusantara API (DEV MODE) → http://localhost:${PORT}`)
  console.log(`    15 produk & 3 kategori tersedia di memory`)
  console.log(`    GET /api/products  GET /api/categories  POST /api/orders`)
})
