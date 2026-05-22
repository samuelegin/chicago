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
function FormButton({ children, onClick, type = 'button', loading, loadingText = 'Processing…', disabled, variant = 'primary', className = '' }) {
  const base = 'w-full py-4 border-4 border-on-background font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-primary-container text-on-primary-fixed hover:brightness-105',
    secondary: 'bg-surface text-on-surface hover:bg-surface-container',
    ghost:     'bg-transparent text-on-surface border-on-background/30 hover:border-on-background hover:bg-surface-container',
  }
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading
        ? <><div className="w-5 h-5 border-4 border-current border-t-transparent animate-spin" /><span>{loadingText}</span></>
        : children}
    </button>
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

// ── Password Strength ─────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters',     pass: password.length >= 8 },
    { label: 'One uppercase letter',       pass: /[A-Z]/.test(password) },
    { label: 'One number',                 pass: /[0-9]/.test(password) },
    { label: 'One special character',      pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const passed = checks.filter(c => c.pass).length
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-on-background/10', 'bg-error', 'bg-yellow-500', 'bg-blue-500', 'bg-green-600']

  if (!password) return null

  return (
    <div className="flex flex-col gap-2 p-4 border-4 border-on-background/20 bg-surface-container-low">
      {/* Strength bar */}
      <div className="flex gap-1.5 items-center">
        {[1, 2, 3, 4].map(i => (
          <div key={i}
            className={`h-2 flex-1 border-2 border-on-background/20 transition-all ${i <= passed ? colors[passed] : 'bg-on-background/10'}`}
          />
        ))}
        <span className={`font-bold text-[10px] uppercase tracking-widest ml-2 min-w-[40px] ${
          passed <= 1 ? 'text-error' : passed === 2 ? 'text-yellow-700' : passed === 3 ? 'text-blue-700' : 'text-green-700'
        }`}>
          {levels[passed] || '—'}
        </span>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${c.pass ? 'text-green-700' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {c.pass ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Background Decorations ────────────────────────────────────
function BgDecorations() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-[-6%] left-[-6%] w-[30%] h-[30%] border-[8px] border-on-background/5 -rotate-12" />
      <div className="absolute bottom-[-4%] right-[-4%] w-[25%] h-[25%] bg-primary-container/10 rotate-6" />
      <div className="absolute top-1/3 right-10 w-14 h-14 border-[4px] border-on-background/5" />
      <div className="absolute top-[70%] left-16 w-10 h-10 bg-primary-container/8 rotate-45" />
    </div>
  )
}

// ── STEP INDICATOR ────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 border-4 border-on-background flex items-center justify-center font-bold text-[11px] transition-all
            ${i < current ? 'bg-on-background text-surface' : i === current ? 'bg-primary-container text-on-primary-fixed' : 'bg-surface text-on-surface-variant'}`}
            style={i <= current ? { boxShadow: '2px 2px 0px 0px var(--neo-border-color)' } : {}}>
            {i < current
              ? <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-[4px] w-8 border-t-4 transition-all ${i < current ? 'border-on-background' : 'border-on-background/20'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── REGISTRATION PAGE ─────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(0) // 0 = account, 1 = profile, 2 = done
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed]       = useState(false)

  // Step 0 fields
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [errors0, setErrors0]     = useState({})

  // Step 1 fields
  const [username, setUsername]   = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio]             = useState('')
  const [errors1, setErrors1]     = useState({})

  // ── Validate step 0 ──
  const validateStep0 = () => {
    const e = {}
    if (!email)                                   e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email))         e.email    = 'Enter a valid email.'
    if (!password)                                e.password = 'Password is required.'
    else if (password.length < 8)                 e.password = 'Password must be at least 8 characters.'
    if (password !== confirmPw)                   e.confirmPw = 'Passwords do not match.'
    if (!agreed)                                  e.agreed   = 'You must agree to the terms.'
    setErrors0(e)
    return Object.keys(e).length === 0
  }

  // ── Validate step 1 ──
  const validateStep1 = () => {
    const e = {}
    if (!username)                                e.username = 'Username is required.'
    else if (username.length < 3)                 e.username = 'At least 3 characters.'
    else if (!/^[a-zA-Z0-9_]+$/.test(username))  e.username = 'Only letters, numbers, underscores.'
    if (!displayName)                             e.displayName = 'Display name is required.'
    setErrors1(e)
    return Object.keys(e).length === 0
  }

  const handleStep0 = (e) => {
    e.preventDefault()
    setError('')
    if (validateStep0()) setStep(1)
  }

  const handleStep1 = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateStep1()) return
    setLoading(true)
    // BACKEND: POST /api/auth/register
    // { email, password, username, displayName, bio }
    // Expected: { token: '...', user: {...} }
    await new Promise(r => setTimeout(r, 1600))
    setLoading(false)
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <BgDecorations />

      <div className="w-full max-w-[520px]" style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}>
        <div className="bg-surface border-4 border-on-background flex flex-col">

          {/* ── Header strip ── */}
          <div className="bg-on-background px-8 py-5 flex items-center justify-between">
            <span className="font-extrabold text-[22px] uppercase tracking-tight leading-none text-surface">
              Chicago
            </span>
            {step < 2 && (
              <div className="flex items-center gap-3">
                <span className="font-bold text-[9px] uppercase tracking-[0.14em] text-surface/50">
                  Step {step + 1} of 2
                </span>
                <StepIndicator current={step} total={2} />
              </div>
            )}
          </div>

          {/* ── STEP 0: Account Setup ── */}
          {step === 0 && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="font-extrabold text-[32px] uppercase tracking-tight leading-none text-on-surface">
                  Create<br />
                  <span className="text-primary-container" style={{ WebkitTextStroke: '2px #1a1c1c' }}>Account</span>
                </h1>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  Join the Chicago Web3 social platform
                </p>
              </div>

              {error && <Alert type="error" message={error} />}

              <form onSubmit={handleStep0} className="flex flex-col gap-5">
                <FormInput
                  id="reg-email" label="Email Address" type="email"
                  placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  error={errors0.email}
                />
                <FormInput
                  id="reg-password" label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  error={errors0.password}
                  rightSlot={
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[22px]">
                        {showPw ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                />
                <PasswordStrength password={password} />
                <FormInput
                  id="reg-confirm" label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  error={errors0.confirmPw}
                  rightSlot={
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[22px]">
                        {showConfirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                />

                {/* Terms */}
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => setAgreed(v => !v)}
                    className="flex items-start gap-3 text-left group">
                    <div className={`w-5 h-5 border-4 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
                      ${agreed ? 'bg-primary-container border-on-background' : 'bg-surface border-on-background group-hover:bg-surface-container'}`}>
                      {agreed && (
                        <span className="material-symbols-outlined text-[13px] text-on-primary-fixed font-bold"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
                      )}
                    </div>
                    <span className="text-[13px] font-medium text-on-surface-variant leading-snug">
                      I agree to the{' '}
                      <span className="text-on-surface font-bold border-b-2 border-primary-container">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-on-surface font-bold border-b-2 border-primary-container">Privacy Policy</span>
                    </span>
                  </button>
                  {errors0.agreed && (
                    <span className="flex items-center gap-1 text-error font-bold text-[12px] ml-8">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors0.agreed}
                    </span>
                  )}
                </div>

                <FormButton type="submit">
                  Continue
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </FormButton>
              </form>

              {/* Wallet option */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[3px] bg-on-background/10" />
                  <span className="font-bold text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">or</span>
                  <div className="flex-1 h-[3px] bg-on-background/10" />
                </div>
                <FormButton variant="secondary">
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <rect width="40" height="40" fill="#d4af37"/>
                    <path d="M8 14h24v2H8zM8 19h24v2H8zM8 24h16v2H8z" fill="#1a1c1c"/>
                  </svg>
                  Register with Wallet
                </FormButton>
              </div>

              <p className="text-center text-sm text-on-surface-variant font-medium">
                Already have an account?{' '}
                <Link to="/login"
                  className="font-bold text-on-surface border-b-2 border-primary-container hover:text-primary transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* ── STEP 1: Profile Setup ── */}
          {step === 1 && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => setStep(0)}
                  className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors mb-1 w-fit">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back
                </button>
                <h1 className="font-extrabold text-[32px] uppercase tracking-tight leading-none text-on-surface">
                  Your<br />
                  <span className="text-primary-container" style={{ WebkitTextStroke: '2px #1a1c1c' }}>Profile</span>
                </h1>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  How will the Chicago community know you?
                </p>
              </div>

              {error && <Alert type="error" message={error} />}

              <form onSubmit={handleStep1} className="flex flex-col gap-5">
                {/* Avatar placeholder */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 border-4 border-on-background bg-surface-container flex items-center justify-center flex-shrink-0"
                    style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}>
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant">person</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                      Profile Photo
                    </span>
                    <button type="button"
                      className="py-2 px-4 border-4 border-on-background bg-surface font-bold text-[11px] uppercase tracking-widest hover:bg-surface-container transition-all flex items-center gap-2"
                      style={{ boxShadow: '2px 2px 0px 0px var(--neo-border-color)' }}>
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      Upload
                    </button>
                    <span className="text-[10px] text-on-surface-variant">JPG, PNG or GIF · max 5MB</span>
                  </div>
                </div>

                <FormInput
                  id="username" label="Username"
                  placeholder="your_handle"
                  value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  error={errors1.username}
                  helper="Letters, numbers, underscores only. Shown as @username"
                />
                <FormInput
                  id="displayName" label="Display Name"
                  placeholder="Your Name"
                  value={displayName} onChange={e => setDisplayName(e.target.value)}
                  error={errors1.displayName}
                />
                <div className="flex flex-col gap-2">
                  <label htmlFor="bio" className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Bio <span className="font-normal normal-case tracking-normal text-on-surface-variant/50">— optional</span>
                  </label>
                  <textarea
                    id="bio" rows={3}
                    placeholder="Tell the community about yourself…"
                    value={bio} onChange={e => setBio(e.target.value.slice(0, 160))}
                    className="w-full bg-surface border-4 border-on-background p-4 font-body-md text-on-surface focus:ring-0 focus:outline-none transition-all placeholder:text-on-surface-variant/40 focus:border-primary-container resize-none"
                  />
                  <span className="text-[10px] text-on-surface-variant text-right">{bio.length}/160</span>
                </div>

                <FormButton type="submit" loading={loading} loadingText="Creating account…">
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  Create Account
                </FormButton>
              </form>
            </div>
          )}

          {/* ── STEP 2: Success ── */}
          {step === 2 && (
            <div className="p-8 flex flex-col items-center gap-6 text-center">
              {/* Gold success box */}
              <div className="w-24 h-24 bg-primary-container border-4 border-on-background flex items-center justify-center"
                style={{ boxShadow: '6px 6px 0px 0px var(--neo-border-color)' }}>
                <span className="material-symbols-outlined text-[48px] text-on-primary-fixed"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>

              <div>
                <h1 className="font-extrabold text-[32px] uppercase tracking-tight leading-none text-on-surface">
                  You're In!
                </h1>
                <p className="text-sm text-on-surface-variant font-medium mt-2">
                  Welcome to Chicago, <span className="font-bold text-on-surface">@{username || 'user'}</span>.
                  <br />Check your email to verify your account.
                </p>
              </div>

              {/* What's next */}
              <div className="w-full border-4 border-on-background bg-surface-container-low p-6 flex flex-col gap-3 text-left"
                style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}>
                <span className="font-bold text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
                  What's next
                </span>
                {[
                  { icon: 'mark_email_unread', text: 'Verify your email address' },
                  { icon: 'account_balance_wallet', text: 'Connect your Web3 wallet' },
                  { icon: 'diversity_3', text: 'Follow community members' },
                  { icon: 'token', text: 'Earn your first $CHI tokens' },
                ].map(item => (
                  <div key={item.icon} className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-on-background bg-surface flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        {item.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-on-surface">{item.text}</span>
                  </div>
                ))}
              </div>

              <FormButton onClick={() => navigate('/')}>
                <span className="material-symbols-outlined text-[18px]">home</span>
                Go to Feed
              </FormButton>

              <p className="text-[12px] text-on-surface-variant">
                Didn't get an email?{' '}
                <button className="font-bold text-on-surface border-b-2 border-primary-container hover:text-primary transition-colors">
                  Resend verification
                </button>
              </p>
            </div>
          )}

          {/* ── Footer strip ── */}
          {step < 2 && (
            <div className="border-t-4 border-on-background px-8 py-4 flex items-center justify-between bg-surface-container-low">
              <span className="font-bold text-[9px] uppercase tracking-[0.18em] text-on-surface-variant">
                Secure · Chicago Web3
              </span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
                <span className="font-bold text-[9px] uppercase tracking-[0.12em] text-on-surface-variant">
                  Data Protected
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
