// ─── HALAMAN KONTAK — Server Component ───────────────────────────────────────
// Hero + kolom info kontak + form (ContactForm = client component).
// Gambar dari Unsplash (di-allowlist CSP & next.config).
// ─────────────────────────────────────────────────────────────────────────────
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Kontak — Kopi Nusantara',
  description:
    'Hubungi Kopi Nusantara untuk reservasi, kerja sama, pemesanan acara, atau sekadar menyapa. Kami senang mendengar dari Anda.',
}

// Ikon line-art cokelat (tanpa emoji) — konsisten dengan tema
const ic = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' }
const IconPin = (p) => (<svg {...ic} {...p}><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></svg>)
const IconPhone = (p) => (<svg {...ic} {...p}><path d="M5 4h3l2 5-2 1.5a11 11 0 0 0 5 5L19 13l2 5v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" /></svg>)
const IconMail = (p) => (<svg {...ic} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg>)
const IconClock = (p) => (<svg {...ic} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>)
const IconInsta = (p) => (<svg {...ic} {...p}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.2" /><circle cx="16.6" cy="7.4" r="0.6" fill="currentColor" /></svg>)

const contacts = [
  { Icon: IconPin, label: 'Alamat', value: 'Jl. Kopi Nusantara No. 1, Jakarta', href: null },
  { Icon: IconPhone, label: 'Telepon', value: '(021) 1234-5678', href: 'tel:+62211234567' },
  { Icon: IconMail, label: 'Email', value: 'halo@kopinusantara.id', href: 'mailto:halo@kopinusantara.id' },
  { Icon: IconInsta, label: 'Instagram', value: '@kopinusantara', href: 'https://instagram.com/kopinusantara' },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* ── Header ringkas (tanpa hero gambar) ──────────────────────────────── */}
      <section className="pt-32 sm:pt-36 px-6">
        <div className="max-w-6xl mx-auto text-center sm:text-left">
          <p className="font-sans text-mocha text-sm tracking-[0.25em] uppercase mb-3 animate-fade-up">
            Hubungi Kami
          </p>
          <h1
            className="font-serif text-4xl sm:text-5xl text-espresso leading-tight animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            Mari <span className="text-caramel italic">Ngobrol</span>
          </h1>
          <span className="mt-5 inline-block w-12 h-px bg-caramel animate-fade-up" />
        </div>
      </section>

      {/* ── Info + Form ─────────────────────────────────────────────────────── */}
      <section className="pt-10 pb-20 sm:pt-12 sm:pb-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Kolom info */}
          <div>
            <p className="font-sans text-mocha text-sm tracking-widest uppercase mb-3">Informasi Kontak</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso mb-6 leading-tight">
              Sampaikan kepada Kami
            </h2>
            <p className="font-sans text-coffee/80 leading-relaxed mb-8">
              Kunjungi kedai kami atau hubungi lewat kanal di bawah ini. Kami selalu
              senang menyambut percakapan baru — dari secangkir kopi hingga peluang
              kolaborasi.
            </p>

            <ul className="space-y-5">
              {contacts.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-center gap-4">
                  <span className="shrink-0 w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-mocha">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span>
                    <span className="block font-sans text-xs uppercase tracking-wide text-latte">{label}</span>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block font-sans text-espresso hover:text-mocha transition-colors">
                        {value}
                      </a>
                    ) : (
                      <span className="block font-sans text-espresso">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            {/* Jam operasional */}
            <div className="mt-8 rounded-2xl bg-parchment p-6">
              <div className="flex items-center gap-2 mb-3 text-mocha">
                <IconClock className="w-5 h-5" />
                <h3 className="font-serif font-semibold text-espresso">Jam Operasional</h3>
              </div>
              <div className="space-y-1 font-sans text-sm text-coffee/80">
                <p className="flex justify-between"><span>Senin – Jumat</span><span>07.00 – 22.00</span></p>
                <p className="flex justify-between"><span>Sabtu – Minggu</span><span>08.00 – 23.00</span></p>
              </div>
            </div>
          </div>

          {/* Kolom form */}
          <div className="card p-7 sm:p-8 h-fit animate-fade-up">
            <h2 className="font-serif text-2xl text-espresso mb-1">Kirim Pesan</h2>
            <p className="font-sans text-sm text-coffee/70 mb-6">Isi formulir di bawah, kami akan menghubungi Anda kembali.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
