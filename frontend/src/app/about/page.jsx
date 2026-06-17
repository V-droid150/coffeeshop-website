// ─── HALAMAN ABOUT — Server Component ────────────────────────────────────────
// Halaman profil "Tentang Kami" multi-section. Murni presentasional (statik),
// animasi entrance memakai util CSS .animate-fade-up (lihat globals.css).
// Gambar diambil dari Unsplash (sudah di-allowlist CSP img-src & next.config).
// ─────────────────────────────────────────────────────────────────────────────
import Link from 'next/link'

export const metadata = {
  title: 'Tentang Kami — Kopi Nusantara',
  description:
    'Cerita di balik Kopi Nusantara: dari biji single origin pegunungan Indonesia hingga secangkir kopi yang diseduh penuh ketelitian. Kenali visi, nilai, dan perjalanan kami.',
}

// ── Ikon line-art cokelat (tanpa emoji) — menyatu dengan tema warm & cozy ──────
const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}
function IconBean({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3c-4 0-7 4-7 9s3 9 7 9 7-4 7-9-3-9-7-9z" />
      <path d="M9 5c2.5 3.5 4 9.5 6 13.5" />
    </svg>
  )
}
function IconGlobe({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </svg>
  )
}
function IconLeaf({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" />
      <path d="M5 19c3.5-3.5 6.5-6.5 9-9" />
    </svg>
  )
}
function IconHeart({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z" />
    </svg>
  )
}
function IconCheck({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const values = [
  {
    Icon: IconBean,
    title: 'Kualitas Tanpa Kompromi',
    desc: 'Hanya biji arabika kelas spesialti yang kami pilih, disangrai dalam batch kecil agar setiap karakter rasa muncul utuh.',
  },
  {
    Icon: IconGlobe,
    title: 'Asal yang Jujur',
    desc: 'Single origin dari Flores, Toraja, dan Aceh Gayo. Kami tahu dari mana biji kami berasal — dan kami bangga menceritakannya.',
  },
  {
    Icon: IconLeaf,
    title: 'Berkelanjutan',
    desc: 'Bermitra adil dengan petani lokal serta menggunakan kemasan dan gelas yang ramah lingkungan.',
  },
  {
    Icon: IconHeart,
    title: 'Kehangatan & Komunitas',
    desc: 'Lebih dari sekadar kopi — kami merawat ruang yang hangat tempat orang bertemu, bekerja, dan beristirahat.',
  },
]

const process = [
  { no: '01', title: 'Sourcing', desc: 'Memilih biji terbaik langsung dari petani pegunungan Nusantara.' },
  { no: '02', title: 'Roasting', desc: 'Disangrai dalam batch kecil untuk profil rasa yang konsisten.' },
  { no: '03', title: 'Brewing', desc: 'Diseduh manual (V60, Chemex, AeroPress) oleh barista terlatih.' },
  { no: '04', title: 'Serving', desc: 'Disajikan hangat di ruang yang nyaman, atau diantar ke tempat Anda.' },
]

const stats = [
  { value: '2024', label: 'Tahun Berdiri' },
  { value: '3+', label: 'Daerah Asal Biji' },
  { value: '100%', label: 'Arabika Pilihan' },
  { value: '50+', label: 'Pilihan Menu' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-24 sm:pt-48 sm:pb-28 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-espresso/92 via-espresso/82 to-coffee/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,149,106,0.25),transparent)]" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-sans text-latte text-sm tracking-[0.3em] uppercase mb-4 animate-fade-up">
            Tentang Kami
          </p>
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-warm-white leading-tight mb-6 animate-fade-up [text-shadow:0_2px_20px_rgba(20,8,4,0.55)]"
            style={{ animationDelay: '0.1s' }}
          >
            Cerita di Balik
            <br />
            <span className="text-caramel italic">Setiap Cangkir</span>
          </h1>
          <p
            className="font-sans text-cream/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-up [text-shadow:0_1px_12px_rgba(20,8,4,0.45)]"
            style={{ animationDelay: '0.2s' }}
          >
            Kopi Nusantara lahir dari satu keyakinan sederhana: kopi terbaik Indonesia
            layak diseduh dengan ketelitian, dan dinikmati dalam kehangatan.
          </p>
        </div>
      </section>

      {/* ── Filosofi / pernyataan brand ─────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-6 bg-parchment">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block w-12 h-px bg-caramel mb-8" />
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-espresso leading-snug">
            “Kami percaya secangkir kopi yang baik dimulai jauh sebelum ia dituang —
            dari tanah yang subur, tangan petani yang telaten, dan waktu yang tidak
            pernah tergesa.”
          </p>
          <p className="mt-8 font-sans text-coffee/70 text-sm tracking-widest uppercase">
            Filosofi Kopi Nusantara
          </p>
        </div>
      </section>

      {/* ── Perjalanan kami (Our Story) ─────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div
              className="aspect-[4/5] rounded-3xl bg-cover bg-center shadow-warm-lg"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80")',
              }}
            />
            {/* Kartu aksen "Est." */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-warm-white rounded-2xl shadow-warm-lg px-6 py-4 text-center">
              <p className="font-serif text-3xl text-espresso leading-none">2024</p>
              <p className="font-sans text-xs text-latte tracking-widest uppercase mt-1">
                Sejak
              </p>
            </div>
          </div>

          <div>
            <p className="font-sans text-mocha text-sm tracking-widest uppercase mb-3">
              Perjalanan Kami
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso mb-6 leading-tight">
              Dari Kecintaan pada Kopi Nusantara
            </h2>
            <div className="space-y-4 font-sans text-coffee leading-relaxed">
              <p>
                Berawal dari obsesi sederhana terhadap kopi lokal, kami berkeliling dari
                satu kebun ke kebun lain di pegunungan Indonesia. Kami menemukan bahwa di
                balik setiap biji ada cerita — tentang tanah, ketinggian, dan petani yang
                merawatnya dengan sepenuh hati.
              </p>
              <p>
                Kopi Nusantara hadir untuk menghormati cerita itu. Kami memilih biji
                single origin terbaik, menyangrainya dalam batch kecil, lalu menyeduhnya
                dengan teknik manual brewing yang presisi — agar setiap karakter rasa
                tersaji apa adanya.
              </p>
              <p>
                Hari ini, kami bukan sekadar kedai kopi. Kami adalah ruang hangat tempat
                orang-orang berkumpul, bekerja, dan menemukan ketenangan — satu cangkir
                pada satu waktu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visi & Misi ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-6 bg-espresso text-cream">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <p className="font-sans text-caramel text-sm tracking-widest uppercase mb-3">
              Visi
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-warm-white leading-tight">
              Menjadikan kopi spesialti Indonesia layak dibanggakan —
              <span className="text-caramel italic"> di rumahnya sendiri.</span>
            </h2>
          </div>
          <div>
            <p className="font-sans text-caramel text-sm tracking-widest uppercase mb-5">
              Misi
            </p>
            <ul className="space-y-4">
              {[
                'Menyajikan kopi berkualitas tinggi yang konsisten dalam setiap cangkir.',
                'Mendukung petani lokal melalui kemitraan yang adil dan transparan.',
                'Menghadirkan pengalaman ngopi yang hangat, nyaman, dan berkesan.',
                'Tumbuh secara berkelanjutan dengan menjaga lingkungan.',
              ].map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-caramel/20 flex items-center justify-center text-caramel">
                    <IconCheck className="w-4 h-4" />
                  </span>
                  <span className="font-sans text-cream/85 leading-relaxed">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Nilai kami ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-sans text-mocha text-sm tracking-widest uppercase mb-3">
              Yang Kami Pegang
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso leading-tight">
              Nilai-Nilai Kami
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="card p-7 text-center hover:-translate-y-1"
              >
                <span className="mx-auto mb-5 w-14 h-14 rounded-full bg-cream flex items-center justify-center text-mocha">
                  <v.Icon className="w-7 h-7" />
                </span>
                <h3 className="font-serif font-semibold text-lg text-espresso mb-2">
                  {v.title}
                </h3>
                <p className="font-sans text-sm text-coffee/80 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dari biji ke cangkir (proses) ───────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-6 bg-parchment">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-sans text-mocha text-sm tracking-widest uppercase mb-3">
              Bean to Cup
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso leading-tight">
              Dari Biji ke Cangkir
            </h2>
            <p className="mt-4 font-sans text-coffee/75 leading-relaxed">
              Empat langkah yang kami jaga dengan teliti agar kopi Anda selalu istimewa.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p, i) => (
              <div key={i} className="relative bg-warm-white rounded-2xl shadow-warm-sm p-7">
                <span className="font-serif text-5xl text-caramel/30 leading-none">{p.no}</span>
                <h3 className="font-serif font-semibold text-lg text-espresso mt-3 mb-2">
                  {p.title}
                </h3>
                <p className="font-sans text-sm text-coffee/80 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistik ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="font-serif text-4xl sm:text-5xl text-espresso">{s.value}</p>
              <p className="mt-2 font-sans text-sm text-latte tracking-wide uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-espresso/92 to-coffee/88" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-warm-white leading-tight mb-5">
            Rasakan Sendiri Kehangatannya
          </h2>
          <p className="font-sans text-cream/85 text-base sm:text-lg mb-9 leading-relaxed">
            Setiap cerita kami berakhir di satu tempat yang sama — secangkir kopi di
            tangan Anda. Mari mulai dari sini.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/menu"
              className="bg-caramel hover:bg-latte text-espresso font-bold px-8 py-4 rounded-2xl shadow-warm-lg transition-all duration-200 text-base sm:text-lg"
            >
              Lihat Menu Lengkap →
            </Link>
            <Link
              href="/contact"
              className="border-2 border-cream/50 text-cream hover:bg-cream/10 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base sm:text-lg"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
