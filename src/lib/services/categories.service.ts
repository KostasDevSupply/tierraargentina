import { cache } from "react"
import { createClient } from "../supabase/server"

export const getCategories = cache(async () => {
  const supabase = await createClient()

  return supabase
    .from('categories')
    .select('id, name, slug, icon, order_index, user_created')
    .order('order_index')
})

export const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = await createClient()

  return supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
})