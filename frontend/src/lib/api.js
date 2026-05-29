// ─── Base URL ──────────────────────────────────────────────────────────────────
// Di development → Next.js rewrites /api/* ke Express localhost:5000
// Di production VPS → ganti NEXT_PUBLIC_API_URL ke domain backend Anda
const BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api'

// ─── Helper fetch ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
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
