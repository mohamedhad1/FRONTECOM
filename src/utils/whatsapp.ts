import type { CartItem, CustomerCheckoutInfo } from '../types/cart'
import { formatPrice } from './formatters'

const DEFAULT_PHONE = '212600000000'

/**
 * Returns the configured WhatsApp phone number stripped of non-digit characters
 */
export function getStoreWhatsAppPhone(): string {
  const envPhone = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER
  if (typeof envPhone === 'string' && envPhone.trim()) {
    return envPhone.replace(/\D/g, '')
  }
  return DEFAULT_PHONE
}

/**
 * Generates a clean, beautifully formatted WhatsApp order message
 */
export function buildWhatsAppOrderMessage(
  items: CartItem[],
  customer: CustomerCheckoutInfo,
  totalAmount: number
): string {
  const lines: string[] = []

  lines.push('🛒 *NEW ORDER REQUEST — ATELIER ECOM*')
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push(`📅 *Date:* ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`)
  lines.push('')

  lines.push('👤 *CUSTOMER DETAILS:*')
  lines.push(`• *Name:* ${customer.fullName.trim()}`)
  lines.push(`• *Phone:* ${customer.phone.trim()}`)
  lines.push(`• *City:* ${customer.city.trim()}`)
  lines.push(`• *Address:* ${customer.address.trim()}`)
  if (customer.notes && customer.notes.trim()) {
    lines.push(`• *Delivery Notes:* ${customer.notes.trim()}`)
  }
  lines.push('')

  lines.push('📦 *ORDER ITEMS:*')
  items.forEach((item, index) => {
    const itemTotal = item.effectivePrice * item.quantity
    const variantParts: string[] = []
    if (item.size) variantParts.push(`Size: ${item.size}`)
    if (item.color) variantParts.push(`Color: ${item.color}`)
    const variantText = variantParts.length > 0 ? ` (${variantParts.join(' | ')})` : ''

    lines.push(`${index + 1}. *${item.name}*${variantText}`)
    lines.push(`   ↳ Qty: ${item.quantity} × ${formatPrice(item.effectivePrice)} = *${formatPrice(itemTotal)}*`)
  })
  lines.push('')

  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push(`💰 *TOTAL ESTIMATE:* *${formatPrice(totalAmount)}*`)
  lines.push('🚚 *Payment Method:* Cash on Delivery (COD)')
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push('')
  lines.push('💬 *Please confirm my order and share delivery schedule.* Thank you!')

  return lines.join('\n')
}

/**
 * Creates the full wa.me link with encoded order text
 */
export function generateWhatsAppLink(
  items: CartItem[],
  customer: CustomerCheckoutInfo,
  totalAmount: number
): string {
  const phone = getStoreWhatsAppPhone()
  const message = buildWhatsAppOrderMessage(items, customer, totalAmount)
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
