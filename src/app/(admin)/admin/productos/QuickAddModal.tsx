'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'category' | 'type'
  onSuccess: () => void
}

export default function QuickAddModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: QuickAddModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(type === 'category' ? '📦' : '')
  const [description, setDescription] = useState('')

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

      const table = type === 'category' ? 'categories' : 'types'
      const data: any = {
        name,
        slug,
        user_created: true,
        created_by: session.user.id,
      }

      if (type === 'category') {
        if (icon) data.icon = icon
        if (description.trim()) data.description = description.trim()
      }

      const { error } = await supabase.from(table).insert(data)

      if (error) throw error

      toast.success(
        type === 'category' ? 'Categoría creada' : 'Tipo creado'
      )
      
      // Limpiar formulario
      setName('')
      setIcon(type === 'category' ? '📦' : '')
      setDescription('')
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al crear')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {type === 'category' ? 'Nueva Categoría' : 'Nuevo Tipo'}
          </h3>
          <button
            onClick={onClose}
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
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder={type === 'category' ? 'Ej: Conjuntos, Ponchos' : 'Ej: Dama, Caballero'}
            />
          </div>

          {/* Icono - Solo para categorías */}
          {type === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icono (Emoji)
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-2xl text-center"
                placeholder="👚"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Escribe o pega un emoji
              </p>
            </div>
          )}

          {/* Descripción - Solo para categorías */}
          {type === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={200}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
                placeholder="Ej: Bombachas de gabardina para toda la familia"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/200 caracteres
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
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