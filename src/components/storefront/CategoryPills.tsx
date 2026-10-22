import { Link } from 'react-router-dom'
import { VALID_CATEGORIES } from '../../types/product'
import { formatCategoryName } from '../../utils/formatters'
import { ArrowUpRight } from 'lucide-react'

interface CategoryPillsProps {
  activeCategory?: string
  onSelectCategory?: (category: string) => void
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory?.('')}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
          !activeCategory
            ? 'bg-slate-950 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        All Pieces
      </button>

      {VALID_CATEGORIES.map((category) => {
        const isActive = activeCategory === category
        return (
          <button
            key={category}
            onClick={() => onSelectCategory?.(category)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {formatCategoryName(category)}
          </button>
        )
      })}
    </div>
  )
}

export const CategoryCardGrid: React.FC = () => {
  const featured = [
    {
      category: 'hoodies',
      title: 'Heavyweight Hoodies',
      desc: '450 GSM French terry cotton with relaxed dropped shoulders',
      badge: 'Best Seller',
      bgGradient: 'from-slate-900 to-slate-800',
    },
    {
      category: 'tshirts',
      title: 'Essential Tees',
      desc: 'Double-stitched ribbed collar in classic boxy cuts',
      badge: 'Daily Core',
      bgGradient: 'from-zinc-900 to-zinc-800',
    },
    {
      category: 'jackets',
      title: 'Outerwear & Jackets',
      desc: 'Weather-resistant coach jackets and minimalist bombers',
      badge: 'New Season',
      bgGradient: 'from-neutral-900 to-neutral-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
      {featured.map((item) => (
        <Link
          key={item.category}
          to={`/catalog?category=${item.category}`}
          className={`group relative p-6 rounded-2xl bg-gradient-to-br ${item.bgGradient} text-white border border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[180px]`}
        >
          {/* Subtle top badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 backdrop-blur-sm">
              {item.badge}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold font-serif tracking-tight mb-1 group-hover:text-slate-100">
              {item.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {item.desc}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
