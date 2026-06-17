'use client'
// ─── FORM KONTAK — Client Component ──────────────────────────────────────────
// Mengikuti pola website sebelumnya (red-lens): submit CLIENT-SIDE langsung ke
// Web3Forms (plan gratis hanya menerima request dari browser). Butuh env
// NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY; bila kosong, form menampilkan fallback agar
// pengguna tetap bisa menghubungi via email/WhatsApp.
// Catatan: domain api.web3forms.com sudah di-allowlist di CSP connect-src.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import toast from 'react-hot-toast'

const SUBJECTS = ['Reservasi Tempat', 'Kerja Sama / Partnership', 'Pemesanan Acara', 'Saran & Masukan', 'Lainnya']

const inputClass =
  'w-full rounded-2xl border border-cream bg-warm-white px-4 py-3 font-sans text-espresso placeholder:text-latte/60 outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/30'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validasi ringan di client
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Mohon lengkapi nama, email, dan pesan Anda.')
      return
    }
    if (form.phone && !/^(\+62|0)[0-9]{8,13}$/.test(form.phone.replace(/[\s-]/g, ''))) {
      setError('Format No. WhatsApp tidak valid (gunakan awalan +62 atau 0).')
      return
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
    if (!accessKey) {
      setError('Form belum dikonfigurasi. Silakan hubungi kami via email atau WhatsApp di samping.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Kopi Nusantara — Pesan dari ${form.name} (${form.subject})`,
          from_name: 'Website Kopi Nusantara',
          name: form.name,
          email: form.email,
          phone: form.phone || '-',
          keperluan: form.subject,
          message: form.message,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Gagal mengirim pesan. Coba lagi.')
      setSent(true)
      toast.success('Pesan terkirim! Kami akan segera membalas.')
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' })
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-caramel bg-cream/50 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf/15 text-leaf">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <p className="font-serif text-xl text-espresso">Terima kasih!</p>
        <p className="font-sans text-sm text-coffee/80">Pesan Anda sudah kami terima dan akan segera dibalas.</p>
        <button onClick={() => setSent(false)} className="mt-2 font-sans text-sm font-semibold text-mocha hover:text-espresso">
          Kirim pesan lain
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block font-sans text-sm font-semibold text-coffee">Nama lengkap</label>
          <input value={form.name} onChange={update('name')} placeholder="Nama Anda" className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block font-sans text-sm font-semibold text-coffee">No. WhatsApp <span className="font-normal text-latte">(opsional)</span></label>
          <input value={form.phone} onChange={update('phone')} placeholder="08xxxxxxxxxx" inputMode="tel" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-sans text-sm font-semibold text-coffee">Email</label>
        <input type="email" value={form.email} onChange={update('email')} placeholder="email@anda.com" className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block font-sans text-sm font-semibold text-coffee">Keperluan</label>
        <select value={form.subject} onChange={update('subject')} className={inputClass}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block font-sans text-sm font-semibold text-coffee">Pesan</label>
        <textarea rows={5} value={form.message} onChange={update('message')} placeholder="Tulis pesan Anda untuk kami…" className={`${inputClass} resize-none`} />
      </div>

      {error && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 font-sans text-sm text-red-700">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? 'Mengirim…' : 'Kirim Pesan'}
      </button>

      <p className="text-center font-sans text-xs text-latte">Kami biasanya membalas dalam 1×24 jam.</p>
    </form>
  )
}
