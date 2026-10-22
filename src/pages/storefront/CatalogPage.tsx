import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../../components/storefront/ProductCard'
import { ProductGridSkeleton } from '../../components/storefront/ProductSkeleton'
import { FiltersBar } from '../../components/storefront/FiltersBar'
import { CategoryPills } from '../../components/storefront/CategoryPills'
import { getProducts } from '../../api/products.api'
import { extractErrorMessage } from '../../api/client'
import type { Product } from '../../types/product'
import type { PaginationMeta } from '../../types/api'
import { ShoppingBag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentSize = searchParams.get('size') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchCatalog = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getProducts({
          page: currentPage,
          limit: 12,
          category: currentCategory || undefined,
          size: currentSize || undefined,
          search: currentSearch || undefined,
        })

        if (isMounted) {
          setProducts(res.data || [])
          setPagination(res.pagination || null)
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

    fetchCatalog()
    window.scrollTo({ top: 0, behavior: 'smooth' })

    return () => {
      isMounted = false
    }
  }, [currentCategory, currentSize, currentSearch, currentPage])

  // Update query params helper
  const updateQuery = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    // Always reset to page 1 on filter change
    next.set('page', '1')
    setSearchParams(next)
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', newPage.toString())
    setSearchParams(next)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Category Quick Navigation */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 tracking-tight mb-2">
          {currentCategory ? `${currentCategory.toUpperCase()} Collection` : 'All Garments'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Engineered streetwear and luxury essentials. Crafted with precision.
        </p>
        <CategoryPills
          activeCategory={currentCategory}
          onSelectCategory={(cat) => updateQuery('category', cat)}
        />
      </div>

      {/* Filter and Search Bar */}
      <FiltersBar
        selectedCategory={currentCategory}
        selectedSize={currentSize}
        searchQuery={currentSearch}
        totalCount={pagination?.total}
        onCategoryChange={(cat) => updateQuery('category', cat)}
        onSizeChange={(size) => updateQuery('size', size)}
        onClearFilters={handleClearFilters}
      />

      {/* Main Grid View */}
      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : error ? (
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Failed to load catalog</p>
            <p className="text-xs text-amber-800 mt-1">{error}</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 font-serif">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn&apos;t find any items matching your current filters. Try resetting your search or filter tags.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-900">{pagination.page}</span> of{' '}
                <span className="font-bold text-slate-900">{pagination.totalPages}</span> (
                {pagination.total} items)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                    // Show first, last, current, and neighbors
                    if (
                      p === 1 ||
                      p === pagination.totalPages ||
                      (p >= pagination.page - 1 && p <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                            p === pagination.page
                              ? 'bg-slate-950 text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    }
                    if (p === pagination.page - 2 || p === pagination.page + 2) {
                      return (
                        <span key={p} className="px-1 text-slate-400 text-xs">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
