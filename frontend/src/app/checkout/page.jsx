'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function formatRupiah(n) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`
}

// Harus sama dengan DELIVERY_FEE di backend (sumber kebenaran tetap server)
const DELIVERY_FEE = 10000

const PAYMENT_OPTIONS = [
  { value: 'transfer', label: 'Transfer Bank',     desc: 'BCA / Mandiri / BNI' },
  { value: 'ewallet',  label: 'E-Wallet',          desc: 'GoPay / OVO / Dana' },
  { value: 'cod',      label: 'Bayar di Tempat',   desc: 'Tunai saat terima/ambil' },
]

const EMPTY_FORM = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  fulfillment_type: 'delivery',
  delivery_address: '',
  payment_method: 'transfer',
  notes: '',
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [form, setForm]       = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const isDelivery   = form.fulfillment_type === 'delivery'
  const deliveryFee  = isDelivery ? DELIVERY_FEE : 0
  const grandTotal   = total + deliveryFee

  const setField = (name, value) => setForm(p => ({ ...p, [name]: value }))

  if (items.length === 0 && !success) {
    return (
      <div className="pt-32 pb-20 px-6 text-center min-h-screen flex flex-col items-center justify-center">
        <span className="mx-auto mb-6 w-16 h-16 rounded-full bg-cream flex items-center justify-center text-coffee">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </span>
        <h2 className="font-serif text-3xl text-espresso mb-3">Keranjang Kosong</h2>
        <p className="text-latte mb-6">Tambahkan menu dulu sebelum checkout.</p>
        <Link href="/menu" className="btn-primary">Lihat Menu</Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_name.trim())  return toast.error('Nama wajib diisi')
    if (!form.customer_phone.trim()) return toast.error('Nomor telepon wajib diisi')
    if (isDelivery && !form.delivery_address.trim()) {
      return toast.error('Alamat pengantaran wajib diisi untuk delivery')
    }

    setLoading(true)
    try {
      const res = await createOrder({
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      setSuccess(res.data)
      clearCart()
      toast.success('Pesanan berhasil dibuat')
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    const wasDelivery = success.fulfillment_type === 'delivery'
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 shadow-warm-lg max-w-md w-full text-center"
        >
          <span className="mx-auto mb-5 w-16 h-16 rounded-full bg-leaf-pale flex items-center justify-center text-leaf">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h2 className="font-serif text-3xl text-espresso mb-2">Pesanan Diterima!</h2>
          <p className="text-latte mb-1">Nomor Pesanan</p>
          <p className="font-serif text-4xl font-bold text-coffee mb-4">#{success.order_id}</p>

          <div className="text-sm text-coffee bg-cream rounded-xl px-4 py-3 mb-2 space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-latte">Metode</span>
              <span className="font-semibold">{wasDelivery ? 'Delivery (diantar)' : 'Pickup (ambil di toko)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-latte">Subtotal</span>
              <span>{formatRupiah(success.subtotal)}</span>
            </div>
            {success.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-latte">Ongkir</span>
                <span>{formatRupiah(success.delivery_fee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-beige pt-1 mt-1">
              <span className="text-latte">Total</span>
              <span className="font-bold text-espresso">{formatRupiah(success.total)}</span>
            </div>
          </div>

          <p className="text-sm text-latte mb-6">
            {wasDelivery
              ? 'Pesananmu sedang disiapkan dan akan segera diantar ke alamatmu.'
              : 'Pesananmu sedang disiapkan. Kami kabari saat siap diambil di toko.'}
          </p>
          <Link href="/menu" className="btn-primary block">Pesan Lagi</Link>
        </motion.div>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 bg-cream border border-beige rounded-xl text-espresso placeholder-latte/60 focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition font-sans'

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-20 px-6 min-h-screen bg-warm-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-latte text-sm font-sans mb-1">
            <Link href="/menu" className="hover:text-coffee">← Kembali ke Menu</Link>
          </p>
          <h1 className="font-serif text-4xl text-espresso">Checkout</h1>
          <p className="text-latte font-sans text-sm mt-1">Pemesanan online — diantar atau ambil sendiri di toko.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Kolom kiri: form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Metode pengantaran */}
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm">
              <h2 className="font-serif text-xl text-espresso mb-4">Metode Pengantaran</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'delivery', label: 'Delivery', desc: `Diantar · ${formatRupiah(DELIVERY_FEE)}` },
                  { value: 'pickup',   label: 'Pickup',   desc: 'Ambil di toko · Gratis' },
                ].map(opt => {
                  const active = form.fulfillment_type === opt.value
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setField('fulfillment_type', opt.value)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        active ? 'border-coffee bg-coffee/5' : 'border-beige hover:border-latte'
                      }`}
                    >
                      <span className="block font-semibold text-espresso">{opt.label}</span>
                      <span className="block text-xs text-latte mt-0.5">{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Informasi pelanggan */}
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm">
              <h2 className="font-serif text-xl text-espresso mb-5">Informasi Kontak</h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-coffee mb-1.5">Nama Lengkap *</label>
                <input
                  type="text" value={form.customer_name}
                  onChange={e => setField('customer_name', e.target.value)}
                  placeholder="Nama Anda" required className={inputClass}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-coffee mb-1.5">Nomor WhatsApp *</label>
                <input
                  type="tel" value={form.customer_phone}
                  onChange={e => setField('customer_phone', e.target.value)}
                  placeholder="08xx-xxxx-xxxx" required className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee mb-1.5">Email (opsional)</label>
                <input
                  type="email" value={form.customer_email}
                  onChange={e => setField('customer_email', e.target.value)}
                  placeholder="email@contoh.com" className={inputClass}
                />
              </div>
            </div>

            {/* Alamat — hanya untuk delivery */}
            {isDelivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-2xl p-6 shadow-warm-sm overflow-hidden"
              >
                <h2 className="font-serif text-xl text-espresso mb-4">Alamat Pengantaran *</h2>
                <textarea
                  value={form.delivery_address}
                  onChange={e => setField('delivery_address', e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan..."
                  rows={3} required={isDelivery}
                  className={`${inputClass} resize-none`}
                />
              </motion.div>
            )}

            {/* Metode pembayaran */}
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm">
              <h2 className="font-serif text-xl text-espresso mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map(opt => {
                  const active = form.payment_method === opt.value
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setField('payment_method', opt.value)}
                      className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                        active ? 'border-coffee bg-coffee/5' : 'border-beige hover:border-latte'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        active ? 'border-coffee bg-coffee' : 'border-latte'
                      }`} />
                      <span>
                        <span className="block font-semibold text-espresso">{opt.label}</span>
                        <span className="block text-xs text-latte">{opt.desc}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Catatan */}
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm">
              <label className="block text-sm font-semibold text-coffee mb-1.5">Catatan Tambahan</label>
              <textarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Misal: less sugar, extra ice, alergi susu..."
                rows={3} className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Kolom kanan: ringkasan */}
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

              <div className="border-t border-beige pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-coffee">
                  <span>Subtotal</span>
                  <span>{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between text-coffee">
                  <span>Ongkos kirim</span>
                  <span>{isDelivery ? formatRupiah(deliveryFee) : 'Gratis'}</span>
                </div>
                <div className="flex justify-between items-center border-t border-beige pt-3 mt-1">
                  <span className="font-sans font-semibold text-coffee">Total</span>
                  <span className="font-serif font-bold text-2xl text-espresso">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg py-4 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
