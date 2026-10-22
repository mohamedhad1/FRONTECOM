import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  ShoppingBag,
} from 'lucide-react'
import { useAuth } from '../../store/auth.context'
import type { Product } from '../../types/product'
import { VALID_CATEGORIES } from '../../types/product'
import { getAdminProducts, toggleProductActive } from '../../api/products.api'
import { extractErrorMessage } from '../../api/client'
import { formatPrice, calculateDiscountPrice, formatCategoryName } from '../../utils/formatters'
import { ProductFormModal } from '../../components/admin/ProductFormModal'
import { QuickStockModal } from '../../components/admin/QuickStockModal'
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal'

export const AdminDashboardPage: React.FC = () => {
  const { admin, logout } = useAuth()

  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)

  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [productForStock, setProductForStock] = useState<Product | null>(null)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAdminProducts({
        limit: 50,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        includeInactive: true,
      })

      if (response && response.data) {
        setProducts(response.data)
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const showNotification = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  // Handle Inline Active Toggle
  const handleToggleActive = async (product: Product) => {
    setTogglingId(product._id)
    try {
      const response = await toggleProductActive(product._id)
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? response.data : p))
      )
      showNotification(`"${product.name}" is now ${response.data.isActive ? 'Active' : 'Inactive'}.`)
    } catch (err: unknown) {
      alert(extractErrorMessage(err))
    } finally {
      setTogglingId(null)
    }
  }

  // Modal handlers
  const handleOpenCreateModal = () => {
    setProductToEdit(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product)
    setIsFormModalOpen(true)
  }

  const handleOpenStockModal = (product: Product) => {
    setProductForStock(product)
    setIsStockModalOpen(true)
  }

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  // Success callbacks
  const handleProductSaved = (savedProduct: Product, isEdit: boolean) => {
    if (isEdit) {
      setProducts((prev) => prev.map((p) => (p._id === savedProduct._id ? savedProduct : p)))
      showNotification(`Updated "${savedProduct.name}" successfully.`)
    } else {
      setProducts((prev) => [savedProduct, ...prev])
      showNotification(`Created "${savedProduct.name}" successfully.`)
    }
  }

  const handleStockUpdated = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)))
    showNotification(`Stock updated to ${updatedProduct.stock} for "${updatedProduct.name}".`)
  }

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== deletedId))
    showNotification('Product deleted permanently.')
  }

  // Filtered view
  const filteredProducts = products.filter((p) => {
    if (statusFilter === 'active') return p.isActive
    if (statusFilter === 'inactive') return !p.isActive
    return true
  })

  // Metric computations
  const totalCount = products.length
  const activeCount = products.filter((p) => p.isActive).length
  const lowStockCount = products.filter((p) => p.stock <= 3).length
  const uniqueCategoriesCount = new Set(products.map((p) => p.category)).size

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow-sm">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight block leading-none">
                ATELIER ECOM
              </span>
              <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-mono">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] truncate max-w-[150px]">{admin?.email}</span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Notice */}
        {notice && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-700/80 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Dashboard Title & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Product Inventory &amp; Catalog
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live database control for prices, active status, and clothing variants
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Garment</span>
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Pieces</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-950">{totalCount}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live in Store</span>
              <Eye className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-amber-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low Stock (&le; 3)</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-600">{lowStockCount}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Categories</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-950">{uniqueCategoriesCount}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search garments by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 capitalize focus:outline-hidden focus:border-slate-950"
            >
              <option value="all">All Categories</option>
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {formatCategoryName(cat)}
                </option>
              ))}
            </select>

            {/* Status Segment */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-slate-950"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={fetchProducts}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              title="Refresh Catalog"
              aria-label="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2 items-center">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Garment</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Sizes</th>
                  <th className="py-3.5 px-4 text-center">Active Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-900" />
                      <span>Loading garments from database...</span>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-800">No products found</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                        Your catalog has no matching garments. Create your first clothing piece to see it live on the storefront.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Garment</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const finalPrice = calculateDiscountPrice(product.price, product.discount)
                    const isToggling = togglingId === product._id

                    return (
                      <tr key={product._id} className="hover:bg-slate-50/60 transition">
                        {/* Image & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover object-center"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ShoppingBag className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                                {product.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                /{product.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                            {formatCategoryName(product.category)}
                          </span>
                        </td>

                        {/* Pricing */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {formatPrice(finalPrice)}
                            </span>
                            {product.discount > 0 && (
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="text-slate-400 line-through">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="font-bold text-rose-600">
                                  -{product.discount}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleOpenStockModal(product)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-400 bg-white transition group"
                            title="Click to quickly update stock"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                product.stock === 0
                                  ? 'bg-rose-500'
                                  : product.stock <= 3
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-bold text-slate-800">{product.stock}</span>
                            <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-slate-700" />
                          </button>
                        </td>

                        {/* Sizes */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {product.sizes?.map((size) => (
                              <span
                                key={size}
                                className="px-1 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-semibold"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Active Switch */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(product)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                              product.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : product.isActive ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition"
                              title="Edit product details"
                              aria-label="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(product)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete product"
                              aria-label="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        onSuccess={handleProductSaved}
      />

      <QuickStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={productForStock}
        onSuccess={handleStockUpdated}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={productToDelete}
        onSuccess={handleProductDeleted}
      />
    </div>
  )
}
