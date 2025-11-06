// components/public/ProductDetailClient.tsx
'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Share2, CheckCircle, Eye } from 'lucide-react'
import ImageGalleryModal from './ImageGalleryModal'
import AddToCartButton from './AddToCartbutton'
import { useCartStore } from '@/lib/stores/cartStore'

interface ProductDetailClientProps {
  product: any
  sortedImages: any[]
  sortedSizes: any[]
}

export default function ProductDetailClient({
  product,
  sortedImages,
  sortedSizes,
}: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)
  
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  const whatsappMessage = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.href : ''
    return encodeURIComponent(
      `Hola! Me interesa el producto: ${product.name}${
        selectedSize ? ` - Talle: ${selectedSize}` : ''
      }\nVer en: ${baseUrl}`
    )
  }, [product.name, selectedSize])

  const openGallery = useCallback((index: number) => {
    setGalleryStartIndex(index)
    setShowGallery(true)
  }, [])

  const closeGallery = useCallback(() => {
    setShowGallery(false)
  }, [])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.name,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles!')
    }
  }, [product.name, product.short_description])

  const handleAddToCart = useCallback(() => {
    const primaryImage = sortedImages[0]?.url || null
    
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: primaryImage,
      category: product.category?.name,
    })
    
    setTimeout(() => openCart(), 500)
  }, [product, selectedSize, sortedImages, addItem, openCart])

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Galería de imágenes */}
        <div className="space-y-4">
          <div
            className="aspect-square bg-white rounded-2xl overflow-hidden border-2 border-gray-200 cursor-pointer group relative"
            onClick={() => openGallery(0)}
          >
            {sortedImages.length > 0 ? (
              <>
                <Image
                  src={sortedImages[0].url}
                  alt={product.name}
                  width={800}
                  height={800}
                  className="w-full h-full object-cover transition group-hover:scale-105"
                  priority
                  quality={90}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-lg">Sin imagen</span>
              </div>
            )}
          </div>

          {sortedImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {sortedImages.slice(1, 4).map((image, index) => (
                <div
                  key={image.id}
                  className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-pink-600 cursor-pointer transition group relative"
                  onClick={() => openGallery(index + 1)}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - imagen ${index + 2}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover transition group-hover:scale-110"
                    loading="lazy"
                    quality={75}
                  />
                </div>
              ))}
              
              {sortedImages.length > 4 && (
                <button
                  onClick={() => openGallery(0)}
                  className="aspect-square bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg border-2 border-pink-600 hover:from-pink-700 hover:to-rose-700 transition flex flex-col items-center justify-center text-white"
                >
                  <Eye className="w-6 h-6 mb-1" />
                  <span className="text-sm font-semibold">Ver más</span>
                  <span className="text-xs">+{sortedImages.length - 4}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="space-y-6">
          {product.category && (
            <Link
              href={`/categorias/${product.category.slug}`}
              className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              <span className="text-lg">{product.category.icon}</span>
              {product.category.name}
            </Link>
          )}

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            {product.type && (
              <p className="text-lg text-gray-600">{product.type.name}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200">
            {product.price > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-1">Precio</p>
                <p className="text-5xl font-bold text-pink-600">
                  ${product.price.toLocaleString('es-AR')}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  Precio a consultar
                </p>
                <p className="text-sm text-gray-600">
                  Contactanos para conocer el precio actualizado
                </p>
              </div>
            )}
          </div>

          {product.short_description && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                {product.short_description}
              </p>
            </div>
          )}

          {sortedSizes.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">
                Talles disponibles{' '}
                {selectedSize && (
                  <span className="text-pink-600">
                    - Seleccionado: {selectedSize}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {sortedSizes.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      selectedSize === size.size
                        ? 'bg-pink-600 text-white border-2 border-pink-600 scale-105 shadow-lg'
                        : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-pink-600'
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.notes && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> {product.notes}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Calidad premium garantizada</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Consultas por WhatsApp</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Atención personalizada</span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t-2 border-gray-200">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: sortedImages[0]?.url,
                category: product.category?.name,
              }}
              selectedSize={selectedSize}
              disabled={sortedSizes.length > 0 && !selectedSize}
              onAddToCart={handleAddToCart}
            />
            
            {sortedSizes.length > 0 && !selectedSize && (
              <p className="text-sm text-amber-600 text-center">
                ⚠️ Por favor seleccioná un talle
              </p>
            )}

            <a
              href={`https://wa.me/+5491156308907?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
            >
              Consultar por WhatsApp
              {selectedSize && (
                <span className="text-sm font-normal">({selectedSize})</span>
              )}
            </a>

            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition"
              >
                <Share2 className="w-5 h-5" />
                Compartir
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition">
                <Heart className="w-5 h-5" />
                Favoritos
              </button>
            </div>
          </div>
        </div>
      </div>

      {showGallery && (
        <ImageGalleryModal
          images={sortedImages}
          initialIndex={galleryStartIndex}
          onClose={closeGallery}
        />
      )}
    </>
  )
}