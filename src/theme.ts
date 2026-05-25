// src/theme.ts
// Central mOS theme tokens (light/dark) and helpers to apply/persist CSS variables.

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'mos:theme'

export const themes: Record<Theme, Record<string, string>> = {
  dark: {
    '--mos-bg': '#050A09',
    '--mos-bg-muted': '#0E1614',
    '--mos-bg-elevated': '#121B1A',
    '--mos-text': '#F5FAF8',
    '--mos-text-muted': '#8A9A94',
    '--mos-accent': '#34D399',
    '--mos-accent-hover': '#6EE7B7',
    '--mos-accent-contrast': '#050A09',
    '--mos-accent-card': '#0F5C47',
    '--mos-income-bg': '#0F2A24',
    '--mos-spent-bg': '#2A181A',
    '--mos-spent-icon': '#F87171',
    '--mos-border': '#1E2E2A',
    '--mos-border-muted': '#2A3F38',
    '--mos-danger': '#F87171',
    '--mos-danger-hover': '#EF4444',
    '--mos-shadow': '0 1px 3px rgba(0, 0, 0, 0.45)',
    '--mos-shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.55)',
    '--mos-accent-glow': '0 0 20px rgba(52, 211, 153, 0.28)',
    '--mos-card-glow': '0 4px 24px rgba(52, 211, 153, 0.1)',
  },
  light: {
    '--mos-bg': '#EFF6F2',
    '--mos-bg-muted': '#E0EBE6',
    '--mos-bg-elevated': '#FFFFFF',
    '--mos-text': '#0A0F0D',
    '--mos-text-muted': '#5C6F66',
    '--mos-accent': '#047857',
    '--mos-accent-hover': '#059669',
    '--mos-accent-contrast': '#FFFFFF',
    '--mos-accent-card': '#065F46',
    '--mos-income-bg': '#D1FAE5',
    '--mos-spent-bg': '#FEE2E2',
    '--mos-spent-icon': '#DC2626',
    '--mos-border': '#C8D9D0',
    '--mos-border-muted': '#B0C4BA',
    '--mos-danger': '#DC2626',
    '--mos-danger-hover': '#B91C1C',
    '--mos-shadow': '0 1px 3px rgba(5, 10, 9, 0.08)',
    '--mos-shadow-lg': '0 10px 25px -5px rgba(5, 10, 9, 0.1)',
    '--mos-accent-glow': '0 0 16px rgba(4, 120, 87, 0.2)',
    '--mos-card-glow': '0 4px 14px rgba(5, 10, 9, 0.06)',
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
  Groceries: '#34D399',
  Transport: '#60A5FA',
  'Food & Dining': '#FB923C',
  Housing: '#A78BFA',
  Subscriptions: '#F472B6',
  Health: '#F87171',
  Fun: '#FBBF24',
  Other: '#8A9A94',
  Salary: '#34D399',
  'Item Sale': '#60A5FA',
  'Digital Sale': '#A78BFA',
  Refund: '#22D3EE',
  Investment: '#FBBF24',
}

export const CATEGORY_COLOR_FALLBACK = '#8A9A94'
