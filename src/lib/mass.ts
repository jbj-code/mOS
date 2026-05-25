// src/lib/mass.ts
// Body weight entries, height profile, and BMI / trend helpers; persisted in localStorage.

const ENTRIES_KEY = 'mOS_mass'
const HEIGHT_KEY = 'mOS_mass_height_in'

export type MassEntry = {
  id: string
  date: string
  weight: number
}

export type MassChartPoint = {
  date: string
  weight: number
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): MassEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MassEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load mass entries from localStorage', err)
    return []
  }
}

function saveToStorage(entries: MassEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export async function loadMassEntries(): Promise<MassEntry[]> {
  return loadFromStorage().sort((a, b) => (b.date > a.date ? 1 : -1))
}

export function createMassEntry(input: { date: string; weight: number }): MassEntry {
  const entries = loadFromStorage()
  const entry: MassEntry = {
    id: genId(),
    date: input.date,
    weight: input.weight,
  }
  entries.push(entry)
  saveToStorage(entries)
  return entry
}

export function deleteMassEntry(id: string): boolean {
  const current = loadFromStorage()
  const next = current.filter((e) => e.id !== id)
  if (next.length === current.length) return false
  saveToStorage(next)
  return true
}

export function getHeightInches(): number | null {
  try {
    const raw = localStorage.getItem(HEIGHT_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

export function setHeightInches(inches: number): void {
  localStorage.setItem(HEIGHT_KEY, String(inches))
}

export function inchesToFeetInches(totalInches: number): { feet: number; inches: number } {
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

export function feetInchesToInches(feet: number, inches: number): number {
  return feet * 12 + inches
}

/** BMI from weight (lbs) and height (inches). */
export function computeBmi(weightLbs: number, heightInches: number): number | null {
  if (heightInches <= 0 || weightLbs <= 0) return null
  return (weightLbs * 703) / (heightInches * heightInches)
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function formatMassDate(date: string): string {
  const parts = date.split('-')
  if (parts.length !== 3) return date
  const [year, month, day] = parts
  return `${Number(month)}/${Number(day)}/${year}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Latest weigh-in per calendar day, oldest → newest for charting. */
export function getChartPoints(entries: MassEntry[], days = 30): MassChartPoint[] {
  if (entries.length === 0) return []

  const today = new Date()
  const start = addDays(today, -(days - 1))
  const startKey = toLocalISO(start)

  const byDate = new Map<string, MassEntry>()
  for (const entry of entries) {
    if (entry.date < startKey) continue
    const prev = byDate.get(entry.date)
    if (!prev || entry.id > prev.id) byDate.set(entry.date, entry)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([, e]) => ({ date: e.date, weight: e.weight }))
}

export function getMonthlyAverage(entries: MassEntry[], days = 30): number | null {
  const points = getChartPoints(entries, days)
  if (points.length === 0) return null
  const sum = points.reduce((acc, p) => acc + p.weight, 0)
  return sum / points.length
}
