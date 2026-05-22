import { createContext, useContext, useState, useCallback } from 'react'
import { mockUsers, mockAdmins } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('chicago_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback(async (email, password, isAdmin = false) => {
    await new Promise(r => setTimeout(r, 1000))
    const pool = isAdmin ? mockAdmins : mockUsers
    const match = pool.find(u => u.email === email && u.password === password)
    if (!match) throw new Error('Invalid email or password.')
    const session = { id: match.id, email: match.email, role: match.role, name: match.name, handle: match.handle, avatar: match.avatar || null }
    localStorage.setItem('chicago_user', JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('chicago_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
