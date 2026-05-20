import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Newspaper, BarChart2, CircleUserRound, Layers, PenLine } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { path: '/',              icon: Newspaper,       label: 'Feed'       },
  { path: '/leaderboard',   icon: BarChart2,       label: 'Leaderboard' },
  { path: '/profile',       icon: CircleUserRound, label: 'Profile'    },
  { path: '/staking',       icon: Layers,          label: 'Staking'    },
  { path: '/?compose=true', icon: PenLine,         label: 'Compose'    },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pointerStart = useRef(null);

  const selectedIndex = NAV.findIndex(
    ({ path }) => pathname === path || (path !== '/' && path !== '/?compose=true' && pathname.startsWith(path))
  );
  const currentIndex = selectedIndex < 0 ? 0 : selectedIndex;

  const handlePointerDown = (event) => {
    pointerStart.current = event.clientX;
  };

  const handlePointerUp = (event) => {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    const threshold = 50;

    if (delta < -threshold && currentIndex < NAV.length - 1) {
      navigate(NAV[currentIndex + 1].path);
    } else if (delta > threshold && currentIndex > 0) {
      navigate(NAV[currentIndex - 1].path);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border" aria-label="Mobile tab navigation">
      <div
        className="flex items-center justify-around h-[82px] px-2 max-w-full"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== '/' && path !== '/?compose=true' && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              aria-label={`Navigate to ${label}`}
              title={label}
              className="relative flex flex-col items-center justify-center w-16 text-[10px] text-neutral-500"
            >
              <Icon
                strokeWidth={active ? 2.5 : 1.8}
                className={`w-[22px] h-[22px] transition-colors ${active ? 'text-amber-500' : 'text-neutral-400'}`}
              />
              <span className={`mt-1 transition-colors ${active ? 'text-amber-500 font-semibold' : 'text-neutral-500'}`}>
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className="absolute bottom-2 w-1 h-1 rounded-full bg-amber-500"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
