import type { ProductSize } from './product'

export interface CartItem {
  /** Unique key generated from productId + size + color to avoid variant collisions */
  key: string
  productId: string
  name: string
  slug?: string
  price: number
  discount?: number
  effectivePrice: number
  imageUrl?: string
  category: string
  size?: ProductSize
  color?: string
  quantity: number
  maxStock: number
}

export interface CustomerCheckoutInfo {
  fullName: string
  phone: string
  city: string
  address: string
  notes?: string
}

export interface ValidationIssue {
  itemKey: string
  productName: string
  type: 'out_of_stock' | 'insufficient_stock' | 'price_changed' | 'product_unavailable'
  message: string
  oldPrice?: number
  newPrice?: number
  availableStock?: number
}
