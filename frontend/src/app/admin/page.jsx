import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getSupabase } from '@/lib/supabase'
import Logo from '@/components/Logo'
import LogoutButton from './LogoutButton'
import OrderStatusSelect from './OrderStatusSelect'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard — Kopi Nusantara', robots: { index: false, follow: false } }

const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }) : '—'

const PAY_META = {
  paid:    { label: 'Lunas',       cls: 'bg-leaf-pale text-leaf' },
  pending: { label: 'Menunggu',    cls: 'bg-caramel/20 text-mocha' },
  unpaid:  { label: 'Belum (COD)', cls: 'bg-cream text-coffee' },
  failed:  { label: 'Gagal',       cls: 'bg-red-100 text-red-600' },
  expired: { label: 'Kedaluwarsa', cls: 'bg-red-50 text-red-500' },
}

// ── Filter rentang waktu ──────────────────────────────────────────────────────
const RANGES = [
  { key: 'today', label: 'Hari ini' },
  { key: '7d',    label: '7 hari' },
  { key: '30d',   label: '30 hari' },
  { key: 'all',   label: 'Semua' },
]
function cutoffFor(range) {
  const now = Date.now()
  if (range === '7d')  return new Date(now - 7 * 86400000)
  if (range === '30d') return new Date(now - 30 * 86400000)
  if (range === 'today') {
    // Tengah malam WIB (UTC+7).
    const wib = new Date(now + 7 * 3600000)
    wib.setUTCHours(0, 0, 0, 0)
    return new Date(wib.getTime() - 7 * 3600000)
  }
  return null // 'all' → tanpa batas
}

function PayBadge({ status }) {
  const m = PAY_META[status] || { label: status || '—', cls: 'bg-cream text-coffee' }
  return <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${m.cls}`}>{m.label}</span>
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-warm-sm p-5">
      <p className="text-sm text-latte font-sans">{label}</p>
      <p className="font-serif font-bold text-2xl text-espresso mt-1">{value}</p>
      {sub && <p className="text-xs text-latte font-sans mt-0.5">{sub}</p>}
    </div>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-espresso">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7 text-caramel" />
            <div>
              <p className="font-serif font-bold text-warm-white leading-tight">Dashboard Admin</p>
              <p className="text-[11px] text-cream/60 font-sans tracking-wide">Kopi Nusantara</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}

function RangeFilter({ active }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {RANGES.map(r => (
        <Link
          key={r.key}
          href={r.key === 'all' ? '/admin' : `/admin?range=${r.key}`}
          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
            active === r.key ? 'bg-coffee text-warm-white shadow-warm-sm' : 'bg-white text-coffee border border-beige hover:border-coffee'
          }`}
        >
          {r.label}
        </Link>
      ))}
    </div>
  )
}

