'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Announcement {
  id: string
  message: string
  background_color: string
  text_color: string
  link_url?: string | null
  link_text?: string | null
}

interface AnnouncementBarClientProps {
  announcements: Announcement[]
}

export default function AnnouncementBarClient({ announcements }: AnnouncementBarClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
    const dismissed = localStorage.getItem('announcements_dismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  // Auto-rotate cada 5 segundos
  useEffect(() => {
    if (announcements.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [announcements.length, currentIndex])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('announcements_dismissed', 'true')
  }

  const handleNext = () => {
    if (isAnimating) return
    setDirection('right')
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
      setIsAnimating(false)
    }, 300)
  }

  const handlePrev = () => {
    if (isAnimating) return
    setDirection('left')
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
      setIsAnimating(false)
    }, 300)
  }

  if (!mounted || !isVisible) return null

  const current = announcements[currentIndex]

  return (
    <div
      className="relative pb-5 py-4 px-4 sm:px-6 transition-colors duration-500 overflow-hidden"
      style={{
        backgroundColor: current.background_color,
        color: current.text_color,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Container centrado con flechas */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Contenido con animación */}
          <div className="flex-1 max-w-4xl">
            <div
              key={currentIndex}
              className={`
                flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left
                ${isAnimating ? 'announcement-slide-out' : 'announcement-slide-in'}
              `}
            >
              {/* Mensaje */}
              <p className="text-sm sm:text-base font-medium leading-relaxed">
                {current.message}
              </p>

              {/* Botón */}
              {current.link_url && current.link_text && (
                <Link
                  href={current.link_url}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-md text-sm font-semibold transition-all hover:scale-105 hover:border-white/50 whitespace-nowrap backdrop-blur-sm"
                >
                  {current.link_text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Flecha Derecha */}
          
        </div>
      </div>

      {/* Botón cerrar */}
      {/* <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition z-10"
        aria-label="Cerrar anuncios"
      >
        <X className="w-4 h-4" />
      </button> */}

      {/* Indicadores de página (opcionales - comenta si no los quieres) */}
      {announcements.length > 1 && (
        <div className="absolute bottom-1 left-1/2 mb-1 -translate-x-1/2 flex gap-1.5">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isAnimating) return
                setDirection(index > currentIndex ? 'right' : 'left')
                setIsAnimating(true)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setIsAnimating(false)
                }, 300)
              }}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60 w-1'
              }`}
              aria-label={`Ir al anuncio ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}