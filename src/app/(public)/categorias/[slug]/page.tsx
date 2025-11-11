import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductCard from '@/components/public/ProductCard'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return {
      title: 'Categoría no encontrada - Tierra Argentina'
    }
  }

  return {
    title: `${category.name} - Tierra Argentina`,
    description: category.description || `Descubrí nuestra colección de ${category.name}`
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Obtener categoría
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // ✅ Obtener productos CON TALLES E IMÁGENES COMPLETAS
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      type:types(name, slug),
      images:product_images(*),
      sizes:product_sizes(*)
    `)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-pink-600 to-rose-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-pink-100 hover:text-white mb-6 group transition"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver a productos
          </Link>
          
          <div className="flex items-center gap-4">
            {category.icon && (
              <span className="text-6xl">{category.icon}</span>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-xl text-pink-100">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-gray-600">
            {products && products.length > 0 ? (
              <>
                <span className="font-bold text-gray-900">{products.length}</span>{' '}
                {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </>
            ) : (
              'No hay productos en esta categoría'
            )}
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            {category.icon && (
              <div className="text-6xl mb-6">{category.icon}</div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Todavía no hay productos
            </h3>
            <p className="text-gray-600 mb-8">
              Estamos trabajando para agregar productos a esta categoría
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Ver todos los productos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}