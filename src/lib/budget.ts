// src/lib/budget.ts
// Finance entries: Supabase CRUD, caching, totals, and date/month helpers.

import { supabase } from '../supabaseClient'

export type ExpenseKind = 'expense' | 'income'

export type Expense = {
  id: string
  label: string
  category: string
  amount: number
  date: string
  kind: ExpenseKind
}

/** Raw row from Supabase entries table. Single place to map row → Expense (DRY). */
type EntryRow = {
  id: string
  label: string | null
  category: string | null
  amount: number
  date: string | null
  kind: string
}

function mapRowToExpense(row: EntryRow): Expense {
  return {
    id: row.id,
    label: row.label ?? '',
    category: row.category ?? '',
    amount: Number(row.amount) || 0,
    date: row.date ?? getTodayLocalISO(),
    kind: row.kind === 'income' ? 'income' : 'expense',
  }
}

/** In-memory cache keyed by month (YYYY-MM) to avoid repeated Supabase reads. */
const entriesCache = new Map<string, Expense[]>()

/** Safety cap per month — personal use; prevents unbounded result sets. */
const ENTRIES_PAGE_LIMIT = 500

export const DEFAULT_BUDGET_CATEGORIES: string[] = [
  'Groceries',
  'Transport',
  'Food & Dining',
  'Housing',
  'Subscriptions',
  'Health',
  'Fun',
  'Other',
]

export function getTodayLocalISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatBudgetDate(date: string): string {
  const parts = date.split('-')
  if (parts.length !== 3) return date
  const [year, month, day] = parts
  const m = Number(month)
  const d = Number(day)
  if (!m || !d) return date
  return `${m}/${d}/${year}`
}

export function getCurrentMonthKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-')
  const monthNum = parseInt(m, 10) || 1
  const date = new Date(Number(y), monthNum - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getPrevMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1, 0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getNextMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function filterByMonth(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(monthKey))
}

/** First and last date (inclusive) for a YYYY-MM month key. */
export function getMonthDateRange(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return {
    start: `${monthKey}-01`,
    end: `${monthKey}-${String(lastDay).padStart(2, '0')}`,
  }
}

function monthKeyFromDate(date: string): string {
  return date.slice(0, 7)
}

export async function loadExpensesForMonth(monthKey: string): Promise<Expense[]> {
  const cached = entriesCache.get(monthKey)
  if (cached !== undefined) return cached

  const { start, end } = getMonthDateRange(monthKey)
  const { data, error } = await supabase
    .from('entries')
    .select('id, label, category, amount, date, kind')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(ENTRIES_PAGE_LIMIT)

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load entries from Supabase', error)
    return []
  }

  const entries = (data ?? []).map((row: EntryRow) => mapRowToExpense(row))
  entriesCache.set(monthKey, entries)
  return entries
}

export type CreateEntryResult =
  | { data: Expense; error: null }
  | { data: null; error: string }

export async function createEntry(
  input: Omit<Expense, 'id'>,
): Promise<CreateEntryResult> {
  const { data, error } = await supabase
    .from('entries')
    .insert({
      label: input.label,
      category: input.category || null,
      amount: input.amount,
      date: input.date,
      kind: input.kind,
    })
    .select('id, label, category, amount, date, kind')
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create entry', error)
    return {
      data: null,
      error: error.message || 'Could not save entry',
    }
  }

  const entry = mapRowToExpense(data as EntryRow)
  const key = monthKeyFromDate(entry.date)
  const cached = entriesCache.get(key)
  if (cached !== undefined) entriesCache.set(key, [entry, ...cached])
  return { data: entry, error: null }
}

export async function deleteEntry(id: string, date: string): Promise<boolean> {
  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete entry', error)
    return false
  }
  const key = monthKeyFromDate(date)
  const cached = entriesCache.get(key)
  if (cached !== undefined) {
    entriesCache.set(key, cached.filter((e) => e.id !== id))
  }
  return true
}

export type BudgetTotals = {
  total: number
  count: number
  categoryTotals: [string, number][]
  uniqueCategories: number
  topCategoryName: string | null
  topCategoryValue: number | null
}

export function computeBudgetTotals(expenses: Expense[]): BudgetTotals {
  const spending = expenses.filter((e) => e.kind !== 'income')
  const total = spending.reduce((sum, e) => sum + e.amount, 0)
  const count = spending.length
  const categoryMap = new Map<string, number>()
  for (const e of spending) {
    const key = e.category || 'Uncategorized'
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + e.amount)
  }
  const categoryTotals = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1] - a[1],
  ) as [string, number][]
  const topCategory = categoryTotals[0] ?? null

  return {
    total,
    count,
    categoryTotals,
    uniqueCategories: categoryTotals.length,
    topCategoryName: topCategory?.[0] ?? null,
    topCategoryValue: topCategory?.[1] ?? null,
  }
}

export type IncomeTotals = {
  total: number
  count: number
}

export function computeIncomeTotals(expenses: Expense[]): IncomeTotals {
  const income = expenses.filter((e) => e.kind === 'income')
  const total = income.reduce((sum, e) => sum + e.amount, 0)
  const count = income.length
  return { total, count }
}
