'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProductServer(productData: any, sizes: string[]) {
  const supabase = await createClient()

  try {
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autorizado' }
    }

    // Verificar slug único
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'Ya existe un producto con ese nombre' }
    }

    // Crear producto
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: productData.slug,
        description: productData.description || null,
        short_description: productData.short_description || null,
        price: Number(productData.price) || 0,
        category_id: productData.category_id,
        type_id: productData.type_id || null,
        notes: productData.notes || null,
        is_active: productData.is_active ?? true,
        is_featured: productData.is_featured ?? false,
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
        await supabase.from('products').delete().eq('id', product.id)
        return { success: false, error: sizesError.message }
      }
    }

    revalidatePath('/admin/productos')
    return { success: true, product }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function updateProductServer(productId: string, productData: any, sizes: string[]) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autorizado' }
    }

    // Actualizar producto
    const { error: productError } = await supabase
      .from('products')
      .update({
        name: productData.name,
        slug: productData.slug,
        description: productData.description || null,
        short_description: productData.short_description || null,
        price: Number(productData.price) || 0,
        category_id: productData.category_id,
        type_id: productData.type_id || null,
        notes: productData.notes || null,
        is_active: productData.is_active ?? true,
        is_featured: productData.is_featured ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (productError) {
      return { success: false, error: productError.message }
    }

    // Actualizar talles
    await supabase.from('product_sizes').delete().eq('product_id', productId)
    
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
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}