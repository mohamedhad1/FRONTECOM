/**
 * src/api/client.ts
 *
 * Centralized Axios HTTP client.
 * Features:
 * - Configured baseURL from VITE_API_BASE_URL
 * - Auto-injection of Authorization Bearer header if token exists
 * - Response error interceptor that handles 401 Unauthorized (auto-clears session)
 * - Normalized error extraction for UI alerts
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authStorage } from '../utils/authStorage'
import type { ApiErrorResponse } from '../types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Attach JWT Bearer Token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: Handle Global 401s & Normalize Error Messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token is expired, invalid, or missing
      authStorage.clearSession()
      // Dispatch a custom event so the UI AuthProvider can immediately sync state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }
    return Promise.reject(error)
  },
)

/**
 * Extracts a clean, human-readable error string from an Axios error
 */
export function extractErrorMessage (error: unknown, defaultMessage = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const errData = error.response?.data as ApiErrorResponse | undefined
    if (errData?.message) {
      return errData.message
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return defaultMessage
}
