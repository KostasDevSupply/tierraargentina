import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react'
import ProductCard from '@/components/public/ProductCard'

export default async function InicioPage() {
  const supabase = await createClient()

  // Obtener solo categorías ACTIVAS
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true) // ✅ Solo activas
    .order('order_index')

  // Obtener productos destacados ACTIVOS con categorías ACTIVAS
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories!inner(*),
      type:types(*),
      images:product_images(*),
      sizes:product_sizes(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .eq('categories.is_active', true)
    .limit(8)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-6">
              <Sparkles className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-semibold text-gray-700">
                Bienvenidos a Tierra Argentina
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Lencería de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
                {' '}Calidad Premium
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Descubrí nuestra colección exclusiva de lencería femenina y masculina
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                Ver Productos
              </Link>
              
              <Link
                href="/categorias"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg border-2 border-gray-200"
              >
                Explorar Categorías
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explorá por Categoría
              </h2>
              <p className="text-gray-600 text-lg">
                Encontrá lo que buscás navegando nuestras colecciones
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categorias/${category.slug}`}
                  className="group relative bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 rounded-2xl p-8 transition-all hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-pink-300"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos Destacados */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">
                  Productos Destacados
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Lo Mejor de Nuestra Colección
              </h2>
            </div>

            {/* ✅ USAR ProductCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
              >
                Ver Todos los Productos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}