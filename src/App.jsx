import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { TopBar, LeftSidebar, BottomNav } from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Leaderboard from './pages/Leaderboard'
import Staking from './pages/Staking'
import Marketplace from './pages/Marketplace'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import UserProfile from './pages/UserProfile'

// ── Admin pages (secret slug: /portal-ax92-v1) ───────────────
// ⚠️  Never link to these paths from any public-facing page.
// ⚠️  Change the slug to something unique before deploying.
import AdminLogin    from './pages/admin/AdminLogin'
import AdminVerify   from './pages/admin/AdminVerify'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'

const ADMIN_SLUG = '/portal-ax92-v1'

// ── Wrapper: hides app shell on admin routes ─────────────────
function AppShell({ walletConnected, onConnectWallet, children }) {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith(ADMIN_SLUG) || pathname === '/login' || pathname === '/register'
  if (isAdmin) return <>{children}</>
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

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false)
  const handleConnectWallet = () => setWalletConnected(v => !v)

  return (
    <BrowserRouter>
      <AppShell walletConnected={walletConnected} onConnectWallet={handleConnectWallet}>
        <Routes>
          {/* ── Auth routes (no app shell) ── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />

          {/* ── Public app routes ── */}
          <Route path="/"                element={<Feed />} />
          <Route path="/leaderboard"     element={<Leaderboard />} />
          <Route path="/staking"         element={<Staking />} />
          <Route path="/marketplace"     element={<Marketplace />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/profile/edit"    element={<EditProfile />} />
          <Route path="/profile/:userId" element={<UserProfile />} />

          {/* ── Admin routes (secret slug, no nav chrome) ──
               Phase 3: Login  → /portal-ax92-v1
               Phase 3: 2FA    → /portal-ax92-v1/verify
               Phase 2: Invite → /portal-ax92-v1/register?token=TOKEN
               Phase 4: Dash   → /portal-ax92-v1/dashboard
               Change ADMIN_SLUG before deploying!           */}
          <Route path={`${ADMIN_SLUG}`}             element={<AdminLogin />} />
          <Route path={`${ADMIN_SLUG}/verify`}      element={<AdminVerify />} />
          <Route path={`${ADMIN_SLUG}/register`}    element={<AdminRegister />} />
          <Route path={`${ADMIN_SLUG}/dashboard`}   element={<AdminDashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
