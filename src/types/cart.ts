import type { Product } from './product'

export interface CartItem {
  id: string // product_id-size-color
  product: Product
  size?: string
  color?: string
  quantity: number
  price: number
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

export interface AddToCartParams {
  product: Product
  size?: string
  color?: string
  quantity?: number
}