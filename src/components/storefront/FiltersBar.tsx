import {
  VALID_CATEGORIES,
  VALID_SIZES,
} from '../../types/product'
import { formatCategoryName } from '../../utils/formatters'
import { Filter, X, RotateCcw } from 'lucide-react'

interface FiltersBarProps {
  selectedCategory: string
  selectedSize: string
  searchQuery: string
  totalCount?: number
  onCategoryChange: (cat: string) => void
  onSizeChange: (size: string) => void
  onClearFilters: () => void
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedCategory,
  selectedSize,
  searchQuery,
  totalCount,
  onCategoryChange,
  onSizeChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(selectedCategory || selectedSize || searchQuery)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Section Header & Count */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Filter Pieces</h3>
            {totalCount !== undefined && (
              <p className="text-xs text-slate-500 font-medium">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} found
              </p>
            )}
          </div>
        </div>

        {/* Center: Dropdown Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Selector */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="text-xs font-semibold py-2 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition cursor-pointer"
            >
              <option value="">All Categories</option>
              {VALID_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {formatCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Size Selector */}
          <div className="relative">
            <select
              value={selectedSize}
              onChange={(e) => onSizeChange(e.target.value)}
              className="text-xs font-semibold py-2 pl-3 pr-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 transition cursor-pointer"
            >
              <option value="">All Sizes</option>
              {VALID_SIZES.map((size) => (
                <option key={size} value={size}>
                  Size {size}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Active:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium">
              Category: {formatCategoryName(selectedCategory)}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-950"
                onClick={() => onCategoryChange('')}
              />
            </span>
          )}
          {selectedSize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium">
              Size: {selectedSize}
              <X
                className="w-3 h-3 cursor-pointer hover:text-slate-950"
                onClick={() => onSizeChange('')}
              />
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium">
              Keyword: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  )
}
