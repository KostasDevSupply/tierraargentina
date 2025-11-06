import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react'
import ProductCard from '@/components/public/ProductCard'

export default async function HomePage() {
  const supabase = await createClient()

  // Productos destacados
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      type:types(name, slug),
      images:product_images(url, is_primary)
    `)
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(8)

  // Categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-400 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Colección 2024/2025</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Ropa Argentina
                <span className="block text-pink-600">de Calidad Premium</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Descubrí nuestra colección de ropa tradicional argentina. 
                Más de 30 años vistiendo a la Argentina con estilo y comodidad.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-pink-600/30"
                >
                  Ver Productos
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <a
                  href="https://wa.me/5491112345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all border-2 border-gray-200 hover:border-pink-600"
                >
                  Consultá por WhatsApp
                </a>
              </div>
            </div>

            {/* Imagen placeholder */}
            <div className="hidden md:block">
              <div className="aspect-square bg-gradient-to-br from-pink-200 to-rose-300 rounded-3xl shadow-2xl flex items-center justify-center">
                <p className="text-white text-2xl font-bold">Imagen Hero</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decoración */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-xl hover:bg-gray-50 transition">
              <div className="p-3 bg-blue-400 rounded-lg">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Calidad Premium</h3>
                <p className="text-gray-600 text-sm">
                  Materiales seleccionados y confección de primera calidad
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl hover:bg-gray-50 transition">
              <div className="p-3 bg-blue-400 rounded-lg">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Últimas Tendencias</h3>
                <p className="text-gray-600 text-sm">
                  Diseños actualizados siguiendo las tendencias del mercado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-xl hover:bg-gray-50 transition">
              <div className="p-3 bg-blue-400 rounded-lg">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Variedad de Talles</h3>
                <p className="text-gray-600 text-sm">
                  Amplio stock de talles para todos los cuerpos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explorá por Categoría
            </h2>
            <p className="text-xl text-gray-600">
              Encontrá lo que buscás navegando nuestras colecciones
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-pink-600">
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 group-hover:text-pink-600 transition">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Productos Destacados
                </h2>
                <p className="text-xl text-gray-600">
                  Lo más popular de nuestra colección
                </p>
              </div>
              <Link
                href="/productos"
                className="hidden md:inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold"
              >
                Ver todos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12 md:hidden">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition"
              >
                Ver todos los productos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-pink-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Tenés dudas sobre talles o modelos?
          </h2>
          <p className="text-xl mb-8 text-pink-100">
            Contactanos por WhatsApp y te asesoramos personalmente
          </p>
            <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-pink-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl"
          >
            Contactar por WhatsApp
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </section>
    </div>
  )
}