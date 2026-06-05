'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion'

/**
 * ServicesScroll — section "Tempat & Layanan" dengan sticky scroll.
 * Saat halaman di-scroll, panel ter-pin di layar, teks layanan berganti,
 * dan gambar latar berganti dengan crossfade halus (di-smooth pakai useSpring)
 * supaya nyaman dan tidak mengejutkan mata. Menghormati prefers-reduced-motion.
 */

const services = [
  {
    eyebrow: 'Ruang & Suasana',
    title: 'Tempat yang Mengundang untuk Tinggal Lebih Lama',
    desc: 'Kayu hangat, cahaya temaram, dan aroma kopi yang baru disangrai. Setiap sudut Kopi Nusantara kami rancang sebagai ruang jeda dari riuhnya kota — tempat percakapan mengalir dan waktu terasa melambat.',
    bullets: ['Indoor & outdoor seating', 'Pencahayaan hangat sepanjang hari', 'Buka 07.00 – 23.00 setiap hari'],
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80',
  },
  {
    eyebrow: 'Manual Brew Bar',
    title: 'Seni Seduh, Disajikan di Depan Mata Anda',
    desc: 'Di brew bar kami, barista meracik setiap cangkir dengan metode V60, Chemex, dan AeroPress. Tanyakan asal bijinya, profil rasanya, atau sekadar nikmati ritual menyeduh yang menenangkan.',
    bullets: ['Single origin Nusantara pilihan', 'Barista bersertifikasi', 'Sesi edukasi kopi tiap akhir pekan'],
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80',
  },
  {
    eyebrow: 'Ruang Kerja & Meeting',
    title: 'Produktif Tanpa Kehilangan Kenyamanan',
    desc: 'WiFi cepat, colokan di setiap meja, dan sudut tenang untuk fokus. Butuh ruang untuk diskusi tim atau acara kecil? Reservasi private space kami dan biarkan kopi menemani setiap ide.',
    bullets: ['WiFi 100 Mbps & stop kontak di tiap meja', 'Private room untuk 4–12 orang', 'Reservasi mudah via WhatsApp'],
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1920&q=80',
  },
  {
    eyebrow: 'Take Away & Antar',
    title: 'Kopi Favorit Anda, Ke Mana Pun Tujuannya',
    desc: 'Sedang terburu-buru? Pesan lewat aplikasi dan ambil tanpa antre, atau biarkan kami antar langsung ke pintu Anda. Kualitas yang sama, dalam kemasan yang ramah lingkungan.',
    bullets: ['Pesan online, ambil tanpa antre', 'Pengantaran area kota', 'Cup & kemasan daur ulang'],
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1920&q=80',
  },
]

// Membangun rentang input/output crossfade untuk satu indeks.
// Ujung pertama & terakhir dibuat "penuh" agar tidak ada flash kosong.
function fadeRanges(index, total) {
  const seg = 1 / total
  const center = index * seg + seg / 2
  const span = seg * 0.75
  if (index === 0) return { input: [center, center + span], output: [1, 0] }
  if (index === total - 1) return { input: [center - span, center], output: [0, 1] }
  return { input: [center - span, center, center + span], output: [0, 1, 0] }
}

// Lapisan gambar latar — crossfade opacity murni (ringan di GPU, tanpa jank).
function ServiceBackground({ service, index, total, progress }) {
  const { input, output } = fadeRanges(index, total)
  const opacity = useTransform(progress, input, output)

  return (
    <motion.div
      style={{
        opacity,
        backgroundImage: `url("${service.image}")`,
        willChange: 'opacity',
        transform: 'translateZ(0)',
      }}
      className="absolute inset-0 bg-cover bg-center"
    >
      {/* Satu overlay hangat: gelap di kiri-bawah agar teks terbaca */}
      <div className="absolute inset-0 bg-gradient-to-tr from-espresso via-espresso/70 to-espresso/25" />
    </motion.div>
  )
}

