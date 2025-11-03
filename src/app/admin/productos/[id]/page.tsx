import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // ⚠️ IMPORTANTE: await params en Next.js 15
  const { id } = await params
  
  const supabase = await createClient()

  // Obtener el producto con todas sus relaciones
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name),
      type:types(id, name),
      sizes:product_sizes(id, size, order_index),
      images:product_images(id, url, filename, order_index, is_primary)
    `)
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Obtener todas las categorías y tipos para los selects
  const [
    { data: categories },
    { data: types }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('order_index'),
    supabase.from('types').select('*').order('order_index')
  ])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/productos"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a productos</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-600 mt-1">{product.name}</p>
        </div>
      </div>

      {/* Info del producto */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Creado</p>
            <p className="font-medium">
              {new Date(product.created_at).toLocaleDateString('es-AR')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Última actualización</p>
            <p className="font-medium">
              {new Date(product.updated_at).toLocaleDateString('es-AR')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Imágenes</p>
            <p className="font-medium">{product.images?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-600">Estado</p>
            <p className={`font-medium ${product.is_active ? 'text-green-600' : 'text-gray-600'}`}>
              {product.is_active ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm
          categories={categories || []}
          types={types || []}
          product={product}
          isEdit={true}
        />
      </div>
    </div>
  )
}