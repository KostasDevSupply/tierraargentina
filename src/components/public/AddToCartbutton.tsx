// components/public/AddToCartButton.tsx
'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image?: string
    category?: string
  }
  selectedSize: string | null
  disabled?: boolean
  onAddToCart: () => void
}

export default function AddToCartButton({
  product,
  selectedSize,
  disabled = false,
  onAddToCart,
}: AddToCartButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = () => {
    onAddToCart()
    
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : showSuccess
            ? 'bg-green-500 text-white'
            : 'bg-pink-600 hover:bg-pink-700 text-white hover:scale-105'
        }`}
      >
        {showSuccess ? (
          <>
            <Check className="w-6 h-6" />
            ¡Agregado al carrito!
          </>
        ) : (
          <>
            <ShoppingCart className="w-6 h-6" />
            Agregar al carrito
            {selectedSize && (
              <span className="text-sm font-normal">({selectedSize})</span>
            )}
          </>
        )}
      </button>

      {showSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="font-bold">¡Producto agregado!</p>
            <p className="text-sm text-green-100">{product.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}