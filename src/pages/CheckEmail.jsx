import { useState } from 'react'
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CheckEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { requestMagicLink, verifyMagicLink } = useAuth()

  const email = location.state?.email || 'your email'
  const [resendState, setResendState] = useState('idle') // idle | sending | sent
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  // If the user lands here with ?token=… (after clicking email link), verify immediately
  const token = searchParams.get('token')
  if (token && !verifying) {
    setVerifying(true)
    verifyMagicLink(token)
      .then(() => navigate('/', { replace: true }))
      .catch((err) => {
        setVerifying(false)
        setError(err.message || 'Invalid or expired link. Please request a new one.')
      })
  }

  const handleResend = async () => {
    if (resendState !== 'idle' || email === 'your email') return
    setResendState('sending')
    try {
      await requestMagicLink(email)
      setResendState('sent')
      setTimeout(() => setResendState('idle'), 4000)
    } catch {
      setResendState('idle')
    }
  }

  const handleOpenInbox = () => {
    window.location.href = `mailto:${email}`
  }

  const resendLabel = {
    idle: 'Resend Link',
    sending: 'Sending…',
    sent: 'Link Sent!',
  }[resendState]

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden relative">

      {/* Background decorations */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-primary-container/10 -z-10 translate-x-1/2 -translate-y-1/2 rotate-45 border-4 border-on-surface/5" />
      <div className="fixed bottom-0 left-0 w-48 h-48 bg-primary-container/5 -z-10 -translate-x-1/3 translate-y-1/3 rotate-12 border-4 border-on-surface/5" />

      {/* ── Left Brand Panel (desktop) ── */}
      <section className="hidden lg:flex w-1/2 h-screen relative bg-surface-container-low overflow-hidden border-r-[4px] border-on-surface">
        <img
          alt="Chicago Web3 Brand Visual"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida/ADBb0ugLx4x4DM0-_tqX27dQ50hEaxr2_HyrMJBNx6nkwMC8ij36AYvpdAc2I1Vm-T93q7UtvskNbVLxXRiDXGX5nNpjsWRsckOcC1_NUewTNYmCUtNE3e5hQycheLJe2svOtk27gKrvx5Ye5AYI4yIZOaoTzzHjsYgODZHSs5ndk5dU3YHOTf5IBZEcUWFBxbHS85VqLMueGg5moCGGod33WI_OqcNhr03VvV0jj4AdQxm4fkh2qV3t28pLcTsP"
        />
        <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        <div className="absolute top-12 left-12 z-10">
          <div
            className="bg-primary-container px-4 py-2 border-[3px] border-on-surface"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <span className="font-extrabold text-[18px] uppercase tracking-widest text-on-primary-container">
              Chicago
            </span>
          </div>
        </div>
      </section>

      {/* ── Right Content Panel ── */}
      <section className="flex flex-col items-center justify-center w-full lg:w-1/2 px-6 md:px-16 py-12 bg-surface relative">

        {/* Mobile brand mark */}
        <div className="lg:hidden absolute top-8 left-6">
          <span className="font-extrabold text-[20px] uppercase tracking-widest text-on-surface">
            Chicago
          </span>
        </div>

        <div
          className="w-full max-w-md bg-white border-[4px] border-on-surface p-8 flex flex-col items-center text-center"
          style={{ boxShadow: '8px 8px 0px 0px #000' }}
        >
          {/* Email icon */}
          <div
            className="w-24 h-24 bg-primary-container border-[4px] border-on-surface flex items-center justify-center mb-8"
            style={{ boxShadow: '8px 8px 0px 0px #d4af37' }}
          >
            <span
              className="material-symbols-outlined text-[48px] text-on-primary-container"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '48px' }}
            >
              mark_email_unread
            </span>
          </div>

          <h1 className="font-extrabold text-[32px] md:text-[40px] uppercase tracking-tight leading-none text-on-surface mb-4">
            Check your email
          </h1>

          <p className="font-medium text-[16px] text-on-surface-variant mb-8 leading-relaxed">
            We sent a secure sign-in link to{' '}
            <strong className="text-on-surface font-bold">{email}</strong>.
            {' '}Click the link in your inbox to log in instantly.
          </p>

          {error && (
            <div className="w-full flex items-center gap-3 border-[3px] border-error bg-error-container text-on-error-container p-4 mb-6">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <p className="font-bold text-sm text-left">{error}</p>
            </div>
          )}

          {verifying ? (
            <div className="w-full py-4 flex items-center justify-center gap-3 border-[4px] border-on-surface mb-6">
              <div className="w-5 h-5 border-[3px] border-on-surface border-t-transparent animate-spin" />
              <span className="font-bold text-sm uppercase tracking-widest">Verifying…</span>
            </div>
          ) : (
            <button
              onClick={handleOpenInbox}
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
              className="w-full py-4 bg-primary-container text-on-primary-container font-bold uppercase tracking-widest text-sm border-[4px] border-on-surface hover:brightness-105 transition-all active:translate-x-[4px] active:translate-y-[4px] mb-6 flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Open Inbox
            </button>
          )}

          <p className="font-medium text-[14px] text-on-surface-variant">
            Didn't receive the email? Check your spam or{' '}
            <button
              onClick={handleResend}
              disabled={resendState !== 'idle'}
              className={`font-bold underline decoration-[3px] underline-offset-4 transition-colors
                ${resendState === 'sent' ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
            >
              {resendLabel}
            </button>
          </p>
        </div>

        <div className="mt-8">
          <Link
            to="/login"
            className="flex items-center gap-2 font-bold text-[13px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-[20px]">
              arrow_back
            </span>
            Back to login
          </Link>
        </div>
      </section>
    </div>
  )
}
