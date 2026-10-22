import React, { useState, useEffect } from 'react'
import { X, Loader2, AlertCircle, Package } from 'lucide-react'
import type { Product } from '../../types/product'
import { updateProductStock } from '../../api/products.api'
import { extractErrorMessage } from '../../api/client'

interface QuickStockModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSuccess: (updatedProduct: Product) => void
}

export const QuickStockModal: React.FC<QuickStockModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [stock, setStock] = useState<number | ''>(product?.stock ?? 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setStock(product.stock)
      setError(null)
    }
  }, [product, isOpen])

  if (!isOpen || !product) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stock === '' || Number(stock) < 0) {
      setError('Stock must be a non-negative number.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await updateProductStock(product._id, Number(stock))
      onSuccess(response.data)
      onClose()
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Stock</h3>
                <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Available Inventory Units
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                autoFocus
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Setting to 0 will mark the product as "Sold Out" on the storefront.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
