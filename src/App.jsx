import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { TopBar, LeftSidebar, BottomNav } from './components/Layout'

// Pages
import Login      from './pages/Login'
import CheckEmail from './pages/CheckEmail'
import Feed       from './pages/Feed'
import Leaderboard from './pages/Leaderboard'
import Staking    from './pages/Staking'
import Marketplace from './pages/Marketplace'
import Profile    from './pages/Profile'
import EditProfile from './pages/EditProfile'
import UserProfile from './pages/UserProfile'

// Admin pages (hidden path — not linked from user-facing UI)
import AdminLogin     from './pages/admin/AdminLogin'
import AdminVerify    from './pages/admin/AdminVerify'
import AdminRegister  from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'

// The admin path is deliberately obscure and not exposed in the UI
const ADMIN_SLUG = '/portal-ax92-v1'

// ── Route guards ─────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: pathname }} replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

// ── App shell — hides nav on auth / admin routes ─────────────
const AUTH_PATHS = ['/login', '/check-email']

function AppShell({ walletConnected, onConnectWallet, children }) {
  const { pathname } = useLocation()
  const isAuthOrAdmin = pathname.startsWith(ADMIN_SLUG) || AUTH_PATHS.includes(pathname)
  if (isAuthOrAdmin) return <>{children}</>
  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-fixed min-h-screen">
      <TopBar walletConnected={walletConnected} onConnectWallet={onConnectWallet} />
      <main className="max-w-container-max mx-auto flex gap-gutter px-4 md:px-20 py-gutter relative min-h-screen pt-24 md:pt-28">
        <LeftSidebar />
        {children}
      </main>
      <BottomNav />
      <button className="lg:hidden fixed bottom-24 right-5 w-10 h-10 bg-primary-container text-on-primary-fixed flex items-center justify-center z-50 active:scale-90 transition-all">
        <span className="material-symbols-outlined text-xl">edit</span>
      </button>
    </div>
  )
}

function AppRoutes() {
  const [walletConnected, setWalletConnected] = useState(false)

  return (
    <AppShell walletConnected={walletConnected} onConnectWallet={() => setWalletConnected(v => !v)}>
      <Routes>
        {/* ── Auth (public) ── */}
        <Route path="/login"       element={<Login />} />
        <Route path="/check-email" element={<CheckEmail />} />

        {/* ── Protected user routes ── */}
        <Route path="/"                element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/leaderboard"     element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/staking"         element={<ProtectedRoute><Staking /></ProtectedRoute>} />
        <Route path="/marketplace"     element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit"    element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* ── Admin routes (hidden — own path, not linked in user UI) ── */}
        <Route path={`${ADMIN_SLUG}`}           element={<AdminLogin />} />
        <Route path={`${ADMIN_SLUG}/verify`}    element={<AdminVerify />} />
        <Route path={`${ADMIN_SLUG}/register`}  element={<AdminRegister />} />
        <Route path={`${ADMIN_SLUG}/dashboard`} element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
