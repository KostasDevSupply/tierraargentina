import { cache } from "react"
import { createClient } from "../supabase/server"

export const searchProducts = cache(async (query: string, limit = 10) => {
  const supabase = await createClient()

  // Usar la función SQL optimizada
  return supabase.rpc('search_products', {
    search_query: query,
    limit_count: limit,
  })
})

export const getSearchSuggestions = cache(async (query: string, limit = 5) => {
  const supabase = await createClient()

  return supabase
    .from('search_suggestions')
    .select('query, result_count')
    .ilike('query', `${query}%`)
    .order('search_count', { ascending: false })
    .limit(limit)
})