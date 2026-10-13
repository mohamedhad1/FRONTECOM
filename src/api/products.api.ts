/**
 * src/api/products.api.ts
 *
 * Product API functions matching the backend routes in src/routes/product.routes.ts
 */

import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse } from '../types/api'
import type {
  Product,
  GetProductsQueryParams,
  CreateProductInput,
  UpdateProductInput,
} from '../types/product'

/**
 * Public: Fetch paginated active products with optional filters
 * Route: GET /api/products
 */
export async function getProducts (
  params?: GetProductsQueryParams,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>('/api/products', {
    params,
  })
  return response.data
}

/**
 * Public: Fetch a single active product by its MongoDB ObjectId
 * Route: GET /api/products/:id
 */
export async function getProductById (id: string): Promise<ApiResponse<Product>> {
  const response = await apiClient.get<ApiResponse<Product>>(`/api/products/${id}`)
  return response.data
}

/**
 * Admin: Fetch all products including inactive ones
 * Route: GET /api/products/admin/all
 */
export async function getAdminProducts (
  params?: GetProductsQueryParams,
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>('/api/products/admin/all', {
    params: {
      ...params,
      includeInactive: true,
    },
  })
  return response.data
}

/**
 * Admin: Create a new product
 * Route: POST /api/products
 */
export async function createProduct (
  input: CreateProductInput,
): Promise<ApiResponse<Product>> {
  const response = await apiClient.post<ApiResponse<Product>>('/api/products', input)
  return response.data
}

/**
 * Admin: Full product update
 * Route: PUT /api/products/:id
 */
export async function updateProduct (
  id: string,
  input: CreateProductInput,
): Promise<ApiResponse<Product>> {
  const response = await apiClient.put<ApiResponse<Product>>(`/api/products/${id}`, input)
  return response.data
}

/**
 * Admin: Partial product update
 * Route: PATCH /api/products/:id
 */
export async function patchProduct (
  id: string,
  input: UpdateProductInput,
): Promise<ApiResponse<Product>> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/api/products/${id}`, input)
  return response.data
}

/**
 * Admin: Toggle product active/inactive status
 * Route: PATCH /api/products/:id/toggle
 */
export async function toggleProductActive (id: string): Promise<ApiResponse<Product>> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/api/products/${id}/toggle`)
  return response.data
}

/**
 * Admin: Update product inventory stock count
 * Route: PATCH /api/products/:id/stock
 */
export async function updateProductStock (
  id: string,
  stock: number,
): Promise<ApiResponse<Product>> {
  const response = await apiClient.patch<ApiResponse<Product>>(`/api/products/${id}/stock`, {
    stock,
  })
  return response.data
}

/**
 * Admin: Permanently delete a product
 * Route: DELETE /api/products/:id
 */
export async function deleteProduct (id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(`/api/products/${id}`)
  return response.data
}
