import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroBanner } from '../../components/storefront/HeroBanner'
import { CategoryCardGrid } from '../../components/storefront/CategoryPills'
import { ProductCard } from '../../components/storefront/ProductCard'
import { ProductGridSkeleton } from '../../components/storefront/ProductSkeleton'
import { getProducts } from '../../api/products.api'
import { extractErrorMessage } from '../../api/client'
import type { Product } from '../../types/product'
import { Sparkles, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react'

export const HomePage: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchHomeProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getProducts({ page: 1, limit: 8 })
        if (isMounted) {
          setNewArrivals(res.data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchHomeProducts()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Showcase */}
      <HeroBanner />

      {/* Featured Category Banners */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore essential garments crafted for longevity and daily comfort
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <CategoryCardGrid />
      </div>

      {/* New Arrivals Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
                New Arrivals
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Fresh drops added to the seasonal catalog
              </p>
            </div>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Could not load new arrivals</p>
              <p className="text-xs text-amber-800 mt-1">{error}</p>
            </div>
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800 font-serif">No products active yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Our latest drop is currently being prepared. Check back shortly or log into the admin dashboard to add items.
            </p>
            <Link
              to="/admin/login"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
            >
              Add Product via Admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
