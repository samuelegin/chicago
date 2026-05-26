import { NavLink, useNavigate } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { id: 'home',        label: 'Home',        icon: 'home',            path: '/' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard',     path: '/leaderboard' },
  { id: 'staking',     label: 'Staking',     icon: 'account_balance', path: '/staking' },
  { id: 'marketplace', label: 'Marketplace', icon: 'storefront',      path: '/marketplace' },
  { id: 'profile',     label: 'Profile',     icon: 'person',          path: '/profile' },
]

const footerLinks = ['Privacy', 'Terms', 'Ads', 'Cookies']

// ─── Icon ────────────────────────────────────────────────────
export function Icon({ name, className = '', filled = false }) {
  const fill = filled ? "'FILL' 1" : "'FILL' 0"
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    >
      {name}
    </span>
  )
}

// ─── TopBar ──────────────────────────────────────────────────
export function TopBar() {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="w-full top-0 fixed z-50 flex justify-between items-center px-4 md:px-20 py-0 bg-background border-b-[4px] border-on-background h-[72px]">

      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 bg-primary-container border-[3px] border-on-surface overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '3px 3px 0px 0px #000' }}
        >
          <img src="/favicon.jpg" alt="Chicago logo" className="w-full h-full object-cover" />
        </div>
        <span
          className="font-extrabold text-[22px] md:text-[26px] uppercase tracking-tight leading-none text-on-surface"
          style={{ letterSpacing: '-0.02em' }}
        >
          Chicago
        </span>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Theme toggle — desktop only */}
        <button
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggle}
          className="hidden lg:flex items-center justify-center w-10 h-10 border-[3px] border-on-surface bg-surface-container text-on-surface-variant hover:bg-primary-container/10 hover:text-primary-container transition-all"
          style={{ boxShadow: '2px 2px 0px 0px var(--neo-shadow-color)' }}
        >
          <Icon name={dark ? 'light_mode' : 'dark_mode'} className="text-[20px]" />
        </button>

        {/* Connect Wallet — always visible */}
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
            const connected = mounted && account
            return (
              <button
                type="button"
                onClick={connected ? openAccountModal : openConnectModal}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-surface text-on-surface font-bold border-[3px] border-on-surface hover:bg-primary-container/10 transition-all text-sm"
                style={{ boxShadow: '3px 3px 0px 0px var(--neo-shadow-color)' }}
              >
                <Icon name="account_balance_wallet" className="text-[18px]" />
                <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider">
                  {connected ? 'Connected' : 'Connect Wallet'}
                </span>
              </button>
            )
          }}
        </ConnectButton.Custom>

        {/* User avatar + logout — desktop only */}
        {user && (
          <div className="hidden lg:flex items-center gap-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 object-cover border-[3px] border-on-surface cursor-pointer hover:border-primary-container transition-colors"
                style={{ boxShadow: '2px 2px 0px 0px var(--neo-shadow-color)' }}
                onClick={() => navigate('/profile')}
                title={user.name}
              />
            ) : (
              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 bg-surface-container border-[3px] border-on-surface flex items-center justify-center hover:bg-primary-container/10 transition-all"
                style={{ boxShadow: '2px 2px 0px 0px var(--neo-shadow-color)' }}
              >
                <Icon name="person" className="text-[20px]" />
              </button>
            )}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center justify-center w-10 h-10 border-[3px] border-on-surface bg-surface-container text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all"
              style={{ boxShadow: '2px 2px 0px 0px var(--neo-shadow-color)' }}
            >
              <Icon name="logout" className="text-[18px]" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// ─── Left Sidebar ────────────────────────────────────────────
