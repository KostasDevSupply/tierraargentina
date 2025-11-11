import { Plus } from 'lucide-react'
import { getAllAnnouncements, getAnnouncementsCount } from '@/lib/services/settings.service'
import AnnouncementsList from './AnnouncementsList'
import NewAnnouncementButton from './NewAnnouncementButton'

export default async function ConfiguracionPage() {
  const { data: announcements } = await getAllAnnouncements()
  const { count } = await getAnnouncementsCount()

  const canAddMore = count < 5

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Anuncios del Sitio
          </h1>
          <p className="text-gray-600">
            Gestiona hasta 5 anuncios que aparecen en la parte superior del sitio
          </p>
        </div>

        {canAddMore ? (
          <NewAnnouncementButton />
        ) : (
          <div className="text-sm text-gray-500">
            Máximo 5 anuncios alcanzado
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{count}/5</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Activos</p>
          <p className="text-2xl font-bold text-green-600">
            {announcements?.filter((a) => a.is_active).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Inactivos</p>
          <p className="text-2xl font-bold text-gray-400">
            {announcements?.filter((a) => !a.is_active).length || 0}
          </p>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <AnnouncementsList announcements={announcements || []} />
      </div>
    </div>
  )
}