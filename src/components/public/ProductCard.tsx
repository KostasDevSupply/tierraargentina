'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const images = product.images || []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasMultipleImages = images.length > 1
  const availableSizes = product.sizes?.filter(s => s.in_stock).slice(0, 4) || []

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const currentImage = images[currentImageIndex]

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="block group"
    >
      <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Imagen con Carrusel */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Flechas */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                {currentImageIndex + 1}/{images.length}
              </div>
            </>
          )}

          {/* Badge destacado */}
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              ⭐ Destacado
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          {/* Categoría */}
          {product.category?.name && (
            <span className="inline-block text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded">
              {product.category.name}
            </span>
          )}

          {/* Título */}
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors min-h-[3rem]">
            {product.name}
          </h3>

          {/* Precio */}
          {product.price > 0 ? (
            <p className="text-xl font-bold text-pink-600">
              ${product.price.toLocaleString('es-AR')}
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-500">Consultar precio</p>
          )}

          {/* ✅ TALLES */}
          {hasSizes && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">Talles:</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    availableSizes.length > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {availableSizes.length > 0 
                      ? `${availableSizes.length} disponibles`
                      : 'Sin stock'
                    }
                  </span>
                </div>
              </div>

              {availableSizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {availableSizes.map((sizeObj) => (
                    <span
                      key={sizeObj.size}
                      className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 rounded-md border border-gray-300 shadow-sm"
                    >
                      {sizeObj.size}
                    </span>
                  ))}
                  {product.sizes && product.sizes.length > 4 && (
                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-md shadow-sm">
                      +{product.sizes.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}