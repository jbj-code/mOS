// src/pages/finance/FinancePage.tsx
// Finance module: renders Budget or Meals based on the active bottom-nav section.

import type { FinanceSection } from '../../nav'
import Budget from './Budget'
import Meals from './Meals'

type Props = {
  section: FinanceSection
  mealAddOpen: boolean
  onCloseMealAdd: () => void
}

export default function FinancePage({ section, mealAddOpen, onCloseMealAdd }: Props) {
  if (section === 'meals') {
    return <Meals isAddOpen={mealAddOpen} onCloseAdd={onCloseMealAdd} />
  }
  return <Budget />
}