// Panel teks — crossfade selaras dengan latarnya + geser lembut.
function ServicePanel({ service, index, total, progress }) {
  const { input, output } = fadeRanges(index, total)
  const opacity = useTransform(progress, input, output)
  const y = useTransform(
    progress,
    input,
    index === 0 ? [0, 60] : index === total - 1 ? [-60, 0] : [60, 0, -60]
  )
  // Matikan klik pada panel yang sedang transparan.
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? 'auto' : 'none'))

  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="absolute inset-0 flex items-center"
    >
      <div className="max-w-2xl px-6 md:px-16 lg:px-24">
        <p className="font-sans text-caramel text-xs sm:text-sm tracking-[0.3em] uppercase mb-3 sm:mb-4">
          0{index + 1} — {service.eyebrow}
        </p>
        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-warm-white leading-tight mb-4 sm:mb-6">
          {service.title}
        </h3>
        <p className="font-sans text-cream/85 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
          {service.desc}
        </p>
        <ul className="space-y-2.5 sm:space-y-3">
          {service.bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-3 text-sm sm:text-base text-cream/90 font-sans">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-caramel/20 text-caramel flex items-center justify-center text-sm">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

// Titik indikator progres di sisi kanan.
function ProgressDot({ index, total, progress }) {
  const seg = 1 / total
  const center = index * seg + seg / 2
  const range = [center - seg / 2, center, center + seg / 2]
  const scale = useTransform(progress, range, [1, 1.8, 1])
  const opacity = useTransform(progress, range, [0.35, 1, 0.35])
  return (
    <motion.span
      style={{ scale, opacity }}
      className="block w-2.5 h-2.5 rounded-full bg-caramel"
    />
  )
}

// Fallback statis untuk pengguna yang memilih reduced motion.
function ServicesFallback() {
  return (
    <section id="layanan" className="bg-espresso py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-caramel text-sm tracking-[0.3em] uppercase mb-3">
            Tempat & Layanan
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-warm-white">
            Lebih dari Sekadar Secangkir Kopi
          </h2>
        </div>
        <div className="space-y-16">
          {services.map((s, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-8 items-center">
              <div
                className={`rounded-3xl overflow-hidden aspect-[4/3] bg-cover bg-center shadow-warm-lg ${i % 2 ? 'md:order-2' : ''}`}
                style={{ backgroundImage: `url("${s.image}")` }}
              />
              <div>
                <p className="font-sans text-caramel text-sm tracking-[0.3em] uppercase mb-3">
                  0{i + 1} — {s.eyebrow}
                </p>
                <h3 className="font-serif text-3xl text-warm-white mb-4">{s.title}</h3>
                <p className="font-sans text-cream/85 leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-3 text-cream/90 font-sans">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-caramel/20 text-caramel flex items-center justify-center text-sm">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ServicesScroll() {
  const reduceMotion = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  // Smoothing ringan: cukup menghaluskan jitter trackpad tanpa terasa "berat"
  // atau tertinggal (lag) dari scroll. Spring yang snappy = settle cepat.
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 40,
    mass: 0.25,
  })

  if (reduceMotion) return <ServicesFallback />

  const total = services.length

  return (
    <section
      id="layanan"
      ref={ref}
      style={{ height: `${total * 100}vh` }}
      className="relative bg-espresso"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Lapisan latar (crossfade) */}
        {services.map((s, i) => (
          <ServiceBackground key={`bg-${i}`} service={s} index={i} total={total} progress={progress} />
        ))}

        {/* Label section, tetap di atas */}
        <div className="absolute top-8 md:top-12 inset-x-0 z-20 text-center px-6 pointer-events-none">
          <p className="font-sans text-caramel/90 text-xs md:text-sm tracking-[0.3em] uppercase">
Tempat & Layanan Kami
          </p>
        </div>

        {/* Panel teks (crossfade) */}
        <div className="absolute inset-0 z-10">
          {services.map((s, i) => (
            <ServicePanel key={`panel-${i}`} service={s} index={i} total={total} progress={progress} />
          ))}
        </div>

        {/* Indikator progres — disembunyikan di mobile agar tak menimpa teks panel */}
        <div className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-4">
          {services.map((_, i) => (
            <ProgressDot key={`dot-${i}`} index={i} total={total} progress={progress} />
          ))}
        </div>

        {/* CTA di bawah */}
        <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center px-6">
          <Link
            href="/menu"
            className="bg-caramel hover:bg-latte text-espresso font-bold px-7 py-3.5 rounded-2xl shadow-warm-lg transition-all duration-200"
          >
            Lihat Menu Lengkap →
          </Link>
        </div>
      </div>
    </section>
  )
}
