import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div
          className="w-full max-w-md bg-surface border-4 border-on-background p-10 flex flex-col items-center gap-6 text-center"
          style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}
        >
          <div className="w-16 h-16 bg-error-container border-4 border-on-background flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-on-error-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
          </div>
          <div>
            <h1 className="font-extrabold text-[24px] uppercase tracking-tight leading-none">Something went wrong</h1>
            <p className="text-on-surface-variant text-sm mt-2">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary-container text-on-primary-fixed border-4 border-on-background font-bold text-[12px] uppercase tracking-widest hover:brightness-105 transition-all"
            style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}
