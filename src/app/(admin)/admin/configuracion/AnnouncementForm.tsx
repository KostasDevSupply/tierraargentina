'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface AnnouncementFormProps {
  announcement?: any
  isEdit?: boolean
}

export default function AnnouncementForm({ announcement, isEdit = false }: AnnouncementFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    message: announcement?.message || '',
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

      if (isEdit && announcement) {
        const { error } = await supabase
          .from('announcement_bar')
          .update(formData)
          .eq('id', announcement.id)

        if (error) throw error
        toast.success('Anuncio actualizado')
      } else {
        const { error } = await supabase
          .from('announcement_bar')
          .insert(formData)

        if (error) throw error
        toast.success('Anuncio creado')
      }

      router.push('/admin/configuracion')
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
      {/* Mensaje */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mensaje del Anuncio *
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
        <p className="text-xs text-gray-500 mt-2">
          Si completas estos campos, se mostrará un botón en el anuncio
        </p>
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
          <span className="text-sm text-gray-700">Mostrar en el sitio</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}</span>
        </button>
      </div>
    </form>
  )
}