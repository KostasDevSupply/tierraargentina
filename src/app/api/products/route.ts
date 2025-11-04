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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  console.log('=== POST /api/products ===')
  
  const supabase = await getSupabaseClient()
  const cookieStore = await cookies()

  // Debug: mostrar cookies
  const allCookies = cookieStore.getAll()
  console.log('Cookies available:', allCookies.map(c => c.name))

  // Verificar autenticación
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  console.log('Auth check:', { 
    hasSession: !!session, 
    sessionError: sessionError?.message,
    user: session?.user?.email,
    userId: session?.user?.id
  })

  if (sessionError) {
    console.error('Session error:', sessionError)
    return NextResponse.json({ 
      error: 'Error de autenticación', 
      details: sessionError.message 
    }, { status: 401 })
  }

  if (!session) {
    console.error('No session found')
    return NextResponse.json({ 
      error: 'No autorizado - Por favor inicia sesión nuevamente' 
    }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productData, sizes } = body

    console.log('Request body received:', { 
      hasProductData: !!productData, 
      hasSizes: !!sizes,
      sizesCount: sizes?.length 
    })

    // Validaciones
    if (!productData?.name || !productData?.category_id) {
      return NextResponse.json({ 
        error: 'Faltan datos obligatorios (nombre o categoría)' 
      }, { status: 400 })
    }

    if (!sizes || sizes.length === 0) {
      return NextResponse.json({ 
        error: 'Debes agregar al menos un talle' 
      }, { status: 400 })
    }

    // Verificar slug único
    console.log('Checking slug uniqueness:', productData.slug)
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .maybeSingle()

    if (existingProduct) {
      console.log('Slug already exists:', existingProduct.id)
      return NextResponse.json({ 
        error: 'Ya existe un producto con ese nombre. Prueba con otro nombre.' 
      }, { status: 400 })
    }

    // Crear producto
    console.log('Creating product...')
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
      console.error('Product creation error:', productError)
      return NextResponse.json({ 
        error: `Error al crear producto: ${productError.message}`,
        code: productError.code
      }, { status: 500 })
    }

    console.log('Product created successfully:', product.id)

    // Crear talles
    console.log('Creating sizes...')
    const sizesData = sizes.map((size: string, index: number) => ({
      product_id: product.id,
      size: size,
      order_index: index,
    }))

    const { error: sizesError } = await supabase
      .from('product_sizes')
      .insert(sizesData)

    if (sizesError) {
      console.error('Sizes creation error:', sizesError)
      // Rollback: eliminar producto
      await supabase.from('products').delete().eq('id', product.id)
      return NextResponse.json({ 
        error: `Error al crear talles: ${sizesError.message}` 
      }, { status: 500 })
    }

    console.log('Sizes created successfully')
    console.log('=== SUCCESS ===')

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Error inesperado en el servidor',
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productId, productData, sizes } = body

    // Verificar slug único (excepto el producto actual)
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .neq('id', productId)
      .maybeSingle()

    if (existingProduct) {
      return NextResponse.json({ 
        error: 'Ya existe otro producto con ese nombre' 
      }, { status: 400 })
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
      return NextResponse.json({ 
        error: `Error al actualizar: ${productError.message}` 
      }, { status: 500 })
    }

    // Eliminar y recrear talles
    await supabase.from('product_sizes').delete().eq('product_id', productId)

    if (sizes && sizes.length > 0) {
      const sizesData = sizes.map((size: string, index: number) => ({
        product_id: productId,
        size: size,
        order_index: index,
      }))

      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesData)

      if (sizesError) {
        return NextResponse.json({ 
          error: `Error al actualizar talles: ${sizesError.message}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}