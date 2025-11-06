// components/public/ProductFilters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ProductFiltersProps {
  categories: Array<{ id: string; name: string; slug: string; icon?: string }>
  types: Array<{ id: string; name: string; slug: string }>
  currentFilters: {
    categoria?: string
    tipo?: string
    buscar?: string
    orden?: string
  }
}

export default function ProductFilters({
  categories,
  types,
  currentFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    categorias: true,
    tipos: true,
    orden: true,
  })

  const activeFiltersCount = [
    currentFilters.categoria,
    currentFilters.tipo,
    currentFilters.orden !== 'reciente',
  ].filter(Boolean).length

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/productos?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/productos')
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string
    sectionKey: keyof typeof expandedSections
    children: React.ReactNode
  }) => (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedSections[sectionKey] ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expandedSections[sectionKey] && <div className="space-y-2">{children}</div>}
    </div>
  )

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header con clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-pink-600" />
          <h2 className="font-bold text-xl text-gray-900">Filtros</h2>
          {activeFiltersCount > 0 && (
            <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-pink-600 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <FilterSection title="Categorías" sectionKey="categorias">
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                updateFilter(
                  'categoria',
                  currentFilters.categoria === category.slug ? null : category.slug
                )
              }
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentFilters.categoria === category.slug
                  ? 'bg-pink-100 border-2 border-pink-600 text-pink-700'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              {category.icon && <span className="text-2xl">{category.icon}</span>}
              <span className="font-medium">{category.name}</span>
              {currentFilters.categoria === category.slug && (
                <svg
                  className="w-5 h-5 ml-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Tipos */}
      {types.length > 0 && (
        <FilterSection title="Tipos" sectionKey="tipos">
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() =>
                  updateFilter(
                    'tipo',
                    currentFilters.tipo === type.slug ? null : type.slug
                  )
                }
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  currentFilters.tipo === type.slug
                    ? 'bg-pink-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Ordenar */}
      <FilterSection title="Ordenar por" sectionKey="orden">
        <div className="space-y-2">
          {[
            { value: 'reciente', label: '✨ Más recientes' },
            { value: 'precio-asc', label: '💰 Menor precio' },
            { value: 'precio-desc', label: '💎 Mayor precio' },
            { value: 'nombre', label: '🔤 Nombre (A-Z)' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter('orden', option.value)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                (currentFilters.orden || 'reciente') === option.value
                  ? 'bg-pink-100 border-2 border-pink-600 text-pink-700'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              {(currentFilters.orden || 'reciente') === option.value && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
        >
          <Filter className="w-6 h-6" />
          {activeFiltersCount > 0 && (
            <span className="bg-white text-pink-600 text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white z-50 lg:hidden animate-slide-in-right overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold"
              >
                Ver productos
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}