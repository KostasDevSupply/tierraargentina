'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProductData {
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  category_id: string
  type_id: string
  notes: string
  is_active: boolean
  is_featured: boolean
}

export async function createProduct(productData: ProductData, sizes: string[]) {
  const supabase = await createClient()

  try {
    // Crear producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...productData,
        type_id: productData.type_id || null,
      })
      .select()
      .single()

    if (productError) {
      return { success: false, error: productError.message }
    }

    // Crear talles
    if (sizes.length > 0) {
      const sizesData = sizes.map((size, index) => ({
        product_id: product.id,
        size: size,
        order_index: index,
      }))

      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesData)

      if (sizesError) {
        return { success: false, error: sizesError.message }
      }
    }

    revalidatePath('/admin/productos')
    return { success: true, product }
  } catch (error) {
    return { success: false, error: 'Error inesperado al crear el producto' }
  }
}

export async function updateProduct(productId: string, productData: ProductData, sizes: string[]) {
  const supabase = await createClient()

  try {
    // Actualizar producto
    const { error: productError } = await supabase
      .from('products')
      .update({
        ...productData,
        type_id: productData.type_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (productError) {
      return { success: false, error: productError.message }
    }

    // Eliminar talles antiguos
    await supabase
      .from('product_sizes')
      .delete()
      .eq('product_id', productId)

    // Crear nuevos talles
    if (sizes.length > 0) {
      const sizesData = sizes.map((size, index) => ({
        product_id: productId,
        size: size,
        order_index: index,
      }))

      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesData)

      if (sizesError) {
        return { success: false, error: sizesError.message }
      }
    }

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${productId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error inesperado al actualizar el producto' }
  }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/productos')
  return { success: true }
}