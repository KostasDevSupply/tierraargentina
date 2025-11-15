'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PriceInputProps {
  label?: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  placeholder?: string
}

export default function PriceInput({ 
  label = 'Precio', 
  value, 
  onChange, 
  disabled = false,
  placeholder = '0'
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Formatear número con separadores de miles
  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return ''
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Parsear string a número
  const parseNumber = (str: string): number => {
    if (!str) return 0
    // Remover puntos y reemplazar coma por punto
    const cleaned = str.replace(/\./g, '').replace(/,/g, '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  // Sincronizar con prop value
  useEffect(() => {
    setDisplayValue(formatNumber(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    // Permitir vacío, números, puntos y comas
    if (input && !/^[\d.,]*$/.test(input)) return
    
    // Actualizar display
    setDisplayValue(input)
    
    // Parsear y enviar valor numérico
    const numericValue = parseNumber(input)
    onChange(numericValue)
  }

  const handleBlur = () => {
    // Al perder foco, formatear el valor
    setDisplayValue(formatNumber(value))
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="price">{label}</Label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
          $
        </span>
        <Input
          id="price"
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-7 font-mono"
        />
      </div>
      {value > 0 && (
        <p className="text-xs text-gray-500">
          Valor: ${formatNumber(value)}
        </p>
      )}
    </div>
  )
}