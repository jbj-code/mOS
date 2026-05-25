// src/pages/health/HealthPage.tsx
// Health module: renders Stack or Mass based on the active bottom-nav section.

import type { HealthSection } from '../../nav'
import Stack from './Stack'
import Mass from './Mass'

type Props = {
  section: HealthSection
  stackAddOpen: boolean
  massAddOpen: boolean
  onCloseStackAdd: () => void
  onCloseMassAdd: () => void
}

export default function HealthPage({
  section,
  stackAddOpen,
  massAddOpen,
  onCloseStackAdd,
  onCloseMassAdd,
}: Props) {
  if (section === 'mass') {
    return <Mass isAddOpen={massAddOpen} onCloseAdd={onCloseMassAdd} />
  }
  return <Stack isAddOpen={stackAddOpen} onCloseAdd={onCloseStackAdd} />
}
