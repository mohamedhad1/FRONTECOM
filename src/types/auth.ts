/**
 * src/types/auth.ts
 * Auth types matching backend auth controller & service responses
 */

export interface AdminUser {
  id: string
  email: string
}

export interface LoginResponseData {
  token: string
  admin: AdminUser
  expiresIn: string
}

export interface LoginCredentials {
  email: string
  password: string
}
