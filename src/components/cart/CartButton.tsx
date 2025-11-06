// components/cart/CartButton.tsx
'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cartStore'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const [mounted, setMounted] = useState(false)
  const totalProducts = useCartStore((state) => state.items.length)
  const openCart = useCartStore((state) => state.openCart)

  // ✅ Evitar hidratación mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100 transition group"
      aria-label="Abrir carrito"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-pink-600 transition" />
      
      {mounted && totalProducts > 0 && (
        <>
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg z-10">
            {totalProducts > 99 ? '99+' : totalProducts}
          </span>
          
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-pink-600 rounded-full animate-ping opacity-75" />
        </>
      )}
    </button>
  )
}