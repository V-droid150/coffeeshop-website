const { Pool } = require('pg')

// Koneksi pool PostgreSQL — reuse connection agar efisien
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'kopi_nusantara',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max:      20,   // max connections in pool
  idleTimeoutMillis: 30000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})

module.exports = pool
