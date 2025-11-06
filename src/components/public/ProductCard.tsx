// components/public/ProductCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Eye, ShoppingCart, Heart } from 'lucide-react'
import { memo, useState } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    short_description?: string
    category?: {
      name: string
      slug: string
    }
    images?: Array<{
      url: string
      is_primary: boolean
    }>
  }
}

function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const images = product.images || []
  const currentImage = images[currentImageIndex] || images[0]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: null,
      image: currentImage?.url || null,
      category: product.category?.name,
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1500)
  }

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImageIndex(1)
    }
  }

  const handleMouseLeave = () => {
    setCurrentImageIndex(0)
  }

  return (
    <article className="group relative">
      <Link href={`/productos/${product.slug}`} className="block">
        <div 
          className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-pink-600 transition-all hover:shadow-2xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Imagen */}
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {currentImage ? (
              <>
                <Image
                  src={currentImage.url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  quality={85}
                />
                
                {/* Indicadores de imágenes */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                    {images.slice(0, 3).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? 'w-6 bg-pink-600'
                            : 'w-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Overlay con acciones rápidas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={handleAddToCart}
                      className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transition-all ${
                        showSuccess
                          ? 'bg-green-500 text-white scale-110'
                          : 'bg-white/90 hover:bg-pink-600 hover:text-white'
                      }`}
                      title="Agregar al carrito"
                    >
                      {showSuccess ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      className="w-10 h-10 bg-white/90 hover:bg-pink-600 hover:text-white rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg transition-all"
                      title="Agregar a favoritos"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Eye className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Badge de categoría */}
            {product.category && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  {product.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition text-lg">
              {product.name}
            </h3>

            {product.short_description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                {product.short_description}
              </p>
            )}

            <div className="flex items-center justify-between mt-4">
              <div>
                {product.price > 0 ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Precio</p>
                    <p className="text-2xl font-bold text-pink-600">
                      ${product.price.toLocaleString('es-AR')}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-gray-600">Consultar</p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md ${
                  showSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-600 hover:bg-pink-700 text-white hover:scale-105'
                }`}
              >
                {showSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">¡Agregado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Agregar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default memo(ProductCard, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id
})