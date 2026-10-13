/**
 * src/types/product.ts
 * Strict product models matching backend Mongoose schema in src/models/Product.ts
 */

export const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE SIZE'] as const
export const VALID_CATEGORIES = [
  'tshirts',
  'hoodies',
  'pants',
  'jackets',
  'shorts',
  'dresses',
  'accessories',
] as const

export type ProductSize = (typeof VALID_SIZES)[number]
export type ProductCategory = (typeof VALID_CATEGORIES)[number]

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  sizes: ProductSize[]
  stock: number
  category: ProductCategory
  colors: string[]
  discount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GetProductsQueryParams {
  page?: number
  limit?: number
  category?: ProductCategory | string
  search?: string
  size?: ProductSize | string
  includeInactive?: boolean
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  category: ProductCategory
  stock?: number
  sizes?: ProductSize[]
  images?: string[]
  colors?: string[]
  discount?: number
  isActive?: boolean
}

export type UpdateProductInput = Partial<CreateProductInput>
