import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import type { Product, ProductCategory, ProductSize, CreateProductInput } from '../../types/product'
import { VALID_CATEGORIES, VALID_SIZES } from '../../types/product'
import { createProduct, updateProduct } from '../../api/products.api'
import { extractErrorMessage } from '../../api/client'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (product: Product, isEdit: boolean) => void
  productToEdit?: Product | null
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}) => {
  const isEdit = Boolean(productToEdit)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [discount, setDiscount] = useState<number | ''>(0)
  const [stock, setStock] = useState<number | ''>(10)
  const [category, setCategory] = useState<ProductCategory>('hoodies')
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>(['M', 'L', 'XL'])
  const [colorsInput, setColorsInput] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '')
      setDescription(productToEdit.description || '')
      setPrice(productToEdit.price ?? '')
      setDiscount(productToEdit.discount ?? 0)
      setStock(productToEdit.stock ?? 0)
      setCategory(productToEdit.category || 'hoodies')
      setSelectedSizes(productToEdit.sizes || [])
      setColorsInput(productToEdit.colors ? productToEdit.colors.join(', ') : '')
      setImageUrls(productToEdit.images && productToEdit.images.length > 0 ? productToEdit.images : [''])
      setIsActive(productToEdit.isActive ?? true)
    } else {
      // Default new product values
      setName('')
      setDescription('')
      setPrice('')
      setDiscount(0)
      setStock(15)
      setCategory('hoodies')
      setSelectedSizes(['S', 'M', 'L', 'XL'])
      setColorsInput('Black, Charcoal')
      setImageUrls([''])
      setIsActive(true)
    }
    setError(null)
  }, [productToEdit, isOpen])

  if (!isOpen) return null

  const handleToggleSize = (size: ProductSize) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size))
    } else {
      setSelectedSizes([...selectedSizes, size])
    }
  }

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls]
    updated[index] = value
    setImageUrls(updated)
  }

  const handleAddImageUrl = () => {
    if (imageUrls.length < 10) {
      setImageUrls([...imageUrls, ''])
    }
  }

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length <= 1) {
      setImageUrls([''])
    } else {
      setImageUrls(imageUrls.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Product name is required.')
      return
    }
    if (price === '' || Number(price) <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    const filteredImages = imageUrls.map((url) => url.trim()).filter(Boolean)
    const parsedColors = colorsInput
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean)

    const payload: CreateProductInput = {
      name: name.trim(),
      description: description.trim() || 'Premium garment designed with meticulous attention to detail.',
      price: Number(price),
      discount: discount === '' ? 0 : Math.min(100, Math.max(0, Number(discount))),
      stock: stock === '' ? 0 : Math.max(0, Number(stock)),
      category,
      sizes: selectedSizes,
      colors: parsedColors,
      images: filteredImages,
      isActive,
    }

    setLoading(true)
    setError(null)

    try {
      if (isEdit && productToEdit) {
        const response = await updateProduct(productToEdit._id, payload)
        onSuccess(response.data, true)
      } else {
        const response = await createProduct(payload)
        onSuccess(response.data, false)
      }
      onClose()
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isEdit ? 'Edit Product' : 'Add New Garment'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? `Updating "${productToEdit?.name}" details & inventory`
                  : 'Add a new clothing item to the active online catalog'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Heavyweight Oversized Hoodie"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
              />
            </div>

            {/* Category & Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition capitalize"
                >
                  {VALID_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Price (MAD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="349.00"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Stock & Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Inventory Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Colors <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="Black, Vintage Gray, Beige"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Sizes Multi-select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {VALID_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-density French terry cotton with relaxed dropped shoulders..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition resize-none"
              />
            </div>

            {/* Image URLs & Live Previews */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Image URLs <span className="text-slate-400 font-normal">(up to 10 images)</span>
                </label>
                {imageUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Image URL</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {/* Thumbnail preview */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {url.trim() ? (
                        <img
                          src={url}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-slate-950 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className="text-xs font-semibold text-slate-800">
                Visible on Storefront (Active)
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
