import { NavLink } from 'react-router-dom'
import { navLinks, footerLinks } from '../data/mockData'

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
export function TopBar({ walletConnected, onConnectWallet }) {
  return (
    <header className="w-full top-0 fixed z-50 flex justify-between items-center px-4 md:px-20 py-4 bg-background border-b-4 border-on-background">
      <div className="flex items-center gap-3">
        <img src="/favicon.jpg" alt="Chicago" className="w-8 h-8 object-cover rounded-full border-2 border-primary-container" />
        <span style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-[2rem] md:text-[2.8rem] text-primary-container tracking-widest leading-none">
          Chicago
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark mode toggle — UI only, not yet implemented */}
        <button
          title="Dark mode (coming soon)"
          className="flex items-center justify-center w-9 h-9 border border-on-background/20 lg:neo-border bg-surface-container text-on-surface-variant hover:bg-primary-container/10 hover:text-primary-container transition-all active:scale-95"
          onClick={() => {}}
        >
          <Icon name="dark_mode" className="text-[20px]" />
        </button>

        {/* Connect Wallet — visible on ALL screen sizes */}
        <button
          onClick={onConnectWallet}
          className="flex items-center gap-2 px-3 md:px-6 py-2 bg-primary-container text-on-primary-fixed font-bold border border-on-background/20 lg:neo-border lg:neo-shadow-sm active:scale-95 transition-all text-sm md:text-base"
        >
          <Icon name="account_balance_wallet" />
          <span className="hidden sm:inline">{walletConnected ? 'Connected' : 'Connect Wallet'}</span>
          <span className="sm:hidden">{walletConnected ? '✓' : 'Wallet'}</span>
        </button>
      </div>
    </header>
  )
}

// ─── Left Sidebar ────────────────────────────────────────────
export function LeftSidebar() {
  return (
    <aside className="fixed left-[max(0px,calc(50%-640px))] top-32 h-[calc(100vh-140px)] w-[280px] hidden lg:flex flex-col gap-6 p-6 overflow-y-auto bg-surface-container border-r-4 border-on-background">
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-4 p-4 bg-primary-container text-on-primary-fixed border-2 border-on-background font-bold transition-transform'
                : 'flex items-center gap-4 p-4 text-on-background hover:bg-primary-container/10 border-2 border-transparent hover:border-on-background transition-all'
            }
          >
            <Icon name={link.icon} />
            <span className="font-headline-md text-headline-md">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

// ─── Bottom Nav (mobile) ─────────────────────────────────────
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full lg:hidden z-50 flex justify-around items-center h-20 px-4 bg-background border-t-4 border-on-background shadow-[0px_-4px_0px_0px_rgba(212,175,55,0.6)]">
      {navLinks.map((link) => (
        <NavLink
          key={link.id}
          to={link.path}
          end={link.path === '/'}
          className={({ isActive }) =>
            isActive
              ? 'flex flex-col items-center justify-center bg-primary-container text-on-primary-fixed border-2 border-on-background p-2 transition-transform active:scale-90 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'flex flex-col items-center justify-center text-on-background p-2 hover:bg-primary-container/10 transition-transform active:scale-90'
          }
        >
          <Icon name={link.icon} />
          <span className="text-[10px] font-bold">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// ─── Right Sidebar ────────────────────────────────────────────
export function RightSidebar({ suggestedUsers, trendingTopics, onFollow }) {
  return (
    <aside className="fixed right-[max(0px,calc(50%-640px))] top-32 w-[320px] hidden lg:flex flex-col gap-6 h-[calc(100vh-140px)] overflow-y-auto pr-2">
      {/* Who to Follow */}
      <section className="bg-surface-container neo-border p-6 shadow-[4px_4px_0px_0px_rgba(212,175,55,1)]">
        <h2 className="font-headline-md text-headline-md mb-6 uppercase tracking-widest border-b-2 border-on-background pb-2 text-on-background">
          Who to Follow
        </h2>
        <div className="flex flex-col gap-6">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 neo-border object-cover" />
                <div>
                  <p className="font-bold text-on-background text-sm">{user.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">{user.handle}</p>
                </div>
              </div>
              <button
                onClick={() => onFollow(user.id)}
                className="px-4 py-1 bg-white text-black font-bold neo-border neo-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-xs"
              >
                {user.following ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="bg-surface-container neo-border p-6 shadow-[4px_4px_0px_0px_rgba(212,175,55,0.3)]">
        <h2 className="font-headline-md text-headline-md mb-6 uppercase tracking-widest border-b-2 border-on-background pb-2 text-on-background">
          Trending
        </h2>
        <div className="flex flex-col gap-4">
          {trendingTopics.map((topic) => (
            <a key={topic.id} className="group" href="#">
              <p className="text-[12px] text-primary-container font-mono mb-1">{topic.hashtag}</p>
              <p className="font-bold text-on-background text-sm group-hover:underline">{topic.title}</p>
              <p className="text-[10px] text-on-surface-variant font-mono">{topic.postCount} Posts</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="mt-4 px-2 flex flex-wrap gap-x-4 gap-y-1 opacity-50 text-[10px] uppercase font-bold tracking-widest text-on-background">
        {footerLinks.map((l) => (
          <a key={l} href="#">{l}</a>
        ))}
        <span>© 2024 Chicago Web3</span>
      </footer>
    </aside>
  )
}
