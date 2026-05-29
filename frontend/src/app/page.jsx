import Link from 'next/link'
import { getProducts } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

// Hero Section
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-espresso via-coffee to-mocha" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,149,106,0.3),transparent)]" />

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
          ☕ Kopi Spesialti Indonesia
        </p>
        <h1 className="font-serif text-5xl md:text-7xl text-warm-white leading-tight mb-6 animate-fade-up"
          style={{ animationDelay: '0.1s' }}>
          Temukan Ketenangan
          <br />
          <span className="text-caramel italic">di Setiap Seduhan</span>
        </h1>
        <p className="font-sans text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.2s' }}>
          Kami memilih biji kopi terbaik dari pegunungan Nusantara, diseduh dengan teknik manual brewing
          oleh barista berpengalaman — untuk satu cangkir yang sempurna, setiap hari.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up"
          style={{ animationDelay: '0.3s' }}>
          <Link href="/menu"
            className="bg-caramel hover:bg-latte text-espresso font-bold px-8 py-4 rounded-2xl shadow-warm-lg transition-all duration-200 text-lg">
            Lihat Menu Lengkap →
          </Link>
          <Link href="#featured"
            className="border-2 border-cream/50 text-cream hover:bg-cream/10 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-lg">
            Menu Favorit
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

// About strip
function AboutStrip() {
  const features = [
    { icon: '🌿', title: 'Single Origin',  desc: 'Biji pilihan dari Flores, Toraja, Aceh Gayo' },
    { icon: '✋', title: 'Manual Brew',    desc: 'V60, Chemex, AeroPress oleh barista terlatih' },
    { icon: '🏡', title: 'Cozy Space',    desc: 'Suasana hangat untuk kerja & bersantai' },
    { icon: '🌱', title: 'Eco Friendly',  desc: 'Kemasan ramah lingkungan, cup daur ulang' },
  ]
  return (
    <section id="about" className="py-20 px-6 bg-parchment">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="text-center p-6 bg-warm-white rounded-2xl shadow-warm-sm">
            <span className="text-4xl block mb-3">{f.icon}</span>
            <h3 className="font-serif font-semibold text-espresso mb-1">{f.title}</h3>
            <p className="text-sm text-latte font-sans leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// Featured products — fetch dari backend
async function FeaturedMenu() {
  let products = []
  try {
    const res = await getProducts({ featured: 'true' })
    products = res.data ?? []
  } catch {
    // Jika backend belum aktif, tampilkan placeholder
    products = []
  }

  return (
    <section id="featured" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-sans text-latte text-sm tracking-widest uppercase mb-2">Menu Pilihan</p>
          <h2 className="font-serif text-4xl md:text-5xl text-espresso">Favorit Pelanggan Kami</h2>
          <p className="text-latte mt-4 max-w-xl mx-auto font-sans">
            Dipilih berdasarkan rating dan ulasan pelanggan setia kami setiap bulan.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-cream rounded-3xl">
            <span className="text-5xl block mb-4">☕</span>
            <p className="font-serif text-xl text-coffee">Menu sedang dimuat...</p>
            <p className="text-latte text-sm mt-2">Pastikan backend sudah berjalan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/menu" className="btn-outline inline-block">
            Lihat Semua Menu →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutStrip />
      <FeaturedMenu />
    </>
  )
}
