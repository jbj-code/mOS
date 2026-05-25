// src/components/PasswordGate.tsx
// Client-side password lock screen; unlock state stored in sessionStorage.

import { useState } from 'react'
import type { FormEvent } from 'react'

const STORAGE_KEY = 'mOS_unlocked'

export function isPasswordEnabled(): boolean {
  return Boolean(import.meta.env.VITE_APP_PASSWORD)
}

export function getIsUnlocked(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(STORAGE_KEY) === '1'
}

export function setUnlocked(): void {
  sessionStorage.setItem(STORAGE_KEY, '1')
}

type Props = {
  onUnlock: () => void
}

export function PasswordGate({ onUnlock }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (password === import.meta.env.VITE_APP_PASSWORD) {
      setUnlocked()
      onUnlock()
      window.location.reload()
    } else {
      setError('Wrong password')
      setPassword('')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--mos-bg)', minHeight: '100dvh' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--mos-border)] bg-[var(--mos-bg-elevated)] p-6 shadow-[var(--mos-shadow-lg)]"
      >
        <h1 className="text-center text-xl font-bold text-[var(--mos-text)]">
          mOS
        </h1>
        <p className="mt-1 text-center text-xs text-[var(--mos-text-muted)]">
          Enter password to continue
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="mos-input mt-4 h-11 w-full rounded-xl border border-[var(--mos-border)] bg-[var(--mos-bg-elevated)] px-3 text-[var(--mos-text)] outline-none focus:ring-2 focus:ring-[var(--mos-accent)]/30"
        />
        {error && (
          <p className="mt-2 text-xs text-[var(--mos-danger)]">{error}</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold bg-[var(--mos-accent)] text-[var(--mos-accent-contrast)]"
        >
          Unlock
        </button>
      </form>
    </div>
  )
}
