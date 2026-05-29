export default function Footer() {
  return (
    <footer className="bg-espresso text-cream py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">☕</span>
            <span className="font-serif font-bold text-xl text-warm-white">Kopi Nusantara</span>
          </div>
          <p className="text-cream/60 text-sm leading-relaxed font-sans">
            Secangkir kopi yang diseduh dengan cinta, untuk menghangatkan hari-harimu.
          </p>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-caramel mb-3">Jam Operasional</h4>
          <div className="space-y-1 text-sm text-cream/70 font-sans">
            <p>Senin – Jumat: 07.00 – 22.00</p>
            <p>Sabtu – Minggu: 08.00 – 23.00</p>
          </div>
        </div>

        <div id="contact">
          <h4 className="font-serif font-semibold text-caramel mb-3">Kontak</h4>
          <div className="space-y-1 text-sm text-cream/70 font-sans">
            <p>📍 Jl. Kopi Nusantara No. 1, Jakarta</p>
            <p>📞 (021) 1234-5678</p>
            <p>✉️ halo@kopinusantara.id</p>
            <p>📸 @kopinusantara</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-coffee/40 mt-10 pt-6 text-center">
        <p className="text-cream/40 text-xs font-sans">
          © {new Date().getFullYear()} Kopi Nusantara. Dibuat dengan ☕ dan ❤️ oleh VinSite.
        </p>
      </div>
    </footer>
  )
}
