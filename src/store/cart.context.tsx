import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { CartItem } from '../types/cart'
import type { Product, ProductSize } from '../types/product'
import { calculateDiscountPrice } from '../utils/formatters'

const CART_STORAGE_KEY = 'atelier_cart_items_v1'

interface AddToCartOptions {
  size?: ProductSize
  color?: string
  quantity?: number
}

interface CartContextValue {
  items: CartItem[]
  totalCount: number
  subtotal: number
  isDrawerOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (product: Product, options?: AddToCartOptions) => boolean
  removeItem: (itemKey: string) => void
  updateQuantity: (itemKey: string, newQuantity: number) => void
  updateItemDetails: (itemKey: string, updates: Partial<CartItem>) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

/**
 * Generate a deterministic compound key for product variant
 */
function generateVariantKey(productId: string, size?: string, color?: string): string {
  const normSize = (size || 'none').trim().toUpperCase()
  const normColor = (color || 'none').trim().toLowerCase()
  return `${productId}::${normSize}::${normColor}`
}

function loadInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (err) {
    console.warn('[CartContext] Failed to load cart from localStorage:', err)
  }
  return []
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadInitialCart)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.warn('[CartContext] Failed to persist cart to localStorage:', err)
    }
  }, [items])

  const openCart = () => setIsDrawerOpen(true)
  const closeCart = () => setIsDrawerOpen(false)
  const toggleCart = () => setIsDrawerOpen((prev) => !prev)

  const addItem = (product: Product, options?: AddToCartOptions): boolean => {
    if (!product || product.stock <= 0) {
      return false
    }

    const size = options?.size
    const color = options?.color
    const requestedQty = Math.max(1, options?.quantity || 1)
    const key = generateVariantKey(product._id, size, color)
    const effectivePrice = calculateDiscountPrice(product.price, product.discount)

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.key === key)

      if (existingIndex > -1) {
        // Increment quantity up to available stock
        const currentItem = prevItems[existingIndex]
        const newQty = Math.min(currentItem.quantity + requestedQty, product.stock)

        const updated = [...prevItems]
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          maxStock: product.stock,
          effectivePrice, // update in case price changed
          price: product.price,
          discount: product.discount,
        }
        return updated
      }

      // Add new item
      const newItem: CartItem = {
        key,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discount: product.discount,
        effectivePrice,
        imageUrl: product.images?.[0] || '',
        category: product.category,
        size,
        color,
        quantity: Math.min(requestedQty, product.stock),
        maxStock: product.stock,
      }

      return [...prevItems, newItem]
    })

    return true
  }

  const removeItem = (itemKey: string) => {
    setItems((prev) => prev.filter((it) => it.key !== itemKey))
  }

  const updateQuantity = (itemKey: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemKey)
      return
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.key === itemKey) {
          const clamped = Math.min(newQuantity, Math.max(1, item.maxStock))
          return { ...item, quantity: clamped }
        }
        return item
      })
    )
  }

  const updateItemDetails = (itemKey: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === itemKey ? { ...item, ...updates } : item))
    )
  }

  const clearCart = () => {
    setItems([])
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const totalCount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0)
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + it.effectivePrice * it.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        isDrawerOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        updateItemDetails,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
