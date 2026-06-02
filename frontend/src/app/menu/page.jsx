// ─── HALAMAN MENU — Server Component ─────────────────────────────────────────
// Data di-fetch langsung di server saat render (SSR).
// Ketika user klik "Tambah", ProductCard (Client Component) mengambil alih.
// ─────────────────────────────────────────────────────────────────────────────
import { products as ALL_PRODUCTS, categories } from '@/lib/menu-data'
import ProductCard from '@/components/ProductCard'
import MenuFilter from './MenuFilter'

export const metadata = {
  title: 'Menu — Kopi Nusantara',
  description: 'Jelajahi menu kopi spesialti, minuman non-kopi, dan pastry kami.',
}

export default function MenuPage({ searchParams }) {
  const activeCategory = searchParams?.category ?? 'semua'

  // Data dibaca langsung dari modul (backend menyatu) — tanpa HTTP fetch ke
  // diri sendiri, jadi andal di server maupun saat di-deploy.
  const products = ALL_PRODUCTS.filter(p =>
    p.is_available && (activeCategory === 'semua' || p.category_slug === activeCategory)
  )

  return (
    <div className="pt-24 pb-20 min-h-screen bg-warm-white">
      {/* Header — background foto kopi & pastry tertata di meja */}
      <div className="relative py-20 px-6 text-center mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1920&q=80")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 to-coffee/85" />
        <div className="relative z-10">
          <p className="font-sans text-latte text-sm tracking-widest uppercase mb-2">Pilihan Terbaik</p>
          <h1 className="font-serif text-4xl md:text-5xl text-warm-white mb-3">Menu Kami</h1>
          <p className="font-sans text-cream/80 max-w-md mx-auto">
            Setiap produk dibuat dengan bahan-bahan segar pilihan dan penuh cinta.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Filter tab kategori (Client Component untuk interaktivitas) */}
        <MenuFilter categories={categories} active={activeCategory} />

        {/* Grid produk */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-cream rounded-3xl mt-8">
            <span className="text-5xl block mb-4">☕</span>
            <p className="font-serif text-xl text-coffee mb-2">
              {activeCategory !== 'semua' ? 'Tidak ada produk di kategori ini' : 'Menu sedang disiapkan...'}
            </p>
            <p className="text-latte text-sm">Pastikan backend berjalan dan database sudah di-seed</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-latte font-sans mb-6">
              Menampilkan <strong className="text-coffee">{products.length}</strong> produk
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
