/**
 * src/types/api.ts
 * Standard envelope types matching the backend's src/utils/ApiResponse.ts
 */

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Array<{ field?: string; message: string }>
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  message?: string
  data: T[]
  pagination: PaginationMeta
}
