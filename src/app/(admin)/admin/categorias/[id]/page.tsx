import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CategoryForm from '../CategoryForm'

interface EditCategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // Obtener categoría
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !category) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Volver a categorías
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Editar Categoría
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm category={category} isEdit={true} />
      </div>
    </div>
  )
}