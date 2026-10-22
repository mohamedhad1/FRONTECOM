import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '../../store/cart.context'
import { formatPrice } from '../../utils/formatters'

export const CartDrawer: React.FC = () => {
  const { items, totalCount, subtotal, isDrawerOpen, closeCart, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeCart])

  if (!isDrawerOpen) return null

  const handleProceedToCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Shopping Bag</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery & Cash on Delivery announcement */}
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fast nationwide delivery • Pay Cash on Delivery</span>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore our modern streetwear & luxury clothing collection to find your next staple piece.
                </p>
                <button
                  onClick={() => {
                    closeCart()
                    navigate('/catalog')
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.key} className="pt-4 first:pt-0 flex gap-3.5">
                    {/* Item Thumbnail */}
                    <Link
                      to={`/products/${item.productId}`}
                      onClick={closeCart}
                      className="w-20 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative group"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/products/${item.productId}`}
                            onClick={closeCart}
                            className="text-xs font-semibold text-slate-900 hover:text-slate-600 line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition"
                            title="Remove item"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Variant Badges */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.size && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium capitalize">
                              {item.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition disabled:opacity-40 disabled:hover:bg-transparent"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(item.effectivePrice * item.quantity)}
                          </span>
                          {item.discount ? (
                            <div className="text-[10px] text-slate-400 line-through">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold uppercase text-[11px]">Free delivery</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Estimated Total</span>
                  <span className="text-base font-extrabold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Security hint */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Orders are finalized and confirmed securely via WhatsApp</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 px-4 bg-slate-950 text-white rounded-xl text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-sm cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={closeCart}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
