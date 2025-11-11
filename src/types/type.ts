export interface Type {
  id: string
  name: string
  slug: string
  order_index: number
  is_active: boolean
  user_created: boolean
  created_at: string
  updated_at?: string
}