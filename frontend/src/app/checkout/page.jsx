'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function formatRupiah(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`
}

const EMPTY_FORM = { customer_name: '', customer_phone: '', table_number: '', notes: '' }

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm]     = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  if (items.length === 0 && !success) {
    return (
      <div className="pt-32 pb-20 px-6 text-center min-h-screen flex flex-col items-center justify-center">
        <span className="text-6xl mb-6 block">🛒</span>
        <h2 className="font-serif text-3xl text-espresso mb-3">Keranjang Kosong</h2>
        <p className="text-latte mb-6">Tambahkan menu dulu sebelum checkout.</p>
        <Link href="/menu" className="btn-primary">Lihat Menu</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_name) return toast.error('Nama wajib diisi')

    setLoading(true)
    try {
      const res = await createOrder({
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      setSuccess(res.data)
      clearCart()
      toast.success('Pesanan berhasil dibuat! ☕')
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 shadow-warm-lg max-w-md w-full text-center"
        >
          <span className="text-6xl block mb-4">✅</span>
          <h2 className="font-serif text-3xl text-espresso mb-2">Pesanan Diterima!</h2>
          <p className="text-latte mb-1">Nomor Pesanan</p>
          <p className="font-serif text-4xl font-bold text-coffee mb-4">#{success.order_id}</p>
          <p className="text-sm text-latte mb-2">Total: <strong className="text-espresso">{formatRupiah(success.total)}</strong></p>
          <p className="text-sm text-latte bg-cream rounded-xl px-4 py-2 mb-6">
            ☕ Pesananmu sedang disiapkan dengan penuh cinta oleh barista kami.
          </p>
          <Link href="/menu" className="btn-primary block">Pesan Lagi</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen bg-warm-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-latte text-sm font-sans mb-1">
            <Link href="/menu" className="hover:text-coffee">← Kembali ke Menu</Link>
          </p>
          <h1 className="font-serif text-4xl text-espresso">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm">
              <h2 className="font-serif text-xl text-espresso mb-5">Informasi Pesanan</h2>

              {[
                { name: 'customer_name',  label: 'Nama Lengkap *', placeholder: 'Nama Anda',         type: 'text',  required: true  },
                { name: 'customer_phone', label: 'Nomor WhatsApp', placeholder: '08xx-xxxx-xxxx',    type: 'tel',   required: false },
                { name: 'table_number',  label: 'Nomor Meja',     placeholder: 'Meja 1, 2, dst...',  type: 'text',  required: false },
              ].map(f => (
                <div key={f.name} className="mb-4">
                  <label className="block text-sm font-semibold text-coffee mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    required={f.required}
                    className="w-full px-4 py-3 bg-cream border border-beige rounded-xl text-espresso placeholder-latte/60 focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition font-sans"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-coffee mb-1.5">Catatan Tambahan</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Misal: less sugar, extra ice, alergi susu..."
                  rows={3}
                  className="w-full px-4 py-3 bg-cream border border-beige rounded-xl text-espresso placeholder-latte/60 focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition font-sans resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : `☕ Konfirmasi Pesanan — ${formatRupiah(total)}`}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm sticky top-28">
              <h2 className="font-serif text-xl text-espresso mb-5">Ringkasan Pesanan</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-coffee font-medium">
                      {item.name}
                      <span className="text-latte font-normal ml-1">×{item.quantity}</span>
                    </span>
                    <span className="text-espresso font-semibold">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-beige pt-4 flex justify-between items-center">
                <span className="font-sans font-semibold text-coffee">Total</span>
                <span className="font-serif font-bold text-2xl text-espresso">{formatRupiah(total)}</span>
              </div>
              <p className="text-xs text-latte mt-3 text-center">Pembayaran di kasir setelah pesanan siap</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
