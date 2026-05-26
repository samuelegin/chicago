// Shared primitives for admin screens
export function AdminShell({ children }) {
  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-8%] right-[-8%] w-[40%] h-[40%] border-[8px] border-on-background/5 rotate-12" />
        <div className="absolute bottom-[-6%] left-[-6%] w-[30%] h-[30%] bg-primary-container/8 -rotate-6" />
      </div>
      {children}
    </div>
  )
}

export function AdminButton({ children, type = 'button', loading, disabled, onClick, variant = 'dark' }) {
  const variants = {
    dark:    'bg-on-surface text-surface border-on-surface hover:bg-on-surface/90',
    gold:    'bg-primary-container text-on-primary-container border-on-surface hover:brightness-105',
    outline: 'bg-surface text-on-surface border-on-surface hover:bg-surface-container',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ boxShadow: '4px 4px 0px 0px #000' }}
      className={`w-full py-4 font-bold uppercase tracking-widest text-sm border-[4px] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 flex items-center justify-center gap-3 ${variants[variant]}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-[3px] border-current border-t-transparent animate-spin" />
          <span>Processing…</span>
        </>
      ) : children}
    </button>
  )
}

export function AdminAlert({ type = 'error', message }) {
  const styles = {
    error:   'border-error bg-error-container text-on-error-container',
    success: 'border-primary-container bg-primary-container/20 text-on-primary-container',
    info:    'border-on-surface bg-surface-container text-on-surface',
  }
  const icons = { error: 'warning', success: 'check_circle', info: 'info' }
  return (
    <div className={`flex items-center gap-3 border-[3px] p-4 ${styles[type]}`}>
      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icons[type]}
      </span>
      <p className="font-bold text-sm">{message}</p>
    </div>
  )
}

export function AdminInput({ id, label, type = 'text', placeholder, value, onChange, disabled, note }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
        {label}
      </label>
      <input
        id={id} type={type} placeholder={placeholder}
        value={value} onChange={onChange} disabled={disabled}
        style={{ boxShadow: '4px 4px 0px 0px #000' }}
        className="w-full px-5 py-4 border-[4px] border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
      />
      {note && <p className="text-[11px] text-on-surface-variant font-medium">{note}</p>}
    </div>
  )
}
