// app/(public)/productos/page.tsx
import { createClient } from '@/lib/supabase/server'
import ProductsGrid from '@/components/public/ProductsGrid'
import ProductFilters from '@/components/public/ProductFilters'
import { Search } from 'lucide-react'
import ProductsSearch from '@/components/public/ProductSearch'

interface SearchParams {
  categoria?: string
  tipo?: string
  buscar?: string
  orden?: string
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  let title = 'Productos - Tierra Argentina'
  
  if (params.categoria) {
    title = `${params.categoria} - Productos`
  }
  if (params.buscar) {
    title = `Búsqueda: ${params.buscar}`
  }
  
  return { title }
}

export const revalidate = 3600

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Parallel queries
  const [categoriesResult, typesResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug, icon, order_index')
      .order('order_index'),
    supabase
      .from('types')
      .select('id, name, slug, order_index')
      .order('order_index'),
  ])

  let query = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      price,
      short_description,
      created_at,
      category:categories!inner(id, name, slug),
      type:types(id, name, slug),
      images:product_images(url, is_primary)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true)

  if (params.categoria) {
    query = query.eq('category.slug', params.categoria)
  }

  if (params.tipo) {
    query = query.eq('type.slug', params.tipo)
  }

  if (params.buscar) {
    query = query.or(
      `name.ilike.%${params.buscar}%,short_description.ilike.%${params.buscar}%`
    )
  }

  switch (params.orden) {
    case 'precio-asc':
      query = query.order('price', { ascending: true, nullsFirst: false })
      break
    case 'precio-desc':
      query = query.order('price', { ascending: false, nullsFirst: false })
      break
    case 'nombre':
      query = query.order('name', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: products, count } = await query

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Moderno */}
      <div className="bg-gradient-to-br from-pink-600 via-pink-500 to-rose-600 text-white relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
              Nuestros Productos
            </h1>
            <p className="text-xl text-pink-50 mb-6">
              Explorá toda nuestra colección de ropa tradicional argentina
            </p>
            {count !== null && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <span className="font-semibold">{count}</span>
                <span className="text-pink-100">
                  {count === 1 ? 'producto disponible' : 'productos disponibles'}
                </span>
              </div>
            )}
          </div>

          {/* Búsqueda rápida en header */}
          <div className="mt-8">
            <ProductsSearch />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <aside className="lg:col-span-1">
            <ProductFilters
              categories={categoriesResult.data || []}
              types={typesResult.data || []}
              currentFilters={{
                categoria: params.categoria,
                tipo: params.tipo,
                buscar: params.buscar,
                orden: params.orden,
              }}
            />
          </aside>

          {/* Grid */}
          <main className="lg:col-span-3">
            <ProductsGrid
              products={products || []}
              currentFilters={params}
            />
          </main>
        </div>
      </div>
    </div>
  )
}