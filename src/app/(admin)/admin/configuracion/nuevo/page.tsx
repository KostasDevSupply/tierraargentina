import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnnouncementForm from '../AnnouncementForm'

export default async function NuevoAnuncioPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // Verificar límite
  const { count } = await supabase
    .from('announcement_bar')
    .select('*', { count: 'exact', head: true })

  if (count && count >= 5) {
    redirect('/admin/configuracion')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nuevo Anuncio
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <AnnouncementForm />
      </div>
    </div>
  )
}