import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/public/ProductCard'
import ProductFilters from '@/components/public/ProductFilters'
import { Suspense } from 'react'
import LoadMoreButton from '@/components/public/LoadMoreButton'

export const metadata = {
  title: 'Productos - Tierra Argentina',
  description: 'Descubrí nuestra colección completa de productos'
}

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductosPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Obtener categorías y tipos
  const [categoriesResult, typesResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),
    supabase
      .from('types')
      .select('*')
      .eq('is_active', true)
      .order('order_index')
  ])

  const categories = categoriesResult.data || []
  const types = typesResult.data || []

  // ✅ Obtener rango de precios de productos activos
  const { data: priceData } = await supabase
    .from('products')
    .select('price')
    .eq('is_active', true)
    // .order('price', { ascending: true })
    .gt('price', 0)

  const prices = priceData?.map(p => p.price) || [0]
  const minPrice = Math.floor(Math.min(...prices))
  const maxPrice = Math.ceil(Math.max(...prices))

  const minPriceFilter = params.min 
      ? Math.max(minPrice, parseInt(params.min as string)) 
      : minPrice
    
    const maxPriceFilter = params.max 
      ? Math.min(maxPrice, parseInt(params.max as string)) 
      : maxPrice

    console.log('🔍 Price Filter Applied:', {
      minPriceFilter,
      maxPriceFilter,
      fromURL: { min: params.min, max: params.max }
    })

  // Query de productos con filtros
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories!inner(*),
      type:types(*),
      images:product_images(*),
      sizes:product_sizes(*)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('categories.is_active', true)

  // Aplicar filtros
  if (params.category) {
    query = query.eq('category_id', params.category)
  }
  if (params.type) {
    query = query.eq('type_id', params.type)
  }

  // ✅ Filtro de precio
   query = query.gte('price', minPriceFilter)
   query = query.lte('price', maxPriceFilter)

  query = query
    .gte('price', minPriceFilter)
    .lte('price', maxPriceFilter)

  // Aplicar ordenamiento
  const sort = params.sort as string
  switch (sort) {
    case 'precio-asc':
      query = query.order('price', { ascending: true })
      break
    case 'precio-desc':
      query = query.order('price', { ascending: false })
      break
    case 'nombre':
      query = query.order('name', { ascending: true })
      break
    case 'mas-vendidos':
      query = query.order('sales_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Ejecutar query
  const { data: products, count, error } = await query.range(0, 11)

  if (error) {
    console.error('Error fetching products:', error)
  }

  const totalCount = count || 0
  const hasMore = totalCount > 12

  // Nombres de filtros activos
  const activeCategoryName = params.category 
    ? categories.find(c => c.id === params.category)?.name 
    : null
  const activeTypeName = params.type 
    ? types.find(t => t.id === params.type)?.name 
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Productos
          </h1>
          <p className="text-gray-600">
            {totalCount > 0 
              ? `Mostrando ${Math.min(12, totalCount)} de ${totalCount} productos`
              : 'No hay productos disponibles'
            }
          </p>
        </div>

        {/* Filtros */}
        <Suspense fallback={<div>Cargando filtros...</div>}>
          <ProductFilters 
            categories={categories} 
            types={types}
            priceRange={{ min: minPrice, max: maxPrice }}
            activeFilters={{
              category: params.category as string,
              type: params.type as string,
              sort: params.sort as string,
              minPrice: minPriceFilter,
              maxPrice: maxPriceFilter,
              categoryName: activeCategoryName,
              typeName: activeTypeName
            }}
          />
        </Suspense>

        {/* Grid de productos */}
        {products && products.length > 0 ? (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-12">
                <LoadMoreButton
                  currentCount={products.length}
                  totalCount={totalCount}
                  filters={{
                    category: params.category as string,
                    type: params.type as string,
                    sort: params.sort as string,
                    minPrice: minPriceFilter,
                    maxPrice: maxPriceFilter,
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros
            </p>
            <a
              href="/productos"
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Ver todos
            </a>
          </div>
        )}
      </div>
    </div>
  )
}