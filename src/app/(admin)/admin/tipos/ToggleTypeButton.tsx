'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ToggleTypeButtonProps {
  typeId: string
  isActive: boolean
}

export default function ToggleTypeButton({
  typeId,
  isActive: initialIsActive,
}: ToggleTypeButtonProps) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    const loadingToast = toast.loading('Actualizando...')

    try {
      const supabase = createClient()
      const newStatus = !isActive

      const { error } = await supabase
        .from('types')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', typeId)

      if (error) throw error

      setIsActive(newStatus)
      toast.success(newStatus ? 'Tipo activado' : 'Tipo desactivado', {
        id: loadingToast,
      })
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error('Error al actualizar', { id: loadingToast })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
        isActive
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}
      title={isActive ? 'Click para desactivar' : 'Click para activar'}
    >
      {isActive ? (
        <>
          <ToggleRight className="w-4 h-4" />
          <span>Activo</span>
        </>
      ) : (
        <>
          <ToggleLeft className="w-4 h-4" />
          <span>Inactivo</span>
        </>
      )}
    </button>
  )
}