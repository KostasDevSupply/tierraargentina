'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Save, Eye, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  announcement?: any
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  announcement,
}: AnnouncementModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    message: announcement?.message || '',
    background_color: announcement?.background_color || '#ec4899',
    text_color: announcement?.text_color || '#ffffff',
    link_url: announcement?.link_url || '',
    link_text: announcement?.link_text || '',
    is_active: announcement?.is_active ?? true,
    order_index: announcement?.order_index || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (announcement) {
        // Actualizar
        const { error } = await supabase
          .from('announcement_bar')
          .update(formData)
          .eq('id', announcement.id)

        if (error) throw error
        toast.success('Anuncio actualizado')
      } else {
        // Crear
        const { error } = await supabase
          .from('announcement_bar')
          .insert(formData)

        if (error) throw error
        toast.success('Anuncio creado')
      }

      router.refresh()
      onClose()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {announcement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vista previa */}
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Vista previa
  </label>
  <div
    style={{
      backgroundColor: formData.background_color,
      color: formData.text_color,
    }}
    className="px-6 py-4 rounded-lg shadow-sm transition-colors duration-300"
  >
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
      <p className="text-sm sm:text-base font-medium leading-relaxed">
        {formData.message || 'Tu mensaje aparecerá aquí'}
      </p>
      {formData.link_text && formData.link_url && (
        <span className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 border border-white/30 rounded-md text-sm font-semibold whitespace-nowrap backdrop-blur-sm">
          {formData.link_text}
          <ArrowRight className="w-4 h-4" />
        </span>
      )}
    </div>
  </div>
  <p className="text-xs text-gray-500 mt-2">
    💡 Desktop: horizontal | Mobile: vertical
  </p>
</div>
          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              disabled={loading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="🎉 ¡Envío gratis en compras mayores a $50.000!"
            />
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de fondo
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) =>
                    setFormData({ ...formData, background_color: e.target.value })
                  }
                  disabled={loading}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(e) =>
                    setFormData({ ...formData, background_color: e.target.value })
                  }
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de texto
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) =>
                    setFormData({ ...formData, text_color: e.target.value })
                  }
                  disabled={loading}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(e) =>
                    setFormData({ ...formData, text_color: e.target.value })
                  }
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Colores predefinidos */}
          {/* Colores predefinidos */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Paletas de colores
  </label>
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
    {[
      { bg: '#8b5cf6', text: '#ffffff', name: 'Lemon & Sea' },
      { bg: '#ec4899', text: '#ffffff', name: 'Rosa Pink' },
      { bg: '#3b82f6', text: '#ffffff', name: 'Azul Cielo' },
      { bg: '#10b981', text: '#ffffff', name: 'Verde Menta' },
      { bg: '#f59e0b', text: '#1f2937', name: 'Naranja Sol' },
      { bg: '#ef4444', text: '#ffffff', name: 'Rojo Fuego' },
      { bg: '#6366f1', text: '#ffffff', name: 'Índigo' },
      { bg: '#14b8a6', text: '#ffffff', name: 'Turquesa' },
      { bg: '#1f2937', text: '#ffffff', name: 'Gris Oscuro' },
      { bg: '#ffffff', text: '#1f2937', name: 'Blanco Clean' },
    ].map((preset) => (
      <button
        key={preset.name}
        type="button"
        onClick={() =>
          setFormData({
            ...formData,
            background_color: preset.bg,
            text_color: preset.text,
          })
        }
        className="group relative h-16 rounded-lg border-2 hover:border-gray-400 transition overflow-hidden"
        style={{ 
          backgroundColor: preset.bg,
          borderColor: formData.background_color === preset.bg ? '#3b82f6' : '#e5e7eb'
        }}
        title={preset.name}
      >
        <span 
          className="absolute inset-0 flex items-center justify-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: preset.text }}
        >
          {preset.name}
        </span>
      </button>
    ))}
  </div>
</div>

          {/* Botón opcional */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Botón (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto del botón
                </label>
                <input
                  type="text"
                  value={formData.link_text}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Ver productos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del botón
                </label>
                <input
                  type="text"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="/productos"
                />
              </div>
            </div>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden de aparición
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) =>
                setFormData({ ...formData, order_index: parseInt(e.target.value) })
              }
              disabled={loading}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número más bajo aparece primero (0 = primero)
            </p>
          </div>

          {/* Activo */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Mostrar en el sitio
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}