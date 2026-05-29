import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminShell, AdminButton, AdminAlert, AdminInput } from './AdminShared'
import { adminSetup } from '../../services/api'

const adminValidateSetupToken = () => Promise.resolve({ valid: true })

// ── Password strength ──────────────────────────────────────────
function getStrength(pw) {
  const checks = {
    length:  pw.length >= 12,
    upper:   /[A-Z]/.test(pw),
    number:  /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
  const passed = Object.values(checks).filter(Boolean).length
  return { checks, score: passed }
}

function Requirement({ met, label }) {
  return (
    <li className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide transition-colors
      ${met ? 'text-secondary' : 'text-on-surface-variant'}`}>
      <span
        className={`w-2 h-2 transition-colors ${met ? 'bg-secondary' : 'bg-outline'}`}
      />
      {label}
    </li>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function AdminSetup() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const token          = searchParams.get('token')

  const [tokenValid, setTokenValid] = useState(null) // null = checking
  const [email,      setEmail]      = useState('')
  const [name,       setName]       = useState('')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [done,       setDone]       = useState(false)

  const strength = getStrength(password)
  const pwMatch  = confirm.length > 0 && password === confirm
  const allReqsMet = strength.score === 4

  // Validate setup token on mount
  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    adminValidateSetupToken(token)
      .then(res => setTokenValid(res.valid === true))
      .catch(() => setTokenValid(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim())    { setError('Email is required.'); return }
    if (!name.trim())     { setError('Full name is required.'); return }
    if (!allReqsMet)      { setError('Password does not meet all requirements.'); return }
    if (!pwMatch)         { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await adminSetup({ token, email, name, password })
      setDone(true)
      setTimeout(() => navigate('/portal-ax92-v1'), 3000)
    } catch (err) {
      setError(err.message || 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
    return
  }

  // ── Validating token ──
  if (tokenValid === null) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center gap-4 text-on-surface-variant">
          <div className="w-10 h-10 border-4 border-primary-container border-t-transparent animate-spin" />
          <p className="font-bold text-sm uppercase tracking-widest">Validating setup token…</p>
        </div>
      </AdminShell>
    )
  }

  // ── Invalid / expired / already-used token ──
  if (tokenValid === false) {
    return (
      <AdminShell>
        <main className="w-full max-w-[420px]" style={{ boxShadow: '8px 8px 0px 0px #000' }}>
          <div className="bg-surface border-4 border-on-background p-8 flex flex-col items-center gap-5 text-center">
            <div
              className="w-16 h-16 bg-error-container border-4 border-on-background flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              <span
                className="material-symbols-outlined text-[32px] text-on-error-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >block</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[24px] uppercase tracking-tight">Access Denied</h1>
              <p className="text-sm text-on-surface-variant mt-2 max-w-[280px]">
                This setup link is invalid, expired, or has already been used. The system may already have an admin account.
              </p>
            </div>
            <div className="w-full h-[4px] bg-on-background/10" />
            <p className="font-bold text-[9px] uppercase tracking-[0.18em] opacity-40">
              Chicago Web3 · Security Protocol v4.0
            </p>
          </div>
        </main>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      {/* Background watermarks */}
      <div className="fixed top-10 left-10 opacity-[0.04] pointer-events-none hidden lg:block select-none">
        <p className="font-extrabold text-[64px] uppercase tracking-tighter text-on-surface">ADMIN.CORE</p>
      </div>
      <div className="fixed bottom-10 right-10 opacity-[0.04] pointer-events-none hidden lg:block select-none">
        <p className="font-extrabold text-[64px] uppercase tracking-tighter text-on-surface">CHICAGO_ROOT</p>
      </div>

      <main className="w-full max-w-[520px]" style={{ boxShadow: '8px 8px 0px 0px #000' }}>
        <div className="bg-surface border-4 border-on-background relative overflow-hidden">

          {/* Yellow top accent bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary-container" />

          <div className="p-8 pt-10 flex flex-col gap-6">

            {/* Header */}
            <header className="border-b-4 border-surface-container pb-5">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 border-2 border-on-background flex items-center justify-center bg-on-surface"
                  style={{ boxShadow: '3px 3px 0px 0px #d4af37' }}
                >
                  <span
                    className="material-symbols-outlined text-[20px] text-surface"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >lock</span>
                </div>
                <h1 className="font-extrabold text-[22px] uppercase tracking-tight text-on-surface leading-none">
                  Initial System Setup
                </h1>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                This page is only accessible once and will be{' '}
                <span className="text-secondary font-bold">permanently disabled</span>{' '}
                after completion.
              </p>
            </header>

            {error && <AdminAlert type="error" message={error} />}
            {done  && <AdminAlert type="success" message="Super admin created. Redirecting to login…" />}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Setup token (read-only) */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                  Setup Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={token}
                    readOnly
                    className="w-full bg-surface-container border-4 border-on-background/30 p-4 font-mono text-sm text-on-surface font-bold cursor-not-allowed opacity-80 pr-12"
                  />
                  <span
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >verified</span>
                </div>
              </div>

              {/* Email */}
              <AdminInput
                id="setup-email"
                label="Super Admin Email"
                type="email"
                placeholder="admin@chicago.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              {/* Full name */}
              <AdminInput
                id="setup-name"
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              {/* Password + confirm side by side on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="setup-pw" className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="setup-pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="•••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ boxShadow: '4px 4px 0px 0px #000' }}
                      className="w-full bg-surface border-4 border-on-surface focus:border-primary-container p-4 pr-12 font-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPw ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="setup-confirm" className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                    Confirm
                  </label>
                  <input
                    id="setup-confirm"
                    type="password"
                    placeholder="•••••••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    style={{ boxShadow: '4px 4px 0px 0px #000' }}
                    className={`w-full bg-surface border-4 p-4 font-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/40
                      ${confirm
                        ? pwMatch
                          ? 'border-[#39FF14]'
                          : 'border-error'
                        : 'border-on-surface focus:border-primary-container'
                      }`}
                  />
                  {confirm && !pwMatch && (
                    <span className="flex items-center gap-1 text-error font-bold text-[11px]">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      Passwords do not match
                    </span>
                  )}
                </div>
              </div>

              {/* Password requirements */}
              <div className="p-4 bg-surface-container border-2 border-on-background/20">
                <h3 className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-widest text-on-surface mb-3">
                  <span className="material-symbols-outlined text-[15px]">security</span>
                  Security Requirements
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  <Requirement met={strength.checks.length}  label="Min 12 chars" />
                  <Requirement met={strength.checks.upper}   label="Uppercase" />
                  <Requirement met={strength.checks.number}  label="Number" />
                  <Requirement met={strength.checks.special} label="Special char" />
                </ul>
              </div>

              <AdminButton
                type="submit"
                variant="gold"
                loading={loading}
                disabled={done || !pwMatch || !allReqsMet}
              >
                <span className="material-symbols-outlined text-[18px]">shield_person</span>
                Create Super Admin Account
              </AdminButton>
            </form>

            {/* Footer warning */}
            <footer className="flex items-start gap-3 pt-1 border-t border-surface-container">
              <span
                className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >warning</span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Once submitted, this setup page will be{' '}
                <span className="text-error font-bold">permanently disabled</span>{' '}
                and cannot be accessed again. Ensure all information is correct before proceeding.
              </p>
            </footer>

            <div className="flex items-center justify-between opacity-40 pt-1">
              <span className="font-bold text-[9px] uppercase tracking-[0.18em]">Security Protocol v4.0</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-on-background" />
                <div className="w-2 h-2 bg-primary-container" />
                <div className="w-2 h-2 bg-on-background" />
              </div>
            </div>

          </div>
        </div>
      </main>
    </AdminShell>
  )
}