export default async function AdminDashboardPage({ searchParams }) {
  if (!isAdminAuthed()) redirect('/admin/login')

  const range = RANGES.some(r => r.key === searchParams?.range) ? searchParams.range : 'all'
  const cutoff = cutoffFor(range)

  const supabase = getSupabase()
  if (!supabase) {
    return (
      <Shell>
        <div className="bg-white rounded-2xl shadow-warm-sm p-8 text-center">
          <p className="font-serif text-xl text-espresso mb-2">Database belum terhubung</p>
          <p className="text-sm text-latte">Set <code>NEXT_PUBLIC_SUPABASE_URL</code> &amp; <code>SUPABASE_SERVICE_ROLE_KEY</code> di environment.</p>
        </div>
      </Shell>
    )
  }

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (cutoff) query = query.gte('created_at', cutoff.toISOString())
  const { data: orders, error } = await query

  if (error) {
    return (
      <Shell>
        <RangeFilter active={range} />
        <div className="bg-white rounded-2xl shadow-warm-sm p-8 text-center">
          <p className="font-serif text-xl text-espresso mb-2">Gagal memuat data</p>
          <p className="text-sm text-latte">Coba muat ulang halaman.</p>
        </div>
      </Shell>
    )
  }

  const list = orders || []

  // ── Statistik (mengikuti filter rentang) ─────────────────────────────────────
  const paid = list.filter(o => o.payment_status === 'paid')
  const revenue = paid.reduce((s, o) => s + (o.total_amount || 0), 0)
  const payCounts = list.reduce((acc, o) => {
    acc[o.payment_status] = (acc[o.payment_status] || 0) + 1
    return acc
  }, {})

  const custMap = new Map()
  for (const o of list) {
    const key = o.customer_phone || o.customer_name || `#${o.id}`
    const c = custMap.get(key) || {
      name: o.customer_name, phone: o.customer_phone, email: o.customer_email,
      orders: 0, spent: 0,
    }
    c.orders += 1
    if (o.payment_status === 'paid') c.spent += o.total_amount || 0
    custMap.set(key, c)
  }
  const customers = [...custMap.values()].sort((a, b) => b.spent - a.spent)

  const itemsSummary = (o) =>
    (o.order_items || []).map(i => `${i.product_name} ×${i.quantity}`).join(', ') || '—'

  const rangeLabel = RANGES.find(r => r.key === range)?.label?.toLowerCase()

  return (
    <Shell>
      <RangeFilter active={range} />

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Total Pendapatan" value={formatRupiah(revenue)} sub={`dari ${paid.length} pesanan lunas`} />
        <StatCard label="Total Pesanan" value={list.length} sub={range !== 'all' ? rangeLabel : undefined} />
        <StatCard label="Pelanggan Unik" value={customers.length} />
        <StatCard label="Menunggu Bayar" value={payCounts.pending || 0} sub="status pending" />
      </div>

      {/* Rincian status pembayaran */}
      <section className="mb-8">
        <h2 className="font-serif text-lg text-espresso mb-3">Status Pembayaran</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PAY_META).map(s => (
            <span key={s} className="inline-flex items-center gap-2 bg-white rounded-xl shadow-warm-sm px-3 py-2">
              <PayBadge status={s} />
              <strong className="text-espresso text-sm">{payCounts[s] || 0}</strong>
            </span>
          ))}
        </div>
      </section>

      {/* Tabel pesanan */}
      <section className="mb-8">
        <h2 className="font-serif text-lg text-espresso mb-3">Pesanan ({list.length})</h2>
        <div className="bg-white rounded-2xl shadow-warm-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="text-left text-latte border-b border-cream">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Metode</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold">Bayar</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-latte">Belum ada pesanan pada rentang ini.</td></tr>
              ) : list.map(o => (
                <tr key={o.id} className="border-b border-cream/60 last:border-0 align-top">
                  <td className="px-4 py-3 text-coffee whitespace-nowrap">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-espresso">{o.customer_name}</p>
                    <p className="text-xs text-latte">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-coffee max-w-[240px]">{itemsSummary(o)}</td>
                  <td className="px-4 py-3 text-coffee whitespace-nowrap capitalize">
                    {o.fulfillment_type} · {o.payment_method}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-espresso whitespace-nowrap">{formatRupiah(o.total_amount)}</td>
                  <td className="px-4 py-3"><PayBadge status={o.payment_status} /></td>
                  <td className="px-4 py-3"><OrderStatusSelect id={o.id} current={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tabel pelanggan */}
      <section>
        <h2 className="font-serif text-lg text-espresso mb-3">Pelanggan ({customers.length})</h2>
        <div className="bg-white rounded-2xl shadow-warm-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-latte border-b border-cream">
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold text-center">Pesanan</th>
                <th className="px-4 py-3 font-semibold text-right">Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-latte">Belum ada pelanggan.</td></tr>
              ) : customers.map((c, i) => (
                <tr key={i} className="border-b border-cream/60 last:border-0">
                  <td className="px-4 py-3 font-semibold text-espresso">{c.name}</td>
                  <td className="px-4 py-3 text-coffee">
                    <p>{c.phone}</p>
                    {c.email && <p className="text-xs text-latte">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-center text-coffee">{c.orders}</td>
                  <td className="px-4 py-3 text-right font-semibold text-espresso whitespace-nowrap">{formatRupiah(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  )
}
