import './globals.css'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Kopi Nusantara — Temukan Ketenangan di Setiap Seduhan',
  description: 'Kopi spesialti Indonesia yang diseduh dengan cinta. Nikmati suasana hangat dan nyaman di Kopi Nusantara.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-warm-white text-espresso min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#F5E6D3',
                color: '#2C1810',
                border: '1px solid #C4956A',
                borderRadius: '12px',
                fontFamily: 'Nunito, sans-serif',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  )
}
