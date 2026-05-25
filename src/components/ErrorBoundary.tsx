// src/components/ErrorBoundary.tsx
// Catches render errors and shows a fallback UI instead of a blank screen.

import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-screen items-center justify-center p-4"
          style={{ background: 'var(--mos-bg)' }}
        >
          <div
            className="max-w-md rounded-2xl border p-4 shadow-[var(--mos-shadow-lg)]"
            style={{
              background: 'var(--mos-bg-elevated)',
              borderColor: 'var(--mos-danger)',
            }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--mos-danger)' }}
            >
              Something went wrong
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--mos-text)' }}>
              {this.state.error.message}
            </p>
            <pre
              className="mt-3 max-h-40 overflow-auto rounded p-2 text-xs"
              style={{
                background: 'var(--mos-bg-muted)',
                color: 'var(--mos-text-muted)',
              }}
            >
              {this.state.error.stack}
            </pre>
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="mt-3 rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{
                background: 'var(--mos-bg-muted)',
                color: 'var(--mos-text)',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
