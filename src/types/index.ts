// types/index.ts

// ============================================
// DATABASE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      products: Product
      categories: Category
      types: Type
      product_sizes: ProductSize
      product_images: ProductImage
      announcement_bar: AnnouncementBar
      site_settings: SiteSetting
      search_suggestions: SearchSuggestion
      audit_log: AuditLog
    }
  }
}

// ============================================
// PRODUCTS
// ============================================

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  notes: string | null
  category_id: string
  type_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithRelations extends Product {
  category: Category
  type: Type | null
  sizes: ProductSize[]
  images: ProductImage[]
}

export interface ProductFormData {
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  notes?: string
  category_id: string
  type_id?: string
  is_active: boolean
}

// ============================================
// CATEGORIES & TYPES
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  order_index: number
  user_created: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Type {
  id: string
  name: string
  slug: string
  order_index: number
  user_created: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CategoryFormData {
  name: string
  slug: string
  icon?: string
  order_index: number
}

export interface TypeFormData {
  name: string
  slug: string
  order_index: number
}

// ============================================
// PRODUCT SIZES & IMAGES
// ============================================

export interface ProductSize {
  id?: string
  product_id?: string
  size: string
  order_index: number
  stock: number | null
  in_stock: boolean
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  filename: string
  order_index: number
  is_primary: boolean
  created_at: string
}

// ============================================
// SITE SETTINGS
// ============================================

export interface AnnouncementBar {
  id: string
  message: string
  is_active: boolean
  background_color: string
  text_color: string
  link_url: string | null
  link_text: string | null
  created_at: string
  updated_at: string
}

export interface AnnouncementBarFormData {
  message: string
  is_active: boolean
  background_color?: string
  text_color?: string
  link_url?: string
  link_text?: string
}

export interface SiteSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: string
  updated_at: string
}

export interface SiteSettings {
  contact_email: string
  contact_phone: string
  whatsapp_number: string
  whatsapp_mayorista_message: string
  contact_address: string
  contact_map_lat: string
  contact_map_lng: string
  business_hours: string
}

// ============================================
// SEARCH
// ============================================

export interface SearchSuggestion {
  id: string
  query: string
  result_count: number
  search_count: number
  last_searched: string
}

export interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  category_name: string
  image_url: string
  relevance: number
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'create' | 'update' | 'delete' | 'toggle'
  changed_by: string | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  created_at: string
}

// ============================================
// CART (Client-side)
// ============================================

export interface CartItem {
  productId: string
  name: string
  slug: string
  price: number
  size: string | null
  quantity: number
  image: string | null
  category?: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

// ============================================
// FILTERS
// ============================================

export interface ProductFilters {
  categoria?: string
  tipo?: string
  buscar?: string
  orden?: 'reciente' | 'precio-asc' | 'precio-desc' | 'nombre'
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// COMPONENT PROPS (GENÉRICOS)
// ============================================

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    short_description?: string
    category?: {
      name: string
      slug: string
    }
    images?: Array<{
      url: string
      is_primary: boolean
    }>
  }
}

export interface CategoryCardProps {
  category: Category
  productCount?: number
}

// ============================================
// FORM STATES
// ============================================

export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isSuccess: boolean
}

export interface ValidationError {
  field: string
  message: string
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  totalCategories: number
  totalTypes: number
  recentOrders: number
}

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

export interface TableAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'primary' | 'secondary' | 'danger'
  show?: (item: T) => boolean
}

// ============================================
// MODAL TYPES
// ============================================

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export interface ConfirmModalProps extends ModalProps {
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncFunction<T = void> = () => Promise<T>
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}