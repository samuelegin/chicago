import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Newspaper, BarChart2, CircleUserRound, Layers, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { path: '/',            icon: Newspaper,       label: 'Feed'        },
  { path: '/leaderboard', icon: BarChart2,        label: 'Leaderboard' },
  { path: '/profile',     icon: CircleUserRound,  label: 'Profile'     },
  { path: '/staking',     icon: Layers,           label: 'Staking'     },
  { path: '/ads',         icon: Megaphone,        label: 'Market'      },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pointerStart = useRef(null);

  const selectedIndex = NAV.findIndex(
    ({ path }) => pathname === path || (path !== '/' && pathname.startsWith(path))
  );
  const currentIndex = selectedIndex < 0 ? 0 : selectedIndex;

  const handlePointerDown = (e) => { pointerStart.current = e.clientX; };
  const handlePointerUp = (e) => {
    if (pointerStart.current === null) return;
    const delta = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (delta < -50 && currentIndex < NAV.length - 1) navigate(NAV[currentIndex + 1].path);
    else if (delta > 50 && currentIndex > 0) navigate(NAV[currentIndex - 1].path);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
      style={{
        background: 'rgba(5,5,5,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 -10px 40px rgba(0,238,252,0.06)',
      }}
      aria-label="Mobile tab navigation"
    >
      <div
        className="flex items-center justify-around h-[72px] px-2 max-w-full"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className="relative flex flex-col items-center justify-center w-14 gap-1 active:scale-90 transition-transform duration-200"
            >
              <Icon
                strokeWidth={active ? 2.5 : 1.6}
                className="w-[22px] h-[22px] transition-all"
                style={{
                  color: active ? '#00eefc' : 'rgba(208,198,171,0.45)',
                  filter: active ? 'drop-shadow(0 0 8px rgba(0,238,252,0.5))' : 'none',
                }}
              />
              <span
                className="text-[10px] font-bold transition-all"
                style={{
                  color: active ? '#00eefc' : 'rgba(208,198,171,0.4)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className="absolute -bottom-0.5 w-6 h-0.5 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #00eefc, transparent)',
                    boxShadow: '0 0 8px rgba(0,238,252,0.6)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
