'use client'

import CartDrawer from './CartDrawer'
import { useEffect } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'

export default function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  return (
    <>
      {children}
      <CartDrawer />
    </>
  )
}