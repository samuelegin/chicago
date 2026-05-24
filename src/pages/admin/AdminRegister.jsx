import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AdminShell, AdminButton, AdminAlert, AdminInput } from './AdminShared'
import { adminValidateInviteToken, adminRegister } from '../../services/api'

// ── Password strength checker ─────────────────────────────────
function getStrength(pw) {
  const checks = {
    length:   pw.length >= 12,
    number:   /\d/.test(pw),
    special:  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
    upper:    /[A-Z]/.test(pw),
    lower:    /[a-z]/.test(pw),
  }
  const passed = Object.values(checks).filter(Boolean).length
  return { checks, score: passed, label: ['', 'Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][passed] }
}

const strengthColors = ['', 'bg-error', 'bg-error', 'bg-primary-container', 'bg-green-500', 'bg-green-600']

function StrengthBar({ score }) {
  return (
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`flex-1 h-1.5 border border-on-background/20 transition-colors
          ${i <= score ? strengthColors[score] : 'bg-surface-container-high'}`} />
      ))}
    </div>
  )
}

function Requirement({ met, label }) {
  return (
    <li className={`flex items-center gap-2 text-[12px] font-bold transition-colors ${met ? 'text-green-700' : 'text-on-surface-variant'}`}>
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${met ? 1 : 0}` }}>
        {met ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      {label}
    </li>
  )
}

// ── REGISTER PAGE ─────────────────────────────────────────────
export default function AdminRegister() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const token             = searchParams.get('token')

  const [tokenValid,   setTokenValid]   = useState(null) // null=checking, true, false
  const [invitedEmail, setInvitedEmail] = useState('')
  const [name,         setName]         = useState('')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [done,         setDone]         = useState(false)

  const strength = getStrength(password)
  const pwMatch  = confirm && password === confirm

  // Validate invite token on mount
  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    adminValidateInviteToken(token)
      .then(res => {
        if (res.valid) {
          setTokenValid(true)
          setInvitedEmail(res.email ?? '')
        } else {
          setTokenValid(false)
        }
      })
      .catch(() => setTokenValid(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim())       { setError('Full name is required.'); return }
    if (strength.score < 3) { setError('Please choose a stronger password.'); return }
    if (!pwMatch)           { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await adminRegister({ token, name, password })
      setDone(true)
      setTimeout(() => navigate('/portal-ax92-v1'), 2500)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
    return
  }

  // ── Token validating ──
  if (tokenValid === null) {
    return (
      <AdminShell>
        <div className="flex flex-col items-center gap-4 text-on-surface-variant">
          <div className="w-10 h-10 border-4 border-primary-container border-t-transparent animate-spin" />
          <p className="font-bold text-sm uppercase tracking-widest">Validating invite…</p>
        </div>
      </AdminShell>
    )
  }

  // ── Invalid / expired token → 404-like wall ──
  if (tokenValid === false) {
    return (
      <AdminShell>
        <main className="w-full max-w-[420px]" style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}>
          <div className="bg-surface border-4 border-on-background p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 bg-error-container border-4 border-on-background flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}>
              <span className="material-symbols-outlined text-[32px] text-on-error-container"
                style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[24px] uppercase tracking-tight">Page Not Found</h1>
              <p className="text-sm text-on-surface-variant mt-2 max-w-[280px]">
                This invite link is invalid or has expired. Contact your Super Admin for a new invitation.
              </p>
            </div>
            <div className="w-full h-[4px] bg-on-background/10" />
            <p className="font-bold text-[9px] uppercase tracking-[0.18em] opacity-40">Chicago Web3 · Security Protocol v4.0</p>
          </div>
        </main>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <main className="w-full max-w-[500px]" style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}>
        <div className="bg-surface border-4 border-on-background p-8 flex flex-col gap-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-primary-container" />
              <span className="font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Admin Setup</span>
            </div>
            <h1 className="font-extrabold text-[28px] uppercase tracking-tight leading-tight">
              Complete Admin<br />Account Setup
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">Create your secure administrator account</p>
          </div>

          {error && <AdminAlert type="error" message={error} />}
          {done  && <AdminAlert type="success" message="Account created! Redirecting to login…" />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Locked email */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Invited Email
              </label>
              <div className="relative">
                <input
                  type="email" value={invitedEmail} disabled
                  className="w-full bg-surface-container border-4 border-on-background/30 p-4 font-body-md cursor-not-allowed text-on-surface-variant"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
              </div>
            </div>

            {/* Full name */}
            <AdminInput
              id="admin-name" label="Full Name"
              placeholder="Enter your full name"
              value={name} onChange={e => setName(e.target.value)}
            />

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Create Password
              </label>
              <div className="relative">
                <input
                  id="admin-pw" type={showPw ? 'text' : 'password'}
                  placeholder="•••••••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface border-4 border-on-background focus:border-primary-container p-4 font-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[22px]">
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {password && (
                <div className="mt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Strength</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider
                      ${strength.score >= 4 ? 'text-green-700' : strength.score >= 3 ? 'text-primary' : 'text-error'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <StrengthBar score={strength.score} />
                  <ul className="mt-3 flex flex-col gap-1.5">
                    <Requirement met={strength.checks.length}  label="At least 12 characters" />
                    <Requirement met={strength.checks.upper}   label="Uppercase letter" />
                    <Requirement met={strength.checks.number}  label="At least one number" />
                    <Requirement met={strength.checks.special} label="Special character (!@#$…)" />
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Confirm Password
              </label>
              <input
                type="password" placeholder="•••••••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                className={`w-full bg-surface border-4 p-4 font-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/40
                  ${confirm ? (pwMatch ? 'border-green-500' : 'border-error') : 'border-on-background focus:border-primary-container'}`}
              />
              {confirm && !pwMatch && (
                <span className="flex items-center gap-1 text-error font-bold text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  Passwords do not match
                </span>
              )}
              {confirm && pwMatch && (
                <span className="flex items-center gap-1 text-green-700 font-bold text-[12px]">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Passwords match
                </span>
              )}
            </div>

            <AdminButton
              type="submit" loading={loading}
              disabled={done || !pwMatch || strength.score < 3}
              className="mt-2"
            >
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
              Create Admin Account
            </AdminButton>
          </form>

          <div className="flex items-center justify-between opacity-40 pt-1">
            <span className="font-bold text-[9px] uppercase tracking-[0.18em]">Security Protocol v4.0</span>
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
