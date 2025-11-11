'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import toast from 'react-hot-toast'
import type { Cart, CartItem, AddToCartParams } from '@/types/cart'

interface CartContextType {
  cart: Cart
  addToCart: (params: AddToCartParams) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'tierra-argentina-cart'

function generateCartItemId(productId: string, size?: string, color?: string): string {
  return `${productId}-${size || 'default'}-${color || 'default'}`
}

function calculateTotal(items: CartItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

function calculateItemCount(items: CartItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Cargar del localStorage solo en el cliente
  useEffect(() => {
    setMounted(true)
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setItems([])
    }
  }, [])

  // Guardar en localStorage
  useEffect(() => {
    if (!mounted) return
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }, [items, mounted])

  const addToCart = useCallback(({ product, size, color, quantity = 1 }: AddToCartParams) => {
    const itemId = generateCartItemId(product.id, size, color)

    setItems(prev => {
      const existingItem = prev.find(item => item.id === itemId)

      if (existingItem) {
        // Llamar toast DESPUÉS de actualizar el estado
        setTimeout(() => toast.success('Cantidad actualizada'), 0)
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      const newItem: CartItem = {
        id: itemId,
        product,
        size,
        color,
        quantity,
        price: product.price
      }

      // Llamar toast DESPUÉS de actualizar el estado
      setTimeout(() => toast.success('Producto agregado al carrito'), 0)
      return [...prev, newItem]
    })

    // Abrir carrito después de agregar
    setTimeout(() => setIsOpen(true), 300)
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
    setTimeout(() => toast.success('Producto eliminado'), 0)
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId)
      return
    }

    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
    setTimeout(() => toast.success('Carrito limpiado'), 0)
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  // Crear el objeto cart con valores seguros
  const cart: Cart = {
    items: Array.isArray(items) ? items : [],
    total: calculateTotal(items),
    itemCount: calculateItemCount(items)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const useCartContext = useCart