'use client'

import { useState } from 'react'

interface Color {
  id: string
  name: string
  hex_code: string
}

interface ColorChipsProps {
  colors: Color[]
  size?: 'sm' | 'md' | 'lg'
  maxVisible?: number
  className?: string
}

export default function ColorChips({ 
  colors, 
  size = 'sm',
  maxVisible = 5,
  className = '' 
}: ColorChipsProps) {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)

  if (!colors || colors.length === 0) return null

  const visibleColors = colors.slice(0, maxVisible)
  const remainingCount = colors.length - maxVisible

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleColors.map((color) => {
        const isHovered = hoveredColor === color.id

        return (
          <div key={color.id} className="relative">
            <div
              onMouseEnter={() => setHoveredColor(color.id)}
              onMouseLeave={() => setHoveredColor(null)}
              className={`
                ${sizeClasses[size]} 
                rounded-full border-2 border-white shadow-sm
                ring-1 ring-gray-300 hover:ring-gray-400
                transition-transform hover:scale-110 cursor-pointer
              `}
              style={{ backgroundColor: color.hex_code }}
            />

            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-20 pointer-events-none">
                {color.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[3px] border-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        )
      })}

      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 font-medium ml-0.5">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}