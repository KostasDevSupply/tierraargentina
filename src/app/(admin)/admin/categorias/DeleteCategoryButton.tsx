'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const loadingToast = toast.loading('Eliminando categoría...')

    try {
      const supabase = createClient()

      // Verificar si hay productos usando esta categoría
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1)

      if (checkError) throw checkError

      if (products && products.length > 0) {
        toast.error(
          'No se puede eliminar: hay productos usando esta categoría',
          { id: loadingToast }
        )
        setShowModal(false)
        setIsDeleting(false)
        return
      }

      // Eliminar categoría
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      toast.success('Categoría eliminada correctamente', { id: loadingToast })
      setShowModal(false)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error al eliminar categoría', { id: loadingToast })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-900"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ¿Eliminar categoría?
                </h3>
                <p className="text-gray-600">
                  Estás a punto de eliminar la categoría{' '}
                  <strong>"{categoryName}"</strong>. Esta acción no se puede
                  deshacer.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}