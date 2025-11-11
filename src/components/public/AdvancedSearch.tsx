'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Package, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  short_description?: string
  category_name: string
  image_url: string
  sizes_count?: number
  is_featured?: boolean
}

export default function AdvancedSearch() {
  const router = useRouter()
  const supabase = createClient()
  const searchRef = useRef<HTMLDivElement>(null)
  
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const debouncedQuery = useDebounce(query, 300)

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recent_searches')
    if (recent) {
      setRecentSearches(JSON.parse(recent).slice(0, 5))
    }
  }, [])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar cuando cambia el query
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchProducts()
      getSuggestions()
    } else {
      setResults([])
      setSuggestions([])
    }
  }, [debouncedQuery])

  const searchProducts = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('search_products', {
        search_query: debouncedQuery,
        limit_count: 8, // ✅ Aumentado de 5 a 8
      })

      if (!error && data) {
        setResults(data)
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestions = async () => {
    try {
      const { data } = await supabase
        .from('search_suggestions')
        .select('query')
        .ilike('query', `${debouncedQuery}%`)
        .order('search_count', { ascending: false })
        .limit(3)

      if (data) {
        setSuggestions(data.map((s) => s.query))
      }
    } catch (error) {
      console.error('Error getting suggestions:', error)
    }
  }

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Guardar en búsquedas recientes
    const recent = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5)
    setRecentSearches(recent)
    localStorage.setItem('recent_searches', JSON.stringify(recent))

    // Redirigir a resultados
    router.push(`/productos?buscar=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSuggestions([])
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nombre, categoría..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-gray-200 focus:border-pink-600 focus:ring-4 focus:ring-pink-100 transition-all outline-none text-gray-900"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados - AMPLIADO */}
      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 w-[600px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[600px] overflow-y-auto z-[9999]">
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Búsquedas recientes
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && (
            <>
              {/* Sugerencias */}
              {suggestions.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 mb-3">
                    Sugerencias
                  </h3>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition"
                      >
                        <span className="text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados - MEJORADOS */}
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-2">Buscando...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Productos encontrados ({results.length})
                  </h3>
                  <div className="space-y-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition group"
                      >
                        {/* Imagen */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {product.is_featured && (
                            <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              ⭐
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 group-hover:text-pink-600 transition line-clamp-1 mb-1">
                            {product.name}
                          </h4>
                          
                          {/* Categoría */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              <Tag className="w-3 h-3" />
                              {product.category_name}
                            </span>
                            {product.sizes_count && product.sizes_count > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                {product.sizes_count} {product.sizes_count === 1 ? 'talle' : 'talles'}
                              </span>
                            )}
                          </div>

                          {/* Descripción */}
                          {product.short_description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.short_description}
                            </p>
                          )}
                        </div>

                        {/* Precio */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-pink-600">
                            ${product.price.toLocaleString('es-AR')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Botón ver todos */}
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full mt-4 py-3 text-center text-pink-600 hover:bg-pink-50 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    Ver todos los resultados para "{query}"
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              ) : query.length >= 2 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-2">
                    No se encontraron productos
                  </p>
                  <p className="text-sm text-gray-400">
                    Intenta con otros términos de búsqueda
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  )
}