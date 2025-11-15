import { Toaster } from 'react-hot-toast'
import { CartProvider } from '@/contexts/CartContext'
import QueryProvider from '@/providers/QueryProvider'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import AnnouncementBar from '@/components/public/AnnouncementBar'

export const metadata = {
  title: 'Tierra Argentina - Lencería de Calidad',
  description: 'Descubrí nuestra colección exclusiva de lencería femenina y masculina'
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <CartProvider>
        <AnnouncementBar />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </CartProvider>
    </QueryProvider>
  )
}