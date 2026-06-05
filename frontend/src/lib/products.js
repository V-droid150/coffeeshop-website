import { getSupabase } from './supabase'
import { products as STATIC_PRODUCTS, categories as STATIC_CATEGORIES } from './menu-data'

// ── Sumber produk tunggal untuk SELURUH aplikasi ─────────────────────────────
// Mengambil produk dari tabel Supabase `products` BILA tabel itu ada & berisi
// data. Bila Supabase tak dikonfigurasi / tabel belum dibuat / kosong / error →
// JATUH KE data statik `menu-data.js`. Dengan begitu situs SELALU jalan dan
// harga produk selalu tersedia & otoritatif dari sisi server (anti-manipulasi).
export async function getProducts({ availableOnly = false } = {}) {
  const supabase = getSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })
      if (!error && Array.isArray(data) && data.length > 0) {
        return availableOnly ? data.filter(p => p.is_available) : data
      }
    } catch {
      // diamkan → pakai fallback statik di bawah
    }
  }
  return availableOnly ? STATIC_PRODUCTS.filter(p => p.is_available) : STATIC_PRODUCTS
}

// Kategori tetap statik (3 kategori) — produk hanya merujuk ke salah satunya.
export function getCategories() {
  return STATIC_CATEGORIES
}

// Validasi + bentuk record produk dari body (dipakai endpoint admin create/update).
// Kategori diturunkan dari slug (sumber tepercaya), bukan nilai bebas dari client.
export function buildRecord(body) {
  const name = String(body?.name ?? '').trim()
  if (!name) return { error: 'Nama produk wajib diisi' }
  if (name.length > 100) return { error: 'Nama terlalu panjang (maks 100)' }

  const price = Number(body?.price)
  if (!Number.isInteger(price) || price < 0 || price > 10_000_000) {
    return { error: 'Harga harus bilangan bulat 0–10.000.000' }
  }

  const cat = STATIC_CATEGORIES.find(c => c.slug === body?.category_slug)
  if (!cat) return { error: 'Kategori tidak valid' }

  const description = String(body?.description ?? '').trim().slice(0, 500)
  const image_url = String(body?.image_url ?? '').trim().slice(0, 500)

  return {
    record: {
      name,
      description: description || null,
      price,
      category_id: cat.id,
      category_name: cat.name,
      category_slug: cat.slug,
      category_icon: cat.icon,
      image_url: image_url || null,
      is_available: body?.is_available !== false,
      is_featured: body?.is_featured === true,
    },
  }
}
