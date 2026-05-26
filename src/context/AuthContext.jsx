import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../services/index'
import { onUnauthorized } from '../services/index'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    try {
      // In mock mode, auto-login with mock user so founder sees the full app immediately
      if (USE_MOCK) {
        const stored = localStorage.getItem('chicago_user')
        if (stored) return JSON.parse(stored)
        // Auto-seed mock session
        const mockSession = {
          id: 'u_001',
          name: 'Jordan Neo',
          handle: '@jordan_neo.eth',
          email: 'user@chicago.io',
          role: 'user',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG8rIH4Dxn2mNYlShmTd6eVt8zq_1mPZy00yVqedHW548TBXBtirL-qRN8CvBR85cOt5CCx7z1CCKVTZ-WQ0JSslAn-29TrVvHrC18PLRLQdUa2VBoyu7j0S9lzk3VhYPQI-CmGUrRHbhDoCmFM9EM99s-lWavGg1B962TVZTtxIj6D3VMuMUZxHlEYovyLerMC4a3gvfOwSXq3rZHZGzTxUsrhKOPFk1-vh2CH7qb6v-6Iv0s6NfYl_d8qEroRvJmmFtav3xt41B4',
          token: 'mock_token_auto',
        }
        localStorage.setItem('chicago_user', JSON.stringify(mockSession))
        return mockSession
      }
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
    if (USE_MOCK) {
      // In mock mode: skip the email flow, auto-login and redirect to feed
      const mockSession = {
        id: 'u_001',
        name: 'Jordan Neo',
        handle: '@jordan_neo.eth',
        email,
        role: 'user',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG8rIH4Dxn2mNYlShmTd6eVt8zq_1mPZy00yVqedHW548TBXBtirL-qRN8CvBR85cOt5CCx7z1CCKVTZ-WQ0JSslAn-29TrVvHrC18PLRLQdUa2VBoyu7j0S9lzk3VhYPQI-CmGUrRHbhDoCmFM9EM99s-lWavGg1B962TVZTtxIj6D3VMuMUZxHlEYovyLerMC4a3gvfOwSXq3rZHZGzTxUsrhKOPFk1-vh2CH7qb6v-6Iv0s6NfYl_d8qEroRvJmmFtav3xt41B4',
        token: 'mock_token_' + Date.now(),
      }
      localStorage.setItem('chicago_user', JSON.stringify(mockSession))
      setUser(mockSession)
      navigate('/')
      return { success: true }
    }
    return api.requestMagicLink(email)
  }, [navigate])

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
