import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../services/index'

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
    try {
      const result = await adminLogin(email, password)
      // Backend returns { adminId } to proceed to 2FA step
      navigate('/portal-ax92-v1/verify', { state: { adminId: result.adminId } })
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-6">

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-8%] right-[-8%] w-[40%] h-[40%] border-[8px] border-on-background/5 rotate-12" />
        <div className="absolute bottom-[-6%] left-[-6%] w-[30%] h-[30%] bg-primary-container/8 -rotate-6" />
      </div>

      <div className="w-full max-w-[480px]">
        <div
          className="bg-surface border-[4px] border-on-background p-8 flex flex-col gap-6"
          style={{ boxShadow: '8px 8px 0px 0px #000' }}
        >

          <div className="text-center flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 bg-on-surface border-[4px] border-on-surface flex items-center justify-center"
              style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}
            >
              <span
                className="material-symbols-outlined text-[32px] text-surface"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock
              </span>
            </div>
            <h1 className="font-extrabold text-[32px] uppercase tracking-tight leading-none text-on-surface">
              Admin Portal
            </h1>
            <p className="text-on-surface-variant font-medium text-[14px]">
              Restricted access. Authorised personnel only.
            </p>
          </div>

          <div className="flex items-center gap-3 border-[3px] border-on-surface bg-surface-container p-3">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <span className="font-bold text-[11px] uppercase tracking-wider">Secure Infrastructure</span>
          </div>

          {error && (
            <div className="flex items-center gap-3 border-[3px] border-error bg-error-container text-on-error-container p-4">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@chicago.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                style={{ boxShadow: '4px 4px 0px 0px #000' }}
                className="w-full px-5 py-4 border-[4px] border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ boxShadow: '4px 4px 0px 0px #000' }}
                  className="w-full px-5 py-4 pr-14 border-[4px] border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showPw ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
              className="w-full py-4 bg-on-surface text-surface font-bold uppercase tracking-widest text-sm border-[4px] border-on-surface hover:bg-on-surface/90 transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 flex items-center justify-center gap-3 mt-1"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-surface border-t-transparent animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t-[2px] border-on-surface/10">
            <p className="font-bold text-[10px] uppercase tracking-widest text-on-surface-variant/50">
              Secure Infrastructure · Chicago Web3 © 2025
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
