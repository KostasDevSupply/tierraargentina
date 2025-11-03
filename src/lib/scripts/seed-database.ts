import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { 
  initialProducts, 
  extractCategoryFromName, 
  extractTypeFromName,
  mapToOfficialCategory 
} from '../data/initial-product'
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDatabase() {
  console.log('🌱 Iniciando migración de datos...\n')

  try {
    // 1. Obtener categorías y tipos
    console.log('📦 Obteniendo categorías y tipos...')
    const { data: categories } = await supabase.from('categories').select('*')
    const { data: types } = await supabase.from('types').select('*')

    if (!categories || !types) {
      throw new Error('No se pudieron obtener categorías o tipos')
    }

    console.log(`✅ ${categories.length} categorías encontradas`)
    console.log(`✅ ${types.length} tipos encontrados\n`)

    // 2. Crear productos
    console.log('📝 Creando productos...\n')

    for (const productData of initialProducts) {
      // Extraer categoría del nombre
      const extractedCategory = extractCategoryFromName(productData.name)
      const categoryName = mapToOfficialCategory(extractedCategory)
      
      const category = categories.find(c => c.name === categoryName)
      if (!category) {
        console.error(`❌ Categoría no encontrada para: ${productData.name}`)
        console.error(`   Extraído: "${extractedCategory}" → Mapeado: "${categoryName}"`)
        continue
      }

      // Extraer tipo del nombre
      const typeName = extractTypeFromName(productData.name)
      let type = null
      if (typeName) {
        type = types.find(t => t.name === typeName)
        if (!type) {
          console.error(`❌ Tipo no encontrado: ${typeName}`)
          continue
        }
      }

      // Crear slug
      const slug = productData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Preparar descripción (vacía por ahora, el cliente la completará)
      const description = `${productData.name}. Descripción pendiente de completar desde el panel de administración.`
      const shortDescription = productData.name

      // Preparar features basadas en lo que tenemos
      const features: string[] = []
      if (productData.notes) {
        features.push(productData.notes)
      }
      if (productData.colors) {
        features.push(`Colores disponibles: ${productData.colors.join(', ')}`)
      }
      features.push(`Talles: ${productData.sizes.join(', ')}`)

      // Insertar producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          slug: slug,
          description: description,
          short_description: shortDescription,
          price: productData.price,
          category_id: category.id,
          type_id: type?.id || null,
          features: features.length > 0 ? features : null,
          notes: productData.notes || null,
          pdf_pages: productData.pdfPages || null,
          is_active: true,
          is_featured: false,
          stock_status: 'in_stock'
        })
        .select()
        .single()

      if (productError) {
        console.error(`❌ Error creando ${productData.name}:`, productError.message)
        continue
      }

      console.log(`✅ ${product.name}`)
      console.log(`   Categoría: ${categoryName} | Tipo: ${typeName || 'Sin tipo'}`)

      // Insertar talles
      const sizesData = productData.sizes.map((size, index) => ({
        product_id: product.id,
        size: size,
        order_index: index,
        is_available: true
      }))

      const { error: sizesError } = await supabase
        .from('product_sizes')
        .insert(sizesData)

      if (sizesError) {
        console.error(`❌ Error creando talles:`, sizesError.message)
      } else {
        console.log(`   📏 ${productData.sizes.length} talles`)
      }

      console.log('')
    }

    console.log('🎉 Migración completada exitosamente!')
    console.log(`📊 Total de productos: ${initialProducts.length}`)

  } catch (error) {
    console.error('💥 Error en la migración:', error)
    process.exit(1)
  }
}

seedDatabase()