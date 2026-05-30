import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'
import { onUnauthorized } from '../services/api'

/**
 * AuthContext — cookie-based auth.
 *
 * On mount we call GET /auth/me to restore session from the HttpOnly cookie.
 * If the access token is expired, api.js auto-calls /auth/refresh and retries.
 * If refresh also fails, onUnauthorized fires and we clear the user.
 *
 * No tokens are ever stored in localStorage.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // true while /auth/me is in-flight on mount

  // ── Restore session on every page load ──────────────────────
  useEffect(() => {
    api.getMe()
      .then(data => {
        // Handle both { id, email, ... } flat and { data: { user: {...} } } wrapped
        const u = data?.data?.user ?? data?.user ?? (data?.id ? data : null)
        setUser(u)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Global 401 handler (refresh exhausted) ──────────────────
  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null)
      // ProtectedRoute will redirect to /login once user is null
    })
  }, [])

  // ── Magic-link login ─────────────────────────────────────────
  const requestMagicLink = useCallback((email) =>
    api.requestMagicLink(email), [])

  const verifyMagicLink = useCallback(async (token) => {
    const data = await api.verifyMagicLink(token)
    const loggedInUser = data?.data?.user ?? data?.user ?? (data?.id ? data : null)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  // ── Logout ───────────────────────────────────────────────────
  // Backend should clear cookies on its side; we just clear local state.
  const logout = useCallback(() => {
    setUser(null)
  }, [])

  // ── Refresh user data (call after profile edits etc.) ────────
  const refreshUser = useCallback(async () => {
    const data = await api.getMe()
    const refreshed = data?.data?.user ?? data?.user ?? (data?.id ? data : null)
    setUser(refreshed)
    return refreshed
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      requestMagicLink,
      verifyMagicLink,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
