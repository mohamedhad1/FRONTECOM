import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById } from '../../api/products.api'
import { extractErrorMessage } from '../../api/client'
import type { Product, ProductSize } from '../../types/product'
import { formatPrice, calculateDiscountPrice, formatCategoryName } from '../../utils/formatters'
import { useCart } from '../../store/cart.context'
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowLeft,
  AlertCircle,
  Check,
  RefreshCw,
  Plus,
  Minus,
  MessageCircle,
} from 'lucide-react'

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const currency = import.meta.env.VITE_STORE_CURRENCY || 'MAD'
  const { addItem, openCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selection state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<ProductSize | ''>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [addedNotice, setAddedNotice] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const res = await getProductById(id)
        if (isMounted && res.data) {
          setProduct(res.data)
          // Default first size if available
          if (res.data.sizes && res.data.sizes.length > 0) {
            setSelectedSize(res.data.sizes[0])
          }
          if (res.data.colors && res.data.colors.length > 0) {
            setSelectedColor(res.data.colors[0])
          }
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

    fetchDetail()
    window.scrollTo({ top: 0, behavior: 'smooth' })

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[4/5] bg-slate-200 rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-24 w-full bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 inline-block max-w-md">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold font-serif">Product Not Found</h2>
          <p className="text-xs text-amber-800 mt-2">
            {error || 'This garment may be inactive or no longer available.'}
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    )
  }

  const finalPrice = calculateDiscountPrice(product.price, product.discount)
  const isOutOfStock = product.stock <= 0
  const maxAvailable = Math.min(product.stock, 10)

  const handleAddToCart = () => {
    if (!product) return
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size first')
      return
    }

    const success = addItem(product, {
      size: (selectedSize as ProductSize) || undefined,
      color: selectedColor || undefined,
      quantity,
    })

    if (success) {
      setAddedNotice(true)
      setTimeout(() => setAddedNotice(false), 2000)
      openCart()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-slate-900">
          Catalog
        </Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category}`} className="hover:text-slate-900 capitalize">
          {formatCategoryName(product.category)}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Image Gallery & Stage (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[560px] pb-2 sm:pb-0 scrollbar-none">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    selectedImageIndex === idx
                      ? 'border-slate-950 ring-1 ring-slate-950'
                      : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}

          {/* Primary Viewport Image */}
          <div className="flex-1 aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
            {product.images?.[selectedImageIndex] ? (
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
                <span className="text-xs font-semibold">Image placeholder</span>
              </div>
            )}

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md shadow">
                Save {product.discount}%
              </div>
            )}
          </div>
        </div>

        {/* Right: Details & Purchase Actions (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Category Tag */}
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            {formatCategoryName(product.category)}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-950 tracking-tight leading-snug mb-3">
            {product.name}
          </h1>

          {/* Price Block */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-200">
            {product.discount > 0 ? (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-serif">
                  {formatPrice(finalPrice, currency)}
                </span>
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.price, currency)}
                </span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-serif">
                {formatPrice(product.price, currency)}
              </span>
            )}
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Cash on Delivery
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Details</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Select Size
                </span>
                <span className="text-xs text-slate-400">Regular fit</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 text-xs font-bold rounded-lg border transition ${
                        isSelected
                          ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Colors (if present) */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
                Colorways
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition ${
                        isSelected
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock & Quantity */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-1">
                Quantity
              </span>
              <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-slate-600 hover:text-slate-950 disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-xs text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                  disabled={quantity >= maxAvailable || isOutOfStock}
                  className="p-2 text-slate-600 hover:text-slate-950 disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-1">
                Stock Status
              </span>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600">Currently Sold Out</span>
              ) : product.stock <= 3 ? (
                <span className="text-xs font-bold text-amber-600">Only {product.stock} units left!</span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                  <Check className="w-3.5 h-3.5" /> Available in stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-lg mb-4 ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : addedNotice
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-white hover:bg-slate-800'
            }`}
          >
            {addedNotice ? (
              <>
                <Check className="w-4 h-4" /> Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
              </>
            )}
          </button>

          {/* WhatsApp Direct Buy Note */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ordering via WhatsApp &amp; Cash on Delivery</span>
            </div>
            <p className="leading-relaxed">
              Add your chosen items to the cart, then submit your delivery details to generate an instant WhatsApp order. No upfront card payment required.
            </p>
          </div>

          {/* Reassurance list */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <span>24-48h Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>7-Day Exchange</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Secure Inspection</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-slate-400" />
              <span>100% Quality Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
