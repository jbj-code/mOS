// src/lib/meals.ts
// Meal CRUD and proportional ingredient cost calculations; persisted in localStorage.

const STORAGE_KEY = 'mOS_meals'

export type MealIngredient = {
  id: string
  name: string
  /** Full product price at the store (e.g. $4.99 for the bag). */
  packagePrice: number
  /** Total amount in the package (e.g. 32 oz). */
  packageAmount: number
  /** Amount used in this meal, same unit as the package (e.g. 4 oz). */
  amountUsed: number
  /** Unit label for display (e.g. oz, g, cup). */
  unit: string
}

/** @deprecated Legacy shape — migrated on load. */
type LegacyMealIngredient = {
  id: string
  name: string
  price?: number
  servingSize?: string
  packagePrice?: number
  packageAmount?: number
  amountUsed?: number
  unit?: string
}

export type Meal = {
  id: string
  name: string
  ingredients: MealIngredient[]
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeIngredient(raw: LegacyMealIngredient): MealIngredient {
  if (raw.packagePrice !== undefined && raw.packageAmount !== undefined) {
    return {
      id: raw.id,
      name: raw.name,
      packagePrice: Number(raw.packagePrice) || 0,
      packageAmount: Number(raw.packageAmount) || 0,
      amountUsed: Number(raw.amountUsed) || 0,
      unit: (raw.unit ?? '').trim(),
    }
  }
  // Legacy: `price` was treated as a flat line cost; `servingSize` was free text.
  return {
    id: raw.id,
    name: raw.name,
    packagePrice: Number(raw.price) || 0,
    packageAmount: 1,
    amountUsed: 1,
    unit: (raw.servingSize ?? '').trim(),
  }
}

function loadFromStorage(): Meal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<{ id: string; name: string; ingredients: LegacyMealIngredient[] }>
    if (!Array.isArray(parsed)) return []
    return parsed.map((m) => ({
      id: m.id,
      name: m.name,
      ingredients: (m.ingredients ?? []).map(normalizeIngredient),
    }))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load meals from localStorage', err)
    return []
  }
}

function saveToStorage(meals: Meal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals))
}

/** Cost of one ingredient line = package price × (used ÷ package size). */
export function ingredientCost(ingredient: MealIngredient): number {
  if (ingredient.packageAmount <= 0 || ingredient.amountUsed <= 0) return 0
  return ingredient.packagePrice * (ingredient.amountUsed / ingredient.packageAmount)
}

export function totalMealCost(meal: Meal): number {
  return meal.ingredients.reduce((sum, i) => sum + ingredientCost(i), 0)
}

export function totalMealPlanCost(meals: Meal[]): number {
  return meals.reduce((sum, m) => sum + totalMealCost(m), 0)
}

export function formatIngredientUsage(ingredient: MealIngredient): string {
  const unit = ingredient.unit ? ` ${ingredient.unit}` : ''
  return `${ingredient.amountUsed}${unit} of ${ingredient.packageAmount}${unit}`
}

export async function loadMeals(): Promise<Meal[]> {
  return loadFromStorage()
}

export function createMeal(input: {
  name: string
  ingredients: Omit<MealIngredient, 'id'>[]
}): Meal {
  const meals = loadFromStorage()
  const meal: Meal = {
    id: genId(),
    name: input.name.trim(),
    ingredients: input.ingredients.map((i) => ({
      id: genId(),
      name: i.name.trim(),
      packagePrice: Number(i.packagePrice) || 0,
      packageAmount: Number(i.packageAmount) || 0,
      amountUsed: Number(i.amountUsed) || 0,
      unit: (i.unit ?? '').trim(),
    })),
  }
  meals.push(meal)
  saveToStorage(meals)
  return meal
}

export function deleteMeal(id: string): boolean {
  const current = loadFromStorage()
  const meals = current.filter((m) => m.id !== id)
  if (meals.length === current.length) return false
  saveToStorage(meals)
  return true
}
