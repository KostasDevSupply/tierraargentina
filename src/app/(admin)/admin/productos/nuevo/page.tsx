import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function NuevoProductoPage() {
  const supabase = await createClient()

  // Obtener categorías y tipos para los selects
  const [
    { data: categories },
    { data: types }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('order_index'),
    supabase.from('types').select('*').order('order_index')
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        <p className="text-gray-600 mt-1">
          Completa la información del producto
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm
          categories={categories || []}
          types={types || []}
        />
      </div>
    </div>
  )
}