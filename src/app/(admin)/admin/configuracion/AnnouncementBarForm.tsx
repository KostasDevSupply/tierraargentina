'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface AnnouncementBarFormProps {
  announcement?: any
}

export default function AnnouncementBarForm({ announcement }: AnnouncementBarFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    message: announcement?.message || '',
    is_active: announcement?.is_active ?? true,
    background_color: announcement?.background_color || '#ec4899',
    text_color: announcement?.text_color || '#ffffff',
    link_url: announcement?.link_url || '',
    link_text: announcement?.link_text || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      if (announcement) {
        // Actualizar existente
        const { error } = await supabase
          .from('announcement_bar')
          .update(formData)
          .eq('id', announcement.id)

        if (error) throw error
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('announcement_bar')
          .insert(formData)

        if (error) throw error
      }

      toast.success('Anuncio actualizado correctamente')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vista previa
        </label>
        <div
          style={{
            backgroundColor: formData.background_color,
            color: formData.text_color,
          }}
          className="px-4 py-3 rounded-lg text-center text-sm"
        >
          {formData.message || 'Tu mensaje aparecerá aquí'}
          {formData.link_text && formData.link_url && (
            <span className="ml-2 underline font-semibold">
              {formData.link_text}
            </span>
          )}
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mensaje *
        </label>
        <input
          type="text"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          disabled={loading}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Link (opcional) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del enlace (opcional)
          </label>
          <input
            type="url"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            placeholder="/productos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto del enlace (opcional)
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
      </div>

      {/* Toggle activo */}
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
          <span className="text-sm text-gray-700 font-medium">
            {formData.is_active ? (
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Mostrar en el sitio
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                Ocultar del sitio
              </span>
            )}
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </form>
  )
}