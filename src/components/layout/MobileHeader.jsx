import React from 'react';
import { Link } from 'react-router-dom';
import useWallet from '../../hooks/useWallet';
import { Button } from '../ui/button';

export default function MobileHeader() {
  const { address, connect, connecting } = useWallet();

  const handleConnect = async () => {
    await connect();
  };

  return (
    <header className="lg:hidden shrink-0 bg-card border-b border-border z-40">
      <div className="flex items-center justify-between px-4 h-[70px]">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Chicago logo" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <span className="text-[22px] font-bold" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Chicago
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleConnect}
            disabled={connecting}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {connecting ? 'Connecting...' : address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </header>
  );
}
