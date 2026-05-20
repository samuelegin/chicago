import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Newspaper,        // Feed — feels editorial, not generic
  BarChart2,        // Leaderboard — rankings/data
  Layers,           // Staking — stacked layers = locked value
  Megaphone,        // Marketplace — ads/campaigns
  PenLine,          // Create — writing/authoring
  CircleUserRound,  // Profile — identity
} from 'lucide-react';

const NAV = [
  { path: '/',              icon: Newspaper,          label: 'Feed'        },
  { path: '/leaderboard',   icon: BarChart2,          label: 'Leaderboard' },
  { path: '/staking',       icon: Layers,             label: 'Staking'     },
  { path: '/ads',           icon: Megaphone,          label: 'Marketplace' },
  { path: '/?compose=true', icon: PenLine,            label: 'Create'      },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    if (path.startsWith('/?')) return false;
    return pathname.startsWith(path);
  };

  const profileActive = pathname === '/profile' || pathname.startsWith('/profile/');

  return (
    <aside className="hidden lg:flex flex-col w-[244px] shrink-0 h-screen border-r border-border bg-white px-3 py-5">
      {/* Wordmark */}
      <Link to="/" className="px-3 py-3 mb-2 flex items-center gap-2">
        <img src="/logo.jpg" alt="Chicago logo" className="w-8 h-8 rounded-full object-cover shrink-0" />
        <span className="text-[22px] font-bold tracking-tight text-foreground" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Chicago
        </span>
      </Link>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'font-semibold text-foreground bg-neutral-100'
                  : 'font-normal text-foreground hover:bg-neutral-100'
              }`}
            >
              <Icon strokeWidth={active ? 2.5 : 1.8} className="w-[22px] h-[22px] shrink-0" />
              <span className="text-[15px] leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile pinned at bottom */}
      <Link
        to="/profile"
        className={`flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors mt-1 ${
          profileActive
            ? 'font-semibold text-foreground bg-neutral-100'
            : 'font-normal text-foreground hover:bg-neutral-100'
        }`}
      >
        <CircleUserRound strokeWidth={profileActive ? 2.5 : 1.8} className="w-[22px] h-[22px] shrink-0" />
        <span className="text-[15px] leading-none">Profile</span>
      </Link>
    </aside>
  );
}
