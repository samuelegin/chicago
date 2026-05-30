import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createProfile, updateProfile } from '../services/api'

/**
 * OnboardingModal
 * Shown on first login when user has no display name / username set.
 * Collects: display name, username, bio — then calls PATCH /users/me.
 */
export default function OnboardingModal({ onComplete }) {
  const { user, refreshUser, patchUser } = useAuth()

  const [step, setStep] = useState(1) // 1 = name+username, 2 = bio
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [bio, setBio]                 = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  // ── Validation ──────────────────────────────────────────────
  const usernameClean = username.replace(/[^a-z0-9_]/gi, '').toLowerCase()
  const step1Valid = displayName.trim().length >= 2 && usernameClean.length >= 3

  // ── Submit ──────────────────────────────────────────────────
  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const userId = user?.id
      console.log('[Onboarding] user object:', user, '| userId:', userId)
      if (!userId) throw new Error('Could not resolve user ID — please refresh and try again.')
      const payload = {
        fullName: displayName.trim(),
        username: usernameClean,
        bio: bio.trim(),
      }
      try {
        await createProfile(userId, payload)
      } catch (createErr) {
        // 409 = already exists, 422 = validation, 5xx = server error on duplicate key
        // In all cases fall back to update so returning users aren't stuck
        if (createErr.status === 409 || createErr.status >= 500 || createErr.status === 422) {
          await updateProfile(userId, payload)
        } else {
          throw createErr
        }
      }
      // Update auth context user immediately so sidebar shows name/handle without waiting for /auth/me
      patchUser({
        name: displayName.trim(),
        handle: `@${usernameClean}`,
        bio: bio.trim(),
      })
      await refreshUser()
      onComplete()
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="w-full max-w-md bg-surface border-[4px] border-on-surface flex flex-col"
        style={{ boxShadow: '8px 8px 0px 0px #000' }}
      >
        {/* Header */}
        <div className="bg-primary-container border-b-[4px] border-on-surface px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface border-[3px] border-on-surface overflow-hidden shrink-0">
              <img src="/favicon.jpg" alt="Chicago" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-black text-lg uppercase tracking-tight text-on-primary-container leading-none">
                Welcome to Chicago
              </h2>
              <p className="text-xs text-on-primary-container/70 font-medium mt-0.5">
                Set up your profile to get started
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 border border-on-surface transition-all ${
                  s <= step ? 'bg-on-surface' : 'bg-on-surface/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {step === 1 && (
            <>
              {/* Display Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface">
                  Display Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="How you appear to others"
                  maxLength={50}
                  className="w-full px-4 py-3 border-[3px] border-on-surface bg-surface-container text-on-surface font-medium text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-primary-container/20"
                  style={{ boxShadow: '3px 3px 0px 0px #000' }}
                  autoFocus
                />
                <span className="text-xs text-on-surface-variant text-right">{displayName.length}/50</span>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-on-surface">
                  Username <span className="text-error">*</span>
                </label>
                <div
                  className="flex items-center border-[3px] border-on-surface bg-surface-container"
                  style={{ boxShadow: '3px 3px 0px 0px #000' }}
                >
                  <span className="px-3 py-3 text-on-surface-variant font-bold text-sm border-r-[2px] border-on-surface/30">@</span>
                  <input
                    type="text"
                    value={usernameClean}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="yourhandle"
                    maxLength={30}
                    className="flex-1 px-3 py-3 bg-transparent text-on-surface font-medium text-sm placeholder:text-on-surface-variant/50 focus:outline-none"
                  />
                </div>
                <span className="text-xs text-on-surface-variant">
                  Only letters, numbers and underscores. Min 3 characters.
                </span>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface">
                Bio <span className="text-on-surface-variant font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell the Chicago community a little about yourself…"
                maxLength={160}
                rows={4}
                className="w-full px-4 py-3 border-[3px] border-on-surface bg-surface-container text-on-surface font-medium text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-primary-container/20 resize-none"
                style={{ boxShadow: '3px 3px 0px 0px #000' }}
                autoFocus
              />
              <span className="text-xs text-on-surface-variant text-right">{bio.length}/160</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-error/10 border-[2px] border-error text-error text-sm font-medium">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 border-[3px] border-on-surface bg-surface-container text-on-surface font-bold uppercase tracking-widest text-sm active:translate-x-[2px] active:translate-y-[2px] transition-all"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              Back
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="flex-1 py-3.5 border-[3px] border-on-surface bg-primary-container text-on-primary-container font-bold uppercase tracking-widest text-sm disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] transition-all"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              Continue
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3.5 border-[3px] border-on-surface bg-primary-container text-on-primary-container font-bold uppercase tracking-widest text-sm disabled:opacity-60 active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Let's Go
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
