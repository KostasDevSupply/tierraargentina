'use client'

import { useState, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import ProductsGrid from '@/components/public/ProductsGrid'
import ProductFilters from '@/components/public/ProductFilters'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface ProductsClientProps {
  initialProducts: any[]
  categories: any[]
  types: any[]
  totalCount: number
  filters: {
    category?: string
    type?: string
    sort?: string
  }
}

export default function ProductsClient({
  initialProducts,
  categories,
  types,
  totalCount,
  filters,
}: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(totalCount > 10)

  // 🎯 Transformar IDs a nombres legibles
  const currentFilters = useMemo(() => {
    const selectedCategory = categories.find(c => c.id === filters.category)
    const selectedType = types.find(t => t.id === filters.type)

    return {
      categoria: selectedCategory?.name || '',
      tipo: selectedType?.name || '',
      buscar: '', // Si tienes búsqueda, agrégala aquí
    }
  }, [filters, categories, types])

  const loadMore = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      
      let query = supabase
      .from('products')
      .select(`
        *,
        category:categories!inner(*),
        type:types(*),
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .eq('is_active', true)
      .eq('categories.is_active', true)
      .range(products.length, products.length + 9)

      if (filters.sort === 'mas-vendidos') {
      query = query.order('sales_count', { ascending: false })
    } else if (filters.sort === 'precio-asc') {
      query = query.order('price', { ascending: true })
    }
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters.type) {
        query = query.eq('type_id', filters.type)
      }

      if (filters.sort === 'precio-asc') {
        query = query.order('price', { ascending: true })
      } else if (filters.sort === 'precio-desc') {
        query = query.order('price', { ascending: false })
      } else if (filters.sort === 'nombre') {
        query = query.order('name', { ascending: true })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        setProducts((prev) => [...prev, ...data])
        setHasMore(products.length + data.length < totalCount)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more:', error)
      toast.error('Error al cargar más productos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Productos</h1>
        <p className="text-gray-600">
          Mostrando {products.length} de {totalCount} productos
        </p>
      </div>

      <div className="mb-8">
        <ProductFilters categories={categories} types={types} />
      </div>

      {/* ✅ Ahora con nombres legibles */}
      <ProductsGrid 
        products={products}
        currentFilters={currentFilters}
      />

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                Ver más productos
                <span className="text-sm opacity-80">
                  ({totalCount - products.length} restantes)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="mt-12 text-center text-gray-500">
          <p>Has visto todos los productos disponibles</p>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">
            No se encontraron productos con estos filtros
          </p>
          <button
            onClick={() => window.location.href = '/productos'}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  )
}