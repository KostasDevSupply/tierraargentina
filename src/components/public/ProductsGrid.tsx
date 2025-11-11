'use client'

import ProductCard from './ProductCard'

interface ProductsGridProps {
  products: any[]
  currentFilters: {
    categoria?: string
    tipo?: string
    buscar?: string
  }
}

export default function ProductsGrid({ products, currentFilters }: ProductsGridProps) {
  return (
    <div>
      {/* Mostrar filtros activos si existen */}
      {(currentFilters.categoria || currentFilters.tipo) && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Filtrando por:</span>
          {currentFilters.categoria && (
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
              {currentFilters.categoria}
            </span>
          )}
          {currentFilters.tipo && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {currentFilters.tipo}
            </span>
          )}
        </div>
      )}

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}