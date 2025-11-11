import { CartProvider } from '@/contexts/CartContext'
import CartButton from '@/components/cart/CartButton'
import CartDrawer from '@/components/cart/CartDrawer'
import AnnouncementBar from '@/components/public/AnnouncementBar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
}