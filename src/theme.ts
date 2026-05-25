// src/theme.ts
// Central mOS theme tokens (light/dark) and helpers to apply/persist CSS variables.

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'mos:theme'

export const themes: Record<Theme, Record<string, string>> = {
  dark: {
    '--mos-bg': '#0C1412',
    '--mos-bg-muted': '#141F1C',
    '--mos-bg-elevated': '#1A2824',
    '--mos-nav-bg': 'rgba(20, 31, 28, 0.92)',
    '--mos-text': '#F4FAF8',
    '--mos-text-muted': '#6B857C',
    '--mos-accent': '#10B981',
    '--mos-accent-hover': '#34D399',
    '--mos-accent-contrast': '#0C1412',
    '--mos-accent-card': '#0D6B52',
    '--mos-income-bg': 'rgba(16, 185, 129, 0.1)',
    '--mos-spent-bg': 'rgba(248, 113, 113, 0.1)',
    '--mos-spent-icon': '#F87171',
    '--mos-border': 'rgba(255, 255, 255, 0.08)',
    '--mos-border-muted': 'rgba(255, 255, 255, 0.05)',
    '--mos-danger': '#F87171',
    '--mos-danger-hover': '#EF4444',
    '--mos-module-finance': 'rgba(16, 185, 129, 0.12)',
    '--mos-module-health': 'rgba(248, 113, 113, 0.1)',
    '--mos-shadow': '0 1px 3px rgba(0, 0, 0, 0.3)',
    '--mos-shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.35)',
    '--mos-card-shadow': '0 2px 12px rgba(0, 0, 0, 0.25)',
  },
  light: {
    '--mos-bg': '#E8F5F0',
    '--mos-bg-muted': '#D5EBE3',
    '--mos-bg-elevated': '#FFFFFF',
    '--mos-nav-bg': 'rgba(255, 255, 255, 0.92)',
    '--mos-text': '#0C1412',
    '--mos-text-muted': '#4A635C',
    '--mos-accent': '#059669',
    '--mos-accent-hover': '#047857',
    '--mos-accent-contrast': '#FFFFFF',
    '--mos-accent-card': '#047857',
    '--mos-income-bg': '#D1FAE5',
    '--mos-spent-bg': '#FEE2E2',
    '--mos-spent-icon': '#DC2626',
    '--mos-border': '#B8D4CA',
    '--mos-border-muted': '#C8DDD4',
    '--mos-danger': '#DC2626',
    '--mos-danger-hover': '#B91C1C',
    '--mos-module-finance': 'rgba(5, 150, 105, 0.12)',
    '--mos-module-health': 'rgba(220, 38, 38, 0.1)',
    '--mos-shadow': '0 1px 3px rgba(10, 18, 16, 0.08)',
    '--mos-shadow-lg': '0 8px 20px rgba(10, 18, 16, 0.1)',
    '--mos-card-shadow': '0 2px 8px rgba(10, 18, 16, 0.06)',
  },
}

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

export function setStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const vars = themes[theme]
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

/** Chart/icon colors for expense and income categories (single source of truth). */
export const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#10B981',
  Transport: '#60A5FA',
  'Food & Dining': '#FB923C',
  Housing: '#A78BFA',
  Subscriptions: '#F472B6',
  Health: '#F87171',
  Fun: '#FBBF24',
  Other: '#6B857C',
  Salary: '#10B981',
  'Item Sale': '#60A5FA',
  'Digital Sale': '#A78BFA',
  Refund: '#22D3EE',
  Investment: '#FBBF24',
}

export const CATEGORY_COLOR_FALLBACK = '#6B857C'
