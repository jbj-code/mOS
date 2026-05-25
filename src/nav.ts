// src/nav.ts
// Navigation types for the super-app shell and module sub-sections.

export type View = 'home' | 'finance' | 'health'

export type FinanceSection = 'budget' | 'meals'

export type HealthSection = 'stack' | 'mass'

export const PAGE_TITLES: Record<View, string> = {
  home: 'mOS',
  finance: 'Finance Hub',
  health: 'Health Hub',
}
