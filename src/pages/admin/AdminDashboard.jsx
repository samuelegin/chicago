import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AdminAlert, AdminButton, AdminInput } from './AdminLogin'

// ── Idle logout ───────────────────────────────────────────────
function useIdleLogout(timeoutMs = 14 * 60 * 1000, onTrigger) {
  const timer = useRef(null)
  const reset = () => { clearTimeout(timer.current); timer.current = setTimeout(onTrigger, timeoutMs) }
  useEffect(() => {
    reset()
    const evts = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    evts.forEach(e => window.addEventListener(e, reset))
    return () => { clearTimeout(timer.current); evts.forEach(e => window.removeEventListener(e, reset)) }
  }, [])
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, badge, gold }) {
  return (
    <div
      className="bg-surface border-4 border-on-background flex flex-col gap-3 p-6 transition-all hover:-translate-y-px hover:-translate-x-px"
      style={{ boxShadow: gold ? '6px 6px 0px 0px #d4af37' : '6px 6px 0px 0px var(--neo-border-color)' }}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 border-4 border-on-background flex items-center justify-center ${gold ? 'bg-primary-container' : 'bg-surface-container'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        {badge && (
          <span className="font-bold text-[9px] uppercase tracking-[0.16em] px-2 py-1 border-2 border-on-background/20 bg-surface-container-low text-on-surface-variant">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="font-extrabold text-[36px] leading-none tracking-tight">{value}</p>
        <p className="font-bold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant mt-1">{label}</p>
      </div>
    </div>
  )
}

// ── Invite modal ──────────────────────────────────────────────
function InviteModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const send = async () => {
    if (!email.includes('@')) { setError('Enter a valid email.'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false); setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-on-background/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-surface border-4 border-on-background p-8 flex flex-col gap-5"
        style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-extrabold text-[20px] uppercase tracking-tight">Invite Admin</h2>
            <p className="text-sm text-on-surface-variant mt-1">One-time link · expires 24 hours</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors ml-4">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {error && <AdminAlert type="error" message={error} />}
        {done
          ? <>
            <AdminAlert type="success" message={`Invite sent to ${email}. Link expires in 24 hours.`} />
            <button onClick={onClose} className="w-full py-3 border-4 border-on-background font-bold uppercase tracking-widest text-sm bg-surface hover:bg-surface-container transition-colors">
              Close
            </button>
          </>
          : <>
            <AdminInput id="invite-email" label="Colleague's Email" type="email" placeholder="colleague@chicago.io"
              value={email} onChange={e => setEmail(e.target.value)} error={error ? ' ' : ''} />
            <div className="bg-surface-container border-2 border-on-background/15 p-3 flex gap-3">
              <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">A cryptographic token is generated, stored with a 24-hour expiry, and emailed as a secure link. The token is destroyed after use.</p>
            </div>
            <AdminButton loading={loading} onClick={send}>
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Invite Link
            </AdminButton>
          </>
        }
      </div>
    </div>
  )
}

// ── Idle warning overlay ──────────────────────────────────────
function IdleWarning({ countdown, onStay, onLogout }) {
  return (
    <div className="fixed inset-0 z-50 bg-on-background/70 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-surface border-4 border-on-background p-8 flex flex-col items-center gap-5 text-center"
        style={{ boxShadow: '8px 8px 0px 0px var(--neo-border-color)' }}>
        <div className="w-14 h-14 bg-primary-fixed border-4 border-on-background flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
        </div>
        <div>
          <h2 className="font-extrabold text-[22px] uppercase tracking-tight">Session Expiring</h2>
          <p className="text-sm text-on-surface-variant mt-1">Auto-logout in <strong className="text-error">{countdown}s</strong> due to inactivity</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onStay} className="flex-1 py-3 bg-primary-container text-on-primary-fixed font-bold uppercase text-sm border-4 border-on-background" style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}>Stay Logged In</button>
          <button onClick={onLogout} className="flex-1 py-3 bg-surface text-on-surface font-bold uppercase text-sm border-4 border-on-background" style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}>Log Out</button>
        </div>
      </div>
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 mx-0 text-left transition-all group
        ${active
          ? 'bg-primary-container text-on-primary-fixed border-r-4 border-on-background font-extrabold'
          : 'text-on-surface hover:bg-surface-container-high hover:translate-x-1 font-medium'}`}
      style={active ? { boxShadow: 'inset -4px 0 0 0 var(--neo-border-color)' } : {}}
    >
      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      <span className="text-[15px] tracking-tight flex-1">{label}</span>
      {badge && (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border-2 ${active ? 'border-on-primary-fixed/30 text-on-primary-fixed/70' : 'border-on-background/20 text-on-surface-variant bg-surface-container'}`}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ── Section: Overview ─────────────────────────────────────────
function Overview({ onInvite }) {
  const recentActivity = [
    { icon: 'login',       text: 'Admin login · 2FA passed',       time: '2 min ago',  ok: true  },
    { icon: 'send',        text: 'Invite sent to dev@chicago.io',   time: '1 hr ago',   ok: true  },
    { icon: 'warning',     text: 'Failed login attempt (3rd party)', time: '3 hrs ago',  ok: false },
    { icon: 'person_add',  text: 'New user registered',             time: '5 hrs ago',  ok: true  },
    { icon: 'toll',        text: 'Staking reward distributed',      time: '8 hrs ago',  ok: true  },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Security notice */}
      <div className="bg-surface border-4 border-on-background p-5 flex items-start gap-4" style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}>
        <span className="material-symbols-outlined text-primary-container text-[24px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        <div>
          <p className="font-bold text-sm uppercase tracking-wider">Session Security Active</p>
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            Token stored in <strong>HttpOnly · Secure</strong> cookie — invisible to JS. Auto-logout after <strong>15 min</strong> inactivity.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="group"      label="Total Users"       value="14,820"  badge="+2.4%"       gold />
        <StatCard icon="article"    label="Total Posts"       value="89,314"  badge="412 today"        />
        <StatCard icon="toll"       label="$CHI Staked"       value="4.2M"    badge="↑ 8%"        gold />
        <StatCard icon="campaign"   label="Active Campaigns"  value="23"      badge="3 pending"        />
      </div>

      {/* Two-col lower */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin management */}
        <div className="bg-surface border-4 border-on-background p-6 flex flex-col gap-4" style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
            <h2 className="font-extrabold text-[15px] uppercase tracking-tight">Admin Management</h2>
          </div>
          <p className="text-[12px] text-on-surface-variant leading-relaxed">
            Invite new admins via one-time cryptographic token links. Tokens expire after 24 hours and are permanently destroyed on use.
          </p>
          <button onClick={onInvite}
            className="flex items-center justify-center gap-2 py-3 bg-primary-container text-on-primary-fixed font-bold text-[12px] uppercase tracking-widest border-4 border-on-background hover:brightness-105 transition-all"
            style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}>
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Invite a New Admin
          </button>
        </div>

        {/* Security log */}
        <div className="bg-surface border-4 border-on-background p-6 flex flex-col gap-4" style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <h2 className="font-extrabold text-[15px] uppercase tracking-tight">Security Log</h2>
            </div>
            <span className="font-bold text-[9px] uppercase tracking-widest text-on-surface-variant border-2 border-on-background/15 px-2 py-1">Last 24h</span>
          </div>
          <ul className="flex flex-col divide-y-2 divide-on-background/10">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className={`flex items-center gap-2 font-bold text-[11px] ${item.ok ? 'text-on-surface' : 'text-error'}`}>
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.ok ? 'check_circle' : 'warning'}
                  </span>
                  {item.text}
                </span>
                <span className="text-on-surface-variant text-[10px] font-mono ml-3 shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Backend checklist */}
      <div className="bg-on-background text-surface border-4 border-on-background p-6" style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}>
        <h2 className="font-extrabold text-[13px] uppercase tracking-widest mb-4 text-primary-container">
          Backend Integration Checklist
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-[11px] text-surface/70">
          {[
            'Phase 1: Seed Super Admin via CLI — never via UI',
            'Phase 2: Invite tokens are 64-char crypto random strings',
            'Phase 3: Login → 2FA step before issuing session',
            'Phase 4: Session stored in HttpOnly + Secure cookie',
            'Sessions auto-expire after 15 min inactivity',
            'Invite tokens expire in 24h, destroyed after use',
            'Password hashed with bcrypt/Argon2 (cost ≥ 12)',
            'Admin login path never linked from public pages',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-container shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Section: User Management ──────────────────────────────────
function UserManagement() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const users = [
    { id: 1, name: 'Amara Osei',      handle: '@amara_web3',   role: 'User',  joined: 'May 2026',  status: 'active',    posts: 142, staked: '2,400' },
    { id: 2, name: 'Jake Thornton',   handle: '@jaketh',        role: 'User',  joined: 'Apr 2026',  status: 'active',    posts: 88,  staked: '800'   },
    { id: 3, name: 'Priya Nair',      handle: '@priya_nair',    role: 'Mod',   joined: 'Mar 2026',  status: 'active',    posts: 310, staked: '5,100' },
    { id: 4, name: 'Luca Bianchi',    handle: '@luca_b',        role: 'User',  joined: 'Feb 2026',  status: 'suspended', posts: 14,  staked: '0'     },
    { id: 5, name: 'Yuki Tanaka',     handle: '@yuki_t',        role: 'User',  joined: 'Jan 2026',  status: 'active',    posts: 207, staked: '1,200' },
  ]

  const statusColors = {
    active:    'bg-green-100 text-green-800 border-green-700',
    suspended: 'bg-error-container text-on-error-container border-error',
    pending:   'bg-primary-fixed text-on-primary-fixed border-primary',
  }
  const roleColors = {
    User: 'bg-surface-container text-on-surface-variant border-on-background/20',
    Mod:  'bg-primary-container/30 text-on-primary-container border-primary-container',
    Admin:'bg-on-background text-surface border-on-background',
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.handle.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
          <input
            type="text" placeholder="Search users…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border-4 border-on-background pl-11 pr-4 py-3 font-body-md focus:ring-0 focus:outline-none focus:border-primary-container transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-3 border-4 border-on-background font-bold text-[11px] uppercase tracking-widest transition-all
                ${filter === f ? 'bg-on-background text-surface' : 'bg-surface text-on-surface hover:bg-surface-container'}`}
              style={filter === f ? { boxShadow: '3px 3px 0px 0px #d4af37' } : { boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border-4 border-on-background overflow-x-auto" style={{ boxShadow: '6px 6px 0px 0px var(--neo-border-color)' }}>
        <table className="w-full">
          <thead>
            <tr className="bg-on-background text-surface border-b-4 border-on-background">
              {['User', 'Role', 'Status', 'Joined', 'Posts', '$CHI Staked', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left font-bold text-[10px] uppercase tracking-[0.14em] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className={`border-b-2 border-on-background/10 hover:bg-primary-fixed/40 transition-colors ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-container border-2 border-on-background flex items-center justify-center font-extrabold text-[11px] text-on-primary-fixed shrink-0">
                      {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p className="font-bold text-[13px]">{u.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{u.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold text-[10px] uppercase tracking-widest px-2 py-1 border-2 ${roleColors[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold text-[10px] uppercase tracking-widest px-2 py-1 border-2 ${statusColors[u.status]}`}>{u.status}</span>
                </td>
                <td className="px-6 py-4 text-[12px] text-on-surface-variant font-mono">{u.joined}</td>
                <td className="px-6 py-4 font-mono font-bold text-[13px]">{u.posts}</td>
                <td className="px-6 py-4 font-mono font-bold text-[13px]">{u.staked}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 border-2 border-on-background hover:bg-on-background hover:text-surface transition-colors">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button className="p-1.5 border-2 border-on-background hover:bg-error hover:text-on-error transition-colors">
                      <span className="material-symbols-outlined text-[16px]">{u.status === 'suspended' ? 'lock_open' : 'block'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 border-t-4 border-on-background bg-surface-container-low flex items-center justify-between">
          <p className="font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Showing {filtered.length} of {users.length} users</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border-2 border-on-background font-bold text-[11px] uppercase tracking-widest hover:bg-on-background hover:text-surface transition-colors disabled:opacity-40" disabled>Prev</button>
            <button className="px-4 py-2 border-2 border-on-background font-bold text-[11px] uppercase tracking-widest hover:bg-on-background hover:text-surface transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section: Ad Manager ───────────────────────────────────────
function AdManager() {
  const campaigns = [
    { name: 'Premium Tier Access',    status: 'active',  impressions: '452,001', clicks: '12,402', ctr: '2.74%' },
    { name: 'Governance Update Q3',   status: 'paused',  impressions: '120,442', clicks: '4,120',  ctr: '3.42%' },
    { name: 'Developer Grants Open',  status: 'active',  impressions: '712,058', clicks: '32,409', ctr: '4.55%' },
    { name: 'Chicago NFT Drop',       status: 'pending', impressions: '—',       clicks: '—',      ctr: '—'     },
  ]
  const statusColors = {
    active:  'bg-green-100 text-green-800 border-green-700',
    paused:  'bg-yellow-100 text-yellow-800 border-yellow-700',
    pending: 'bg-primary-fixed text-on-primary-fixed border-primary',
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* Stats row */}
      <div className="xl:col-span-3 grid grid-cols-3 gap-4">
        {[
          { icon: 'visibility', label: 'Total Impressions', value: '1.28M', badge: 'Live' },
          { icon: 'ads_click',  label: 'Total Clicks',      value: '48,931' },
          { icon: 'percent',    label: 'Average CTR',       value: '3.81%' },
        ].map(s => (
          <div key={s.label} className="bg-surface border-4 border-on-background p-5 transition-all hover:-translate-y-px hover:-translate-x-px"
            style={{ boxShadow: '6px 6px 0px 0px #d4af37' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              {s.badge && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary-fixed border-2 border-primary text-on-primary-fixed">{s.badge}</span>}
            </div>
            <p className="font-bold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">{s.label}</p>
            <p className="font-extrabold text-[36px] leading-none tracking-tight mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="xl:col-span-2 border-4 border-on-background" style={{ boxShadow: '6px 6px 0px 0px var(--neo-border-color)' }}>
        <div className="px-6 py-4 border-b-4 border-on-background bg-surface flex items-center justify-between">
          <h3 className="font-extrabold text-[15px] uppercase tracking-tight">Active Campaigns</h3>
          <div className="flex gap-2">
            <button className="p-2 border-2 border-on-background hover:bg-on-background hover:text-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
            </button>
            <button className="p-2 border-2 border-on-background hover:bg-on-background hover:text-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-surface-container border-b-4 border-on-background">
              {['Campaign', 'Status', 'Impressions', 'Clicks', 'CTR', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left font-bold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i} className="border-b-2 border-on-background/10 hover:bg-primary-fixed/30 transition-colors">
                <td className="px-5 py-4 font-bold text-[13px]">{c.name}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold text-[10px] uppercase tracking-widest px-2 py-1 border-2 ${statusColors[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-5 py-4 font-mono text-[13px]">{c.impressions}</td>
                <td className="px-5 py-4 font-mono text-[13px]">{c.clicks}</td>
                <td className="px-5 py-4 font-mono font-bold text-[13px]">{c.ctr}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    <button className="p-1.5 border-2 border-on-background hover:bg-on-background hover:text-surface transition-colors">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                    <button className="p-1.5 border-2 border-on-background hover:bg-on-background hover:text-surface transition-colors">
                      <span className="material-symbols-outlined text-[15px]">{c.status === 'active' ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <button className="p-1.5 border-2 border-on-background hover:bg-error hover:text-on-error transition-colors">
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create ad form */}
      <div className="border-4 border-on-background" style={{ boxShadow: '6px 6px 0px 0px #d4af37' }}>
        <div className="px-6 py-4 border-b-4 border-on-background bg-primary">
          <h3 className="font-extrabold text-[15px] uppercase tracking-tight text-on-primary">Create New Ad</h3>
        </div>
        <div className="p-6 bg-surface flex flex-col gap-4">
          {[
            { label: 'Campaign Name',   placeholder: 'e.g. Winter Drop 2026', type: 'text' },
            { label: 'Destination URL', placeholder: 'https://chicago.web3/…', type: 'url'  },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-2">
              <label className="font-bold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                className="w-full bg-surface-container-low border-b-4 border-on-background px-4 py-3 focus:ring-0 focus:outline-none focus:border-primary-container transition-all font-body-md text-[14px]" />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">Image Asset</label>
            <div className="w-full border-4 border-dashed border-outline-variant bg-surface-container-low p-6 text-center hover:border-primary-container transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">cloud_upload</span>
              <p className="font-bold text-[11px] uppercase tracking-widest text-on-surface-variant mt-2">Drag & Drop or Click</p>
              <p className="text-[10px] text-on-surface-variant mt-1">PNG, JPG, WebP · Max 5MB</p>
            </div>
          </div>
          <button
            className="w-full py-4 bg-primary-container text-on-primary-fixed font-bold uppercase tracking-widest text-sm border-4 border-on-background hover:brightness-105 transition-all"
            style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}>
            Publish Ad
          </button>
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ads reviewed within 24 hours</p>
        </div>
      </div>
    </div>
  )
}

// ── Section: Admin Team ───────────────────────────────────────
function AdminTeam({ onInvite }) {
  const admins = [
    { name: 'Root Admin',    email: 'root@chicago.io',    role: 'Super Admin', since: 'Jan 2025', last: '2 min ago',  status: 'online' },
    { name: 'Priya Nair',    email: 'priya@chicago.io',   role: 'Moderator',   since: 'Mar 2025', last: '1 hr ago',   status: 'away'   },
    { name: 'James Okafor',  email: 'james@chicago.io',   role: 'Ad Manager',  since: 'Jun 2025', last: '3 hrs ago',  status: 'offline'},
  ]
  const statusDot = { online: 'bg-green-500', away: 'bg-yellow-400', offline: 'bg-on-surface-variant/30' }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-on-surface-variant font-medium">{admins.length} active admins on this platform</p>
        <button onClick={onInvite}
          className="flex items-center gap-2 px-5 py-3 bg-primary-container text-on-primary-fixed font-bold text-[11px] uppercase tracking-widest border-4 border-on-background hover:brightness-105 transition-all"
          style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}>
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Invite Admin
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {admins.map((a, i) => (
          <div key={i} className="bg-surface border-4 border-on-background p-6 flex items-center gap-5"
            style={{ boxShadow: '4px 4px 0px 0px var(--neo-border-color)' }}>
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-primary-container border-4 border-on-background flex items-center justify-center font-extrabold text-[13px] text-on-primary-fixed">
                {a.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${statusDot[a.status]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-extrabold text-[15px]">{a.name}</p>
                <span className="font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 border-2 border-on-background/20 bg-surface-container text-on-surface-variant">{a.role}</span>
              </div>
              <p className="text-[12px] text-on-surface-variant">{a.email}</p>
              <p className="text-[11px] text-on-surface-variant/60 mt-0.5">Since {a.since} · Last active {a.last}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="p-2 border-2 border-on-background hover:bg-on-background hover:text-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              {a.role !== 'Super Admin' && (
                <button className="p-2 border-2 border-on-background hover:bg-error hover:text-on-error transition-colors">
                  <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate               = useNavigate()
  const { logout: authLogout } = useAuth()
  const [activeTab, setActiveTab]       = useState('overview')
  const [showInvite, setShowInvite]     = useState(false)
  const [idleWarning, setIdleWarning]   = useState(false)
  const [idleCountdown, setIdleCountdown] = useState(60)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const countdownRef = useRef(null)

  const logout = () => {
    authLogout()
    navigate('/login')
  }

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

  const stayActive = () => { setIdleWarning(false); clearInterval(countdownRef.current) }

  const tabs = [
    { id: 'overview',  icon: 'dashboard',     label: 'Overview'        },
    { id: 'users',     icon: 'group',          label: 'User Management', badge: '14.8k' },
    { id: 'ads',       icon: 'ads_click',      label: 'Ad Manager',      badge: '23'    },
    { id: 'team',      icon: 'shield_person',  label: 'Admin Team',      badge: '3'     },
  ]

  const tabTitles = { overview: 'Dashboard', users: 'User Management', ads: 'Ad Manager', team: 'Admin Team' }

  return (
    <div className="min-h-screen bg-surface-container flex">

      {/* ── Overlays ── */}
      {idleWarning && <IdleWarning countdown={idleCountdown} onStay={stayActive} onLogout={logout} />}
      {showInvite  && <InviteModal onClose={() => setShowInvite(false)} />}

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col h-screen w-72 border-r-4 border-on-background bg-surface sticky top-0 z-40 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-6 py-6 border-b-4 border-on-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-container border-4 border-on-background flex items-center justify-center"
                style={{ boxShadow: '3px 3px 0px 0px var(--neo-border-color)' }}>
                <span className="material-symbols-outlined text-[18px] text-on-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              </div>
              <div>
                <h1 className="font-extrabold text-[18px] uppercase tracking-tight leading-none">Chicago</h1>
                <p className="font-bold text-[9px] uppercase tracking-[0.16em] text-on-surface-variant">Admin Console</p>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mx-4 mt-4 mb-2 px-4 py-2.5 bg-on-background flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-bold text-[9px] uppercase tracking-[0.18em] text-surface/70">Session Authenticated</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-2">
            {tabs.map(t => (
              <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id}
                badge={t.badge} onClick={() => setActiveTab(t.id)} />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t-4 border-on-background">
            <NavItem icon="settings" label="Settings" active={false} onClick={() => {}} />
            <NavItem icon="logout"   label="Log Out"  active={false} onClick={logout}   />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-surface border-b-4 border-on-background px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-30">
          {/* Mobile: hamburger + title */}
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1 text-on-surface" onClick={() => setMobileNavOpen(v => !v)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-extrabold text-[18px] uppercase tracking-tight">{tabTitles[activeTab]}</h2>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search (desktop) */}
            <div className="hidden lg:flex items-center border-4 border-on-background bg-surface-container-low px-4 py-2 focus-within:border-primary-container transition-all">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">search</span>
              <input type="text" placeholder="Search platform…"
                className="bg-transparent border-none focus:ring-0 text-[13px] w-52 placeholder:text-on-surface-variant/40" />
            </div>

            <button className="relative p-2 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error border-2 border-surface" />
            </button>

            {/* Invite (desktop) */}
            <button onClick={() => setShowInvite(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-fixed font-bold text-[11px] uppercase tracking-wider border-2 border-on-background hover:brightness-105 transition-all"
              style={{ boxShadow: '2px 2px 0px 0px var(--neo-border-color)' }}>
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Invite Admin
            </button>

            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 font-bold text-[11px] uppercase tracking-wider border-2 border-on-background hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:block">Log Out</span>
            </button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-on-background/60" onClick={() => setMobileNavOpen(false)}>
            <div className="w-72 h-full bg-surface border-r-4 border-on-background flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 border-b-4 border-on-background flex items-center justify-between">
                <span className="font-extrabold text-[18px] uppercase tracking-tight">Chicago Admin</span>
                <button onClick={() => setMobileNavOpen(false)}><span className="material-symbols-outlined">close</span></button>
              </div>
              <nav className="flex-1 py-2">
                {tabs.map(t => (
                  <NavItem key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id}
                    badge={t.badge} onClick={() => { setActiveTab(t.id); setMobileNavOpen(false) }} />
                ))}
              </nav>
              <div className="border-t-4 border-on-background">
                <NavItem icon="logout" label="Log Out" active={false} onClick={logout} />
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <span className="font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Admin</span>
            <span className="text-on-surface-variant/40 font-bold">/</span>
            <span className="font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface">{tabTitles[activeTab]}</span>
          </div>

          {activeTab === 'overview' && <Overview onInvite={() => setShowInvite(true)} />}
          {activeTab === 'users'    && <UserManagement />}
          {activeTab === 'ads'      && <AdManager />}
          {activeTab === 'team'     && <AdminTeam onInvite={() => setShowInvite(true)} />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t-4 border-on-background z-20 flex justify-around py-3 px-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === t.id ? 'text-primary-container' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: activeTab === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{t.id}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
