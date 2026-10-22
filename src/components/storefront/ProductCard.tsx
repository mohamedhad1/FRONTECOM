import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { formatPrice, calculateDiscountPrice } from '../../utils/formatters'
import { Eye, ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const currency = import.meta.env.VITE_STORE_CURRENCY || 'MAD'
  const hasDiscount = product.discount > 0
  const finalPrice = calculateDiscountPrice(product.price, product.discount)
  const isOutOfStock = product.stock <= 0
  const mainImage = product.images?.[0]
  const hoverImage = product.images?.[1] || mainImage

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
      {/* Product Image Stage */}
      <Link
        to={`/products/${product._id}`}
        className="relative block aspect-[4/5] bg-slate-100 overflow-hidden"
      >
        {mainImage ? (
          <>
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
                hoverImage !== mainImage ? 'group-hover:opacity-0' : ''
              }`}
            />
            {hoverImage !== mainImage && (
              <img
                src={hoverImage}
                alt={`${product.name} alternate view`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
            <ShoppingBag className="w-8 h-8 stroke-1 mb-1" />
            <span className="text-[11px] font-medium tracking-wider uppercase">No photo</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white rounded-md shadow-sm">
              -{product.discount}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-white rounded-md shadow-sm">
              Sold Out
            </span>
          ) : product.stock <= 3 ? (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-white rounded-md shadow-sm">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Quick View Button Hover Reveal */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 hidden sm:block">
          <div className="w-full py-2 bg-white/95 backdrop-blur-sm text-slate-900 font-semibold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 hover:bg-slate-950 hover:text-white transition">
            <Eye className="w-3.5 h-3.5" />
            <span>View Product</span>
          </div>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Color indicators */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1 uppercase tracking-wider">
          <span>{product.category}</span>
          {product.colors && product.colors.length > 0 && (
            <span className="text-slate-500 lowercase">
              {product.colors.length} {product.colors.length === 1 ? 'color' : 'colors'}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/products/${product._id}`}
          className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Available Sizes preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.sizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-600 border border-slate-200"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[10px] text-slate-400 self-center">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}

        {/* Price & Action Button */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm text-slate-950">
                  {formatPrice(finalPrice, currency)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.price, currency)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-sm text-slate-950">
                {formatPrice(product.price, currency)}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-800 transition"
            aria-label={`View ${product.name}`}
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
