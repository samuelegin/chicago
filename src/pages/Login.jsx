import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Neo-Brutalist shared primitives ──────────────────────────
function NeoInput({ id, label, type = 'text', placeholder, value, onChange, disabled }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-bold text-[11px] uppercase tracking-[0.12em] text-on-surface"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          boxShadow: focused
            ? '4px 4px 0px 0px #d4af37'
            : '4px 4px 0px 0px #000000',
        }}
        className="w-full px-6 py-4 border-[3px] border-on-surface bg-surface text-on-surface
          placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none focus:border-primary
          transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  )
}

function NeoButton({ children, onClick, type = 'button', loading, disabled, variant = 'primary' }) {
  const base = 'w-full py-4 px-6 border-[3px] border-on-surface font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary-container text-on-primary-container',
    outline: 'bg-surface text-on-surface hover:bg-surface-container',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ boxShadow: '4px 4px 0px 0px #000000' }}
      className={`${base} ${variants[variant]}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-[3px] border-current border-t-transparent animate-spin" />
          <span>Sending…</span>
        </>
      ) : children}
    </button>
  )
}

function Toast({ message, onClose }) {
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-on-surface text-surface px-6 py-4 border-[3px] border-on-surface"
      style={{ boxShadow: '4px 4px 0px 0px #d4af37' }}
    >
      <span className="material-symbols-outlined text-[18px]">info</span>
      <span className="font-bold text-sm uppercase tracking-wide">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}

// ── Background decorations ────────────────────────────────────
function BgDecorations() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute top-[-6%] right-[-6%] w-[32%] h-[32%] border-[8px] border-on-background/5 rotate-12" />
      <div className="absolute bottom-[-4%] left-[-4%] w-[25%] h-[25%] bg-primary-container/10 -rotate-6" />
      <div className="absolute top-1/2 left-8 w-16 h-16 border-[4px] border-on-background/5" />
      <div className="absolute top-1/4 right-16 w-10 h-10 bg-primary-container/8 rotate-45" />
    </div>
  )
}

// ── LOGIN PAGE ────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const { requestMagicLink } = useAuth()

  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [toast, setToast]   = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      await requestMagicLink(email)
      // Navigate to check-email screen passing the email so it can display it
      navigate('/check-email', { state: { email } })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    if (!import.meta.env.VITE_API_BASE_URL) {
      alert('Authentication is not configured yet. Please check back soon.')
      return
    }
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`
  }

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden relative">
      <BgDecorations />

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* ── Left Brand Panel (desktop only) ── */}
      <section className="hidden lg:block w-1/2 h-screen relative bg-surface-container-low overflow-hidden border-r-[4px] border-on-surface">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKjd-2PiSLgA0CXQVrGqatQWZ9RvvckptvkLGlwiOYVmWtTbHvoW_ec4kKbndHB0wvlulCCZWhPBwkiAKle3sGQ3fNGEap4uEjz4pdWEePfxgu16EGllOSHSGMejqq91-gytD_7yr_umrxgMxSM65fIYwss9w6iXv6Os8SkglBu-ToSDAycgLttT5ZN66m0yzib36IOl0X-wpZRPYo7Vfe3FZj1WL1qDsuk-i7cmItAcsMYEdfKcm2zT0rsrZq29eC6cbTN-5uoPxI"
          alt="Chicago Brand"
          className="w-full h-full object-cover scale-110"
          style={{ transition: 'transform 0.1s ease-out' }}
        />
        {/* Brand overlay card */}
        <div
          className="absolute bottom-16 left-16 right-16 p-8 bg-white/10 backdrop-blur-md border border-white/20"
          style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.8)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-container border-[3px] border-on-surface overflow-hidden flex items-center justify-center">
              <img src="/favicon.jpg" alt="Chicago logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="font-extrabold text-[40px] uppercase tracking-tight leading-none text-white">
              Chicago
            </h2>
          </div>
          <p className="text-white/90 font-medium text-[16px] leading-relaxed">
            The next architectural era of decentralized social networking.
          </p>
        </div>
        {/* Top brand mark */}
        <div className="absolute top-8 left-8">
          <div
            className="bg-primary-container px-4 py-2 border-[3px] border-on-surface"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <div className="flex items-center gap-2">
              <img src="/favicon.jpg" alt="Chicago logo" className="w-6 h-6 object-cover" />
              <span className="font-extrabold text-[18px] uppercase tracking-widest text-on-primary-container">
                Chicago
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right Form Panel ── */}
      <section className="w-full lg:w-1/2 h-screen flex items-center justify-center overflow-y-auto px-6 md:px-16 py-12 bg-surface">
        <div className="w-full max-w-[480px] flex flex-col items-center">

          {/* Mobile brand mark */}
          <div className="lg:hidden mb-8 self-start">
            <div
              className="bg-primary-container px-4 py-2 border-[3px] border-on-surface"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              <div className="flex items-center gap-2">
                <img src="/favicon.jpg" alt="Chicago logo" className="w-6 h-6 object-cover" />
                <span className="font-extrabold text-[18px] uppercase tracking-widest text-on-primary-container">
                  Chicago
                </span>
              </div>
            </div>
          </div>

          {/* Brand icon + heading */}
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <div
                className="w-16 h-16 bg-primary-container border-[3px] border-on-surface overflow-hidden"
                style={{ boxShadow: '4px 4px 0px 0px #000' }}
              >
                <img src="/favicon.jpg" alt="Chicago logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="font-extrabold text-[32px] md:text-[40px] uppercase tracking-tight leading-none text-on-surface mb-2">
              Welcome back
            </h1>
            <p className="text-on-surface-variant font-medium text-[16px]">
              Sign in to your Chicago account
            </p>
          </div>

          {/* Google OAuth button */}
          <div className="w-full mb-6">
            <button
              type="button"
              onClick={handleGoogle}
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
              className="w-full flex items-center justify-center gap-4 bg-surface border-[3px] border-on-surface py-4 px-6 transition-all hover:bg-surface-container active:translate-x-[2px] active:translate-y-[2px] group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-bold text-[13px] uppercase tracking-[0.1em] text-on-surface">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center mb-6">
            <div className="flex-grow h-[3px] bg-on-surface" />
            <span className="px-4 font-bold text-[11px] uppercase tracking-[0.1em] text-on-surface-variant bg-surface">
              or sign in with email
            </span>
            <div className="flex-grow h-[3px] bg-on-surface" />
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="w-full flex flex-col gap-5">
            <NeoInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />

            {error && (
              <div className="flex items-center gap-3 border-[3px] border-error bg-error-container text-on-error-container p-4">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <p className="font-bold text-sm">{error}</p>
              </div>
            )}

            <NeoButton type="submit" loading={loading}>
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Magic Link
            </NeoButton>
          </form>

          {/* Info hint */}
          <div className="mt-6 w-full p-4 border-[2px] border-dotted border-on-surface-variant flex items-start gap-4">
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">info</span>
            <p className="text-on-surface-variant font-medium text-[14px] leading-relaxed">
              No password needed. We'll email you a secure link to sign in instantly.
            </p>
          </div>

          {/* Footer links */}
          <div className="mt-10 flex gap-6">
            <a href="#" className="font-bold text-[12px] uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">
              Privacy Policy
            </a>
            <a href="#" className="font-bold text-[12px] uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary">
              Terms of Service
            </a>
          </div>

          <p className="mt-6 text-center text-[12px] font-medium text-on-surface-variant/70 leading-relaxed max-w-[90%]">
            New to Chicago? Enter your email above — we'll create your account automatically.
          </p>

        </div>
      </section>
    </div>
  )
}
