'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface UploadResult {
  success: boolean
  error?: string
  image?: {
    id: string
    url: string
    filename: string
    order_index: number
    is_primary: boolean
  }
}

// Subir imagen
export async function uploadProductImage(productId: string, file: File): Promise<UploadResult> {
  const supabase = await createClient()

  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convertir File a ArrayBuffer y luego a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // Obtener el order_index (última posición + 1)
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('order_index')
      .eq('product_id', productId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingImages && existingImages.length > 0 
      ? existingImages[0].order_index + 1 
      : 0

    // Verificar si es la primera imagen (será la principal)
    const { count } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const isPrimary = count === 0

    // Guardar metadata en la DB
    const { data: imageData, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: fileName,
        url: publicUrl,
        filename: file.name,
        size_bytes: file.size,
        mime_type: file.type,
        order_index: nextOrderIndex,
        is_primary: isPrimary
      })
      .select()
      .single()

    if (dbError) {
      // Si falla la DB, eliminar archivo de Storage
      await supabase.storage.from('product-images').remove([fileName])
      return { success: false, error: dbError.message }
    }

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${productId}`)

    return {
      success: true,
      image: {
        id: imageData.id,
        url: imageData.url,
        filename: imageData.filename,
        order_index: imageData.order_index,
        is_primary: imageData.is_primary
      }
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al subir la imagen' 
    }
  }
}

// Eliminar imagen
export async function deleteProductImage(imageId: string) {
  const supabase = await createClient()

  try {
    // Obtener info de la imagen
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('storage_path, product_id')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      return { success: false, error: 'Imagen no encontrada' }
    }

    // Eliminar de Storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([image.storage_path])

    if (storageError) {
      console.error('Error eliminando de storage:', storageError)
      // Continuar de todas formas para limpiar la DB
    }

    // Eliminar de la DB
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${image.product_id}`)

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al eliminar la imagen' 
    }
  }
}

// Reordenar imágenes
export async function reorderProductImages(productId: string, imageIds: string[]) {
  const supabase = await createClient()

  try {
    // Actualizar order_index de cada imagen
    const updates = imageIds.map((id, index) => 
      supabase
        .from('product_images')
        .update({ order_index: index })
        .eq('id', id)
        .eq('product_id', productId)
    )

    await Promise.all(updates)

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${productId}`)

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al reordenar imágenes' 
    }
  }
}

// Marcar imagen como principal
export async function setImageAsPrimary(productId: string, imageId: string) {
  const supabase = await createClient()

  try {
    // Quitar is_primary de todas las imágenes del producto
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    // Marcar la seleccionada como principal
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${productId}`)

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al marcar como principal' 
    }
  }
}