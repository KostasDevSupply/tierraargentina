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
        limit_count: 8,
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
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
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
          className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white border-2 border-gray-200 focus:border-pink-600 focus:ring-4 focus:ring-pink-100 transition-all outline-none text-gray-900 text-sm md:text-base"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados - RESPONSIVE MEJORADO */}
      {isOpen && (
        <div 
          className="
            absolute 
            top-[calc(100%+0.5rem)]
            left-0 
            right-0 
            md:left-auto
            md:right-auto
            w-full 
            md:min-w-[500px]
            bg-white 
            rounded-xl 
            md:rounded-2xl 
            shadow-2xl 
            border 
            border-gray-200 
            max-h-[calc(100vh-200px)]
            md:max-h-[600px] 
            overflow-y-auto 
            z-[100]
            animate-in 
            fade-in 
            slide-in-from-top-2 
            duration-200
          "
        >
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-bold text-gray-500 mb-2 md:mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                Búsquedas recientes
              </h3>
              <div className="space-y-1 md:space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 md:px-4 py-2 hover:bg-gray-50 rounded-lg transition flex items-center gap-2 text-sm md:text-base"
                  >
                    <Search className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && (
            <>
              {/* Sugerencias */}
              {suggestions.length > 0 && (
                <div className="p-3 md:p-4 border-b border-gray-100">
                  <h3 className="text-xs md:text-sm font-bold text-gray-500 mb-2 md:mb-3">
                    Sugerencias
                  </h3>
                  <div className="space-y-1 md:space-y-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full text-left px-3 md:px-4 py-2 hover:bg-gray-50 rounded-lg transition text-sm md:text-base"
                      >
                        <span className="text-gray-700">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados - RESPONSIVE */}
              {isLoading ? (
                <div className="p-6 md:p-8 text-center">
                  <div className="inline-block w-6 h-6 md:w-8 md:h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Buscando...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-3 md:p-4">
                  <h3 className="text-xs md:text-sm font-bold text-gray-500 mb-2 md:mb-3 flex items-center gap-2">
                    <Package className="w-3 h-3 md:w-4 md:h-4" />
                    Productos encontrados ({results.length})
                  </h3>
                  <div className="space-y-1 md:space-y-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-start gap-2 md:gap-4 p-2 md:p-3 hover:bg-gray-50 rounded-lg md:rounded-xl transition group"
                      >
                        {/* Imagen - Responsive */}
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
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
                              <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                            </div>
                          )}
                          {product.is_featured && (
                            <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 bg-yellow-400 text-yellow-900 text-[8px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded">
                              ⭐
                            </div>
                          )}
                        </div>

                        {/* Info - Responsive */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-pink-600 transition line-clamp-2 md:line-clamp-1 mb-1">
                            {product.name}
                          </h4>
                          
                          {/* Categoría y talles */}
                          <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1 md:mb-2">
                            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-gray-600 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded">
                              <Tag className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              {product.category_name}
                            </span>
                            {product.sizes_count && product.sizes_count > 0 && (
                              <span className="text-[10px] md:text-xs text-green-600 font-medium">
                                {product.sizes_count} {product.sizes_count === 1 ? 'talle' : 'talles'}
                              </span>
                            )}
                          </div>

                          {/* Descripción - Solo en desktop */}
                          {product.short_description && (
                            <p className="hidden md:block text-sm text-gray-600 line-clamp-2">
                              {product.short_description}
                            </p>
                          )}
                        </div>

                        {/* Precio - Responsive */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm md:text-lg font-bold text-pink-600">
                            ${product.price.toLocaleString('es-AR')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Botón ver todos - Responsive */}
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full mt-3 md:mt-4 py-2.5 md:py-3 text-center text-sm md:text-base text-pink-600 hover:bg-pink-50 rounded-lg md:rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span className="truncate">Ver todos los resultados{query.length < 20 && ` para "${query}"`}</span>
                    <Search className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              ) : query.length >= 2 ? (
                <div className="p-6 md:p-8 text-center">
                  <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 md:mb-3" />
                  <p className="text-sm md:text-base text-gray-500 font-medium mb-1 md:mb-2">
                    No se encontraron productos
                  </p>
                  <p className="text-xs md:text-sm text-gray-400">
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