import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductCard from '@/components/public/ProductCard'
import ProductDetailClient from '@/components/public/ProductDetailClient'

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // ✅ FIX: Traer TODOS los colores mediante product_colors
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug, icon),
      type:types(id, name, slug),
      product_colors(
        id,
        color_id,
        order_index,
        colors(id, name, hex_code)
      ),
      sizes:product_sizes(size, order_index, in_stock),
      images:product_images(id, url, filename, order_index, is_primary)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    console.error('Product not found:', { slug, error })
    notFound()
  }

  // ✅ Normalizar colores para compatibilidad
  const colors = product.product_colors?.map((pc: any) => pc.colors) || []
  const productWithColors = { ...product, colors }

  const { data: relatedProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      type:types(name, slug),
      product_colors(
        id,
        color_id,
        colors(id, name, hex_code)
      ),
      sizes:product_sizes(size, in_stock),
      images:product_images(url, is_primary)
    `)
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  // Normalizar related products
  const normalizedRelated = relatedProducts?.map((p: any) => ({
    ...p,
    colors: p.product_colors?.map((pc: any) => pc.colors) || []
  })) || []

  const sortedImages = product.images?.sort((a: any, b: any) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return a.order_index - b.order_index
  }) || []

  const sortedSizes = product.sizes?.sort((a: any, b: any) => a.order_index - b.order_index) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/inicio" className="text-gray-600 hover:text-pink-600">
              Inicio
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/productos" className="text-gray-600 hover:text-pink-600">
              Productos
            </Link>
            {product.category && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  href={`/categorias/${product.category.slug}`}
                  className="text-gray-600 hover:text-pink-600"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver a productos
        </Link>

        {/* Client Component */}
        <ProductDetailClient
          product={productWithColors}
          sortedImages={sortedImages}
          sortedSizes={sortedSizes}
        />

        {normalizedRelated.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {normalizedRelated.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}