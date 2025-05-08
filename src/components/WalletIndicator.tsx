import React, { useState } from 'react';
import Jdenticon from 'react-jdenticon';
import { Wallet, ChevronDown, Users, PlusCircle } from 'lucide-react';
import { useStore } from '../store';
import { WalletManager } from './WalletManager';

interface WalletIndicatorProps {
  onManageWallets?: () => void;
}

export const WalletIndicator: React.FC<WalletIndicatorProps> = ({ onManageWallets }) => {
  const { activeWallet, wallets } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);

  // Get short wallet name for display
  const getShortWalletName = (name: string) => {
    if (name.length <= 12) return name;
    return `${name.substring(0, 10)}...`;
  };

  // Handle opening wallet manager
  const handleManageWallets = () => {
    if (onManageWallets) {
      // Use the provided handler if available (new full page)
      onManageWallets();
    } else {
      // Fallback to modal if no handler provided
      setShowWalletManager(true);
    }
    setShowDropdown(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center h-full px-3 hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green border-l border-cyber-green/20"
        >
          {activeWallet?.avatar ? (
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
            <Wallet className="w-4 h-4 mr-2" />
          )}
          <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu with cypherpunk-style */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-cyber-black border border-cyber-green/50 shadow-neon-green z-50 animate-glitch-in">
            <div className="p-2 border-b border-cyber-green/20 flex justify-between items-center">
              <span className="text-cyber-green text-xs font-terminal">WALLET SELECT</span>
              <span className="text-cyber-purple text-xs font-mono">[{wallets.length}]</span>
            </div>
            
            {/* Wallet list */}
            <div className="max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black">
              {wallets.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    useStore.getState().switchWallet(wallet.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left p-2 flex items-center hover:bg-cyber-green/10 ${
                    wallet.isActive ? 'bg-cyber-green/10 text-cyber-green' : 'text-cyber-green/80'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${wallet.isActive ? 'bg-cyber-green' : 'bg-cyber-green/20'}`} />
                  <div className="overflow-hidden">
                    <div className="font-terminal text-sm truncate">
                      {wallet.name}
                    </div>
                    <div className="text-xs text-cyber-green/60 font-mono truncate">
                      {wallet.publicKey.substring(0, 6)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Management options */}
            <div className="border-t border-cyber-green/20">
              <button
                onClick={handleManageWallets}
                className="w-full text-left p-2 flex items-center text-cyber-green/80 hover:bg-cyber-green/10 hover:text-cyber-green group"
              >
                <Users className="w-4 h-4 mr-2 group-hover:text-cyber-purple transition-colors" />
                <span className="font-terminal text-xs">MANAGE WALLETS</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet manager modal (only used if onManageWallets is not provided) */}
      {showWalletManager && !onManageWallets && (
        <WalletManager onClose={() => setShowWalletManager(false)} />
      )}
    </>
  );
}; 