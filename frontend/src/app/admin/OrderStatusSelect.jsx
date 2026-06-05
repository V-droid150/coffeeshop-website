'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'pending',    label: 'Baru' },
  { value: 'preparing',  label: 'Disiapkan' },
  { value: 'ready',      label: 'Siap' },
  { value: 'delivering', label: 'Diantar' },
  { value: 'completed',  label: 'Selesai' },
  { value: 'cancelled',  label: 'Batal' },
]

// Warna ringkas per status agar mudah dibaca sekilas.
const COLOR = {
  pending:    'border-beige text-coffee',
  preparing:  'border-caramel text-mocha',
  ready:      'border-leaf-light text-leaf',
  delivering: 'border-caramel text-mocha',
  completed:  'border-leaf text-leaf',
  cancelled:  'border-red-300 text-red-500',
}

export default function OrderStatusSelect({ id, current }) {
  const router = useRouter()
  const [val, setVal] = useState(current || 'pending')
  const [saving, setSaving] = useState(false)

  const onChange = async (e) => {
    const next = e.target.value
    const prev = val
    setVal(next)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        setVal(prev) // gagal → kembalikan nilai semula
      } else {
        router.refresh() // segarkan agar statistik ikut terupdate
      }
    } catch {
      setVal(prev)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={val}
      onChange={onChange}
      disabled={saving}
      className={`text-xs font-semibold bg-white border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-coffee/30 disabled:opacity-60 ${COLOR[val] || 'border-beige text-coffee'}`}
    >
      {STATUSES.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
