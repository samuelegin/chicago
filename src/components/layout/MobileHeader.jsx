import React from 'react';
import { Link } from 'react-router-dom';
import useWallet from '../../hooks/useWallet';

export default function MobileHeader() {
  const { address, connect, connecting } = useWallet();

  return (
    <header
      className="lg:hidden shrink-0 z-40"
      style={{
        background: 'rgba(5,5,5,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 20px rgba(255,215,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-[64px]">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#ffd700', boxShadow: '0 0 12px rgba(255,215,0,0.4)' }}
          >
            <img src="/logo.jpg" alt="" className="w-full h-full rounded-full object-cover" />
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: '#ffd700', fontFamily: 'Sora, sans-serif' }}
          >
            Chicago Social
          </span>
        </Link>

        <button
          onClick={connect}
          disabled={connecting}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          style={{
            background: '#ffd700',
            color: '#000',
            fontFamily: 'JetBrains Mono, monospace',
            boxShadow: '0 0 12px rgba(255,215,0,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,215,0,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(255,215,0,0.3)'}
        >
          {connecting
            ? 'Connecting...'
            : address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : 'Connect Wallet'
          }
        </button>
      </div>
    </header>
  );
}
