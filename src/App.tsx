import { useEffect, useState } from 'react'
import { getProducts } from './api/products.api'
import { extractErrorMessage } from './api/client'
import type { Product } from './types/product'
import type { PaginationMeta } from './types/api'
import { authStorage } from './utils/authStorage'
import { CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck, RefreshCw } from 'lucide-react'

export function App () {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'Not Configured (Relative)'
  const hasToken = authStorage.isAuthenticated()

  const fetchCatalog = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getProducts({ page: 1, limit: 12 })
      setProducts(response.data || [])
      setPagination(response.pagination || null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCatalog()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Banner */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              E
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">PROJECT-ECOM</h1>
              <p className="text-xs text-slate-500 font-medium">Phase 1 Foundation — React 19 + Vite + Tailwind v4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Frontend Initialized
            </span>
            {hasToken ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Session Active
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Verification Status Card */}
        <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Phase 1 Setup & Integration Verification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block uppercase font-semibold">Configured API Base</span>
              <span className="font-mono text-xs text-slate-800 break-all">{apiBaseUrl}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block uppercase font-semibold">Backend Route Contract</span>
              <span className="font-mono text-xs text-slate-800">GET /api/products</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block uppercase font-semibold">Auth Strategy</span>
              <span className="text-xs text-slate-800 font-medium">Stateless Bearer JWT via Axios Interceptor</span>
            </div>
          </div>
        </section>

        {/* Live Catalog Preview */}
        <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                Live Products Catalog API Test
              </h3>
              <p className="text-xs text-slate-500">Live response from the connected backend</p>
            </div>
            <button
              onClick={fetchCatalog}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-3 text-slate-500" />
              <p className="text-sm font-medium">Fetching catalog from backend...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">API Request Notice</p>
                <p className="text-xs mt-1 text-amber-800">{error}</p>
                <p className="text-xs text-amber-700 mt-2">
                  (If the remote Vercel domain has Deployment Protection SSO enabled, configure your production domain or local backend URL in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>).
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Catalog is connected and ready</p>
              <p className="text-xs text-slate-400 mt-1">
                Database returned 0 active products (Total: {pagination?.total ?? 0}).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((item) => (
                <div key={item._id} className="border border-slate-200 rounded-lg p-3 bg-slate-50 hover:shadow-md transition">
                  <div className="aspect-square bg-slate-200 rounded-md mb-2 overflow-hidden flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No Image</span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{item.category}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{item.price} MAD</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          PROJECT-ECOM — Frontend Foundation Verified | Phase 1 Completed
        </div>
      </footer>
    </div>
  )
}

export default App
