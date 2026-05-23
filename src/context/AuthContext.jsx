import { createContext, useContext, useState, useCallback } from 'react'
import * as api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chicago_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  // Sends a magic-link email via the real backend
  const requestMagicLink = useCallback(async (email) => {
    return api.requestMagicLink(email)
  }, [])

  // Called after the user clicks their magic-link and lands on /auth/verify?token=…
  const verifyMagicLink = useCallback(async (token) => {
    const session = await api.verifyMagicLink(token)
    localStorage.setItem('chicago_user', JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('chicago_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, requestMagicLink, verifyMagicLink, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
