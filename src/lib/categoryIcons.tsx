// src/lib/categoryIcons.tsx
// Maps expense/income category names to icons and chart segment colors.

import type { IconType } from 'react-icons'
import {
  MdShoppingBasket,
  MdDirectionsCar,
  MdRestaurant,
  MdHome,
  MdSubscriptions,
  MdLocalHospital,
  MdLocalBar,
  MdCategory,
  MdPayments,
  MdSell,
  MdSmartphone,
  MdReply,
  MdSavings,
} from 'react-icons/md'
import { CATEGORY_COLOR_FALLBACK, CATEGORY_COLORS } from '../theme'

const CATEGORY_CONFIG: Record<string, { icon: IconType; color: string }> = {
  Groceries: { icon: MdShoppingBasket, color: CATEGORY_COLORS.Groceries },
  Transport: { icon: MdDirectionsCar, color: CATEGORY_COLORS.Transport },
  'Food & Dining': { icon: MdRestaurant, color: CATEGORY_COLORS['Food & Dining'] },
  Housing: { icon: MdHome, color: CATEGORY_COLORS.Housing },
  Subscriptions: { icon: MdSubscriptions, color: CATEGORY_COLORS.Subscriptions },
  Health: { icon: MdLocalHospital, color: CATEGORY_COLORS.Health },
  Fun: { icon: MdLocalBar, color: CATEGORY_COLORS.Fun },
  Other: { icon: MdCategory, color: CATEGORY_COLORS.Other },
  Salary: { icon: MdPayments, color: CATEGORY_COLORS.Salary },
  'Item Sale': { icon: MdSell, color: CATEGORY_COLORS['Item Sale'] },
  'Digital Sale': { icon: MdSmartphone, color: CATEGORY_COLORS['Digital Sale'] },
  Refund: { icon: MdReply, color: CATEGORY_COLORS.Refund },
  Investment: { icon: MdSavings, color: CATEGORY_COLORS.Investment },
}

const FALLBACK = { icon: MdCategory, color: CATEGORY_COLOR_FALLBACK }

export function getCategoryIcon(category: string): IconType {
  const key = (category || 'Other').trim()
  return CATEGORY_CONFIG[key]?.icon ?? FALLBACK.icon
}

export function getCategoryColor(category: string): string {
  const key = (category || 'Other').trim()
  return CATEGORY_CONFIG[key]?.color ?? FALLBACK.color
}

/** Income categories (required when adding income); shown with icons in Recent Activity. */
export const INCOME_CATEGORIES: string[] = [
  'Salary',
  'Item Sale',
  'Digital Sale',
  'Refund',
  'Investment',
  'Other',
]