export function LeftSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-[max(0px,calc(50%-640px))] top-[88px] h-[calc(100vh-100px)] w-[260px] hidden lg:flex flex-col gap-4 overflow-y-auto">

      {/* Nav links */}
      <nav className="flex flex-col gap-1 border-[4px] border-on-background bg-surface"
        style={{ boxShadow: '4px 4px 0px 0px var(--neo-shadow-color)' }}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-5 py-4 bg-primary-container text-on-primary-container border-b-[3px] border-on-background font-bold transition-all'
                : 'flex items-center gap-3 px-5 py-4 text-on-surface hover:bg-primary-container/10 border-b-[3px] border-on-background/20 hover:border-on-background transition-all'
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={link.icon} className="text-[22px]" filled={isActive} />
                <span className="font-bold text-[14px] uppercase tracking-wider">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      {user && (
        <div
          className="border-[4px] border-on-background bg-surface p-4 flex items-center gap-3"
          style={{ boxShadow: '4px 4px 0px 0px rgba(212,175,55,1)' }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 object-cover border-[3px] border-on-surface flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-surface-container border-[3px] border-on-surface flex items-center justify-center flex-shrink-0">
              <Icon name="person" className="text-[18px]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px] uppercase tracking-wide text-on-surface truncate">{user.name}</p>
            <p className="text-[11px] text-on-surface-variant truncate font-mono">{user.handle}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all border-[2px] border-transparent hover:border-error/30"
          >
            <Icon name="logout" className="text-[16px]" />
          </button>
        </div>
      )}
    </aside>
  )
}

// ─── Bottom Nav (mobile) ─────────────────────────────────────
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full lg:hidden z-50 flex justify-around items-center h-[64px] px-2 bg-background border-t-[4px] border-on-background"
      style={{ boxShadow: '0px -4px 0px 0px rgba(212,175,55,0.4)' }}
    >
      {navLinks.map((link) => (
        <NavLink
          key={link.id}
          to={link.path}
          end={link.path === '/'}
          className={({ isActive }) =>
            isActive
              ? 'flex flex-col items-center justify-center gap-1 px-3 py-2 bg-primary-container text-on-primary-container border-[2px] border-on-background min-w-[56px]'
              : 'flex flex-col items-center justify-center gap-1 px-3 py-2 text-on-surface-variant hover:text-on-surface min-w-[56px] transition-colors'
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={link.icon} className="text-[22px]" filled={isActive} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{link.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

// ─── Right Sidebar ────────────────────────────────────────────
export function RightSidebar({ suggestedUsers, trendingTopics, onFollow }) {
  return (
    <aside className="fixed right-[max(0px,calc(50%-640px))] top-[88px] w-[300px] hidden lg:flex flex-col gap-4 h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">

      {/* Who to Follow */}
      <section
        className="bg-surface border-[4px] border-on-background p-5"
        style={{ boxShadow: '4px 4px 0px 0px rgba(212,175,55,1)' }}
      >
        <h2 className="font-bold text-[11px] uppercase tracking-[0.14em] mb-5 pb-3 border-b-[3px] border-on-background text-on-surface">
          Who to Follow
        </h2>
        <div className="flex flex-col gap-4">
          {suggestedUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-9 h-9 border-[3px] border-on-surface object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-on-surface text-[13px] truncate">{u.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-mono truncate">{u.handle}</p>
                </div>
              </div>
              <button
                onClick={() => onFollow(u.id)}
                className={`px-3 py-1.5 font-bold border-[2px] border-on-surface text-[11px] uppercase tracking-wider flex-shrink-0 transition-all hover:translate-x-[1px] hover:translate-y-[1px]
                  ${u.following
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface text-on-surface hover:bg-surface-container'
                  }`}
                style={{ boxShadow: '2px 2px 0px 0px #000' }}
              >
                {u.following ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section
        className="bg-surface border-[4px] border-on-background p-5"
        style={{ boxShadow: '4px 4px 0px 0px var(--neo-shadow-color)' }}
      >
        <h2 className="font-bold text-[11px] uppercase tracking-[0.14em] mb-5 pb-3 border-b-[3px] border-on-background text-on-surface">
          Trending
        </h2>
        <div className="flex flex-col gap-4">
          {trendingTopics.map((topic) => (
            <a key={topic.id} className="group block" href="#">
              <p className="text-[11px] text-primary font-bold font-mono mb-0.5">{topic.hashtag}</p>
              <p className="font-bold text-on-surface text-[13px] group-hover:underline decoration-2 underline-offset-2">{topic.title}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">{topic.postCount} Posts</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="px-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50">
        {footerLinks.map((l) => (
          <a key={l} href="#" className="hover:text-primary transition-colors">{l}</a>
        ))}
        <span>© 2025 Chicago</span>
      </footer>
    </aside>
  )
}
