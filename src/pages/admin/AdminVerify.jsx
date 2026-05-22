import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminShell, AdminButton, AdminAlert } from './AdminLogin'

export default function AdminVerify() {
  const navigate  = useNavigate()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleDigit = (index, value) => {
    // Allow paste of full 6-digit code
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const arr = value.split('')
      setDigits(arr)
      inputRefs.current[5]?.focus()
      return
    }
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    setError('')
    setLoading(true)
    // BACKEND: POST /api/admin/auth/verify-2fa
    //   Headers: { Authorization: `Bearer ${sessionStorage.getItem('admin_temp_token')}` }
    //   Body: { code }
    // Expected response: { sessionToken: '...' }
    // Then: document.cookie = `admin_session=...; HttpOnly; Secure; SameSite=Strict; Max-Age=900`
    //   (HttpOnly must be set server-side; store session ID in cookie from server response)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/portal-ax92-v1/dashboard'), 1000)
  }

  const handleResend = () => {
    setResendCooldown(60)
    setError('')
    // BACKEND: POST /api/admin/auth/resend-2fa
  }

  return (
    <AdminShell>
      <main className="w-full max-w-[440px]" style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}>
        <div className="bg-surface border-4 border-on-background p-8 flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`w-16 h-16 border-4 border-on-background flex items-center justify-center transition-colors duration-500
              ${success ? 'bg-green-400' : 'bg-primary-container'}`}
              style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}>
              <span className="material-symbols-outlined text-[32px] text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                {success ? 'check_circle' : 'verified_user'}
              </span>
            </div>
            <div>
              <h1 className="font-extrabold text-[24px] uppercase tracking-tight leading-none">
                Security Verification
              </h1>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[300px] mx-auto">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex-1 flex items-center gap-2 opacity-40">
              <div className="w-5 h-5 border-2 border-on-background flex items-center justify-center text-[9px]">✓</div>
              <span className="hidden sm:block">Password</span>
            </div>
            <div className="w-8 h-[2px] bg-on-background/20" />
            <div className="flex-1 flex items-center gap-2 justify-center text-primary-container">
              <div className="w-5 h-5 border-2 border-primary-container bg-primary-container flex items-center justify-center text-[9px] text-on-primary-fixed">2</div>
              <span className="hidden sm:block">2FA Code</span>
            </div>
            <div className="w-8 h-[2px] bg-on-background/20" />
            <div className="flex-1 flex items-center gap-2 justify-end opacity-30">
              <div className="w-5 h-5 border-2 border-on-background flex items-center justify-center text-[9px]">3</div>
              <span className="hidden sm:block">Access</span>
            </div>
          </div>

          {error   && <AdminAlert type="error"   message={error} />}
          {success && <AdminAlert type="success" message="Verified! Redirecting to dashboard…" />}

          {/* OTP inputs */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex justify-between gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputRefs.current[i] = el)}
                  type="text" inputMode="numeric" maxLength={i === 0 ? 6 : 1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  className={`flex-1 aspect-square text-center font-extrabold text-[24px] border-4 bg-surface focus:outline-none transition-all
                    ${d ? 'border-primary-container bg-primary-container/5' : 'border-on-background focus:border-primary-container'}`}
                />
              ))}
            </div>

            <AdminButton type="submit" loading={loading} disabled={success}>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              Verify and Proceed
            </AdminButton>
          </form>

          {/* Resend / backup */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="font-bold text-[11px] uppercase tracking-wider text-primary hover:underline underline-offset-4 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </button>
            <button
              onClick={() => navigate('/portal-ax92-v1')}
              className="flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to login
            </button>
          </div>

          <div className="flex items-center justify-between opacity-40 pt-1">
            <span className="font-bold text-[9px] uppercase tracking-[0.18em]">Locked Session · Chicago Vault</span>
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
