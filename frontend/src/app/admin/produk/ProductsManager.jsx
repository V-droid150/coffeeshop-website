'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function ProductsManager({ initialProducts, categories }) {
  const router = useRouter()
  const EMPTY = {
    name: '', price: '', category_slug: categories[0]?.slug || 'kopi',
    image_url: '', description: '', is_available: true, is_featured: false,
  }
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => { setForm(EMPTY); setEditingId(null); setShowForm(true) }
  const openEdit = (p) => {
    setForm({
      name: p.name, price: String(p.price), category_slug: p.category_slug,
      image_url: p.image_url || '', description: p.description || '',
      is_available: p.is_available, is_featured: p.is_featured,
    })
    setEditingId(p.id)
    setShowForm(true)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY) }

  const save = async (e) => {
    e.preventDefault()
    const price = Number(form.price)
    if (!form.name.trim()) return toast.error('Nama wajib diisi')
    if (!Number.isInteger(price) || price < 0) return toast.error('Harga harus bilangan bulat ≥ 0')

    setSaving(true)
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error || 'Gagal menyimpan'); setSaving(false); return }
      toast.success(editingId ? 'Produk diperbarui' : 'Produk ditambahkan')
      closeForm()
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p) => {
    if (!window.confirm(`Hapus produk "${p.name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error || 'Gagal menghapus'); return }
      toast.success('Produk dihapus')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    }
  }

  const inputCls = 'w-full px-3 py-2.5 bg-cream border border-beige rounded-xl text-espresso placeholder-latte/60 focus:outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition font-sans text-sm'

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-lg text-espresso">Produk ({initialProducts.length})</h2>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm">+ Tambah Produk</button>
        )}
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-2xl shadow-warm-sm p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-espresso">{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
            <button type="button" onClick={closeForm} className="text-sm text-latte hover:text-coffee">Tutup ✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-coffee mb-1">Nama *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nama produk" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-coffee mb-1">Harga (Rp) *</label>
              <input type="number" inputMode="numeric" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-coffee mb-1">Kategori *</label>
              <select value={form.category_slug} onChange={e => set('category_slug', e.target.value)} className={inputCls}>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-coffee mb-1">URL Gambar</label>
              <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://... atau /products/nama.jpg" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-coffee mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Deskripsi singkat produk" className={`${inputCls} resize-none`} />
          </div>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-coffee cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} className="w-4 h-4 accent-coffee" />
              Tersedia (tampil di menu)
            </label>
            <label className="flex items-center gap-2 text-sm text-coffee cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-coffee" />
              Unggulan (Favorit)
            </label>
          </div>
          {form.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image_url} alt="" className="w-24 h-24 object-cover rounded-xl border border-beige" />
          )}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary py-2.5 px-5 text-sm disabled:opacity-60">
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
            <button type="button" onClick={closeForm} className="btn-outline py-2.5 px-5 text-sm">Batal</button>
          </div>
        </form>
      )}

      {/* Daftar produk */}
      <div className="bg-white rounded-2xl shadow-warm-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-latte border-b border-cream">
              <th className="px-4 py-3 font-semibold">Produk</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold text-right">Harga</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-latte">Belum ada produk. Klik tombol Tambah Produk di atas.</td></tr>
            ) : initialProducts.map(p => (
              <tr key={p.id} className="border-b border-cream/60 last:border-0 align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-cream shrink-0" />
                      : <span className="w-10 h-10 rounded-lg bg-cream shrink-0" />}
                    <span className="font-semibold text-espresso">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-coffee whitespace-nowrap">{p.category_icon} {p.category_name}</td>
                <td className="px-4 py-3 text-right font-semibold text-espresso whitespace-nowrap">{formatRupiah(p.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.is_available ? 'bg-leaf-pale text-leaf' : 'bg-red-50 text-red-500'}`}>
                      {p.is_available ? 'Tersedia' : 'Disembunyikan'}
                    </span>
                    {p.is_featured && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-caramel/20 text-mocha">Favorit</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-xs font-semibold text-coffee hover:text-espresso border border-beige hover:border-coffee rounded-lg px-3 py-1.5 transition-colors">Edit</button>
                    <button onClick={() => remove(p)} className="text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg px-3 py-1.5 transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
