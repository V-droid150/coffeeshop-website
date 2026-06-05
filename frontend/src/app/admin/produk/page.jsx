import { redirect } from 'next/navigation'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/supabase'
import { getCategories } from '@/lib/products'
import AdminHeader from '../AdminHeader'
import ProductsManager from './ProductsManager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Kelola Produk — Kopi Nusantara', robots: { index: false, follow: false } }

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-parchment">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}

function Notice({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-warm-sm p-8 max-w-2xl">
      <p className="font-serif text-xl text-espresso mb-2">{title}</p>
      <div className="text-sm text-latte space-y-2">{children}</div>
    </div>
  )
}

export default async function AdminProductsPage() {
  if (!isAdminAuthed()) redirect('/admin/login')

  const supabase = getSupabase()
  if (!supabase) {
    return (
      <Shell>
        <Notice title="Database belum terhubung">
          <p>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> &amp; <code>SUPABASE_SERVICE_ROLE_KEY</code> di environment.</p>
        </Notice>
      </Shell>
    )
  }

  // Baca apa adanya dari DB. Bila tabel belum dibuat → tampilkan panduan setup.
  const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true })

  if (error) {
    return (
      <Shell>
        <Notice title="Tabel produk belum dibuat">
          <p>Untuk mengelola produk dari sini, buat tabelnya dulu: buka <strong>Supabase → SQL Editor</strong>, jalankan isi file <code>frontend/supabase-products-schema.sql</code> (sudah termasuk 15 produk awal Anda).</p>
          <p>Sebelum itu, situs tetap berjalan normal memakai daftar produk bawaan — jadi tidak ada yang rusak.</p>
        </Notice>
      </Shell>
    )
  }

  return (
    <Shell>
      <ProductsManager initialProducts={data || []} categories={getCategories()} />
    </Shell>
  )
}
