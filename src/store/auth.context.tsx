import React, { createContext, useContext, useEffect, useState } from 'react'
import { authStorage } from '../utils/authStorage'
import { loginAdmin, getMe, logoutAdmin } from '../api/auth.api'
import type { AdminUser, LoginCredentials } from '../types/auth'

interface AuthContextValue {
  admin: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AdminUser>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(authStorage.getToken)
  const [admin, setAdmin] = useState<AdminUser | null>(authStorage.getAdminUser)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Validate session on mount
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      const storedToken = authStorage.getToken()
      if (!storedToken) {
        if (isMounted) {
          setAdmin(null)
          setToken(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const response = await getMe()
        if (isMounted && response?.data) {
          setAdmin(response.data)
          setToken(storedToken)
        }
      } catch (err) {
        console.warn('[AuthContext] Session invalid or expired, resetting', err)
        authStorage.clearSession()
        if (isMounted) {
          setAdmin(null)
          setToken(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen for 401 unauthenticated events from Axios interceptor
    const handleUnauthorized = () => {
      if (isMounted) {
        setAdmin(null)
        setToken(null)
        setIsLoading(false)
      }
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      isMounted = false
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AdminUser> => {
    setIsLoading(true)
    try {
      const data = await loginAdmin(credentials)
      setToken(data.token)
      setAdmin(data.admin)
      return data.admin
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    logoutAdmin()
    setToken(null)
    setAdmin(null)
  }

  const refreshProfile = async () => {
    if (!token) return
    try {
      const res = await getMe()
      if (res?.data) {
        setAdmin(res.data)
      }
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(token && admin),
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
