import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TypeForm from '../TypeForm'

export default async function NuevoTipoPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Nuevo Tipo
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <TypeForm />
      </div>
    </div>
  )
}