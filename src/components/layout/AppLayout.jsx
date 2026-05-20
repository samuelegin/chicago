import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import MobileHeader from './MobileHeader';

export default function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleShortcuts = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.defaultPrevented) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName) || target.isContentEditable) return;
      }

      const pageShortcuts = {
        '1': '/',
        '2': '/leaderboard',
        '3': '/profile',
        '4': '/staking',
      };

      const destination = pageShortcuts[event.key];
      if (destination) {
        event.preventDefault();
        navigate(destination);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-background" style={{ minHeight: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Desktop left sidebar — fixed in place, never scrolls */}
      <Sidebar />

      {/* Right side: stacks header + scrollable content + bottom nav */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile-only top header */}
        <MobileHeader />

        {/* THE single scroll container — both mobile and desktop */}
        <main className="flex-1 overflow-y-auto">
          <div className="pb-[54px] lg:pb-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile-only bottom nav */}
        <MobileNav />
      </div>
    </div>
  );
}
