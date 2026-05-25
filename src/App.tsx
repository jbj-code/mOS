// src/App.tsx
// Root app shell: password gate, view routing, module sections, and page layout.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MdLightMode, MdDarkMode, MdAddCircle } from 'react-icons/md'
import { useTheme } from './hooks/useTheme'
import Hub from './pages/home/Hub'
import FinancePage from './pages/finance/FinancePage'
import HealthPage from './pages/health/HealthPage'
import './style.css'
import {
  PAGE_TITLES,
  type View,
  type FinanceSection,
  type HealthSection,
} from './nav'
import { NavBar } from './components/NavBar'
import { PasswordGate, getIsUnlocked, isPasswordEnabled } from './components/PasswordGate'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  const [unlocked, setUnlocked] = useState(getIsUnlocked)
  const { theme, setTheme } = useTheme()
  const [view, setView] = useState<View>('home')
  const [financeSection, setFinanceSection] = useState<FinanceSection>('budget')
  const [healthSection, setHealthSection] = useState<HealthSection>('stack')
  const [mealAddOpen, setMealAddOpen] = useState(false)
  const [stackAddOpen, setStackAddOpen] = useState(false)
  const [massAddOpen, setMassAddOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, financeSection, healthSection])

  useEffect(() => {
    setMealAddOpen(false)
    setStackAddOpen(false)
    setMassAddOpen(false)
  }, [view, financeSection, healthSection])

  if (isPasswordEnabled() && !unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  const isHome = view === 'home'
  const showFinanceAdd = view === 'finance' && financeSection === 'meals'
  const showHealthAdd = view === 'health'

  function handleGoHome() {
    setView('home')
  }

  function handleChangeView(next: View) {
    setView(next)
    if (next === 'finance') setFinanceSection('budget')
    if (next === 'health') setHealthSection('stack')
  }

  function handleNavigateFromHub(next: View) {
    setView(next)
    if (next === 'finance') setFinanceSection('budget')
    if (next === 'health') setHealthSection('stack')
  }

  return (
    <ErrorBoundary>
      <div className="mos-app-shell min-h-screen flex justify-center px-3 py-4 sm:px-4 sm:py-6">
        <div className="w-full max-w-xl min-w-0 pb-24">
          <header
            className={`mos-page-header ${isHome ? 'mos-page-header--home' : ''}`}
          >
            <div className="mos-page-header-inner">
              <h1
                className={`mos-page-header-title ${isHome ? 'mos-page-header-title--bold' : ''}`}
              >
                {PAGE_TITLES[view]}
              </h1>
            </div>
            <div className="mos-page-header-right flex items-center gap-1">
              {showFinanceAdd && (
                <button
                  type="button"
                  onClick={() => setMealAddOpen(true)}
                  className="mos-page-header-action border border-[var(--mos-border)] bg-[var(--mos-bg-elevated)]"
                  aria-label="Add meal"
                >
                  <MdAddCircle className="mos-icon text-[var(--mos-accent)]" size={24} />
                </button>
              )}
              {showHealthAdd && (
                <button
                  type="button"
                  onClick={() =>
                    healthSection === 'stack'
                      ? setStackAddOpen(true)
                      : setMassAddOpen(true)
                  }
                  className="mos-page-header-action border border-[var(--mos-border)] bg-[var(--mos-bg-elevated)]"
                  aria-label={
                    healthSection === 'stack' ? 'Add supplement' : 'Log weight'
                  }
                >
                  <MdAddCircle className="mos-icon text-[var(--mos-accent)]" size={24} />
                </button>
              )}
              {isHome && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="mos-page-header-action"
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? (
                    <MdDarkMode className="mos-icon" size={24} />
                  ) : (
                    <MdLightMode className="mos-icon" size={24} />
                  )}
                </button>
              )}
            </div>
          </header>

          {view === 'home' && <Hub onNavigate={handleNavigateFromHub} />}
          {view === 'finance' && (
            <FinancePage
              section={financeSection}
              mealAddOpen={mealAddOpen}
              onCloseMealAdd={() => setMealAddOpen(false)}
            />
          )}
          {view === 'health' && (
            <HealthPage
              section={healthSection}
              stackAddOpen={stackAddOpen}
              massAddOpen={massAddOpen}
              onCloseStackAdd={() => setStackAddOpen(false)}
              onCloseMassAdd={() => setMassAddOpen(false)}
            />
          )}
        </div>

        {typeof document !== 'undefined' &&
          createPortal(
            <NavBar
              view={view}
              financeSection={financeSection}
              healthSection={healthSection}
              onGoHome={handleGoHome}
              onChangeView={handleChangeView}
              onChangeFinanceSection={setFinanceSection}
              onChangeHealthSection={setHealthSection}
            />,
            document.body,
          )}
      </div>
    </ErrorBoundary>
  )
}
