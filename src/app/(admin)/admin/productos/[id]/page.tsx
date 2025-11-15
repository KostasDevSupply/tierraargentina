import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProductEditClient from './ProductEditClient'
import type { Metadata } from 'next'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', id)
    .single()
  
  return {
    title: product ? `Editar ${product.name}` : 'Editar Producto',
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verificar autenticación
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  // ✅ Obtener producto con relaciones (INCLUYE COLORES)
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, icon),
      type:types(id, name),
      product_colors(
        id,
        color_id,
        order_index,
        colors(id, name, hex_code)
      ),
      sizes:product_sizes(id, size, in_stock, order_index),
      images:product_images(*)
    `)
    .eq('id', id)
    .single()
  
  if (error || !product) {
    console.error('Error loading product:', error)
    notFound()
  }

  // ✅ Normalizar colores para el modal
  const productWithColors = {
    ...product,
    colors: product.product_colors?.map((pc: any) => pc.colors) || []
  }
  
  // Obtener categorías, tipos y colores activos
  const [categoriesResult, typesResult, colorsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),
    supabase
      .from('types')
      .select('*')
      .eq('is_active', true)
      .order('order_index'),
    supabase
      .from('colors')
      .select('*')
      .eq('is_active', true)
      .order('name')
  ])
  
  return (
    <ProductEditClient
      product={productWithColors}
      categories={categoriesResult.data || []}
      types={typesResult.data || []}
      colors={colorsResult.data || []}
    />
  )
}