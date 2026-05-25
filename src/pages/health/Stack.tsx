// src/pages/health/Stack.tsx
// Supplement stack: track supplements with cost-per-serving and monthly cost.

import { useEffect, useState } from 'react'
import { MdScience } from 'react-icons/md'
import { useLongPressReveal } from '../../hooks/useLongPressReveal'
import {
  loadSupplements,
  createSupplement,
  deleteSupplement,
  costPerServing,
  monthlyCost,
  type Supplement,
} from '../../lib/supplements'

type Props = {
  isAddOpen: boolean
  onCloseAdd: () => void
}

export default function Stack({ isAddOpen, onCloseAdd }: Props) {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [servingsPerContainer, setServingsPerContainer] = useState('')
  const [servingsPerDay, setServingsPerDay] = useState('1')
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
      setIsLoading(true)
      const data = await loadSupplements()
      if (!ignore) {
        setSupplements(data)
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
      setServingsPerDay('1')
      setAddError(null)
    }
  }, [isAddOpen])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const priceNum = Number(price)
    const servingsNum = Number(servingsPerContainer)
    const perDayNum = Number(servingsPerDay) || 1
    if (
      !name.trim() ||
      Number.isNaN(priceNum) ||
      priceNum < 0 ||
      Number.isNaN(servingsNum) ||
      servingsNum < 1
    )
      return

    const result = await createSupplement({
      name: name.trim(),
      price: priceNum,
      servingsPerContainer: servingsNum,
      servingsPerDay: perDayNum < 0 ? 1 : perDayNum,
    })
    if (result.error || !result.data) {
      if (result.error) setAddError(result.error)
      return
    }
    const added = result.data

    setSupplements((prev) =>
      [...prev, added].sort((a, b) => a.name.localeCompare(b.name)),
    )
    setName('')
    setPrice('')
    setServingsPerContainer('')
    setServingsPerDay('1')
    setAddError(null)
    onCloseAdd()
  }

  async function handleDelete(id: string) {
    const ok = await deleteSupplement(id)
    if (!ok) return
    setSupplements((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="relative w-full max-w-xl min-w-0">
      <section className="space-y-3 pb-20">
        {isLoading ? (
          <p className="text-sm text-[var(--mos-text-muted)]">Loading...</p>
        ) : supplements.length === 0 ? (
          <p className="text-sm text-[var(--mos-text-muted)]">
            No supplements yet. Tap + to add one.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-3">
            {supplements.map((s) => {
              const isRevealed = deleteRevealId === s.id
              const perServing = costPerServing(s)
              const perMonth = monthlyCost(s)
              return (
                <li
                  key={s.id}
                  className={`mos-clickable-card flex min-w-0 overflow-hidden rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-bg-elevated)] shadow-[var(--mos-shadow)] transition-[border-color] duration-200 ${
                    isRevealed ? 'border-[var(--mos-border-muted)]' : ''
                  }`}
                >
                  <div
                    className="flex min-w-0 flex-1 flex-col items-center p-4 text-center transition-[flex] duration-200"
                    style={{ flex: isRevealed ? '1 1 0%' : undefined }}
                    onTouchStart={(e) =>
                      startLongPress(
                        s.id,
                        e.touches[0].clientX,
                        e.touches[0].clientY,
                      )
                    }
                    onTouchMove={(e) =>
                      cancelLongPress(
                        e.touches[0].clientX,
                        e.touches[0].clientY,
                      )
                    }
                    onTouchEnd={() => onPointerEnd(s.id)}
                    onMouseDown={(e) =>
                      startLongPress(s.id, e.clientX, e.clientY)
                    }
                    onMouseMove={(e) => {
                      if (e.buttons === 1) {
                        cancelLongPress(e.clientX, e.clientY)
                      }
                    }}
                    onMouseUp={() => onPointerEnd(s.id)}
                    onMouseLeave={(e) => {
                      if (e.buttons === 1) clearLongPressTimer()
                    }}
                  >
                    <p className="text-base font-semibold text-[var(--mos-text)]">
                      {s.name}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--mos-accent)]">
                      ${perMonth.toFixed(2)}/mo
                    </p>
                    <p className="mt-1 text-xs text-[var(--mos-text-muted)]">
                      ${s.price.toFixed(2)} · {s.servingsPerContainer} servings
                      {s.servingsPerDay !== 1 && s.servingsPerDay !== 1.0
                        ? ` · ${s.servingsPerDay}/day`
                        : ''}{' '}
                      → ${perServing.toFixed(2)}/serving
                    </p>
                  </div>
                  <div
                    className="flex shrink-0 items-center overflow-hidden transition-[width,opacity] duration-200 ease-out"
                    style={{
                      width: isRevealed ? 72 : 0,
                      opacity: isRevealed ? 1 : 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        handleDelete(s.id)
                      }}
                      className="flex h-full min-w-[72px] items-center justify-center rounded-r-2xl bg-[var(--mos-danger)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--mos-danger-hover)] active:opacity-90"
                      aria-label="Delete supplement"
                    >
                      Delete
                    </button>
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
                  <MdScience className="text-[var(--mos-text-muted)]" size={20} />
                </div>
                <h2 className="text-sm font-semibold text-[var(--mos-text)]">
                  Add supplement
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCloseAdd()
                  setName('')
                  setPrice('')
                  setServingsPerContainer('')
                  setServingsPerDay('1')
                  setAddError(null)
                }}
                className="text-[var(--mos-text-muted)] hover:text-[var(--mos-text)]"
              >
                Cancel
              </button>
            </div>
            {addError && (
              <p className="mb-2 rounded-xl px-3 py-2 text-xs text-[var(--mos-danger)] sm:mb-3" style={{ background: 'var(--mos-spent-bg)' }}>
                {addError}
              </p>
            )}
            <form
              id="add-supplement-form"
              onSubmit={handleAdd}
              className="space-y-2 sm:space-y-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vitamin D3"
                  className="mos-input h-10 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)] outline-none ring-0 focus:border-[var(--mos-accent)] focus:ring-2 focus:ring-[var(--mos-accent)]/30"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                    Servings per day
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={servingsPerDay}
                    onChange={(e) => setServingsPerDay(e.target.value)}
                    placeholder="1"
                    className="mos-input h-10 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)] outline-none ring-0 focus:border-[var(--mos-accent)] focus:ring-2 focus:ring-[var(--mos-accent)]/30"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                    Servings per container
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={servingsPerContainer}
                    onChange={(e) => setServingsPerContainer(e.target.value)}
                    placeholder="30"
                    className="mos-input h-10 rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)] outline-none ring-0 focus:border-[var(--mos-accent)] focus:ring-2 focus:ring-[var(--mos-accent)]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                  Price
                </label>
                <div className="mt-1 flex items-baseline rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg-elevated)] shadow-[var(--mos-shadow)]">
                  <span className="mos-amount-input py-4 pl-4 font-semibold tabular-nums text-[var(--mos-text)]">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="mos-amount-input w-full min-w-0 border-0 bg-transparent py-4 pr-4 pl-1 font-semibold tabular-nums text-[var(--mos-text)] outline-none focus:ring-0"
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-2 sm:mt-3">
                <button
                  type="submit"
                  disabled={
                    !name.trim() ||
                    !price.trim() ||
                    !servingsPerContainer.trim() ||
                    Number(price) < 0 ||
                    Number(servingsPerContainer) < 1
                  }
                  className="w-full rounded-xl bg-[var(--mos-accent)] py-3 text-sm font-semibold text-[var(--mos-accent-contrast)] shadow transition hover:opacity-90 active:opacity-95 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
