'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Ruler, Palette } from 'lucide-react'
import { useCartContext } from '@/contexts/CartContext'
import type { Product, ProductImage } from '@/types' // ✅ Importar desde @/types

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export default function QuickAddModal({ isOpen, onClose, product }: QuickAddModalProps) {
  const { addToCart } = useCartContext()
  
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasColors = false // Por ahora no hay colores, pero lo dejamos preparado

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedSize('')
      setSelectedColor('')
      setQuantity(1)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (hasSizes && !selectedSize) {
      return // El botón estará deshabilitado
    }

    if (hasColors && !selectedColor) {
      return // El botón estará deshabilitado
    }

    addToCart({
      product,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity
    })

    onClose()
  }

  const canSubmit = (!hasSizes || selectedSize) && (!hasColors || selectedColor)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">
              Seleccionar opciones
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Producto info */}
            <div className="flex items-start gap-3">
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images.find((img: ProductImage) => img.is_primary)?.url || product.images[0].url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category?.name}</p>
                <p className="text-lg font-bold text-pink-600 mt-1">
                  ${product.price.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Talles */}
            {hasSizes && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="w-4 h-4" />
                  Talle <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes?.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      type="button"
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={!sizeObj.in_stock}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all
                        ${!sizeObj.in_stock 
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                          : selectedSize === sizeObj.size
                            ? 'border-pink-600 bg-pink-50 text-pink-700'
                            : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                        }
                      `}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-gray-500 mt-1">
                    Por favor selecciona un talle
                  </p>
                )}
              </div>
            )}

            {/* Colores (preparado para futuro) */}
            {hasColors && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4" />
                  Color <span className="text-red-500">*</span>
                </label>
                {/* Implementar cuando tengas colores */}
              </div>
            )}

            {/* Cantidad */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-300 rounded-lg py-2"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}