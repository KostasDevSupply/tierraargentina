import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function getSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Ignorar errores al setear cookies
          }
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  console.log('🔵 ===== UPLOAD API ROUTE CALLED =====')
  
  try {
    const supabase = await getSupabaseClient()
    const cookieStore = await cookies()

    // Log de cookies disponibles
    const allCookies = cookieStore.getAll()
    console.log('🍪 Cookies disponibles:', allCookies.map(c => c.name))

    // Verificar autenticación con detalle
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔐 Auth check:', {
      hasSession: !!session,
      sessionError: sessionError?.message || null,
      user: session?.user?.email || null,
      userId: session?.user?.id || null,
    })

    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return NextResponse.json({ 
        error: 'Error de autenticación',
        details: sessionError.message 
      }, { status: 401 })
    }

    if (!session) {
      console.error('❌ No session found - Usuario no autenticado')
      return NextResponse.json({ 
        error: 'No autorizado - Por favor inicia sesión nuevamente' 
      }, { status: 401 })
    }

    console.log('✅ Usuario autenticado:', session.user.email)

    // Obtener datos del formulario
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null

    console.log('📦 Datos recibidos:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      productId: productId || 'null/temp'
    })

    // Validaciones - SOLO el archivo es requerido
    if (!file) {
      console.error('❌ Falta archivo')
      return NextResponse.json({ 
        error: 'Falta archivo requerido' 
      }, { status: 400 })
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ Archivo muy grande:', file.size)
      return NextResponse.json({ 
        error: `Archivo muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 5MB` 
      }, { status: 400 })
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      console.error('❌ Tipo de archivo inválido:', file.type)
      return NextResponse.json({ 
        error: 'Solo se permiten imágenes (JPG, PNG, WebP)' 
      }, { status: 400 })
    }

    // Generar nombre único para el archivo
    // Si no hay productId, usar 'temp' como carpeta temporal
    const folder = productId || 'temp'
    const fileExt = file.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const fileName = `${folder}/${timestamp}-${random}.${fileExt}`

    console.log('📝 Nombre generado para archivo:', fileName)

    // Convertir archivo a buffer
    console.log('🔄 Convirtiendo archivo a buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('✅ Buffer creado, tamaño:', buffer.length)

    // Subir a Supabase Storage
    console.log('☁️ Subiendo a Supabase Storage...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ Error al subir a Storage:', {
        message: uploadError.message,
        name: uploadError.name,
        cause: uploadError.cause
      })
      return NextResponse.json({ 
        error: `Error al subir archivo: ${uploadError.message}` 
      }, { status: 500 })
    }

    console.log('✅ Archivo subido a Storage:', uploadData.path)

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    console.log('🔗 URL pública generada:', publicUrl)

    // Si NO hay productId, solo retornar la URL (imagen temporal)
    if (!productId) {
      console.log('⚠️ Sin productId - retornando solo URL temporal')
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: file.name,
        storage_path: fileName,
        is_temp: true
      })
    }

    // Si HAY productId, guardar en base de datos
    console.log('💾 Guardando en base de datos con productId:', productId)

    // Obtener el siguiente order_index
    const { data: existingImages } = await supabase
      .from('product_images')
      .select('order_index')
      .eq('product_id', productId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrderIndex = existingImages && existingImages.length > 0 
      ? existingImages[0].order_index + 1 
      : 0

    // Verificar si es la primera imagen
    const { count } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const isPrimary = (count ?? 0) === 0

    // Guardar metadata en la base de datos
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
      console.error('❌ Error al guardar en DB:', dbError)

      // Rollback: Eliminar archivo del storage
      await supabase.storage
        .from('product-images')
        .remove([fileName])
      
      return NextResponse.json({ 
        error: `Error al guardar en base de datos: ${dbError.message}`,
        code: dbError.code,
        hint: dbError.hint
      }, { status: 500 })
    }

    console.log('✅ Imagen guardada exitosamente')
    console.log('🎉 ===== UPLOAD COMPLETADO EXITOSAMENTE =====')

    return NextResponse.json({
      success: true,
      image: {
        id: imageData.id,
        url: imageData.url,
        filename: imageData.filename,
        order_index: imageData.order_index,
        is_primary: imageData.is_primary
      }
    })

  } catch (error) {
    console.error('💥 ===== ERROR INESPERADO EN UPLOAD =====')
    console.error('Error details:', error)
    
    return NextResponse.json(
      { 
        error: 'Error inesperado en el servidor',
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}