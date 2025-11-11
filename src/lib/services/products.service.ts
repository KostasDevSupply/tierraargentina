import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { Product, ProductWithRelations } from '@/types'

// ✅ Cache en React para evitar duplicar queries
export const getProducts = cache(async (filters?: {
  categorySlug?: string
  typeSlug?: string
  search?: string
  order?: 'reciente' | 'precio-asc' | 'precio-desc' | 'nombre'
  limit?: number
  isActive?: boolean
}) => {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      price,
      short_description,
      created_at,
      category:categories!inner(id, name, slug, icon),
      type:types(id, name, slug),
      images:product_images(url, is_primary)
    `,
      { count: 'exact' }
    )

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  if (filters?.categorySlug) {
    query = query.eq('category.slug', filters.categorySlug)
  }

  if (filters?.typeSlug) {
    query = query.eq('type.slug', filters.typeSlug)
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,category.name.ilike.%${filters.search}%`
    )
  }

  switch (filters?.order) {
    case 'precio-asc':
      query = query.order('price', { ascending: true, nullsFirst: false })
      break
    case 'precio-desc':
      query = query.order('price', { ascending: false, nullsFirst: false })
      break
    case 'nombre':
      query = query.order('name', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  return query
})

export const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createClient()

  return supabase
    .from('products')
    .select(
      `
      *,
      category:categories(id, name, slug, icon),
      type:types(id, name, slug),
      sizes:product_sizes(size, order_index, stock, in_stock),
      images:product_images(id, url, filename, order_index, is_primary)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
})

export const getRelatedProducts = cache(
  async (categoryId: string, excludeId: string, limit = 4) => {
    const supabase = await createClient()

    return supabase
      .from('products')
      .select(
        `
      id,
      name,
      slug,
      price,
      short_description,
      category:categories(name, slug),
      type:types(name, slug),
      images:product_images(url, is_primary)
    `
      )
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', excludeId)
      .limit(limit)
  }
)