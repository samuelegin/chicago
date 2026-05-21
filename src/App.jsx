import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopBar, LeftSidebar, BottomNav } from './components/Layout'
import Feed from './pages/Feed'
import Leaderboard from './pages/Leaderboard'
import Staking from './pages/Staking'
import Marketplace from './pages/Marketplace'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import UserProfile from './pages/UserProfile'

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false)

  const handleConnectWallet = () => {
    // BACKEND: await api.connectWallet(address)  ← triggered after wallet provider handshake
    setWalletConnected((v) => !v)
  }

  return (
    <BrowserRouter>
      <div className="bg-background text-on-background font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-fixed min-h-screen">
        <TopBar walletConnected={walletConnected} onConnectWallet={handleConnectWallet} />
        <main className="max-w-container-max mx-auto flex gap-gutter px-4 md:px-20 py-gutter relative min-h-screen pt-24 md:pt-28">
          <LeftSidebar />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
          </Routes>
        </main>
        <BottomNav />
        {/* Mobile FAB */}
        <button className="lg:hidden fixed bottom-24 right-5 w-10 h-10 bg-primary-container text-on-primary-fixed flex items-center justify-center z-50 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
      </div>
    </BrowserRouter>
  )
}
