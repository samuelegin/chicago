import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import { onUnauthorized } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chicago_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const logout = useCallback(() => {
    localStorage.removeItem('chicago_user')
    setUser(null)
  }, [])

  // Global 401 handler — any API call that gets a 401 clears the session
  useEffect(() => {
    const unsub = onUnauthorized(() => {
      logout()
      // Let the ProtectedRoute redirect handle navigation
    })
    return unsub
  }, [logout])

  const requestMagicLink = useCallback(async (email) => {
    return api.requestMagicLink(email)
  }, [])

  const verifyMagicLink = useCallback(async (token) => {
    const session = await api.verifyMagicLink(token)
    localStorage.setItem('chicago_user', JSON.stringify(session))
    setUser(session)
    return session
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
