// ─── Base URL ──────────────────────────────────────────────────────────────────
// Backend menyatu di dalam Next.js (route handler /api/*), jadi:
//  • Browser  : panggil same-origin → '/api' (tak perlu env apa pun)
//  • SSR      : butuh URL absolut. Pakai VERCEL_URL otomatis saat di-deploy,
//               atau API_URL kalau ingin menunjuk backend Express terpisah.
function resolveBase() {
  if (typeof window !== 'undefined') return '/api'                       // Browser
  if (process.env.API_URL)     return `${process.env.API_URL}/api`       // override manual
  if (process.env.VERCEL_URL)  return `https://${process.env.VERCEL_URL}/api` // di Vercel
  return 'http://127.0.0.1:3000/api'                                     // dev lokal
}
const BASE = resolveBase()

// ─── Helper fetch ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  // Respons mungkin bukan JSON (mis. halaman error 500, body kosong) — jangan sampai
  // res.json() yang gagal menutupi error asli.
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
  return json
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/products${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
}

export const getProduct = (id) => apiFetch(`/products/${id}`)

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = () => apiFetch('/categories', { cache: 'no-store' })

// ─── Orders ───────────────────────────────────────────────────────────────────
export const createOrder = (body) =>
  apiFetch('/orders', { method: 'POST', body: JSON.stringify(body) })

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const getOrders = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return apiFetch(`/orders${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export const updateOrderStatus = (token, id, status) =>
  apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: { Authorization: `Bearer ${token}` },
  })

export const createProduct = (token, body) =>
  apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  })

export const updateProduct = (token, id, body) =>
  apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  })

export const deleteProduct = (token, id) =>
  apiFetch(`/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
