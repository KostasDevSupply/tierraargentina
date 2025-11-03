// ============================================
// DATABASE TYPES
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Type {
  id: string
  name: string
  slug: string
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string | null
  price: number
  category_id: string | null
  type_id: string | null
  features: string[] | null
  notes: string | null
  pdf_pages: string | null
  is_active: boolean
  is_featured: boolean
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order'
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  
  // Relaciones (cuando haces JOIN)
  category?: Category
  type?: Type
  images?: ProductImage[]
  sizes?: ProductSize[]
}

export interface ProductSize {
  id: string
  product_id: string
  size: string
  order_index: number
  is_available: boolean
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  url: string
  filename: string
  size_bytes: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  order_index: number
  is_primary: boolean
  created_at: string
}

// ============================================
// FRONTEND TYPES
// ============================================

export interface CartItem {
  productId: string
  name: string
  price: number
  size: string
  quantity: number
  image: string
  slug: string
}

export interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}