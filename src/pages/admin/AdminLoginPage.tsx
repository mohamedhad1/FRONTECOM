import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../store/auth.context'
import { extractErrorMessage } from '../../api/client'
import { Shield, Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      await login({ email: email.trim(), password })
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg = extractErrorMessage(err)
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header / Storefront Link */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
        <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
          Portal v2.4 • Secured
        </span>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo / Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">
              Admin Authentication
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to manage clothing inventory, prices &amp; catalog status
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex gap-3 items-start animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourstore.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-400 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Security & Rate Limiting Disclaimer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Protected by IP rate limiting (10 attempts / 15m) &amp; JWT stateless verification.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-600">
        © {CURRENT_YEAR} ATELIER ECOM — Internal Administrative Gateway
      </div>
    </div>
  )
}
