'use client'
import { useState } from 'react'
import Script from 'next/script'
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

// ── Validasi nomor WhatsApp ──────────────────────────────────────────────────
// Wajib diawali +62 atau 0, sisanya hanya angka (8–13 digit). Selain itu invalid.
const PHONE_RE = /^(\+62|0)[0-9]{8,13}$/
// Saring input saat diketik: hanya izinkan angka & satu '+' di paling depan.
const normalizePhone = (v) => v.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')

// Konfigurasi Midtrans Snap (client)
const MIDTRANS_IS_PROD = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const SNAP_SRC = MIDTRANS_IS_PROD
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

const PAYMENT_OPTIONS = [
  { value: 'online', label: 'Bayar Online', desc: 'QRIS / GoPay / ShopeePay / VA / Kartu' },
  { value: 'cod',    label: 'Bayar di Tempat (COD)', desc: 'Tunai saat terima / ambil' },
]

const EMPTY_FORM = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  fulfillment_type: 'delivery',
  delivery_address: '',
  payment_method: 'online',
  notes: '',
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [form, setForm]       = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  // Transaksi Midtrans yang sudah dibuat tapi belum dibayar — disimpan agar popup
  // bisa dibuka lagi tanpa membuat order baru bila user menutup popup tak sengaja.
  const [pendingPayment, setPendingPayment] = useState(null) // { snap_token, data }

  const isDelivery  = form.fulfillment_type === 'delivery'
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0
  const grandTotal  = total + deliveryFee
  // Nomor dianggap invalid hanya bila sudah diisi tapi formatnya salah (jangan
  // tampilkan error saat field masih kosong).
  const phoneInvalid = form.customer_phone.length > 0 && !PHONE_RE.test(form.customer_phone)

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

  // Tampilkan layar sukses (dipakai untuk COD & setelah pembayaran online)
  const finish = (data, paymentStatus) => {
    setSuccess({ ...data, payment_status: paymentStatus })
    clearCart()
  }

  // Buka popup Snap untuk token yang sudah ada — TIDAK membuat order baru.
  const openSnap = (snapToken, data) => {
    if (typeof window === 'undefined' || !window.snap) {
      toast.error('Pembayaran belum siap, tunggu sebentar lalu coba lagi')
      setLoading(false)
      return
    }
    window.snap.pay(snapToken, {
      onSuccess: () => { setPendingPayment(null); finish(data, 'paid');    toast.success('Pembayaran berhasil') },
      onPending: () => { setPendingPayment(null); finish(data, 'pending'); toast('Menunggu pembayaran') },
      onError:   () => { toast.error('Pembayaran gagal'); setLoading(false) },
      onClose:   () => {
        // Token tetap disimpan → user bisa membuka lagi lewat tombol "Lanjutkan Pembayaran".
        toast('Pembayaran dibatalkan. Klik "Lanjutkan Pembayaran" untuk membuka lagi.')
        setLoading(false)
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Sudah ada transaksi tertunda → buka token yang sama, jangan buat order baru.
    if (pendingPayment) {
      setLoading(true)
      openSnap(pendingPayment.snap_token, pendingPayment.data)
      return
    }

    if (!form.customer_name.trim())  return toast.error('Nama wajib diisi')
    if (!form.customer_phone.trim()) return toast.error('Nomor WhatsApp wajib diisi')
    if (!PHONE_RE.test(form.customer_phone)) {
      return toast.error('Nomor WhatsApp harus diawali +62 atau 0 dan hanya berisi angka')
    }
    if (isDelivery && !form.delivery_address.trim()) {
      return toast.error('Alamat pengantaran wajib diisi untuk delivery')
    }

    setLoading(true)
    try {
      const res = await createOrder({
        ...form,
        customer_email: form.customer_email.trim(), // buang spasi tak sengaja (ditolak Midtrans)
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      const data = res.data

      // Pembayaran online → simpan token lalu buka popup Midtrans Snap
      if (data.snap_token) {
        setPendingPayment({ snap_token: data.snap_token, data })
        openSnap(data.snap_token, data)
        return
      }

      // COD atau pembayaran belum dikonfigurasi → langsung selesai
      finish(data, form.payment_method === 'cod' ? 'unpaid' : 'pending')
      toast.success('Pesanan berhasil dibuat')
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pesanan')
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    const wasDelivery = success.fulfillment_type === 'delivery'
    const paid    = success.payment_status === 'paid'
    const pending = success.payment_status === 'pending'
    const isCod   = success.payment_method === 'cod'
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 shadow-warm-lg max-w-md w-full text-center"
        >
          <span className={`mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center ${
            paid ? 'bg-leaf-pale text-leaf' : 'bg-caramel/15 text-caramel'
          }`}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {paid
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
          </span>
          <h2 className="font-serif text-3xl text-espresso mb-2">
            {paid ? 'Pembayaran Berhasil!' : 'Pesanan Diterima!'}
          </h2>
          <p className="text-latte mb-1">Nomor Pesanan</p>
          <p className="font-serif text-4xl font-bold text-coffee mb-4">#{success.order_id}</p>

          <div className="text-sm text-coffee bg-cream rounded-xl px-4 py-3 mb-2 space-y-1 text-left">
            <div className="flex justify-between">
              <span className="text-latte">Metode</span>
              <span className="font-semibold">{wasDelivery ? 'Delivery (diantar)' : 'Pickup (ambil di toko)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-latte">Pembayaran</span>
              <span className="font-semibold">
                {isCod ? 'COD (bayar di tempat)' : paid ? 'Lunas' : 'Menunggu pembayaran'}
              </span>
            </div>
            <div className="flex justify-between border-t border-beige pt-1 mt-1">
              <span className="text-latte">Total</span>
              <span className="font-bold text-espresso">{formatRupiah(success.total)}</span>
            </div>
          </div>

          <p className="text-sm text-latte mb-6">
            {isCod
              ? (wasDelivery ? 'Pesananmu disiapkan & diantar. Siapkan pembayaran tunai saat tiba.' : 'Pesananmu disiapkan. Bayar tunai saat ambil di toko.')
              : pending
                ? 'Selesaikan pembayaran sesuai instruksi. Status akan terupdate otomatis setelah lunas.'
                : 'Terima kasih! Pesananmu sedang kami siapkan.'}
          </p>
          {/* Pembayaran online belum lunas (mis. VA/transfer) → buka lagi instruksi
              pembayaran. Pakai popup Snap bila tersedia, kalau tidak buka halaman
              pembayaran Midtrans (snap_redirect_url) di tab baru. Tanpa order baru. */}
          {pending && !isCod && (success.snap_token || success.snap_redirect_url) && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.snap && success.snap_token) {
                  openSnap(success.snap_token, success)
                } else if (success.snap_redirect_url) {
                  window.open(success.snap_redirect_url, '_blank')
                } else {
                  toast.error('Tautan pembayaran tidak tersedia, silakan pesan ulang')
                }
              }}
              className="btn-primary block w-full mb-3"
            >
              Lanjutkan Pembayaran
            </button>
          )}
          <Link
            href="/menu"
            className={`${pending && !isCod && (success.snap_token || success.snap_redirect_url) ? 'btn-outline' : 'btn-primary'} block`}
          >
            Pesan Lagi
          </Link>
        </motion.div>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 bg-cream border border-beige rounded-xl text-espresso placeholder-latte/60 focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition font-sans'

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 min-h-screen bg-warm-white">
      {/* Script popup pembayaran Midtrans Snap */}
      {MIDTRANS_CLIENT_KEY && (
        <Script src={SNAP_SRC} data-client-key={MIDTRANS_CLIENT_KEY} strategy="afterInteractive" />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <p className="text-latte text-sm font-sans mb-1">
            <Link href="/menu" className="hover:text-coffee">← Kembali ke Menu</Link>
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-espresso">Checkout</h1>
          <p className="text-latte font-sans text-sm mt-1">Pemesanan online — diantar atau ambil sendiri di toko.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
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

            {/* Informasi kontak */}
            <div className="bg-white rounded-2xl p-6 shadow-warm-sm">
              <h2 className="font-serif text-xl text-espresso mb-5">Informasi Kontak</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-coffee mb-1.5">Nama Lengkap *</label>
                <input type="text" autoComplete="name" value={form.customer_name}
                  onChange={e => setField('customer_name', e.target.value)}
                  placeholder="Nama Anda" required className={inputClass} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-coffee mb-1.5">Nomor WhatsApp *</label>
                <input type="tel" inputMode="tel" autoComplete="tel" value={form.customer_phone}
                  onChange={e => setField('customer_phone', normalizePhone(e.target.value))}
                  placeholder="08xxxxxxxxxx atau +62xxxxxxxxxx" required
                  aria-invalid={phoneInvalid}
                  className={`${inputClass} ${phoneInvalid ? '!border-red-400 focus:!border-red-400 focus:!ring-red-200' : ''}`} />
                {phoneInvalid && (
                  <p className="text-xs text-red-500 mt-1.5 font-sans">
                    Nomor harus diawali <strong>+62</strong> atau <strong>0</strong> dan hanya berisi angka.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee mb-1.5">Email (opsional)</label>
                <input type="email" inputMode="email" autoComplete="email" value={form.customer_email}
                  onChange={e => setField('customer_email', e.target.value)}
                  placeholder="email@contoh.com" className={inputClass} />
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
                <textarea value={form.delivery_address}
                  onChange={e => setField('delivery_address', e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan..."
                  rows={3} required={isDelivery} className={`${inputClass} resize-none`} />
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
              <textarea value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Misal: less sugar, extra ice, alergi susu..."
                rows={3} className={`${inputClass} resize-none`} />
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
                <p className="text-xs text-latte mt-1">Harga final dikonfirmasi server saat checkout.</p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary text-lg py-4 mt-6 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? 'Memproses...'
                  : pendingPayment ? 'Lanjutkan Pembayaran'
                  : form.payment_method === 'cod' ? 'Konfirmasi Pesanan' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
