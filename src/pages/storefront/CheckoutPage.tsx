import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useCart } from '../../store/cart.context'
import type { CustomerCheckoutInfo, ValidationIssue } from '../../types/cart'
import { getProductById } from '../../api/products.api'
import { calculateDiscountPrice, formatPrice } from '../../utils/formatters'
import { generateWhatsAppLink, getStoreWhatsAppPhone } from '../../utils/whatsapp'

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart, updateItemDetails, removeItem } = useCart()
  const navigate = useNavigate()

  // Form State
  const [customer, setCustomer] = useState<CustomerCheckoutInfo>({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomer((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!customer.fullName.trim()) {
      errors.fullName = 'Please enter your full name'
    }

    const cleanPhone = customer.phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 8) {
      errors.phone = 'Please enter a valid phone number (at least 8 digits)'
    }

    if (!customer.city.trim()) {
      errors.city = 'Please specify your city'
    }

    if (!customer.address.trim()) {
      errors.address = 'Please provide your full delivery address'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Live Stock & Price Pre-flight Verification
   * Requirement: Validate against live backend before opening WhatsApp
   */
  const handleProceedToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (items.length === 0) {
      return
    }

    setIsValidating(true)
    setValidationIssues([])

    try {
      const issues: ValidationIssue[] = []

      // Fetch live data for each distinct product
      for (const item of items) {
        try {
          const res = await getProductById(item.productId)
          const liveProduct = res?.data

          if (!liveProduct || liveProduct.isActive === false) {
            issues.push({
              itemKey: item.key,
              productName: item.name,
              type: 'product_unavailable',
              message: `"${item.name}" is no longer available in our store.`,
            })
            continue
          }

          // Stock Check
          if (liveProduct.stock <= 0) {
            issues.push({
              itemKey: item.key,
              productName: item.name,
              type: 'out_of_stock',
              availableStock: 0,
              message: `"${item.name}" is currently out of stock.`,
            })
          } else if (liveProduct.stock < item.quantity) {
            issues.push({
              itemKey: item.key,
              productName: item.name,
              type: 'insufficient_stock',
              availableStock: liveProduct.stock,
              message: `Only ${liveProduct.stock} unit(s) of "${item.name}" remaining in stock (you requested ${item.quantity}).`,
            })
          }

          // Price integrity check
          const liveEffectivePrice = calculateDiscountPrice(liveProduct.price, liveProduct.discount)
          if (liveEffectivePrice !== item.effectivePrice) {
            issues.push({
              itemKey: item.key,
              productName: item.name,
              type: 'price_changed',
              oldPrice: item.effectivePrice,
              newPrice: liveEffectivePrice,
              message: `Price for "${item.name}" was updated from ${formatPrice(item.effectivePrice)} to ${formatPrice(liveEffectivePrice)}.`,
            })

            // Automatically sync the cart price
            updateItemDetails(item.key, {
              price: liveProduct.price,
              discount: liveProduct.discount,
              effectivePrice: liveEffectivePrice,
              maxStock: liveProduct.stock,
            })
          }
        } catch (fetchErr) {
          console.error(`Failed to verify product ${item.productId}:`, fetchErr)
          // Don't block order if backend error occurs, but flag warning
        }
      }

      setValidationIssues(issues)

      // Check if there are blocking issues (out of stock or unavailable)
      const hasBlockingIssue = issues.some(
        (issue) => issue.type === 'out_of_stock' || issue.type === 'product_unavailable'
      )

      if (hasBlockingIssue) {
        setIsValidating(false)
        return
      }

      // If price changed or stock is less, let user see the update or proceed
      const waLink = generateWhatsAppLink(items, customer, subtotal)
      setLastWhatsAppUrl(waLink)
      setIsOrderPlaced(true)

      // Open WhatsApp in new tab
      window.open(waLink, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Validation error:', err)
    } finally {
      setIsValidating(false)
    }
  }

  // Empty cart view
  if (items.length === 0 && !isOrderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 stroke-1" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Shopping Bag is empty</h2>
        <p className="text-sm text-slate-500 mb-6">
          Add items to your bag before proceeding to the WhatsApp checkout desk.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition"
        >
          <span>Browse Catalog</span>
        </Link>
      </div>
    )
  }

  // Order Submitted / Success Screen
  if (isOrderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            Order Transmitted to WhatsApp
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            Thank you, {customer.fullName}!
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto mb-6">
            Your structured order summary was opened in WhatsApp to our concierge representative.
            Please send the message in WhatsApp to confirm your delivery address and receive your tracking number.
          </p>

          {/* WhatsApp Direct Action */}
          {lastWhatsAppUrl && (
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-3 font-medium">
                Did WhatsApp not open automatically? Click below to resume:
              </p>
              <a
                href={lastWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold tracking-wide uppercase hover:bg-emerald-500 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Order Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Important Transparency Notice */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-left mb-8 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1">Payment & Dispatch Notice</p>
              <p>
                As our store uses Cash on Delivery, no funds were charged online. Your order will be packed and dispatched once our WhatsApp representative confirms your telephone number and physical delivery location.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                clearCart()
                navigate('/catalog')
              }}
              className="px-6 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
            >
              Clear Bag & Keep Shopping
            </button>
            <Link
              to="/"
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-50 transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Return link */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to store</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Customer Form & Shipping Info (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Checkout & Shipping
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your delivery destination. You will verify this order directly on WhatsApp.
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            {/* Validation alerts if any */}
            {validationIssues.length > 0 && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Please review items before proceeding:</span>
                </div>
                <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                  {validationIssues.map((issue, idx) => (
                    <li key={idx} className="leading-snug">
                      {issue.message}
                      {issue.type === 'out_of_stock' && (
                        <button
                          onClick={() => removeItem(issue.itemKey)}
                          className="ml-2 font-bold underline hover:text-rose-900 cursor-pointer"
                        >
                          Remove item
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleProceedToWhatsApp} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={customer.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Karim El Amrani"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 transition ${
                    formErrors.fullName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.fullName}</p>
                )}
              </div>

              {/* Phone & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 06 12 34 56 78"
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 transition ${
                      formErrors.phone
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  {formErrors.phone ? (
                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.phone}</p>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-400">Our courier will contact you on this number</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customer.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Casablanca, Rabat, Marrakech"
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 transition ${
                      formErrors.city
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'
                    }`}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.city}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={customer.address}
                  onChange={handleInputChange}
                  placeholder="Street name, building, apartment or neighborhood"
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 transition ${
                    formErrors.address
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-slate-900 focus:ring-slate-200'
                  }`}
                />
                {formErrors.address && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.address}</p>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={customer.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Deliver afternoon after 3 PM, leave with concierge"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-200 transition resize-none"
                />
              </div>

              {/* Mandatory Architecture & Security Disclosure */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-3 items-start mt-6">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-0.5">How WhatsApp Checkout Works</p>
                  <p>
                    Clicking the button below formats your order items, validates real-time prices & stock against our servers, and opens a direct chat with our WhatsApp business desk (<span className="font-mono font-medium text-slate-800">+{getStoreWhatsAppPhone()}</span>). No online payment is requested; payment is 100% Cash on Delivery upon receiving your package.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-emerald-500 transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying live inventory & prices...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>Confirm & Send Order via WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs sticky top-28">
            <h2 className="text-base font-bold text-slate-900 tracking-tight pb-4 border-b border-slate-100 mb-4 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-slate-500">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </h2>

            {/* Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3">
              {items.map((item) => (
                <div key={item.key} className="pt-3 first:pt-0 flex gap-3">
                  <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.size && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded capitalize">
                          {item.color}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-500 font-medium">Qty: {item.quantity}</span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatPrice(item.effectivePrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-5 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Nationwide Shipping</span>
                <span className="text-emerald-600 font-bold uppercase text-[11px]">Free delivery</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method</span>
                <span className="font-medium text-slate-800">Cash on Delivery</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Total Due</span>
                  <span className="text-[10px] text-slate-400">Pay upon delivery</span>
                </div>
                <span className="text-lg font-extrabold text-slate-950">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/70 text-[11px] text-emerald-800 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Free returns & size exchanges within 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
