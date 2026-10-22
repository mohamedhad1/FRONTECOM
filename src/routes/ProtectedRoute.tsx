import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth.context'
import { Loader2, Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
          <Shield className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : null
}
