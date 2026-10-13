/**
 * src/api/auth.api.ts
 *
 * Authentication API functions matching src/routes/auth.routes.ts
 */

import { apiClient } from './client'
import { authStorage } from '../utils/authStorage'
import type { ApiResponse } from '../types/api'
import type { AdminUser, LoginCredentials, LoginResponseData } from '../types/auth'

/**
 * Public: Log in administrator using email & password
 * Route: POST /api/auth/login
 */
export async function loginAdmin (credentials: LoginCredentials): Promise<LoginResponseData> {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    '/api/auth/login',
    credentials,
  )

  const data = response.data.data
  // Persist the token and admin profile in storage
  if (data?.token && data?.admin) {
    authStorage.setSession(data.token, data.admin)
  }

  return data
}

/**
 * Protected: Validate current token and fetch administrator profile
 * Route: GET /api/auth/me
 */
export async function getMe (): Promise<ApiResponse<AdminUser>> {
  const response = await apiClient.get<ApiResponse<AdminUser>>('/api/auth/me')
  return response.data
}

/**
 * Client-side logout
 */
export function logoutAdmin (): void {
  authStorage.clearSession()
}
