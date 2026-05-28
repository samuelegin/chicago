import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  error:   'warning',
  success: 'check_circle',
  info:    'info',
}

const STYLES = {
  error:   'bg-error text-on-error border-error',
  success: 'bg-green-600 text-white border-green-700',
  info:    'bg-on-surface text-surface border-on-surface',
}

function ToastItem({ message, type = 'info', onClose }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 border-[3px] min-w-[280px] max-w-[420px] ${STYLES[type]}`}
      style={{ boxShadow: '4px 4px 0px 0px rgba(212,175,55,0.8)' }}
    >
      <span
        className="material-symbols-outlined text-[18px] flex-shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {ICONS[type]}
      </span>
      <span className="font-bold text-sm uppercase tracking-wide flex-1">{message}</span>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  // Convenience shorthands
  toast.error   = (msg, dur) => toast(msg, 'error', dur)
  toast.success = (msg, dur) => toast(msg, 'success', dur)
  toast.info    = (msg, dur) => toast(msg, 'info', dur)

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast stack — top center */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem
              message={t.message}
              type={t.type}
              onClose={() => dismiss(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
