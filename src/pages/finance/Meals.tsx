// src/pages/finance/Meals.tsx
// Meal planner: build meals from ingredients with proportional cost per serving.

import { useEffect, useMemo, useState } from 'react'
import { MdRestaurant, MdAdd, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useLongPressReveal } from '../../hooks/useLongPressReveal'
import {
  loadMeals,
  createMeal,
  deleteMeal,
  totalMealCost,
  totalMealPlanCost,
  ingredientCost,
  formatIngredientUsage,
  type Meal,
} from '../../lib/meals'

type Props = {
  isAddOpen: boolean
  onCloseAdd: () => void
}

type IngredientRow = {
  key: string
  name: string
  packagePrice: string
  packageAmount: string
  amountUsed: string
  unit: string
}

const EMPTY_ROW = (): IngredientRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  packagePrice: '',
  packageAmount: '',
  amountUsed: '',
  unit: '',
})

function rowCost(row: IngredientRow): number {
  const price = Number(row.packagePrice) || 0
  const pkg = Number(row.packageAmount) || 0
  const used = Number(row.amountUsed) || 0
  if (pkg <= 0 || used <= 0) return 0
  return price * (used / pkg)
}

export default function Meals({ isAddOpen, onCloseAdd }: Props) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mealName, setMealName] = useState('')
  const [ingredients, setIngredients] = useState<IngredientRow[]>([EMPTY_ROW()])
  const [addError, setAddError] = useState<string | null>(null)
  const {
    revealId: deleteRevealId,
    startLongPress,
    cancelLongPress,
    onPointerEnd,
    clearLongPressTimer,
  } = useLongPressReveal()

  useEffect(() => {
    let ignore = false
    async function load() {
      const data = await loadMeals()
      if (!ignore) {
        setMeals(data)
        setIsLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (isAddOpen) {
      setMealName('')
      setIngredients([EMPTY_ROW()])
      setAddError(null)
    }
  }, [isAddOpen])

  const planTotal = useMemo(() => totalMealPlanCost(meals), [meals])
  const draftTotal = useMemo(
    () => ingredients.reduce((sum, row) => sum + rowCost(row), 0),
    [ingredients],
  )

  function addIngredientRow() {
    setIngredients((prev) => [...prev, EMPTY_ROW()])
  }

  function removeIngredientRow(key: string) {
    setIngredients((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)))
  }

  function updateRow(key: string, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    )
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = mealName.trim()
    const list = ingredients
      .map((r) => ({
        name: r.name.trim(),
        packagePrice: Number(r.packagePrice) || 0,
        packageAmount: Number(r.packageAmount) || 0,
        amountUsed: Number(r.amountUsed) || 0,
        unit: r.unit.trim(),
      }))
      .filter((i) => i.name && i.packageAmount > 0 && i.amountUsed > 0)

    if (!name) {
      setAddError('Enter a meal name.')
      return
    }
    if (list.length === 0) {
      setAddError('Add at least one ingredient with name, package size, and amount used.')
      return
    }
    const meal = createMeal({ name, ingredients: list })
    setMeals((prev) => [...prev, meal].sort((a, b) => a.name.localeCompare(b.name)))
    onCloseAdd()
  }

  function handleDelete(id: string) {
    if (!deleteMeal(id)) return
    setMeals((prev) => prev.filter((m) => m.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="relative w-full max-w-xl min-w-0">
      {!isLoading && meals.length > 0 && (
        <div className="mos-glass-card mb-4 rounded-2xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--mos-text-muted)]">
            Meal plan total
          </p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-[var(--mos-accent)]">
            ${planTotal.toFixed(2)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--mos-text-muted)]">
            {meals.length} meal{meals.length !== 1 ? 's' : ''} · avg $
            {(planTotal / meals.length).toFixed(2)} each
          </p>
        </div>
      )}

      <section className="space-y-3 pb-20">
        {isLoading ? (
          <p className="text-sm text-[var(--mos-text-muted)]">Loading...</p>
        ) : meals.length === 0 ? (
          <p className="text-sm text-[var(--mos-text-muted)]">
            No meals yet. Tap + to build your first meal — add each ingredient with its
            product cost, package size, and how much you use per serving.
          </p>
        ) : (
          <ul className="space-y-3">
            {meals.map((meal) => {
              const isRevealed = deleteRevealId === meal.id
              const cost = totalMealCost(meal)
              const isExpanded = expandedId === meal.id
              return (
                <li
                  key={meal.id}
                  className={`mos-glass-card overflow-hidden rounded-2xl border transition-[border-color] ${
                    isRevealed ? 'border-[var(--mos-border-muted)]' : ''
                  }`}
                >
                  <div className="flex min-w-0">
                    <div
                      className="flex min-w-0 flex-1 flex-col p-4"
                      onTouchStart={(e) =>
                        startLongPress(meal.id, e.touches[0].clientX, e.touches[0].clientY)
                      }
                      onTouchMove={(e) =>
                        cancelLongPress(e.touches[0].clientX, e.touches[0].clientY)
                      }
                      onTouchEnd={() => onPointerEnd(meal.id)}
                      onMouseDown={(e) => startLongPress(meal.id, e.clientX, e.clientY)}
                      onMouseMove={(e) => {
                        if (e.buttons === 1) cancelLongPress(e.clientX, e.clientY)
                      }}
                      onMouseUp={() => onPointerEnd(meal.id)}
                      onMouseLeave={(e) => {
                        if (e.buttons === 1) clearLongPressTimer()
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-[var(--mos-text)]">
                            {meal.name}
                          </p>
                          <p className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--mos-accent)]">
                            ${cost.toFixed(2)}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--mos-text-muted)]">
                            {meal.ingredients.length} ingredient
                            {meal.ingredients.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : meal.id)
                          }
                          className="mos-clickable shrink-0 rounded-lg p-1 text-[var(--mos-text-muted)] hover:bg-[var(--mos-bg-muted)]"
                          aria-label={isExpanded ? 'Hide ingredients' : 'Show ingredients'}
                        >
                          {isExpanded ? (
                            <MdExpandLess size={22} />
                          ) : (
                            <MdExpandMore size={22} />
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <ul className="mt-3 space-y-2 border-t border-[var(--mos-border-muted)] pt-3">
                          {meal.ingredients.map((ing) => (
                            <li
                              key={ing.id}
                              className="flex items-start justify-between gap-2 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-[var(--mos-text)]">{ing.name}</p>
                                <p className="text-xs text-[var(--mos-text-muted)]">
                                  {formatIngredientUsage(ing)} · ${ing.packagePrice.toFixed(2)}{' '}
                                  product
                                </p>
                              </div>
                              <p className="shrink-0 tabular-nums font-medium text-[var(--mos-text)]">
                                ${ingredientCost(ing).toFixed(2)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {isRevealed && (
                      <button
                        type="button"
                        onClick={() => handleDelete(meal.id)}
                        className="flex min-w-[72px] items-center justify-center bg-[var(--mos-danger)] px-3 text-xs font-medium text-white"
                        aria-label="Delete meal"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4 sm:pb-0">
          <div className="mos-modal-panel w-full max-w-md rounded-t-3xl border border-b-0 border-[var(--mos-border)] bg-[var(--mos-bg-elevated)] p-3 shadow-[var(--mos-shadow-lg)] sm:rounded-3xl sm:border-b sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mos-bg-muted)]">
                  <MdRestaurant className="text-[var(--mos-text-muted)]" size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--mos-text)]">Add meal</h2>
                  {draftTotal > 0 && (
                    <p className="text-xs tabular-nums text-[var(--mos-accent)]">
                      Est. ${draftTotal.toFixed(2)} per serving
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseAdd}
                className="text-[var(--mos-text-muted)] hover:text-[var(--mos-text)]"
              >
                Cancel
              </button>
            </div>
            {addError && (
              <p
                className="mb-2 rounded-xl px-3 py-2 text-xs text-[var(--mos-danger)] sm:mb-3"
                style={{ background: 'var(--mos-spent-bg)' }}
              >
                {addError}
              </p>
            )}
            <form onSubmit={handleAdd} className="space-y-2 sm:space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                  Meal name
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Chicken stir fry"
                  className="mos-input h-10 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)] outline-none focus:border-[var(--mos-accent)]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                  Ingredients
                </label>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--mos-accent)] hover:bg-[var(--mos-income-bg)]"
                >
                  <MdAdd size={16} />
                  Add ingredient
                </button>
              </div>

              <p className="text-[11px] leading-snug text-[var(--mos-text-muted)]">
                For each ingredient: what the product costs, how much is in the package, and
                how much this meal uses (same unit).
              </p>

              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {ingredients.map((row) => (
                  <div
                    key={row.key}
                    className="space-y-2 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] p-2"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.key, 'name', e.target.value)}
                        placeholder="Ingredient name"
                        className="mos-input h-9 min-w-0 flex-1 rounded-lg border border-[var(--mos-border)] bg-transparent px-2 text-sm text-[var(--mos-text)] outline-none focus:border-[var(--mos-accent)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredientRow(row.key)}
                        disabled={ingredients.length <= 1}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--mos-text-muted)] hover:bg-[var(--mos-bg-muted)] hover:text-[var(--mos-danger)] disabled:opacity-40"
                        aria-label="Remove ingredient"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[var(--mos-text-muted)]">
                          Product cost ($)
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={row.packagePrice}
                          onChange={(e) =>
                            updateRow(row.key, 'packagePrice', e.target.value)
                          }
                          placeholder="4.99"
                          className="mos-input mt-0.5 h-9 w-full rounded-lg border border-[var(--mos-border)] bg-transparent px-2 text-sm tabular-nums text-[var(--mos-text)] outline-none focus:border-[var(--mos-accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--mos-text-muted)]">
                          Unit (oz, g, cup…)
                        </label>
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => updateRow(row.key, 'unit', e.target.value)}
                          placeholder="oz"
                          className="mos-input mt-0.5 h-9 w-full rounded-lg border border-[var(--mos-border)] bg-transparent px-2 text-sm text-[var(--mos-text)] outline-none focus:border-[var(--mos-accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--mos-text-muted)]">
                          Package size
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={row.packageAmount}
                          onChange={(e) =>
                            updateRow(row.key, 'packageAmount', e.target.value)
                          }
                          placeholder="32"
                          className="mos-input mt-0.5 h-9 w-full rounded-lg border border-[var(--mos-border)] bg-transparent px-2 text-sm tabular-nums text-[var(--mos-text)] outline-none focus:border-[var(--mos-accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--mos-text-muted)]">
                          Used in meal
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min="0"
                          value={row.amountUsed}
                          onChange={(e) =>
                            updateRow(row.key, 'amountUsed', e.target.value)
                          }
                          placeholder="4"
                          className="mos-input mt-0.5 h-9 w-full rounded-lg border border-[var(--mos-border)] bg-transparent px-2 text-sm tabular-nums text-[var(--mos-text)] outline-none focus:border-[var(--mos-accent)]"
                        />
                      </div>
                    </div>
                    {rowCost(row) > 0 && (
                      <p className="text-right text-xs tabular-nums text-[var(--mos-accent)]">
                        ${rowCost(row).toFixed(2)} for this meal
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={!mealName.trim()}
                className="mt-2 w-full rounded-xl bg-[var(--mos-accent)] py-3 text-sm font-semibold text-[var(--mos-accent-contrast)] disabled:opacity-50"
              >
                Save meal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
