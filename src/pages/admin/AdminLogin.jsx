import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Shared admin layout shell ─────────────────────────────────
export function AdminShell({ children }) {
  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-8%] right-[-8%] w-[35%] h-[35%] border-[8px] border-on-background/5 rotate-12" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[28%] h-[28%] bg-primary-container/10 -rotate-6" />
        <div className="absolute top-1/2 left-10 w-20 h-20 border-[4px] border-on-background/5" />
        <div className="absolute bottom-1/3 right-16 w-12 h-12 bg-primary-container/8" />
      </div>
      {children}
    </div>
  )
}

// ── Shared input ──────────────────────────────────────────────
export function AdminInput({ label, id, type = 'text', placeholder, value, onChange, disabled, error, rightSlot, helper }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={onChange} disabled={disabled}
          className={`w-full bg-surface border-4 p-4 font-body-md focus:ring-0 focus:outline-none transition-all placeholder:text-on-surface-variant/40
            ${error ? 'border-error' : 'border-on-background focus:border-primary-container'}
            ${disabled ? 'cursor-not-allowed opacity-60 bg-surface-container' : ''}`}
        />
        {rightSlot && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && (
        <span className="flex items-center gap-1 text-error font-bold text-[12px]">
          <span className="material-symbols-outlined text-[14px]">error</span>{error}
        </span>
      )}
      {helper && !error && <span className="text-[11px] text-on-surface-variant">{helper}</span>}
    </div>
  )
}

// ── Shared button ─────────────────────────────────────────────
export function AdminButton({ children, onClick, type = 'button', loading, disabled, variant = 'primary', className = '' }) {
  const base = 'w-full py-4 border-4 border-on-background font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px]'
  const variants = {
    primary: 'bg-primary-container text-on-primary-fixed hover:brightness-105',
    secondary: 'bg-surface text-on-surface hover:bg-surface-container',
    danger: 'bg-error text-on-error hover:brightness-105',
  }
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}
      className={`${base} ${variants[variant]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading
        ? <><div className="w-5 h-5 border-4 border-current border-t-transparent animate-spin" /><span>Processing…</span></>
        : children}
    </button>
  )
}

// ── Shared alert ──────────────────────────────────────────────
export function AdminAlert({ type = 'error', message }) {
  const styles = {
    error:   'bg-error-container border-error text-on-error-container',
    success: 'bg-green-100 border-green-700 text-green-900',
    warning: 'bg-primary-fixed border-primary text-on-primary-fixed',
  }
  const icons = { error: 'warning', success: 'check_circle', warning: 'info' }
  return (
    <div className={`flex items-center gap-3 border-4 p-4 ${styles[type]}`}>
      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icons[type]}
      </span>
      <p className="font-bold text-sm">{message}</p>
    </div>
  )
}

// ── LOGIN PAGE ────────────────────────────────────────────────
export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    // BACKEND: POST /api/admin/auth/login  { email, password }
    // Expected response: { requiresTwoFactor: true, tempToken: '...' }
    // Store tempToken in sessionStorage for the 2FA step:
    //   sessionStorage.setItem('admin_temp_token', data.tempToken)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    navigate('/portal-ax92-v1/verify')
  }

  return (
    <AdminShell>
      <main className="w-full max-w-[460px]" style={{ boxShadow: '8px 8px 0px 0px #1a1c1c' }}>
        <div className="bg-surface border-4 border-on-background p-8 flex flex-col gap-6">

          {/* Brand */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-primary-container border-4 border-on-background flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}>
              <span className="material-symbols-outlined text-[32px] text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[28px] uppercase tracking-tight leading-none">Admin Portal</h1>
              <p className="text-sm text-on-surface-variant mt-1">Authorised personnel only</p>
            </div>
          </div>

          {error && <AdminAlert type="error" message={error} />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AdminInput
              id="admin-email" label="Admin Email" type="email"
              placeholder="admin@chicago.io"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <AdminInput
              id="admin-password" label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              rightSlot={
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[22px]">
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              }
            />
            <AdminButton type="submit" loading={loading}>
              <span className="material-symbols-outlined text-[18px]">login</span>
              Sign In
            </AdminButton>
          </form>

          <div className="flex items-center justify-between pt-2 opacity-40">
            <span className="font-bold text-[9px] uppercase tracking-[0.18em]">Secure Infrastructure · Chicago Web3</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-on-background" />
              <div className="w-2 h-2 bg-primary-container" />
              <div className="w-2 h-2 bg-on-background" />
            </div>
          </div>
        </div>
      </main>
    </AdminShell>
  )
}
