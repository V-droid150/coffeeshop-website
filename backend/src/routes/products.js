const express    = require('express')
const router     = express.Router()
const pool       = require('../db/pool')
const authenticate = require('../middleware/authenticate')

// ── GET /api/products ─────────────────────────────────────────────────────────
// Query params: ?category=kopi  ?featured=true  ?search=latte
router.get('/', async (req, res) => {
  try {
    const { category, featured, search } = req.query

    let query = `
      SELECT
        p.id, p.name, p.description, p.price,
        p.image_url, p.is_available, p.is_featured, p.stock,
        c.name  AS category_name,
        c.slug  AS category_slug,
        c.icon  AS category_icon
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = TRUE
    `
    const params = []

    if (category) {
      params.push(category)
      query += ` AND c.slug = $${params.length}`
    }
    if (featured === 'true') {
      query += ` AND p.is_featured = TRUE`
    }
    if (search) {
      params.push(`%${search}%`)
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`
    }

    query += ` ORDER BY c.id, p.name`

    const { rows } = await pool.query(query, params)
    res.json({ success: true, data: rows })
  } catch (err) {
    console.error('[GET /products]', err.message)
    res.status(500).json({ success: false, error: 'Gagal mengambil data produk' })
  }
})

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    res.json({ success: true, data: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

// ── POST /api/products  (admin only) ─────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_featured, stock } = req.body
    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'name dan price wajib diisi' })
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url, is_featured, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description, price, category_id, image_url, is_featured ?? false, stock ?? 999]
    )
    res.status(201).json({ success: true, data: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal menambah produk' })
  }
})

// ── PUT /api/products/:id  (admin only) ──────────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, is_available, is_featured, stock } = req.body
    const { rows } = await pool.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, category_id=$4,
           image_url=$5, is_available=$6, is_featured=$7, stock=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [name, description, price, category_id, image_url, is_available, is_featured, stock, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    res.json({ success: true, data: rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal update produk' })
  }
})

// ── DELETE /api/products/:id  (admin only) ────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    res.json({ success: true, message: 'Produk berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal hapus produk' })
  }
})

module.exports = router
