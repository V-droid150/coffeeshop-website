import Link from 'next/link'
import ServicesScroll from '@/components/ServicesScroll'

// Hero Section
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image — coffee shop estetik */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1920&q=80")' }} />
      {/* Overlay hangat agar teks tetap terbaca */}
      <div className="absolute inset-0 bg-gradient-to-br from-espresso/90 via-espresso/75 to-coffee/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,149,106,0.25),transparent)]" />

      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'7\' cy=\'7\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
      />

      {/* Decorative coffee rings */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full border border-latte/20 hidden lg:block" />
      <div className="absolute top-32 left-16 w-20 h-20 rounded-full border border-latte/10 hidden lg:block" />
      <div className="absolute bottom-24 right-16 w-48 h-48 rounded-full border border-latte/15 hidden lg:block" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="font-sans text-latte text-sm tracking-[0.3em] uppercase mb-4 animate-fade-up">
          Kopi Spesialti Indonesia
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-warm-white leading-tight mb-6 animate-fade-up"
          style={{ animationDelay: '0.1s' }}>
          Temukan Ketenangan
          <br />
          <span className="text-caramel italic">di Setiap Seduhan</span>
        </h1>
        <p className="font-sans text-cream/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.2s' }}>
          Kami memilih biji kopi terbaik dari pegunungan Nusantara, diseduh dengan teknik manual brewing
          oleh barista berpengalaman — untuk satu cangkir yang sempurna, setiap hari.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-fade-up"
          style={{ animationDelay: '0.3s' }}>
          <Link href="/menu"
            className="bg-caramel hover:bg-latte text-espresso font-bold px-8 py-3.5 sm:py-4 rounded-2xl shadow-warm-lg transition-all duration-200 text-base sm:text-lg">
            Lihat Menu Lengkap →
          </Link>
          <Link href="#layanan"
            className="border-2 border-cream/50 text-cream hover:bg-cream/10 font-semibold px-8 py-3.5 sm:py-4 rounded-2xl transition-all duration-200 text-base sm:text-lg">
            Tempat & Layanan
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/50">
        <span className="text-xs font-sans tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-cream/40 to-transparent animate-bounce" />
      </div>
    </section>
  )
}

// Ikon line-art cokelat (tanpa emoji) — menyatu dengan tema warm & cozy
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
function IconBrew({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 6h16" />
      <path d="M6 6l3 7h6l3-7" />
      <path d="M9.5 13l.8 4h3.4l.8-4" />
      <path d="M12 19v2" />
    </svg>
  )
}
function IconCozy({ className }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 10V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
      <path d="M4 10a2 2 0 0 1 2 2v4h12v-4a2 2 0 0 1 2-2" />
      <path d="M7 16v3M17 16v3" />
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

// About strip
function AboutStrip() {
  const features = [
    { Icon: IconBean, title: 'Single Origin', desc: 'Biji pilihan dari Flores, Toraja, Aceh Gayo' },
    { Icon: IconBrew, title: 'Manual Brew',   desc: 'V60, Chemex, AeroPress oleh barista terlatih' },
    { Icon: IconCozy, title: 'Cozy Space',    desc: 'Suasana hangat untuk kerja & bersantai' },
    { Icon: IconLeaf, title: 'Eco Friendly',  desc: 'Kemasan ramah lingkungan, cup daur ulang' },
  ]
  return (
    <section id="about" className="py-20 px-6 bg-parchment">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="text-center p-6 bg-warm-white rounded-2xl shadow-warm-sm">
            <span className="mx-auto mb-4 w-14 h-14 rounded-full bg-cream flex items-center justify-center text-mocha">
              <f.Icon className="w-7 h-7" />
            </span>
            <h3 className="font-serif font-semibold text-espresso mb-1">{f.title}</h3>
            <p className="text-sm text-latte font-sans leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutStrip />
      <ServicesScroll />
    </>
  )
}
