import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AnnouncementForm from '../AnnouncementForm'

interface EditAnnouncementPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const { data: announcement, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !announcement) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/configuracion"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver a configuración
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Editar Anuncio
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <AnnouncementForm announcement={announcement} isEdit={true} />
      </div>
    </div>
  )
}