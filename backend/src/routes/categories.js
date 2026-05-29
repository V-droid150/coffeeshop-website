const express = require('express')
const router  = express.Router()
const pool    = require('../db/pool')

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories ORDER BY id'
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
})

module.exports = router
