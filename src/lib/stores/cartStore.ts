// lib/stores/cartStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  slug: string
  price: number
  size: string | null
  quantity: number
  image: string | null
  category?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, size: string | null) => void
  updateQuantity: (productId: string, size: string | null, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemKey: (productId: string, size: string | null) => string
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const itemKey = get().getItemKey(newItem.productId, newItem.size)
          const existingItemIndex = state.items.findIndex(
            (item) => get().getItemKey(item.productId, item.size) === itemKey
          )

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += 1
            return { items: updatedItems }
          } else {
            return {
              items: [...state.items, { ...newItem, quantity: 1 }],
            }
          }
        })
      },

      removeItem: (productId, size) => {
        set((state) => {
          const itemKey = get().getItemKey(productId, size)
          return {
            items: state.items.filter(
              (item) => get().getItemKey(item.productId, item.size) !== itemKey
            ),
          }
        })
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }

        set((state) => {
          const itemKey = get().getItemKey(productId, size)
          const updatedItems = state.items.map((item) =>
            get().getItemKey(item.productId, item.size) === itemKey
              ? { ...item, quantity }
              : item
          )
          return { items: updatedItems }
        })
      },

      clearCart: () => set({ items: [], isOpen: false }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getItemKey: (productId, size) => {
        return `${productId}-${size || 'no-size'}`
      },
    }),
    {
      name: 'tierra-argentina-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Hook para generar mensaje de WhatsApp
export const useWhatsAppMessage = () => {
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.getTotalPrice())

  const generateMessage = () => {
    if (items.length === 0) return ''

    let message = 'Hola! 👋 Quiero realizar el siguiente pedido:\n\n'
    message += '📦 *PEDIDO*\n'
    message += '━━━━━━━━━━━━━━━━\n'

    items.forEach((item) => {
      message += `\n${item.quantity}x ${item.name}\n`
      if (item.size) {
        message += `   Talle: ${item.size}\n`
      }
      message += `   Precio: $${(item.price * item.quantity).toLocaleString('es-AR')}\n`
    })

    message += '\n━━━━━━━━━━━━━━━━\n'
    message += `💰 *TOTAL: $${totalPrice.toLocaleString('es-AR')}*\n\n`
    message += '¡Gracias! Quedo a la espera de la confirmación.'

    return encodeURIComponent(message)
  }

  return { generateMessage }
}