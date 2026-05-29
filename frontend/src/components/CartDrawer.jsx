'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

function formatRupiah(n) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, itemCount } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-espresso/40 backdrop-blur-sm z-50"
          />

          {/* Drawer — slide dari kanan */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-warm-white shadow-warm-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream">
              <div>
                <h2 className="font-serif text-xl text-espresso">Keranjang</h2>
                <p className="text-sm text-latte font-sans">{itemCount} item</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-cream text-coffee transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-5xl block mb-4">☕</span>
                  <p className="font-serif text-lg text-coffee mb-2">Keranjang kosong</p>
                  <p className="text-sm text-latte">Tambahkan menu favoritmu!</p>
                  <Link
                    href="/menu"
                    onClick={() => setIsOpen(false)}
                    className="inline-block mt-4 btn-primary text-sm py-2"
                  >
                    Lihat Menu
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 bg-white rounded-2xl p-3 shadow-warm-sm"
                    >
                      {/* Placeholder image */}
                      <div className="w-16 h-16 bg-cream rounded-xl flex items-center justify-center text-2xl shrink-0">
                        ☕
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-semibold text-espresso text-sm truncate">{item.name}</p>
                        <p className="text-latte text-xs mb-2">{formatRupiah(item.price)}</p>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-cream hover:bg-beige flex items-center justify-center text-coffee font-bold text-sm transition-colors"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-espresso">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-cream hover:bg-beige flex items-center justify-center text-coffee font-bold text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-latte hover:text-red-400 transition-colors"
                          aria-label="Hapus"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <p className="text-sm font-bold text-coffee">
                          {formatRupiah(item.price * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer total + checkout */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-cream space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-coffee">Total</span>
                  <span className="font-serif font-bold text-xl text-espresso">{formatRupiah(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block text-center btn-primary w-full"
                >
                  Lanjut ke Pembayaran →
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
