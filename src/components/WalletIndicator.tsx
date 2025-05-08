import React from 'react';
import Jdenticon from 'react-jdenticon';
import { Wallet, ChevronDown } from 'lucide-react';
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
      {activeWallet ? (
        activeWallet.avatar ? (
          activeWallet.avatar.startsWith('data:') ? (
            <img
              src={activeWallet.avatar}
              alt={`${activeWallet.name} avatar`}
              className="w-4 h-4 rounded-full mr-2"
            />
          ) : (
            <Jdenticon size={16} value={activeWallet.avatar} className="rounded-full mr-2" />
          )
        ) : (
          <Jdenticon size={16} value={activeWallet.id} className="rounded-full mr-2" />
        )
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      <ChevronDown 
        className={`w-3 h-3 ml-1 transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'transform rotate-180' : ''
        }`} 
      />
    </button>
  );
}; 