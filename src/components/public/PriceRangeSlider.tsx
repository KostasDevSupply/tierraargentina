'use client'

import { useState, useEffect } from 'react'
import { DollarSign, ChevronDown } from 'lucide-react'

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
  const [showQuickOptions, setShowQuickOptions] = useState(false)
  const [inputMin, setInputMin] = useState('')
  const [inputMax, setInputMax] = useState('')

  useEffect(() => {
    setLocalMin(currentMin || minPrice)
    setLocalMax(currentMax || maxPrice)
    setInputMin(currentMin ? currentMin.toString() : '')
    setInputMax(currentMax ? currentMax.toString() : '')
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
    const newMin = Math.max(minPrice, Math.min(value, localMax - 1000))
    setLocalMin(newMin)
  }

  const handleMaxChange = (value: number) => {
    const newMax = Math.min(maxPrice, Math.max(value, localMin + 1000))
    setLocalMax(newMax)
  }

  const handleInputMinChange = (value: string) => {
    setInputMin(value)
    if (value === '') {
      setLocalMin(minPrice)
    } else {
      const numValue = parseInt(value.replace(/\D/g, ''))
      if (!isNaN(numValue)) {
        handleMinChange(numValue)
      }
    }
  }

  const handleInputMaxChange = (value: string) => {
    setInputMax(value)
    if (value === '') {
      setLocalMax(maxPrice)
    } else {
      const numValue = parseInt(value.replace(/\D/g, ''))
      if (!isNaN(numValue)) {
        handleMaxChange(numValue)
      }
    }
  }

  const handleApply = () => {
    onChange(localMin, localMax)
  }

  const handleQuickOption = (min: number, max: number) => {
    setLocalMin(min)
    setLocalMax(max)
    setInputMin(min === minPrice ? '' : min.toString())
    setInputMax(max === maxPrice ? '' : max.toString())
    onChange(min, max)
    setShowQuickOptions(false)
  }

  const minPercent = ((localMin - minPrice) / (maxPrice - minPrice)) * 100
  const maxPercent = ((localMax - minPrice) / (maxPrice - minPrice)) * 100

  const quickOptions = [
    { label: 'Hasta $20.000', min: minPrice, max: 20000 },
    { label: '$20K - $50K', min: 20000, max: 50000 },
    { label: '$50K - $100K', min: 50000, max: 100000 },
    { label: 'Más de $100K', min: 100000, max: maxPrice },
  ]

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <DollarSign className="w-4 h-4 text-green-600" />
        Rango de precio
      </label>

      {/* Inputs de precio personalizados */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1.5 font-medium">Mínimo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="text"
              placeholder="0"
              value={inputMin}
              onChange={(e) => handleInputMinChange(e.target.value)}
              onBlur={handleApply}
              className="w-full pl-7 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 font-medium hover:border-green-300"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1.5 font-medium">Máximo</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="text"
              placeholder={maxPrice.toString()}
              value={inputMax}
              onChange={(e) => handleInputMaxChange(e.target.value)}
              onBlur={handleApply}
              className="w-full pl-7 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-900 font-medium hover:border-green-300"
            />
          </div>
        </div>
      </div>

      {/* Slider de rango dual */}
      <div className="relative pt-2 pb-8">
        {/* Barra de fondo */}
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />
        
        {/* Barra activa con gradiente */}
        <div 
          className="absolute h-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full top-1/2 -translate-y-1/2 transition-all"
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
          step={1000}
          value={localMin}
          onChange={(e) => handleMinChange(parseInt(e.target.value))}
          onMouseUp={handleApply}
          onTouchEnd={handleApply}
          className="absolute w-full appearance-none bg-transparent pointer-events-none z-10
            [&::-webkit-slider-thumb]:pointer-events-auto 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:border-[3px] 
            [&::-webkit-slider-thumb]:border-green-600 
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:shadow-lg 
            [&::-webkit-slider-thumb]:hover:scale-110 
            [&::-webkit-slider-thumb]:active:scale-105
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:pointer-events-auto 
            [&::-moz-range-thumb]:w-5 
            [&::-moz-range-thumb]:h-5 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:border-[3px] 
            [&::-moz-range-thumb]:border-green-600 
            [&::-moz-range-thumb]:cursor-grab
            [&::-moz-range-thumb]:shadow-lg"
        />

        {/* Slider máximo */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={1000}
          value={localMax}
          onChange={(e) => handleMaxChange(parseInt(e.target.value))}
          onMouseUp={handleApply}
          onTouchEnd={handleApply}
          className="absolute w-full appearance-none bg-transparent pointer-events-none z-10
            [&::-webkit-slider-thumb]:pointer-events-auto 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:border-[3px] 
            [&::-webkit-slider-thumb]:border-green-600 
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:shadow-lg 
            [&::-webkit-slider-thumb]:hover:scale-110 
            [&::-webkit-slider-thumb]:active:scale-105
            [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:pointer-events-auto 
            [&::-moz-range-thumb]:w-5 
            [&::-moz-range-thumb]:h-5 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:border-[3px] 
            [&::-moz-range-thumb]:border-green-600 
            [&::-moz-range-thumb]:cursor-grab
            [&::-moz-range-thumb]:shadow-lg"
        />

        {/* Labels de valores actuales */}
        <div className="absolute w-full flex justify-between mt-6 text-xs font-semibold text-gray-700">
          <span className="bg-green-50 px-2 py-1 rounded-lg">{formatPrice(localMin)}</span>
          <span className="bg-green-50 px-2 py-1 rounded-lg">{formatPrice(localMax)}</span>
        </div>
      </div>

      {/* Dropdown de opciones rápidas */}
      <div className="relative">
        <button
          onClick={() => setShowQuickOptions(!showQuickOptions)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition text-sm font-medium text-gray-700"
        >
          <span>Rangos rápidos</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showQuickOptions ? 'rotate-180' : ''}`} />
        </button>

        {showQuickOptions && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowQuickOptions(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
              {quickOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickOption(option.min, option.max)}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition border-b border-gray-100 last:border-0"
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => handleQuickOption(minPrice, maxPrice)}
                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Ver todos los precios
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}