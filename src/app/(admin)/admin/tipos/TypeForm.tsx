'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface TypeFormProps {
  type?: any
  isEdit?: boolean
}

export default function TypeForm({ type, isEdit = false }: TypeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: type?.name || '',
    slug: type?.slug || '',
    order_index: type?.order_index || 0,
    is_active: type?.is_active ?? true,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No hay sesión activa')
      }

      if (isEdit && type) {
        const { error } = await supabase
          .from('types')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', type.id)

        if (error) throw error
        toast.success('Tipo actualizado')
      } else {
        const { error } = await supabase.from('types').insert({
          ...formData,
          user_created: true,
          created_by: session.user.id,
        })

        if (error) throw error
        toast.success('Tipo creado')
      }

      router.push('/admin/tipos')
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          placeholder="Ej: Dama, Caballero, Niño"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug (URL)
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-50"
          placeholder="dama"
        />
        <p className="text-xs text-gray-500 mt-1">Se genera automáticamente</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Orden
        </label>
        <input
          type="number"
          value={formData.order_index}
          onChange={(e) =>
            setFormData({ ...formData, order_index: parseInt(e.target.value) })
          }
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

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
          <span className="text-sm text-gray-700">Tipo activo</span>
        </label>
      </div>

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