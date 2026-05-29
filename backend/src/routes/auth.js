const express  = require('express')
const router   = express.Router()
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const pool     = require('../db/pool')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password wajib diisi' })
    }

    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email])
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Email atau password salah' })
    }

    const admin = rows[0]
    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Email atau password salah' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '8h' }
    )

    res.json({ success: true, token, admin: { id: admin.id, email: admin.email, name: admin.name } })
  } catch (err) {
    console.error('[POST /auth/login]', err.message)
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

module.exports = router
