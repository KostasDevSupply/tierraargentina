export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
  order_index: number
  is_active: boolean
  user_created: boolean
  created_at: string
  updated_at?: string
}