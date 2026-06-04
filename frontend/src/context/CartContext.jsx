'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems]       = useState([])   // [{ id, name, price, image_url, quantity }]
  const [isOpen, setIsOpen]     = useState(false) // CartDrawer open state

  // ── Persist ke localStorage ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kopi_cart')
      const parsed = saved ? JSON.parse(saved) : null
      // Hanya pakai bila bentuknya array — cegah crash dari data localStorage yang korup.
      if (Array.isArray(parsed)) setItems(parsed)
    } catch {
      localStorage.removeItem('kopi_cart') // data rusak → buang
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('kopi_cart', JSON.stringify(items))
  }, [items])

  // ── Actions ───────────────────────────────────────────────────────────────
  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsOpen(true) // buka drawer saat item ditambah
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return removeItem(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const total     = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items, total, itemCount,
      isOpen, setIsOpen,
      addItem, removeItem, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus digunakan di dalam CartProvider')
  return ctx
}
