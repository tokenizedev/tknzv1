import React from 'react';
import { Home, Repeat, BarChart2, Settings, Wallet } from 'lucide-react';

interface BottomNavigationProps {
  active: "swap" | "wallet" | "manager" | "createdCoins" | "myCoins" | "overview" | "settings" | null;
  onHome: () => void;
  onSwap: () => void;
  onPortfolio: () => void;
  onSettings: () => void;
  onWalletManager: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  active,
  onHome,
  onSwap,
  onPortfolio,
  onSettings,
  onWalletManager,
}) => (
  <nav className="fixed bottom-0 left-0 right-0 z-20 bg-cyber-black/90 border-t border-cyber-green/20 flex justify-around items-center h-14">
    <button
        className={`flex flex-col items-center justify-center flex-1 h-full ${active === null ? 'text-cyber-purple' : 'text-cyber-green hover:text-cyber-purple'}`}
      onClick={onHome}
      title="TKNZ"
    >
      <img src="/assets/logo-01.png" alt="TKNS" className="w-5 h-5 mb-0.5" />
      <span className="text-xs font-terminal">TKNZ</span>
    </button>
    <button
      className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'swap' ? 'text-cyber-purple' : 'text-cyber-green hover:text-cyber-purple'}`}
      onClick={onSwap}
      title="Swap"
    >
      <Repeat className="w-5 h-5 mb-0.5" />
      <span className="text-xs font-terminal">Swap</span>
    </button>
    <button
      className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'overview' ? 'text-cyber-purple' : 'text-cyber-green hover:text-cyber-purple'}`}
      onClick={onPortfolio}
      title="Portfolio"
    >
      <BarChart2 className="w-5 h-5 mb-0.5" />
      <span className="text-xs font-terminal">Portfolio</span>
    </button>
    <button
      className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'manager' ? 'text-cyber-purple' : 'text-cyber-green hover:text-cyber-purple'}`}
      onClick={onWalletManager}
      title="Wallets"
    >
      <Wallet className="w-5 h-5 mb-0.5" />
      <span className="text-xs font-terminal">Wallets</span>
    </button>
    <button
      className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'settings' ? 'text-cyber-purple' : 'text-cyber-green hover:text-cyber-purple'}`}
      onClick={onSettings}
      title="Settings"
    >
      <Settings className="w-5 h-5 mb-0.5" />
      <span className="text-xs font-terminal">Settings</span>
    </button>
  </nav>
);