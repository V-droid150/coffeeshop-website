'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [token, setToken]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token.trim()) return setError('Token wajib diisi')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Gagal masuk')
        setLoading(false)
        return
      }
      // Sukses → masuk dashboard. refresh() agar server component membaca cookie baru.
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan jaringan')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-espresso">
      <div className="w-full max-w-sm bg-warm-white rounded-3xl shadow-warm-lg p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <span className="w-14 h-14 rounded-2xl bg-espresso flex items-center justify-center mb-4">
            <Logo className="w-8 h-8 text-caramel" />
          </span>
          <h1 className="font-serif text-2xl text-espresso">Dashboard Admin</h1>
          <p className="text-sm text-latte font-sans mt-1">Kopi Nusantara — masuk dengan token akses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-coffee mb-1.5">Token Akses</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Masukkan token admin"
              autoComplete="off"
              autoFocus
              className={`w-full px-4 py-3 bg-cream border rounded-xl text-espresso placeholder-latte/60 focus:outline-none focus:ring-1 transition font-sans ${
                error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-beige focus:border-coffee focus:ring-coffee/20'
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1.5 font-sans">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
