'use client'
import { motion } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'

function formatRupiah(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`
}

const CATEGORY_COLORS = {
  'kopi':     'bg-coffee/10 text-coffee',
  'non-kopi': 'bg-leaf-pale text-leaf',
  'pastry':   'bg-caramel/10 text-mocha',
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem(product)
    toast.success(`${product.name} ditambahkan ke cart`, { duration: 2000 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="card group flex flex-col"
    >
      {/* Gambar produk */}
      <div className="relative h-44 bg-cream overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradien lembut agar badge terbaca */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 to-transparent" />

        {/* Badge featured */}
        {product.is_featured && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-caramel text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-warm-sm">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.2l1.2-6.6L2.5 9l6.6-.9z" />
            </svg>
            Favorit
          </span>
        )}

        {/* Badge kategori */}
        <span className={`absolute top-3 right-3 badge ${CATEGORY_COLORS[product.category_slug] || 'bg-cream text-coffee'}`}>
          {product.category_name}
        </span>
      </div>

      {/* Konten */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif font-semibold text-espresso text-lg mb-1 leading-tight">
          {product.name}
        </h3>
        <p className="text-sm text-latte leading-relaxed flex-1 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-serif font-bold text-coffee text-lg">
            {formatRupiah(product.price)}
          </span>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-coffee text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-espresso transition-colors duration-200 shadow-warm-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
