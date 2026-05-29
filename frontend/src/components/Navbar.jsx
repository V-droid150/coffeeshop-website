'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/',         label: 'Beranda' },
  { href: '/menu',     label: 'Menu'    },
  { href: '/#about',   label: 'Tentang' },
  { href: '/#contact', label: 'Kontak'  },
]

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart()
  const [scrolled, setScrolled]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-warm-white/95 backdrop-blur-md shadow-warm' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <div>
            <span className="font-serif font-bold text-xl text-espresso">Kopi Nusantara</span>
            <span className="block text-[10px] text-latte font-sans tracking-widest uppercase -mt-0.5">
              Est. 2024
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans font-medium text-coffee hover:text-espresso transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-caramel group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
          ))}
        </nav>

        {/* Cart button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 btn-primary py-2 px-4 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Keranjang</span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-leaf text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 text-coffee"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={`h-0.5 bg-coffee rounded transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 bg-coffee rounded transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-coffee rounded transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-warm-white border-t border-cream overflow-hidden"
          >
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-6 py-3 font-sans font-medium text-coffee hover:bg-cream hover:text-espresso transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
