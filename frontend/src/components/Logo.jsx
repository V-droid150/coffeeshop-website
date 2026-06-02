/**
 * Logo — mark kopi minimalis & artistik (monoline cup + uap + alas).
 * Mewarisi warna dari `currentColor`, jadi atur warna lewat className teks induk.
 */
export default function Logo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* uap */}
        <path d="M16 6c-1.3 1.6-1.3 3.2 0 4.8" opacity="0.65" />
        <path d="M22 5c-1.4 1.8-1.4 3.6 0 5.4" opacity="0.65" />
        {/* badan cangkir */}
        <path d="M9 15h18v6.5a9 9 0 0 1-18 0z" />
        {/* gagang */}
        <path d="M27 17h3.2a3.8 3.8 0 0 1 0 7.6H27" />
        {/* alas */}
        <path d="M6.5 33h21" />
      </g>
    </svg>
  )
}
