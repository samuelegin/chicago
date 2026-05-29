import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * /auth/callback
 *
 * Backend redirects here after Google OAuth or magic-link with a
 * one-time token in the query string:
 *   https://chicago-ten.vercel.app/auth/callback?token=xxx
 *
 * We exchange it via verifyMagicLink() — the backend sets HttpOnly
 * access + refresh cookies and returns the user object.
 * No token is ever stored in localStorage.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { verifyMagicLink } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('No token found. Please try signing in again.')
      return
    }

    verifyMagicLink(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setError('Sign-in failed. The link may have expired. Please try again.'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div
          className="w-full max-w-md border-[4px] border-on-surface bg-surface-container p-8 flex flex-col gap-6"
          style={{ boxShadow: '6px 6px 0px 0px #000' }}
        >
          <div className="flex items-center gap-3 text-error">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <h1 className="font-extrabold text-xl uppercase tracking-tight">Sign-in Failed</h1>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-4 border-[3px] border-on-surface bg-primary-container text-on-primary-container font-bold uppercase tracking-widest text-sm active:translate-x-[2px] active:translate-y-[2px] transition-all"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-16 h-16 bg-primary-container border-[3px] border-on-surface overflow-hidden"
          style={{ boxShadow: '4px 4px 0px 0px #000' }}
        >
          <img src="/favicon.jpg" alt="Chicago" className="w-full h-full object-cover" />
        </div>
        <div className="w-8 h-8 border-[4px] border-on-surface border-t-primary-container animate-spin" />
        <p className="font-bold uppercase tracking-widest text-sm text-on-surface-variant">
          Signing you in…
        </p>
      </div>
    </div>
  )
}
