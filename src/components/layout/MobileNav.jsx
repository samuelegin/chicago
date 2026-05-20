import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Newspaper, BarChart2, CircleUserRound, Layers, PenLine } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { path: '/',              icon: Newspaper       },
  { path: '/leaderboard',   icon: BarChart2       },
  { path: '/profile',       icon: CircleUserRound },
  { path: '/staking',       icon: Layers          },
  { path: '/?compose=true', icon: PenLine         },
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
    <nav className="lg:hidden shrink-0 bg-white border-t border-border z-50" aria-label="Mobile tab navigation">
      <div
        className="flex items-center justify-around h-[70px] px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {NAV.map(({ path, icon: Icon }) => {
          const active = pathname === path || (path !== '/' && path !== '/?compose=true' && pathname.startsWith(path));
          const label = path === '/' ? 'Feed' : path.includes('compose') ? 'Compose' : path.replace('/', '');
          return (
            <Link
              key={path}
              to={path}
              aria-label={`Navigate to ${label}`}
              title={label}
              className="relative flex flex-col items-center justify-center w-12 h-12"
            >
              <Icon
                strokeWidth={active ? 2.5 : 1.8}
                className={`w-[22px] h-[22px] transition-colors ${active ? 'text-amber-500' : 'text-neutral-400'}`}
              />
              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className="absolute bottom-1.5 w-1 h-1 rounded-full bg-amber-500"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
