/**
 * src/utils/authStorage.ts
 *
 * Centralized, secure storage manager for the Admin JWT token.
 *
 * SECURITY NOTE & TRADE-OFFS:
 * - The backend uses stateless Bearer authentication (`Authorization: Bearer <token>`).
 * - Storing the JWT in `localStorage` allows session persistence across page refreshes.
 * - Trade-off: Any token in localStorage is vulnerable if third-party scripts execute XSS.
 * - Mitigations implemented:
 *   1. Token is strictly scoped to administrative operations; no sensitive customer data is stored.
 *   2. The token is never exposed in logs or console output.
 *   3. Invalid/expired tokens are immediately cleared by the API client interceptor upon receiving 401.
 *   4. Backend secret keys (`JWT_SECRET`) are never in frontend environment variables.
 */

const TOKEN_KEY = 'ecom_admin_token'
const ADMIN_KEY = 'ecom_admin_user'

export const authStorage = {
  getToken (): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  setSession (token: string, admin: { id: string; email: string }): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
    } catch (err) {
      console.error('[authStorage] Failed to save admin session', err)
    }
  },

  getAdminUser (): { id: string; email: string } | null {
    try {
      const data = localStorage.getItem(ADMIN_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  clearSession (): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ADMIN_KEY)
    } catch (err) {
      console.error('[authStorage] Failed to clear session', err)
    }
  },

  isAuthenticated (): boolean {
    return Boolean(this.getToken())
  },
}
