// src/pages/home/Hub.tsx
// Super-app home: greeting and module hub cards.

import { MdAccountBalance, MdFavorite } from 'react-icons/md'
import type { View } from '../../nav'

type Props = {
  onNavigate: (view: View) => void
}

const MODULES = [
  {
    view: 'finance' as const,
    label: 'Finance',
    description: 'Budget, spending & meals',
    Icon: MdAccountBalance,
    tint: 'var(--mos-module-finance)',
  },
  {
    view: 'health' as const,
    label: 'Health',
    description: 'Stack, mass & wellness',
    Icon: MdFavorite,
    tint: 'var(--mos-module-health)',
  },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Hub({ onNavigate }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-[var(--mos-text-muted)]">{getGreeting()}</p>
        <h2 className="mt-0.5 text-2xl font-bold tracking-tight text-[var(--mos-text)]">
          Your <span className="text-[var(--mos-accent)]">Hub</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MODULES.map(({ view, label, description, Icon, tint }) => (
          <button
            key={view}
            type="button"
            onClick={() => onNavigate(view)}
            className="mos-glass-card mos-clickable-card flex flex-col items-start rounded-2xl border p-4 text-left"
          >
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: tint, color: 'var(--mos-accent)' }}
            >
              <Icon size={22} />
            </div>
            <p className="font-semibold text-[var(--mos-text)]">{label}</p>
            <p className="mt-0.5 text-xs leading-snug text-[var(--mos-text-muted)]">
              {description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
