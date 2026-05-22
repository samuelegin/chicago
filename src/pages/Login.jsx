import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ── Shared Input ──────────────────────────────────────────────
function FormInput({ label, id, type = 'text', placeholder, value, onChange, disabled, error, rightSlot, helper }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={onChange} disabled={disabled}
          className={`w-full bg-surface border-4 p-4 font-body-md text-on-surface focus:ring-0 focus:outline-none transition-all placeholder:text-on-surface-variant/40
            ${error ? 'border-error' : 'border-on-background focus:border-primary-container'}
            ${disabled ? 'cursor-not-allowed opacity-60 bg-surface-container' : ''}`}
        />
        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <span className="flex items-center gap-1 text-error font-bold text-[12px]">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </span>
      )}
      {helper && !error && (
        <span className="text-[11px] text-on-surface-variant">{helper}</span>
      )}
    </div>
  )
}

// ── Shared Button ─────────────────────────────────────────────
function FormButton({ children, onClick, type = 'button', loading, disabled, variant = 'primary', className = '' }) {
  const base = 'w-full py-4 border-4 border-on-background font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-primary-container text-on-primary-fixed hover:brightness-105',
    secondary: 'bg-surface text-on-surface hover:bg-surface-container',
    ghost:     'bg-transparent text-on-surface border-on-background/30 hover:border-on-background hover:bg-surface-container',
  }
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading
        ? <><div className="w-5 h-5 border-4 border-current border-t-transparent animate-spin" /><span>Signing in…</span></>
        : children}
    </button>
  )
}

// ── Divider ───────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-[3px] bg-on-background" />
      <span className="font-bold text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">{label}</span>
      <div className="flex-1 h-[3px] bg-on-background" />
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────
function Alert({ type = 'error', message }) {
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

// ── Background Decorations ────────────────────────────────────
function BgDecorations() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-[-6%] right-[-6%] w-[32%] h-[32%] border-[8px] border-on-background/5 rotate-12" />
      <div className="absolute bottom-[-4%] left-[-4%] w-[25%] h-[25%] bg-primary-container/10 -rotate-6" />
      <div className="absolute top-1/2 left-8 w-16 h-16 border-[4px] border-on-background/5" />
      <div className="absolute top-1/4 right-16 w-10 h-10 bg-primary-container/8 rotate-45" />
      <div className="absolute bottom-1/3 right-8 w-8 h-8 border-[3px] border-primary-container/20" />
    </div>
  )
}

// ── LOGIN PAGE ────────────────────────────────────────────────
export default function Login() {
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
    // BACKEND: POST /api/auth/login  { email, password }
    // Expected response: { token: '...', user: { id, username, avatar, role } }
    // Store token: localStorage.setItem('chicago_token', data.token)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4 relative overflow-hidden">
      <BgDecorations />

      <div className="w-full max-w-[480px]" style={{ boxShadow: '8px 8px 0px 0px #1a1c1c' }}>
        <div className="bg-surface border-4 border-on-background flex flex-col">

          {/* ── Header strip ── */}
          <div className="bg-on-background px-8 py-5 flex items-center justify-between">
            <span className="font-extrabold text-[22px] uppercase tracking-tight leading-none text-surface">
              Chicago
            </span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-surface/20" />
              <div className="w-3 h-3 bg-primary-container" />
              <div className="w-3 h-3 bg-surface/20" />
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-8 flex flex-col gap-6">

            {/* Title */}
            <div className="flex flex-col gap-1">
              <h1 className="font-extrabold text-[32px] uppercase tracking-tight leading-none text-on-surface">
                Welcome<br />
                <span className="text-primary-container" style={{ WebkitTextStroke: '2px #1a1c1c' }}>Back</span>
              </h1>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                Sign in to your Chicago Web3 account
              </p>
            </div>

            {error && <Alert type="error" message={error} />}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormInput
                id="email" label="Email Address" type="email"
                placeholder="you@chicago.io"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <FormInput
                id="password" label="Password"
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

              {/* Forgot password */}
              <div className="flex justify-end -mt-2">
                <button type="button"
                  className="text-[12px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface border-b-2 border-transparent hover:border-primary-container transition-all pb-0.5">
                  Forgot password?
                </button>
              </div>

              <FormButton type="submit" loading={loading}>
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </FormButton>
            </form>

            <Divider label="or continue with" />

            {/* Wallet connect */}
            <FormButton variant="secondary" onClick={() => {}}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" fill="#d4af37"/>
                <path d="M8 14h24v2H8zM8 19h24v2H8zM8 24h16v2H8z" fill="#1a1c1c"/>
              </svg>
              Connect Wallet
            </FormButton>

            {/* Register link */}
            <p className="text-center text-sm text-on-surface-variant font-medium">
              New to Chicago?{' '}
              <Link to="/register"
                className="font-bold text-on-surface border-b-2 border-primary-container hover:text-primary transition-colors">
                Create an account
              </Link>
            </p>

          </div>

          {/* ── Footer strip ── */}
          <div className="border-t-4 border-on-background px-8 py-4 flex items-center justify-between bg-surface-container-low">
            <span className="font-bold text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
              Secure · Chicago Web3
            </span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
              <span className="font-bold text-[9px] uppercase tracking-[0.12em] text-on-surface-variant">
                SSL Encrypted
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
