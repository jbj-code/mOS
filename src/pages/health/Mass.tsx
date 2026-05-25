// src/pages/health/Mass.tsx
// Body weight log with trend chart, monthly average, and BMI.

import { useEffect, useMemo, useState } from 'react'
import { MdMonitorWeight, MdDelete, MdEdit } from 'react-icons/md'
import { MassTrendChart } from '../../components/MassTrendChart'
import { useLongPressReveal } from '../../hooks/useLongPressReveal'
import {
  loadMassEntries,
  createMassEntry,
  deleteMassEntry,
  formatMassDate,
  getHeightInches,
  setHeightInches,
  inchesToFeetInches,
  feetInchesToInches,
  computeBmi,
  bmiLabel,
  getChartPoints,
  getMonthlyAverage,
  type MassEntry,
} from '../../lib/mass'
import { getTodayLocalISO } from '../../lib/budget'

type Props = {
  isAddOpen: boolean
  onCloseAdd: () => void
}

export default function Mass({ isAddOpen, onCloseAdd }: Props) {
  const [entries, setEntries] = useState<MassEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState(getTodayLocalISO)
  const [weight, setWeight] = useState('')
  const [heightInches, setHeightInchesState] = useState<number | null>(() => getHeightInches())
  const [heightEditOpen, setHeightEditOpen] = useState(false)
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInchesInput, setHeightInchesInput] = useState('')
  const {
    revealId: deleteRevealId,
    startLongPress,
    cancelLongPress,
    onPointerEnd,
  } = useLongPressReveal()

  useEffect(() => {
    let ignore = false
    async function load() {
      const data = await loadMassEntries()
      if (!ignore) {
        setEntries(data)
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
      setDate(getTodayLocalISO())
      setWeight('')
    }
  }, [isAddOpen])

  useEffect(() => {
    if (heightEditOpen && heightInches !== null) {
      const { feet, inches } = inchesToFeetInches(heightInches)
      setHeightFeet(String(feet))
      setHeightInchesInput(String(inches))
    } else if (heightEditOpen) {
      setHeightFeet('')
      setHeightInchesInput('')
    }
  }, [heightEditOpen, heightInches])

  const latest = entries[0] ?? null
  const chartPoints = useMemo(() => getChartPoints(entries, 30), [entries])
  const monthlyAvg = useMemo(() => getMonthlyAverage(entries, 30), [entries])

  const delta = useMemo(() => {
    if (entries.length < 2) return null
    return entries[0].weight - entries[1].weight
  }, [entries])

  const trendDelta = useMemo(() => {
    if (chartPoints.length < 2) return null
    return chartPoints[chartPoints.length - 1].weight - chartPoints[0].weight
  }, [chartPoints])

  const bmi = useMemo(() => {
    if (!latest || !heightInches) return null
    return computeBmi(latest.weight, heightInches)
  }, [latest, heightInches])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const w = Number(weight)
    if (Number.isNaN(w) || w <= 0) return
    const entry = createMassEntry({ date, weight: w })
    setEntries((prev) => [entry, ...prev].sort((a, b) => (b.date > a.date ? 1 : -1)))
    onCloseAdd()
  }

  function handleDelete(id: string) {
    if (!deleteMassEntry(id)) return
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function handleSaveHeight(e: React.FormEvent) {
    e.preventDefault()
    const feet = Number(heightFeet) || 0
    const inches = Number(heightInchesInput) || 0
    const total = feetInchesToInches(feet, inches)
    if (total <= 0) return
    setHeightInches(total)
    setHeightInchesState(total)
    setHeightEditOpen(false)
  }

  const heightDisplay =
    heightInches !== null
      ? `${inchesToFeetInches(heightInches).feet}'${inchesToFeetInches(heightInches).inches}"`
      : null

  return (
    <div className="space-y-4">
      <div className="mos-glass-card rounded-2xl border p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--mos-text-muted)]">
              Current weight
            </p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums text-[var(--mos-accent)]">
              {latest ? (
                <>
                  {latest.weight.toFixed(1)} <span className="text-lg">lbs</span>
                </>
              ) : (
                <span className="text-lg text-[var(--mos-text-muted)]">—</span>
              )}
            </p>
            {delta !== null && (
              <p
                className="mt-1 text-sm tabular-nums"
                style={{ color: delta <= 0 ? 'var(--mos-accent)' : 'var(--mos-danger)' }}
              >
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)} lbs vs last entry
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--mos-text-muted)]">
              30-day avg
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--mos-text)]">
              {monthlyAvg !== null ? `${monthlyAvg.toFixed(1)} lbs` : '—'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--mos-border-muted)] pt-3">
          <div>
            <p className="text-xs text-[var(--mos-text-muted)]">Height</p>
            <p className="text-sm font-medium text-[var(--mos-text)]">
              {heightDisplay ?? 'Not set'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--mos-text-muted)]">BMI</p>
            <p className="text-sm font-semibold tabular-nums text-[var(--mos-text)]">
              {bmi !== null ? (
                <>
                  {bmi.toFixed(1)}{' '}
                  <span className="font-normal text-[var(--mos-text-muted)]">
                    ({bmiLabel(bmi)})
                  </span>
                </>
              ) : (
                '—'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHeightEditOpen(true)}
            className="mos-page-header-action shrink-0 border border-[var(--mos-border)] bg-[var(--mos-bg-muted)]"
            aria-label="Edit height"
          >
            <MdEdit className="mos-icon text-[var(--mos-text-muted)]" size={20} />
          </button>
        </div>
      </div>

      <div className="mos-glass-card rounded-2xl border p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--mos-text)]">30-day trend</p>
          {trendDelta !== null && (
            <p
              className="text-xs tabular-nums font-medium"
              style={{ color: trendDelta <= 0 ? 'var(--mos-accent)' : 'var(--mos-danger)' }}
            >
              {trendDelta > 0 ? '+' : ''}
              {trendDelta.toFixed(1)} lbs
            </p>
          )}
        </div>
        <MassTrendChart points={chartPoints} />
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--mos-text-muted)]">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-[var(--mos-text-muted)]">
          No weigh-ins yet. Tap + to log your weight.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const isRevealed = deleteRevealId === entry.id
            return (
              <li
                key={entry.id}
                className={`mos-glass-card flex overflow-hidden rounded-2xl border transition-[border-color] ${
                  isRevealed ? 'border-[var(--mos-border-muted)]' : ''
                }`}
              >
                <div
                  className="flex min-w-0 flex-1 items-center gap-3 p-3"
                  onTouchStart={(e) =>
                    startLongPress(entry.id, e.touches[0].clientX, e.touches[0].clientY)
                  }
                  onTouchMove={(e) =>
                    cancelLongPress(e.touches[0].clientX, e.touches[0].clientY)
                  }
                  onTouchEnd={() => onPointerEnd(entry.id)}
                  onMouseDown={(e) => startLongPress(entry.id, e.clientX, e.clientY)}
                  onMouseMove={(e) => {
                    if (e.buttons === 1) cancelLongPress(e.clientX, e.clientY)
                  }}
                  onMouseUp={() => onPointerEnd(entry.id)}
                  onMouseLeave={(e) => {
                    if (e.buttons === 1) cancelLongPress(e.clientX, e.clientY)
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--mos-module-health)' }}
                  >
                    <MdMonitorWeight className="text-[var(--mos-accent)]" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold tabular-nums text-[var(--mos-text)]">
                      {entry.weight.toFixed(1)} lbs
                    </p>
                    <p className="text-xs text-[var(--mos-text-muted)]">
                      {formatMassDate(entry.date)}
                    </p>
                  </div>
                </div>
                {isRevealed && (
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="flex min-w-[72px] items-center justify-center bg-[var(--mos-danger)] px-3 text-xs font-medium text-white"
                    aria-label="Delete entry"
                  >
                    <MdDelete size={18} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {isAddOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Log weight"
          onClick={onCloseAdd}
        >
          <form
            onSubmit={handleAdd}
            className="mos-modal-panel mos-glass-card w-full max-w-md rounded-t-3xl border border-b-0 p-4 sm:rounded-3xl sm:border-b sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--mos-text)]">Log weight</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mos-input mt-1 h-10 w-full rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mos-input mt-1 h-10 w-full rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-2 text-[var(--mos-text)]"
                />
              </div>
              <button
                type="submit"
                disabled={!weight.trim()}
                className="w-full rounded-xl bg-[var(--mos-accent)] py-3 text-sm font-semibold text-[var(--mos-accent-contrast)] disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {heightEditOpen && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 px-3 pt-12 pb-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Set height"
          onClick={() => setHeightEditOpen(false)}
        >
          <form
            onSubmit={handleSaveHeight}
            className="mos-modal-panel mos-glass-card w-full max-w-md rounded-t-3xl border border-b-0 p-4 sm:rounded-3xl sm:border-b sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--mos-text)]">Your height</h3>
            <p className="mt-1 text-xs text-[var(--mos-text-muted)]">
              Used to calculate BMI from your latest weigh-in.
            </p>
            <div className="mt-4 flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">Feet</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="8"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="mos-input mt-1 h-10 w-full rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)]"
                  autoFocus
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-[var(--mos-text-muted)]">Inches</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="11"
                  value={heightInchesInput}
                  onChange={(e) => setHeightInchesInput(e.target.value)}
                  className="mos-input mt-1 h-10 w-full rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg)] px-3 text-[var(--mos-text)]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-[var(--mos-accent)] py-3 text-sm font-semibold text-[var(--mos-accent-contrast)]"
            >
              Save height
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
