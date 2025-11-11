'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ToggleLeft, ToggleRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ToggleProductButtonProps {
  productId: string
  isActive: boolean
  isFeatured: boolean
}

export default function ToggleProductButton({
  productId,
  isActive: initialIsActive,
  isFeatured: initialIsFeatured,
}: ToggleProductButtonProps) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const newStatus = !isActive

      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', productId)

      if (error) throw error

      setIsActive(newStatus)
      toast.success(newStatus ? 'Producto activado' : 'Producto desactivado')
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error('Error al actualizar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const newStatus = !isFeatured

      const { error } = await supabase
        .from('products')
        .update({ is_featured: newStatus })
        .eq('id', productId)

      if (error) throw error

      setIsFeatured(newStatus)
      toast.success(newStatus ? 'Marcado como destacado' : 'Desmarcado como destacado')
      router.refresh()
    } catch (error) {
      console.error('Toggle featured error:', error)
      toast.error('Error al actualizar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleActive}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all disabled:opacity-50 ${
          isActive
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        title={isActive ? 'Click para desactivar' : 'Click para activar'}
      >
        {isActive ? (
          <>
            <ToggleRight className="w-3 h-3" />
            Activo
          </>
        ) : (
          <>
            <ToggleLeft className="w-3 h-3" />
            Inactivo
          </>
        )}
      </button>

      <button
        onClick={handleToggleFeatured}
        disabled={isLoading}
        className={`p-1 rounded transition-all disabled:opacity-50 ${
          isFeatured
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-gray-400 hover:text-gray-500'
        }`}
        title={isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
      >
        <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}