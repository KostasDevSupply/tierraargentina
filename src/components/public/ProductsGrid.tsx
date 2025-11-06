// components/public/ProductsGrid.tsx
import ProductCard from './ProductCard'
import { Package, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface ProductsGridProps {
  products: Array<any>
  currentFilters: any
}

export default function ProductsGrid({ products, currentFilters }: ProductsGridProps) {
  const hasFilters = currentFilters.categoria || currentFilters.tipo || currentFilters.buscar

  return (
    <div>
      {/* Results header mejorado */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resultados</p>
              <p className="text-xl font-bold text-gray-900">
                {products.length === 0 ? (
                  'Sin productos'
                ) : (
                  <>
                    {products.length} {products.length === 1 ? 'producto' : 'productos'}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Active filters chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {currentFilters.categoria && (
              <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
                {currentFilters.categoria}
              </span>
            )}
            {currentFilters.tipo && (
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                {currentFilters.tipo}
              </span>
            )}
            {currentFilters.buscar && (
              <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                "{currentFilters.buscar}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Grid mejorado */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            No encontramos productos
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {hasFilters
              ? 'Intentá ajustar los filtros o realizar una búsqueda diferente'
              : 'Todavía no hay productos disponibles en esta sección'}
          </p>
          {hasFilters && (
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Ver todos los productos
            </Link>
          )}
        </div>
      )}
    </div>
  )
}