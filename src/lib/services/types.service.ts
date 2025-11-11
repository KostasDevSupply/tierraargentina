import { cache } from "react"
import { createClient } from "../supabase/server"

export const getTypes = cache(async () => {
  const supabase = await createClient()

  return supabase
    .from('types')
    .select('id, name, slug, order_index, user_created')
    .order('order_index')
})