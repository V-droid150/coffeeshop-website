'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import LogoutButton from './LogoutButton'

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/produk', label: 'Produk' },
]

export default function AdminHeader() {
  const pathname = usePathname()
  return (
    <header className="bg-espresso">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo className="w-7 h-7 text-caramel shrink-0" />
          <div className="min-w-0 hidden sm:block">
            <p className="font-serif font-bold text-warm-white leading-tight truncate">Dashboard Admin</p>
            <p className="text-[11px] text-cream/60 font-sans tracking-wide">Kopi Nusantara</p>
          </div>
        </div>
        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(l => {
            const active = l.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
                  active ? 'bg-cream/15 text-white' : 'text-cream/70 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}
