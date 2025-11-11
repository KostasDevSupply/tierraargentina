'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import AnnouncementModal from './AnnouncementModal'

interface AnnouncementsListProps {
  announcements: any[]
}

export default function AnnouncementsList({ announcements }: AnnouncementsListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null)

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTogglingId(id)
    const loadingToast = toast.loading('Actualizando...')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcement_bar')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      toast.success(
        currentStatus ? 'Anuncio desactivado' : 'Anuncio activado',
        { id: loadingToast }
      )
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error('Error al actualizar', { id: loadingToast })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('¿Eliminar este anuncio?')
    if (!confirmed) return

    setDeletingId(id)
    const loadingToast = toast.loading('Eliminando...')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcement_bar')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Anuncio eliminado', { id: loadingToast })
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error al eliminar', { id: loadingToast })
    } finally {
      setDeletingId(null)
    }
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 mb-4">No hay anuncios creados</p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-200">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-6 hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      announcement.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {announcement.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {announcement.order_index > 0 && (
                    <span className="text-xs text-gray-500">
                      Orden: {announcement.order_index}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: announcement.background_color,
                    color: announcement.text_color,
                  }}
                  className="px-4 py-2 rounded-lg text-sm inline-block"
                >
                  {announcement.message}
                </div>

                {announcement.link_url && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {announcement.link_text || 'Ver más'}
                    </span>
                    <span>→</span>
                    <span className="truncate">{announcement.link_url}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(announcement.id, announcement.is_active)}
                  disabled={togglingId === announcement.id}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  title={announcement.is_active ? 'Desactivar' : 'Activar'}
                >
                  {announcement.is_active ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => setEditingAnnouncement(announcement)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <Pencil className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleDelete(announcement.id)}
                  disabled={deletingId === announcement.id}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingAnnouncement && (
        <AnnouncementModal
          isOpen={!!editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          announcement={editingAnnouncement}
        />
      )}
    </>
  )
}