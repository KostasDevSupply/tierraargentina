export interface ProductImage {
  id?: string
  url: string
  filename?: string
  storage_path?: string
  order_index: number
  is_primary: boolean
  size_bytes?: number
  mime_type?: string
  product_id?: string
  created_at?: string
}

export interface ProductSize {
  id?: string
  size: string
  in_stock: boolean
  order_index?: number
  product_id?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
  order_index: number
  is_active: boolean
}

export interface Type {
  id: string
  name: string
  slug: string
  order_index: number
  is_active: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string
  price: number
  category_id: string
  type_id?: string
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  category?: Category
  type?: Type
  images?: ProductImage[]
  sizes?: ProductSize[]
}