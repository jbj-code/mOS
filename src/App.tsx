// src/App.tsx
// Root app shell: password gate, view routing, layout modes, and page headers.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  MdLightMode,
  MdDarkMode,
  MdAddCircle,
  MdPhoneIphone,
  MdComputer,
} from 'react-icons/md'
import { useTheme } from './hooks/useTheme'
import { useViewMode } from './hooks/useViewMode'
import Home from './pages/Home'
import Meals from './pages/Meals'
import Supplements from './pages/Supplements'
import './style.css'
import type { View } from './nav'
import { NavBar } from './components/NavBar'
import { PasswordGate, getIsUnlocked, isPasswordEnabled } from './components/PasswordGate'
import { ErrorBoundary } from './components/ErrorBoundary'

const PAGE_CONFIG: Record<View, { title: string; subtitle: string }> = {
  home: {
    title: 'mOS',
    subtitle: '',
  },
  meal: {
    title: 'Meals',
    subtitle: '',
  },
  supplements: {
    title: 'Supplements',
    subtitle: '',
  },
}

export default function App() {
  const [unlocked, setUnlocked] = useState(getIsUnlocked)
  const { theme, setTheme } = useTheme()
  const { viewMode, toggleViewMode } = useViewMode()
  const [view, setView] = useState<View>('home')
  const [mealAddOpen, setMealAddOpen] = useState(false)
  const [supplementAddOpen, setSupplementAddOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  if (isPasswordEnabled() && !unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  const config = PAGE_CONFIG[view]
  const viewModeToggle = (
    <button
      type="button"
      onClick={toggleViewMode}
      className="mos-page-header-action"
      aria-label={viewMode === 'mobile' ? 'Switch to desktop view' : 'Switch to mobile view'}
      title={viewMode === 'mobile' ? 'Desktop view' : 'Mobile view'}
    >
      {viewMode === 'mobile' ? (
        <MdComputer className="mos-icon" size={24} />
      ) : (
        <MdPhoneIphone className="mos-icon" size={24} />
      )}
    </button>
  )
  const pageAction =
    view === 'home'
      ? (
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
        )
      : view === 'meal'
          ? (
              <button
                type="button"
                onClick={() => setMealAddOpen(true)}
                className="mos-page-header-action"
                aria-label="Add meal"
              >
                <MdAddCircle className="mos-icon" size={24} />
              </button>
            )
          : view === 'supplements'
            ? (
                <button
                  type="button"
                  onClick={() => setSupplementAddOpen(true)}
                  className="mos-page-header-action"
                  aria-label="Add supplement"
                >
                  <MdAddCircle className="mos-icon" size={24} />
                </button>
              )
            : null

  const setViewAndClose = (next: View) => {
    setView(next)
    if (next !== 'meal') setMealAddOpen(false)
    if (next !== 'supplements') setSupplementAddOpen(false)
  }

  const isHome = view === 'home'
  const mainContent = (
    <>
      <header
        className={`mos-page-header ${isHome ? 'mos-page-header--home' : ''}`}
      >
        <div className="mos-page-header-inner">
          <h1
            className={`mos-page-header-title ${isHome ? 'mos-page-header-title--bold' : ''}`}
          >
            {config.title}
          </h1>
          {config.subtitle ? (
            <p className="mos-page-header-subtitle">{config.subtitle}</p>
          ) : null}
        </div>
        {(view === 'home' && viewModeToggle) || pageAction ? (
          <div className="mos-page-header-right flex items-center gap-1">
            {view === 'home' && viewModeToggle}
            {pageAction}
          </div>
        ) : null}
      </header>

      {view === 'home' && <Home onView={setViewAndClose} />}
      {view === 'meal' && (
        <Meals
          isAddOpen={mealAddOpen}
          onCloseAdd={() => setMealAddOpen(false)}
        />
      )}
      {view === 'supplements' && (
        <Supplements
          isAddOpen={supplementAddOpen}
          onCloseAdd={() => setSupplementAddOpen(false)}
        />
      )}
    </>
  )

  return (
    <ErrorBoundary>
      {viewMode === 'desktop' ? (
        <div
          className="min-h-screen flex"
          style={{ background: 'var(--mos-bg)' }}
        >
          <NavBar
            viewMode="desktop"
            view={view}
            onChangeView={setViewAndClose}
          />
          <main className="mos-scrollbar-hide flex-1 min-w-0 overflow-auto">
            <div className="mx-auto max-w-2xl px-6 py-6">
              {mainContent}
            </div>
          </main>
        </div>
      ) : (
        <div
          className="min-h-screen flex justify-center px-3 py-4 sm:px-4 sm:py-6"
          style={{ background: 'var(--mos-bg)' }}
        >
          <div className="w-full max-w-xl min-w-0 pb-20">
            {mainContent}
          </div>

          {typeof document !== 'undefined' &&
            createPortal(
              <NavBar
                viewMode="mobile"
                view={view}
                onChangeView={setViewAndClose}
              />,
              document.body,
            )}
        </div>
      )}
    </ErrorBoundary>
  )
}
