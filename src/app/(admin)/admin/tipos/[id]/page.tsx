import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TypeForm from '../TypeForm'

interface EditTypePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditTypePage({ params }: EditTypePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const { data: type, error } = await supabase
    .from('types')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !type) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/tipos"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver a tipos
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Editar Tipo
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <TypeForm type={type} isEdit={true} />
      </div>
    </div>
  )
}