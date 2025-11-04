import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import ImageManager from '../../ImageManager'
import Link from 'next/link'
import { ArrowLeft, Calendar, Image as ImageIcon, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  
  const supabase = await createClient()

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

  const [
    { data: categories },
    { data: types }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('order_index'),
    supabase.from('types').select('*').order('order_index')
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a productos</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Editar Producto
            </h1>
            <p className="text-lg text-gray-600 mt-2">{product.name}</p>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all">
            {product.is_active ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Activo</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">Inactivo</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Fecha de creación */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Creado</p>
              <p className="text-lg font-bold text-blue-900 mt-0.5">
                {new Date(product.created_at).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Última actualización */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Actualizado</p>
              <p className="text-lg font-bold text-purple-900 mt-0.5">
                {new Date(product.updated_at).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Cantidad de imágenes */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Imágenes</p>
              <p className="text-lg font-bold text-amber-900 mt-0.5">
                {product.images?.length || 0} {product.images?.length === 1 ? 'imagen' : 'imágenes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Manager Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Imágenes del Producto
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Arrastra para reordenar, máximo 5MB por imagen
            </p>
          </div>
        </div>
        
        <ImageManager
          productId={product.id}
          initialImages={product.images || []}
        />
      </div>

      {/* Product Form Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Información del Producto
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Actualiza los detalles y características
            </p>
          </div>
        </div>
        
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