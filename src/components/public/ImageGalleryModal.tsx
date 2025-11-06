'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryModalProps {
  images: Array<{
    id: string
    url: string
    filename?: string
  }>
  initialIndex?: number
  onClose: () => void
}

export default function ImageGalleryModal({
  images,
  initialIndex = 0,
  onClose,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
        <p className="text-white font-medium">
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {/* Main content */}
      <div
        className="relative w-full h-full flex items-center justify-center px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Image */}
        <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
          <Image
            src={images[currentIndex].url}
            alt={`Imagen ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                index === currentIndex
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}