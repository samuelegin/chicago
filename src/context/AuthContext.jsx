import { createContext, useContext, useState, useCallback } from 'react'
import { mockUsers } from '../data/mockData'

const AuthContext = createContext(null)

// ── Magic Link simulation ────────────────────────────────────
// Replace this single function with your real sendMagicLink(email) call.
// It should POST to your backend and return a Promise.
// The demo bypass in CheckEmail.jsx will vanish automatically once
// the backend redirects to /auth/verify?token=<real-token>.
async function sendMagicLink(email) {
  // TODO: replace with → return fetch('/api/auth/magic-link', { method:'POST', body: JSON.stringify({email}) })
  await new Promise(r => setTimeout(r, 1200))  // simulate network latency
  return { ok: true }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chicago_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  // Called by Login.jsx after email is submitted
  const requestMagicLink = useCallback(async (email) => {
    return sendMagicLink(email)
  }, [])

  // Demo bypass: auto-authenticate from CheckEmail screen
  const demoVerify = useCallback(async (email) => {
    await new Promise(r => setTimeout(r, 600))
    const match = mockUsers.find(u => u.email === email) || mockUsers[0]
    const session = {
      id: match.id,
      email: email || match.email,
      role: 'user',
      name: match.name,
      handle: match.handle,
      avatar: match.avatar || null,
    }
    localStorage.setItem('chicago_user', JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('chicago_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, requestMagicLink, demoVerify, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
