'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const images = product.images || []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasMultipleImages = images.length > 1
  const availableSizes = product.sizes?.filter((s) => s.in_stock).slice(0, 4) || []
  
  // ✅ Obtener colores
  const colors = product.colors || []
  const hasColors = colors.length > 0

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
    <Link href={`/productos/${product.slug}`} className="block group">
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
          {/* Tags: Categoría + Tipo */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.category?.name && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
                <Tag className="w-3 h-3" />
                {product.category.name}
              </span>
            )}
            {product.type?.name && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                {product.type.name}
              </span>
            )}
          </div>

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

          {/* ✅ Colores y Talles */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {/* Colores */}
            {hasColors && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">Colores:</span>
                  <span className="text-xs text-gray-600">
                    {colors.length} disponible{colors.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {colors.slice(0, 6).map((color: any) => {
                    const isHovered = hoveredColor === color.id
                    return (
                      <div key={color.id} className="relative">
                        {/* ✅ FIX: Prevenir navegación al hacer click en color */}
                        <div
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onMouseEnter={() => setHoveredColor(color.id)}
                          onMouseLeave={() => setHoveredColor(null)}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-300 hover:ring-gray-400 transition-transform hover:scale-110 cursor-default"
                          style={{ backgroundColor: color.hex_code }}
                        />
                        {isHovered && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 pointer-events-none">
                            {color.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[3px] border-transparent border-t-gray-900" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {colors.length > 6 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-md shadow-sm">
                      +{colors.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Talles */}
            {hasSizes && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
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
        </div>
      </article>
    </Link>
  )
}