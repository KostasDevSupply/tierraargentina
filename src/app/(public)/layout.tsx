import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import WhatsAppButton from '@/components/public/WhatsappButton'
import CartProvider from '@/components/cart/CartProvider'


export const metadata = {
  title: 'Tierra Argentina',
  description: 'Catálogo de productos de Tierra Argentina',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
     <CartProvider>
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
    </CartProvider>
  )
}