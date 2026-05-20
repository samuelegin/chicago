import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="flex items-center gap-3 px-5 h-[54px] max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft strokeWidth={1.8} className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex items-center gap-2">
            <SlidersHorizontal strokeWidth={1.8} className="w-4 h-4 text-neutral-500" />
            <span className="text-[15px] font-semibold text-foreground">Admin</span>
          </div>

          <div className="ml-auto">
            <Link
              to="/"
              className="flex items-center gap-2"
            >
              <img src="/logo.jpg" alt="Chicago logo" className="w-7 h-7 rounded-full object-cover" />
              <span className="text-[15px] font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                Chicago
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
