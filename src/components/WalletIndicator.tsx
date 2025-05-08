import React from 'react';
import Jdenticon from 'react-jdenticon';
import { Wallet, ChevronDown, Users } from 'lucide-react';
import { useStore } from '../store';

// Add declaration for react-jdenticon to fix type error
declare module 'react-jdenticon';

interface WalletIndicatorProps {
  onToggleWalletDrawer: () => void;
  isDrawerOpen: boolean;
}

export const WalletIndicator: React.FC<WalletIndicatorProps> = ({ 
  onToggleWalletDrawer,
  isDrawerOpen
}) => {
  const { activeWallet } = useStore();

  return (
    <button
      onClick={onToggleWalletDrawer}
      className="flex items-center h-full px-3 hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green border-l border-cyber-green/20 transition-colors duration-200"
      aria-expanded={isDrawerOpen}
      aria-controls="wallet-drawer"
    >
      <div className="relative flex items-center justify-center">
        {activeWallet ? (
          activeWallet.avatar ? (
            activeWallet.avatar.startsWith('data:') ? (
              <img
                src={activeWallet.avatar}
                alt={`${activeWallet.name} avatar`}
                className="w-8 h-8 rounded-full mr-2 border-2 border-cyber-green/30 shadow-[0_0_8px_rgba(0,255,0,0.3)] z-10"
              />
            ) : (
              <Jdenticon size={32} value={activeWallet.avatar} className="rounded-full mr-2 border-2 border-cyber-green/30 shadow-[0_0_8px_rgba(0,255,0,0.3)] z-10" />
            )
          ) : (
            <Jdenticon size={32} value={activeWallet.id} className="rounded-full mr-2 border-2 border-cyber-green/30 shadow-[0_0_8px_rgba(0,255,0,0.3)] z-10" />
          )
        ) : (
          <Wallet className="w-8 h-8 mr-2 p-1 rounded-full border-2 border-cyber-green/30 shadow-[0_0_8px_rgba(0,255,0,0.3)] z-10" />
        )}
      </div>
      <Users
        className={`w-4 h-4 ml-1 transition-opacity duration-300 ease-out ${isDrawerOpen ? 'text-cyber-green' : 'opacity-70'}`}
      />
    </button>
  );
}; 