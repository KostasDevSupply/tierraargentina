import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClients'

export default async function ProductosPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
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
      sizes:product_sizes(id, size, in_stock, order_index),
      images:product_images(id, url, is_primary, order_index)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md w-full">
          <h3 className="text-xl font-semibold text-red-900 mb-2">Error al cargar productos</h3>
          <p className="text-red-700">{error.message}</p>
        </div>
      </div>
    )
  }

  const productsWithColors = products?.map(product => ({
    ...product,
    colors: product.product_colors?.map((pc: any) => pc.colors) || []
  })) || []

  return <ProductsClient products={productsWithColors} />
}