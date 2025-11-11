'use client'

import { useState, useEffect, useRef } from 'react'
import { DollarSign } from 'lucide-react'

interface PriceRangeSliderProps {
  minPrice: number
  maxPrice: number
  currentMin?: number
  currentMax?: number
  onChange: (min: number, max: number) => void
}

export default function PriceRangeSlider({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onChange
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(currentMin || minPrice)
  const [localMax, setLocalMax] = useState(currentMax || maxPrice)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setLocalMin(currentMin || minPrice)
    setLocalMax(currentMax || maxPrice)
  }, [currentMin, currentMax, minPrice, maxPrice])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - 1000)
    setLocalMin(newMin)
    setIsDragging(true)
  }

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + 1000)
    setLocalMax(newMax)
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (isDragging) {
      onChange(localMin, localMax)
      setIsDragging(false)
    }
  }

  const minPercent = ((localMin - minPrice) / (maxPrice - minPrice)) * 100
  const maxPercent = ((localMax - minPrice) / (maxPrice - minPrice)) * 100

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <DollarSign className="w-4 h-4 text-green-600" />
        Rango de precio
      </label>

      {/* Inputs de precio */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => handleMinChange(parseInt(e.target.value) || minPrice)}
            onBlur={handleMouseUp}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 font-medium"
          />
        </div>
        <div className="relative">
          <label className="block text-xs text-gray-600 mb-1">Máximo</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => handleMaxChange(parseInt(e.target.value) || maxPrice)}
            onBlur={handleMouseUp}
            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 font-medium"
          />
        </div>
      </div>

      {/* Slider de rango */}
      <div className="relative pt-2 pb-6">
        {/* Barra de fondo */}
        <div className="absolute w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />
        
        {/* Barra activa */}
        <div 
          className="absolute h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full top-1/2 -translate-y-1/2"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        />

        {/* Slider mínimo */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={500}
          value={localMin}
          onChange={(e) => handleMinChange(parseInt(e.target.value))}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
        />

        {/* Slider máximo */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={500}
          value={localMax}
          onChange={(e) => handleMaxChange(parseInt(e.target.value))}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
        />

        {/* Labels de valores */}
        <div className="absolute w-full flex justify-between text-xs text-gray-600 mt-8">
          <span className="font-medium">{formatPrice(localMin)}</span>
          <span className="font-medium">{formatPrice(localMax)}</span>
        </div>
      </div>

      {/* Rangos rápidos */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setLocalMin(minPrice)
            setLocalMax(20000)
            onChange(minPrice, 20000)
          }}
          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
        >
          Hasta $20K
        </button>
        <button
          onClick={() => {
            setLocalMin(20000)
            setLocalMax(50000)
            onChange(20000, 50000)
          }}
          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
        >
          $20K - $50K
        </button>
        <button
          onClick={() => {
            setLocalMin(50000)
            setLocalMax(maxPrice)
            onChange(50000, maxPrice)
          }}
          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
        >
          Más de $50K
        </button>
        <button
          onClick={() => {
            setLocalMin(minPrice)
            setLocalMax(maxPrice)
            onChange(minPrice, maxPrice)
          }}
          className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
        >
          Todos
        </button>
      </div>
    </div>
  )
}