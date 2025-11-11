'use client'

import { useRouter } from 'next/navigation'
import { Filter, X, Tag, Grid3x3, ArrowUpDown } from 'lucide-react'
import PriceRangeSlider from './PriceRangeSlider'

interface ProductFiltersProps {
  categories: any[]
  types: any[]
  priceRange: { min: number; max: number }
  activeFilters: {
    category?: string
    type?: string
    sort?: string
    minPrice?: number
    maxPrice?: number
    categoryName?: string | null
    typeName?: string | null
  }
}

export default function ProductFilters({ 
  categories, 
  types, 
  priceRange,
  activeFilters 
}: ProductFiltersProps) {
  const router = useRouter()

  // ✅ FUNCIÓN MEJORADA PARA CONSTRUIR URL
  const buildUrl = (updates: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams()
    
    // Procesar cada filtro
    const processFilter = (key: string, filterKey: keyof typeof activeFilters) => {
      if (updates[filterKey] !== undefined) {
        // Si el update es null o undefined, no agregar
        if (updates[filterKey]) {
          params.set(key, updates[filterKey]!.toString())
        }
      } else if (activeFilters[filterKey]) {
        // Si no hay update, mantener el valor actual
        params.set(key, activeFilters[filterKey]!.toString())
      }
    }

    processFilter('category', 'category')
    processFilter('type', 'type')
    processFilter('sort', 'sort')
    
    // Precio especial
    if (updates.minPrice !== undefined) {
      if (updates.minPrice && updates.minPrice !== priceRange.min) {
        params.set('min', updates.minPrice.toString())
      }
    } else if (activeFilters.minPrice && activeFilters.minPrice !== priceRange.min) {
      params.set('min', activeFilters.minPrice.toString())
    }

    if (updates.maxPrice !== undefined) {
      if (updates.maxPrice && updates.maxPrice !== priceRange.max) {
        params.set('max', updates.maxPrice.toString())
      }
    } else if (activeFilters.maxPrice && activeFilters.maxPrice !== priceRange.max) {
      params.set('max', activeFilters.maxPrice.toString())
    }

    const urlString = params.toString()
    return urlString ? `/productos?${urlString}` : '/productos'
  }

  const handleFilterChange = (key: string, value: string | number) => {
    router.push(buildUrl({ [key]: value }))
  }

  const handlePriceChange = (min: number, max: number) => {
    router.push(buildUrl({ 
      minPrice: min === priceRange.min ? null : min,
      maxPrice: max === priceRange.max ? null : max
    }))
  }

  // ✅ FUNCIÓN MEJORADA PARA REMOVER FILTRO INDIVIDUAL
  const removeFilter = (filterKey: string) => {
    if (filterKey === 'price') {
      router.push(buildUrl({ minPrice: null, maxPrice: null }))
    } else {
      router.push(buildUrl({ [filterKey]: null }))
    }
  }

  const clearAllFilters = () => {
    router.push('/productos')
  }

  const hasPriceFilter = 
    (activeFilters.minPrice && activeFilters.minPrice !== priceRange.min) ||
    (activeFilters.maxPrice && activeFilters.maxPrice !== priceRange.max)

  const activeFiltersCount = [
    activeFilters.category,
    activeFilters.type,
    activeFilters.sort && activeFilters.sort !== 'reciente' ? activeFilters.sort : null,
    hasPriceFilter ? 'price' : null,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Filtros principales */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-gray-500">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'activo' : 'activos'}
                </p>
              )}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition hover:scale-105"
            >
              <X className="w-4 h-4" />
              Limpiar todo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Categoría */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Tag className="w-4 h-4 text-pink-600" />
              Categoría
            </label>
            <select
              value={activeFilters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition text-gray-900 font-medium hover:border-pink-300"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Grid3x3 className="w-4 h-4 text-blue-600" />
              Tipo
            </label>
            <select
              value={activeFilters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 font-medium hover:border-blue-300"
            >
              <option value="">Todos</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ArrowUpDown className="w-4 h-4 text-purple-600" />
              Ordenar
            </label>
            <select
              value={activeFilters.sort || 'reciente'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-gray-900 font-medium hover:border-purple-300"
            >
              <option value="reciente">📅 Recientes</option>
              <option value="mas-vendidos">🔥 Más vendidos</option>
              <option value="precio-asc">💰 Menor precio</option>
              <option value="precio-desc">💎 Mayor precio</option>
              <option value="nombre">🔤 A-Z</option>
            </select>
          </div>

          {/* Precio */}
          <PriceRangeSlider
            minPrice={priceRange.min}
            maxPrice={priceRange.max}
            currentMin={activeFilters.minPrice}
            currentMax={activeFilters.maxPrice}
            onChange={handlePriceChange}
          />
        </div>
      </div>

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.categoryName && (
            <button
              onClick={() => removeFilter('category')}
              className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-200 transition group hover:scale-105"
            >
              <Tag className="w-3 h-3" />
              {activeFilters.categoryName}
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
          {activeFilters.typeName && (
            <button
              onClick={() => removeFilter('type')}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition group hover:scale-105"
            >
              <Grid3x3 className="w-3 h-3" />
              {activeFilters.typeName}
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
          {activeFilters.sort && activeFilters.sort !== 'reciente' && (
            <button
              onClick={() => removeFilter('sort')}
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 transition group hover:scale-105"
            >
              <ArrowUpDown className="w-3 h-3" />
              {
                activeFilters.sort === 'mas-vendidos' ? '🔥 Más vendidos' :
                activeFilters.sort === 'precio-asc' ? '💰 Menor precio' :
                activeFilters.sort === 'precio-desc' ? '💎 Mayor precio' :
                '🔤 Alfabético'
              }
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
          {hasPriceFilter && (
            <button
              onClick={() => removeFilter('price')}
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-200 transition group hover:scale-105"
            >
              💰 ${activeFilters.minPrice?.toLocaleString()} - ${activeFilters.maxPrice?.toLocaleString()}
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}