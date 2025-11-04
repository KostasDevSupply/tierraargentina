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
    // Validar que haya al menos un talle
    if (!sizes || sizes.length === 0) {
      return { success: false, error: 'Debes agregar al menos un talle' }
    }

    // Validar slug único
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .maybeSingle()

    if (existingProduct) {
      return { success: false, error: 'Ya existe un producto con ese nombre/slug. Usa otro nombre.' }
    }

    console.log('Creating product with data:', {
      ...productData,
      type_id: productData.type_id || null,
    })

    // Crear producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: productData.slug,
        description: productData.description || null,
        short_description: productData.short_description || null,
        price: productData.price,
        category_id: productData.category_id,
        type_id: productData.type_id || null,
        notes: productData.notes || null,
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        ...productData,
        type_id: productData.type_id || null,
      })
      .select()
      .single()

    if (productError) {
      console.error('Product creation error:', productError)
      return { success: false, error: `Error al crear producto: ${productError.message}` }
    }

    console.log('Product created:', product)

      return { success: false, error: productError.message }
    }

    // Crear talles
    if (sizes.length > 0) {
      const sizesData = sizes.map((size, index) => ({
        product_id: product.id,
        size: size,
        order_index: index,
      }))

      console.log('Creating sizes:', sizesData)

      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesData)

      if (sizesError) {
        console.error('Sizes creation error:', sizesError)
        // Eliminar el producto si falló crear los talles
        await supabase.from('products').delete().eq('id', product.id)
        return { success: false, error: `Error al crear talles: ${sizesError.message}` }
        return { success: false, error: sizesError.message }
      }
    }

    revalidatePath('/admin/productos')
    return { success: true, product }
  } catch (error) {
    console.error('Unexpected error in createProduct:', error)
    return { 
      success: false, 
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }
    return { success: false, error: 'Error inesperado al crear el producto' }
  }
}

export async function updateProduct(productId: string, productData: ProductData, sizes: string[]) {
  const supabase = await createClient()

  try {
    // Validar slug único (excepto el producto actual)
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .neq('id', productId)
      .maybeSingle()

    if (existingProduct) {
      return { success: false, error: 'Ya existe otro producto con ese nombre/slug' }
    }

    // Actualizar producto
    const { error: productError } = await supabase
      .from('products')
      .update({
        name: productData.name,
        slug: productData.slug,
        description: productData.description || null,
        short_description: productData.short_description || null,
        price: productData.price,
        category_id: productData.category_id,
        type_id: productData.type_id || null,
        notes: productData.notes || null,
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        ...productData,
        type_id: productData.type_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (productError) {
      console.error('Product update error:', productError)
      return { success: false, error: `Error al actualizar: ${productError.message}` }
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
        console.error('Sizes update error:', sizesError)
        return { success: false, error: `Error al actualizar talles: ${sizesError.message}` }
        return { success: false, error: sizesError.message }
      }
    }

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${productId}`)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in updateProduct:', error)
    return { 
      success: false, 
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }
    return { success: false, error: 'Error inesperado al actualizar el producto' }
  }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Product deletion error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error in deleteProduct:', error)
    return { 
      success: false, 
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    }
  }
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