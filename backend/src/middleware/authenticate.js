const jwt = require('jsonwebtoken')

// Middleware: verifikasi JWT token dari header Authorization
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token      = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token tidak ditemukan' })
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    next()
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token tidak valid atau sudah kadaluarsa' })
  }
}
