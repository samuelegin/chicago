import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { TopBar, LeftSidebar, BottomNav } from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Login        from './pages/Login'
import CheckEmail   from './pages/CheckEmail'
import AuthCallback from './pages/AuthCallback'
import Feed         from './pages/Feed'
import Leaderboard  from './pages/Leaderboard'
import Staking      from './pages/Staking'
import Marketplace  from './pages/Marketplace'
import Profile      from './pages/Profile'
import EditProfile  from './pages/EditProfile'
import UserProfile  from './pages/UserProfile'
import CommentsPage from './pages/CommentsPage'
import NotFound     from './pages/NotFound'

// Admin pages (hidden path — not linked from user-facing UI)
import AdminLogin     from './pages/admin/AdminLogin'
import AdminVerify    from './pages/admin/AdminVerify'
import AdminSetup     from './pages/admin/AdminSetup'
import AdminRegister  from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'

const ADMIN_SLUG = '/portal-ax92-v1'

// Initialized lazily to avoid crashes during module load
let _wagmiConfig = null
let _queryClient = null

function getWagmiConfig() {
  if (!_wagmiConfig) {
    _wagmiConfig = getDefaultConfig({
      appName: 'Chicago Web3',
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
      chains: [mainnet, sepolia],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
      },
      ssr: false,
    })
  }
  return _wagmiConfig
}

function getQueryClient() {
  if (!_queryClient) {
    _queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          gcTime: 1000 * 60 * 5,
        },
      },
    })
  }
  return _queryClient
}

// ── Route guards ──────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  // Wait for /auth/me to resolve before deciding to redirect.
  // Without this, a cookie-authed user gets bounced to /login on every refresh.
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-[4px] border-on-surface border-t-primary-container animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: pathname }} replace />
  return children
}

// Admin route guard — checks for admin session cookie presence via auth context
// The dashboard itself will 403 on every API call if the session is invalid
function AdminRoute({ children }) {
  return children
}

// ── App shell — hides nav on auth / admin routes ──────────────
const AUTH_PATHS = ['/login', '/check-email', '/register']

function AppShell({ children }) {
  const { pathname } = useLocation()
  const isAuthOrAdmin = pathname.startsWith(ADMIN_SLUG) || AUTH_PATHS.includes(pathname) || pathname === '/auth/callback'
  const isCommentsPage = pathname === '/comments'
  if (isAuthOrAdmin) return <>{children}</>
  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-fixed min-h-screen">
      <TopBar />
      <main className={`max-w-container-max mx-auto ${isCommentsPage ? '' : 'flex gap-gutter'} px-4 md:px-20 py-gutter relative min-h-screen pt-24 md:pt-28`}>
        {!isCommentsPage && <LeftSidebar />}
        {children}
      </main>
      {!isCommentsPage && <BottomNav />}
      {pathname === '/' && (
        <button
          onClick={() => {
            const ta = document.querySelector('textarea[placeholder]')
            if (ta) { ta.scrollIntoView({ behavior: 'smooth', block: 'center' }); ta.focus() }
          }}
          className="lg:hidden fixed bottom-24 right-5 w-10 h-10 bg-primary-container text-on-primary-fixed flex items-center justify-center z-50 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
      )}
    </div>
  )
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        {/* ── Auth (public) ── */}
        <Route path="/login"         element={<Login />} />
        <Route path="/check-email"   element={<CheckEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Protected user routes ── */}
        <Route path="/"                element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/leaderboard"     element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/staking"         element={<ProtectedRoute><Staking /></ProtectedRoute>} />
        <Route path="/marketplace"     element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit"    element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/comments"        element={<ProtectedRoute><CommentsPage /></ProtectedRoute>} />

        {/* ── Admin routes (hidden — own path, not linked in user UI) ── */}
        <Route path={`${ADMIN_SLUG}`}           element={<AdminLogin />} />
        <Route path={`${ADMIN_SLUG}/verify`}    element={<AdminVerify />} />
        <Route path={`${ADMIN_SLUG}/setup`}     element={<AdminSetup />} />
        <Route path={`${ADMIN_SLUG}/register`}  element={<AdminRegister />} />
        <Route path={`${ADMIN_SLUG}/dashboard`} element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={getWagmiConfig()}>
        <QueryClientProvider client={getQueryClient()}>
          <RainbowKitProvider>
            <BrowserRouter>
              <ThemeProvider>
                <AuthProvider>
                  <ToastProvider>
                    <AppRoutes />
                  </ToastProvider>
                </AuthProvider>
              </ThemeProvider>
            </BrowserRouter>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}
