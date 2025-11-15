'use client'

import { useState } from 'react'
import { Ruler, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SizeSelectorProps {
  selectedSizes: string[]
  onChange: (sizes: string[]) => void
  disabled?: boolean
}

const COMMON_SIZES = [
  { category: 'Letras', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
  { category: 'Números', sizes: ['1', '2', '3', '4', '5', '6'] },
  { category: 'Medidas', sizes: ['85', '90', '95', '100', '105', '110'] },
]

export default function SizeSelector({ selectedSizes, onChange, disabled }: SizeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [customSize, setCustomSize] = useState('')

  const handleToggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter(s => s !== size))
    } else {
      onChange([...selectedSizes, size])
    }
  }

  const handleAddCustom = () => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      onChange([...selectedSizes, customSize.trim().toUpperCase()])
      setCustomSize('')
    }
  }

  const handleRemove = (size: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedSizes.filter(s => s !== size))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Ruler className="w-4 h-4 text-gray-500" />
          Talles
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              disabled={disabled}
              className="h-8 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Agregar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Talles Comunes</h4>
                <div className="space-y-3">
                  {COMMON_SIZES.map((group) => (
                    <div key={group.category}>
                      <p className="text-xs text-gray-500 mb-2">{group.category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.sizes.map((size) => {
                          const isSelected = selectedSizes.includes(size)
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleToggleSize(size)}
                              className={`
                                px-2.5 py-1 text-xs font-medium rounded-md transition-all
                                ${isSelected 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
                              `}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Talle Personalizado</p>
                <div className="flex gap-2">
                  <Input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
                    placeholder="Ej: 42, XL+"
                    className="text-sm h-9"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddCustom}
                    disabled={!customSize.trim()}
                    size="sm"
                    className="h-9"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Sizes */}
      {selectedSizes.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedSizes.map((size) => (
            <Badge
              key={size}
              variant="secondary"
              className="pl-2.5 pr-1.5 py-1 text-xs font-medium"
            >
              {size}
              <button
                type="button"
                onClick={(e) => handleRemove(size, e)}
                disabled={disabled}
                className="ml-1.5 hover:bg-gray-300 rounded-sm p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic py-2">
          No hay talles seleccionados
        </p>
      )}
    </div>
  )
}