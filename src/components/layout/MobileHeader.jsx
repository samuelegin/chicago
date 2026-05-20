import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useWallet from '../../hooks/useWallet';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

export default function MobileHeader() {
  const { address, connect, connecting } = useWallet();
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === 'accepted') {
      console.log('PWA install accepted');
    }
  };

  const handleConnect = async () => {
    await connect();
  };

  return (
    <header className="lg:hidden shrink-0 bg-white border-b border-border z-40">
      <div className="flex items-center justify-between px-4 h-[70px]">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Chicago logo" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <span className="text-[22px] font-bold" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Chicago
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {installPrompt ? (
            <Button
              onClick={handleInstallClick}
              variant="outline"
              size="sm"
              className="text-xs gap-2"
              aria-label="Install Chicago app"
            >
              <Download className="w-4 h-4" />
              Install
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={connecting}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {connecting ? 'Connecting...' : address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
