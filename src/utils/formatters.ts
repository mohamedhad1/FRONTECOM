/**
 * src/utils/formatters.ts
 * Currency and text formatting utilities
 */

export function formatPrice (amount: number, currency = 'MAD'): string {
  const formatted = new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${formatted} ${currency}`
}

export function calculateDiscountPrice (originalPrice: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) return originalPrice
  return Math.max(0, originalPrice * (1 - discountPercentage / 100))
}

export function formatCategoryName (category: string): string {
  const map: Record<string, string> = {
    tshirts: 'T-Shirts',
    hoodies: 'Hoodies & Sweatshirts',
    pants: 'Pants & Trousers',
    jackets: 'Jackets & Coats',
    shorts: 'Shorts',
    dresses: 'Dresses',
    accessories: 'Accessories',
  }
  return map[category] || category.charAt(0).toUpperCase() + category.slice(1)
}
