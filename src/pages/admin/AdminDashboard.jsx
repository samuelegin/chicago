import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminAlert, AdminButton, AdminInput } from './AdminLogin'

// ── Session idle timer: logs out after 15 min inactivity ──────
function useIdleLogout(timeoutMs = 15 * 60 * 1000, onLogout) {
  const timer = useRef(null)
  const reset = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(onLogout, timeoutMs)
  }
  useEffect(() => {
    reset()
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset))
    return () => {
      clearTimeout(timer.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [])
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-surface border-4 border-on-background p-6 flex flex-col gap-2"
      style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}>
      <div className="flex items-center justify-between">
        <span className="material-symbols-outlined text-primary-container text-[28px]"
          style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        {sub && <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-0.5 border border-on-background/10">{sub}</span>}
      </div>
      <p className="font-extrabold text-[32px] leading-none">{value}</p>
      <p className="font-bold text-[11px] uppercase tracking-widest text-on-surface-variant">{label}</p>
    </div>
  )
}

// ── Invite modal ──────────────────────────────────────────────
function InviteModal({ onClose }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const send = async () => {
    if (!email.includes('@')) { setError('Please enter a valid email.'); return }
    setError(''); setLoading(true)
    // BACKEND: POST /api/admin/auth/invite
    //   Body: { email }
    //   Server: generates 64-char crypto token, stores with 24h expiry, emails invite link
    //   Link format: https://yourdomain.com/portal-ax92-v1/register?token=TOKEN
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false); setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-on-background/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-surface border-4 border-on-background p-8 flex flex-col gap-5"
        style={{ boxShadow: '8px 8px 0px 0px #1a1c1c' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-extrabold text-[20px] uppercase tracking-tight">Invite Admin</h2>
            <p className="text-sm text-on-surface-variant mt-1">A one-time link expires in 24 hours</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors ml-4">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <AdminAlert type="error" message={error} />}
        {done && (
          <AdminAlert type="success"
            message={`Invite sent to ${email}. The link expires in 24 hours and is destroyed after use.`} />
        )}

        {!done && (
          <>
            <AdminInput
              id="invite-email" label="Colleague's Email" type="email"
              placeholder="colleague@chicago.io"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <div className="bg-surface-container border-2 border-on-background/15 p-3 flex gap-3">
              <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                The server will generate a cryptographic token, store it with a 24-hour expiry, and email a secure registration link. The token is permanently destroyed after use.
              </p>
            </div>
            <AdminButton loading={loading} onClick={send}>
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Invite Link
            </AdminButton>
          </>
        )}

        {done && (
          <button onClick={onClose}
            className="w-full py-3 border-4 border-on-background font-bold uppercase tracking-widest text-sm bg-surface hover:bg-surface-container transition-colors">
            Close
          </button>
        )}
      </div>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate           = useNavigate()
  const [showInvite, setShowInvite] = useState(false)
  const [idleWarning, setIdleWarning] = useState(false)
  const [idleCountdown, setIdleCountdown] = useState(60)
  const countdownRef = useRef(null)

  const logout = () => {
    // BACKEND: POST /api/admin/auth/logout  (clears HttpOnly session cookie server-side)
    // Client: sessionStorage.clear()
    navigate('/portal-ax92-v1')
  }

  // Idle: show warning at 14 min, hard logout at 15 min
  useIdleLogout(14 * 60 * 1000, () => {
    setIdleWarning(true)
    setIdleCountdown(60)
    countdownRef.current = setInterval(() => {
      setIdleCountdown(c => {
        if (c <= 1) { clearInterval(countdownRef.current); logout(); return 0 }
        return c - 1
      })
    }, 1000)
  })

  const stayActive = () => {
    setIdleWarning(false)
    clearInterval(countdownRef.current)
  }

  return (
    <div className="min-h-screen bg-surface-container">

      {/* Idle warning overlay */}
      {idleWarning && (
        <div className="fixed inset-0 z-50 bg-on-background/70 flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-surface border-4 border-on-background p-8 flex flex-col items-center gap-5 text-center"
            style={{ boxShadow: '8px 8px 0px 0px #1a1c1c' }}>
            <div className="w-14 h-14 bg-primary-fixed border-4 border-on-background flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            </div>
            <div>
              <h2 className="font-extrabold text-[22px] uppercase tracking-tight">Session Expiring</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                You will be logged out due to inactivity in <strong className="text-error">{idleCountdown}s</strong>
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={stayActive}
                className="flex-1 py-3 bg-primary-container text-on-primary-fixed font-bold uppercase text-sm border-4 border-on-background"
                style={{ boxShadow: '3px 3px 0px 0px #1a1c1c' }}>
                Stay Logged In
              </button>
              <button onClick={logout}
                className="flex-1 py-3 bg-surface text-on-surface font-bold uppercase text-sm border-4 border-on-background"
                style={{ boxShadow: '3px 3px 0px 0px #1a1c1c' }}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      {/* Top bar */}
      <header className="bg-surface border-b-4 border-on-background px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-container border-2 border-on-background flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-on-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <div>
            <span className="font-extrabold text-sm uppercase tracking-tight">Chicago Admin</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Authenticated</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-fixed font-bold text-[11px] uppercase tracking-wider border-2 border-on-background hover:brightness-105 transition-all"
            style={{ boxShadow: '2px 2px 0px 0px #1a1c1c' }}>
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Invite Admin
          </button>
          <button onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-surface text-on-surface font-bold text-[11px] uppercase tracking-wider border-2 border-on-background hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:block">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-8 flex flex-col gap-8">

        {/* Page title */}
        <div>
          <h1 className="font-extrabold text-[32px] lg:text-[48px] uppercase tracking-tight leading-none">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Platform overview · Session active</p>
        </div>

        {/* Security notice */}
        <div className="bg-surface border-4 border-on-background p-5 flex items-start gap-4"
          style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}>
          <span className="material-symbols-outlined text-primary-container text-[24px] shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <div>
            <p className="font-bold text-sm uppercase tracking-wider">Session Security Active</p>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Your session token is stored in an <strong>HttpOnly · Secure</strong> cookie — invisible to JavaScript.
              Auto-logout triggers after <strong>15 minutes</strong> of inactivity.
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="group"          label="Total Users"    value="14,820"  sub="+2.4%" />
          <StatCard icon="article"        label="Total Posts"    value="89,314"  sub="Today: 412" />
          <StatCard icon="toll"           label="CLT Staked"     value="4.2M"    sub="↑ 8%" />
          <StatCard icon="campaign"       label="Active Campaigns" value="23"   sub="3 pending" />
        </div>

        {/* Admin actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border-4 border-on-background p-6 flex flex-col gap-4"
            style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
              <h2 className="font-extrabold text-[16px] uppercase tracking-tight">Admin Management</h2>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Invite new admins via one-time secure token links. Tokens expire after 24 hours and are destroyed on use.
            </p>
            <button onClick={() => setShowInvite(true)}
              className="flex items-center justify-center gap-2 py-3 bg-primary-container text-on-primary-fixed font-bold text-[12px] uppercase tracking-widest border-4 border-on-background hover:brightness-105 transition-all"
              style={{ boxShadow: '3px 3px 0px 0px #1a1c1c' }}>
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Invite a New Admin
            </button>
          </div>

          <div className="bg-surface border-4 border-on-background p-6 flex flex-col gap-4"
            style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <h2 className="font-extrabold text-[16px] uppercase tracking-tight">Security Log</h2>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                { event: 'Login · 2FA passed',   time: '2 min ago',  ok: true  },
                { event: 'Invite sent',           time: '1h ago',     ok: true  },
                { event: 'Failed login attempt',  time: '3h ago',     ok: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between text-[11px] border-b border-on-background/10 pb-2 last:border-0 last:pb-0">
                  <span className={`flex items-center gap-1.5 font-bold ${item.ok ? 'text-on-surface' : 'text-error'}`}>
                    <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.ok ? 'check_circle' : 'warning'}
                    </span>
                    {item.event}
                  </span>
                  <span className="text-on-surface-variant font-mono">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Architecture reminder */}
        <div className="bg-on-background text-surface border-4 border-on-background p-6"
          style={{ boxShadow: '4px 4px 0px 0px #1a1c1c' }}>
          <h2 className="font-extrabold text-[14px] uppercase tracking-widest mb-3 text-primary-container">
            Backend Integration Checklist
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-[11px] text-surface/70">
            {[
              'Phase 1: Seed Super Admin via CLI — never via UI',
              'Phase 2: Invite tokens are 64-char crypto random strings',
              'Phase 3: Login → 2FA step before issuing session',
              'Phase 4: Session stored in HttpOnly + Secure cookie',
              'Sessions auto-expire after 15 min inactivity',
              'Invite tokens expire in 24h and destroyed after use',
              'Password hashed with bcrypt or Argon2 (cost ≥ 12)',
              'Admin login path never linked from public pages',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary-container shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </main>
    </div>
  )
}
