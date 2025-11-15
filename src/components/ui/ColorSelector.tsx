'use client'

import { useState } from 'react'
import { Palette, Plus, X, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Color {
  id: string
  name: string
  hex_code: string
}

interface ColorSelectorProps {
  colors: Color[]
  selectedColorIds: string[]
  onChange: (colorIds: string[]) => void
  onAddNew: () => void
  disabled?: boolean
}

export default function ColorSelector({
  colors,
  selectedColorIds,
  onChange,
  onAddNew,
  disabled = false
}: ColorSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleToggleColor = (colorId: string) => {
    if (disabled) return
    
    const isSelected = selectedColorIds.includes(colorId)
    
    if (isSelected) {
      // Remover
      const newIds = selectedColorIds.filter(id => id !== colorId)
      onChange(newIds)
      console.log('Color removido:', colorId, 'Nuevos IDs:', newIds)
    } else {
      // Agregar
      const newIds = [...selectedColorIds, colorId]
      onChange(newIds)
      console.log('Color agregado:', colorId, 'Nuevos IDs:', newIds)
    }
  }

  const handleRemove = (colorId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    
    const newIds = selectedColorIds.filter(id => id !== colorId)
    onChange(newIds)
  }

  const selectedColors = colors.filter(c => selectedColorIds.includes(c.id))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-500" />
          Colores
        </label>
        <div className="flex gap-2">
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
                Seleccionar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Colores Disponibles</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOpen(false)
                      onAddNew()
                    }}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Nuevo Color
                  </Button>
                </div>

                {colors.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                    {colors.map((color) => {
                      const isSelected = selectedColorIds.includes(color.id)
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => handleToggleColor(color.id)}
                          className="group relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                          title={color.name}
                        >
                          <div 
                            className={`
                              w-full aspect-square rounded-lg border-2 transition-all
                              ${isSelected 
                                ? 'border-blue-600 scale-105 shadow-lg ring-2 ring-blue-200' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                              }
                            `}
                            style={{ backgroundColor: color.hex_code }}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {color.name}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Palette className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">No hay colores disponibles</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOpen(false)
                        onAddNew()
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Crear Primer Color
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Selected Colors */}
      {selectedColors.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedColors.map((color) => (
            <Badge
              key={color.id}
              variant="secondary"
              className="pl-2 pr-1.5 py-1 text-xs font-medium flex items-center gap-1.5"
            >
              <div 
                className="w-3 h-3 rounded-sm border border-gray-300"
                style={{ backgroundColor: color.hex_code }}
              />
              {color.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(color.id, e)}
                  className="ml-0.5 hover:bg-gray-300 rounded-sm p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic py-2">
          No hay colores seleccionados
        </p>
      )}
    </div>
  )
}