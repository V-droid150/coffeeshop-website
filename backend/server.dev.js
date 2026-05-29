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
  { id:1,  name:'Espresso',            description:'Shot espresso murni dari biji arabika pilihan Flores, dengan crema tebal dan rasa yang bold.',          price:25000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:false },
  { id:2,  name:'Americano',           description:'Espresso yang diencerkan dengan air panas, menghasilkan rasa kopi yang bersih dan segar.',              price:28000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:false },
  { id:3,  name:'Cappuccino',          description:'Perpaduan sempurna espresso, susu kukus, dan foam susu yang lembut. Klasik tak lekang waktu.',          price:35000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:4,  name:'Latte',               description:'Espresso lembut berpadu susu kukus creamy. Pilihan sempurna untuk hari yang santai.',                   price:38000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:5,  name:'Cold Brew',           description:'Kopi diseduh dingin selama 18 jam. Rasa yang smooth, manis alami, tanpa rasa pahit.',                  price:42000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:6,  name:'V60 Manual Brew',     description:'Diseduh manual dengan metode pour-over V60. Nikmati kompleksitas rasa single origin kami.',            price:45000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:false },
  { id:7,  name:'Kopi Susu Gula Aren', description:'Espresso segar bertemu susu segar dan manisnya gula aren nusantara. Favorit pelanggan kami.',          price:32000, category_id:1, category_name:'Kopi',     category_slug:'kopi',     category_icon:'☕', is_available:true, is_featured:true  },
  { id:8,  name:'Matcha Latte',        description:'Matcha premium asal Jepang dipadukan susu oat yang creamy. Sehat dan memanjakan.',                     price:38000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:true  },
  { id:9,  name:'Cokelat Panas',       description:'Cokelat belgia murni yang kaya, hangat, dan menghibur di setiap tegukan.',                             price:32000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:false },
  { id:10, name:'Lemon Tea Honey',     description:'Teh hijau segar dengan perasan lemon dan madu asli. Menyegarkan jiwa dan raga.',                       price:25000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:false },
  { id:11, name:'Strawberry Smoothie', description:'Strawberry segar diblender dengan yogurt dan madu. Creamy, segar, dan penuh vitamin.',                 price:40000, category_id:2, category_name:'Non-Kopi', category_slug:'non-kopi', category_icon:'🍵', is_available:true, is_featured:false },
  { id:12, name:'Croissant Butter',    description:'Croissant berlapis mentega pilihan, dipanggang segar setiap pagi hingga kecokelatan sempurna.',        price:28000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:true  },
  { id:13, name:'Banana Bread',        description:'Roti pisang lembut dengan tekstur yang moist, dibuat dari pisang cavendish matang pilihan.',           price:25000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:false },
  { id:14, name:'Japanese Cheesecake', description:'Cheesecake lembut ala Jepang, ringan seperti kapas namun kaya rasa keju cream.',                      price:35000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:true  },
  { id:15, name:'Choco Muffin',        description:'Muffin cokelat yang moist dengan chocolate chip melimpah di setiap gigitan.',                          price:22000, category_id:3, category_name:'Pastry',   category_slug:'pastry',   category_icon:'🥐', is_available:true, is_featured:false },
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

// ── Orders ────────────────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, table_number, notes, items } = req.body
  if (!customer_name || !items?.length) {
    return res.status(400).json({ success: false, error: 'customer_name dan items wajib diisi' })
  }
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))
  let total = 0
  for (const item of items) {
    const p = productMap[item.product_id]
    if (!p) return res.status(400).json({ success: false, error: `Produk id ${item.product_id} tidak ditemukan` })
    total += p.price * item.quantity
  }
  const order = { id: orders.length + 1, customer_name, customer_phone, table_number, notes,
                  items, total_amount: total, status: 'pending', created_at: new Date() }
  orders.push(order)
  res.status(201).json({ success: true, data: { order_id: order.id, total, status: 'pending' } })
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
