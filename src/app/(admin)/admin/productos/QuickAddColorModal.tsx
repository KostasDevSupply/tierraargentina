'use client'

import { useState } from 'react'
import { X, Save, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface QuickAddColorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (createdId?: string) => void
}

const PRESET_COLORS = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Rojo', hex: '#FF0000' },
  { name: 'Azul', hex: '#0000FF' },
  { name: 'Verde', hex: '#00FF00' },
  { name: 'Amarillo', hex: '#FFFF00' },
  { name: 'Rosa', hex: '#FFC0CB' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Marrón', hex: '#8B4513' },
  { name: 'Naranja', hex: '#FFA500' },
  { name: 'Violeta', hex: '#8B00FF' },
  { name: 'Turquesa', hex: '#40E0D0' },
]

export default function QuickAddColorModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickAddColorModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [hexCode, setHexCode] = useState('#000000')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) throw new Error('No hay sesión activa')

      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      const { data: created, error } = await supabase
        .from('colors')
        .insert({
          name,
          hex_code: hexCode,
          slug,
          user_created: true,
          created_by: session.user.id,
        })
        .select('id')
        .single()

      if (error) throw error

      toast.success('Color creado')
      
      setName('')
      setHexCode('#000000')
      
      onSuccess(created?.id)
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al crear color')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setHexCode('#000000')
      onClose()
    }
  }

  const handlePresetClick = (preset: typeof PRESET_COLORS[0]) => {
    setName(preset.name)
    setHexCode(preset.hex)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Nuevo Color</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del color *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Ej: Azul marino, Rojo pasión"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selector de color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={hexCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase()
                  if (/^#[0-9A-F]{0,6}$/.test(value)) {
                    setHexCode(value)
                  }
                }}
                maxLength={7}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 font-mono"
                placeholder="#000000"
              />
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-inner"
                style={{ backgroundColor: hexCode }}
                title={hexCode}
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colores predefinidos (click para seleccionar)
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  disabled={loading}
                  className="group relative aspect-square rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all disabled:opacity-50 overflow-hidden"
                  title={preset.name}
                >
                  <div 
                    className="w-full h-full"
                    style={{ backgroundColor: preset.hex }}
                  />
                  {hexCode === preset.hex && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-3 h-3 bg-white rounded-full border-2 border-gray-800" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-md"
                style={{ backgroundColor: hexCode }}
              />
              <div>
                <p className="font-medium text-gray-900">{name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500 font-mono">{hexCode}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creando...' : 'Crear'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}