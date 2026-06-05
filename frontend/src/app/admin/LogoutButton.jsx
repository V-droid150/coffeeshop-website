'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    router.push('/admin/login')
    router.refresh()
  }
  return (
    <button
      onClick={logout}
      className="text-sm font-semibold text-cream/80 hover:text-white border border-cream/30 hover:border-cream/60 rounded-xl px-4 py-2 transition-colors"
    >
      Keluar
    </button>
  )
}
