import { createClient } from '@supabase/supabase-js'

// Klien Supabase khusus server (pakai Service Role Key — JANGAN dipakai di browser).
// Mengembalikan null bila env belum di-set, agar app tetap jalan tanpa database.
let cached = null

export function getSupabase() {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}
