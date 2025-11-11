'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import ProductCard from './ProductCard'

interface LoadMoreButtonProps {
  currentCount: number
  totalCount: number
  filters: {
    category?: string
    type?: string
    sort?: string
    minPrice?: number
    maxPrice?: number
  }
}

export default function LoadMoreButton({ currentCount, totalCount, filters }: LoadMoreButtonProps) {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState(currentCount)

  const loadMore = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // ✅ AQUÍ EMPIEZA EL QUERY
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

      // ✅ Filtro de categoría
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      // ✅ Filtro de tipo
      if (filters.type) {
        query = query.eq('type_id', filters.type)
      }

      // ✅ AQUÍ VAN LOS FILTROS DE PRECIO
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice)
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }

      // ✅ Ordenamiento
      switch (filters.sort) {
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

      const { data, error } = await query.range(offset, offset + 11)

      if (!error && data) {
        setProducts(prev => [...prev, ...data])
        setOffset(prev => prev + data.length)
      }
    } catch (error) {
      console.error('Error loading more:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const remaining = totalCount - offset

  return (
    <div className="space-y-8">
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                Ver más productos
                <span className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">
                  {remaining} restantes
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}