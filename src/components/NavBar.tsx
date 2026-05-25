// src/components/NavBar.tsx
// Bottom navigation: root hub nav or module-specific sub-nav with Home on the left.

import {
  MdHome,
  MdAccountBalance,
  MdFavorite,
  MdPieChart,
  MdRestaurant,
  MdScience,
  MdMonitorWeight,
} from 'react-icons/md'
import type { View, FinanceSection, HealthSection } from '../nav'
import type { IconType } from 'react-icons'

type RootItem = { kind: 'root'; view: View; label: string; Icon: IconType }
type FinanceItem = { kind: 'finance'; section: FinanceSection | 'home'; label: string; Icon: IconType }
type HealthItem = { kind: 'health'; section: HealthSection | 'home'; label: string; Icon: IconType }

type NavItem = RootItem | FinanceItem | HealthItem

type Props = {
  view: View
  financeSection: FinanceSection
  healthSection: HealthSection
  onGoHome: () => void
  onChangeView: (view: View) => void
  onChangeFinanceSection: (section: FinanceSection) => void
  onChangeHealthSection: (section: HealthSection) => void
}

const ROOT_ITEMS: RootItem[] = [
  { kind: 'root', view: 'home', label: 'Home', Icon: MdHome },
  { kind: 'root', view: 'finance', label: 'Finance', Icon: MdAccountBalance },
  { kind: 'root', view: 'health', label: 'Health', Icon: MdFavorite },
]

const FINANCE_ITEMS: FinanceItem[] = [
  { kind: 'finance', section: 'home', label: 'Home', Icon: MdHome },
  { kind: 'finance', section: 'budget', label: 'Budget', Icon: MdPieChart },
  { kind: 'finance', section: 'meals', label: 'Meals', Icon: MdRestaurant },
]

const HEALTH_ITEMS: HealthItem[] = [
  { kind: 'health', section: 'home', label: 'Home', Icon: MdHome },
  { kind: 'health', section: 'stack', label: 'Stack', Icon: MdScience },
  { kind: 'health', section: 'mass', label: 'Mass', Icon: MdMonitorWeight },
]

function getItems(view: View): NavItem[] {
  if (view === 'finance') return FINANCE_ITEMS
  if (view === 'health') return HEALTH_ITEMS
  return ROOT_ITEMS
}

function isActive(
  item: NavItem,
  view: View,
  financeSection: FinanceSection,
  healthSection: HealthSection,
): boolean {
  if (item.kind === 'root') return view === item.view
  if (item.kind === 'finance') {
    if (item.section === 'home') return false
    return view === 'finance' && financeSection === item.section
  }
  if (item.section === 'home') return false
  return view === 'health' && healthSection === item.section
}

export function NavBar({
  view,
  financeSection,
  healthSection,
  onGoHome,
  onChangeView,
  onChangeFinanceSection,
  onChangeHealthSection,
}: Props) {
  const items = getItems(view)

  function handleClick(item: NavItem) {
    if (item.kind === 'root') {
      onChangeView(item.view)
      return
    }
    if (item.kind === 'finance') {
      if (item.section === 'home') {
        onGoHome()
        return
      }
      onChangeView('finance')
      onChangeFinanceSection(item.section)
      return
    }
    if (item.section === 'home') {
      onGoHome()
      return
    }
    onChangeView('health')
    onChangeHealthSection(item.section)
  }

  return (
    <nav className="mos-nav-bar pointer-events-none flex justify-center px-3">
      <div className="mos-nav-bar-inner pointer-events-auto flex w-full max-w-xl items-center justify-between border border-[var(--mos-border)] bg-[var(--mos-nav-bg)] px-2 py-1.5 text-xs backdrop-blur-xl">
        {items.map((item) => {
          const active = isActive(item, view, financeSection, healthSection)
          const key =
            item.kind === 'root'
              ? item.view
              : `${item.kind}-${item.section}`
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleClick(item)}
              className={`mos-nav-item mos-clickable flex flex-1 flex-col items-center gap-0.5 min-h-[44px] justify-center rounded-xl py-1.5 ${
                active ? 'mos-nav-item--active' : ''
              }`}
            >
              <item.Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
