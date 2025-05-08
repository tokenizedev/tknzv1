import React, { useState, useEffect } from 'react';
import Jdenticon from 'react-jdenticon';
import { Wallet, ChevronDown, Users, PlusCircle, Copy, CheckCircle, X } from 'lucide-react';
import { useStore } from '../store';
import { WalletManager } from './WalletManager';
import ReactDOM from 'react-dom';

interface WalletIndicatorProps {
  onManageWallets?: () => void;
}

export const WalletIndicator: React.FC<WalletIndicatorProps> = ({ onManageWallets }) => {
  const { activeWallet, wallets } = useStore();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  // Handle opening wallet manager
  const handleManageWallets = () => {
    if (onManageWallets) {
      // Use the provided handler if available (new full page)
      onManageWallets();
    } else {
      // Fallback to modal if no handler provided
      setShowWalletManager(true);
    }
    setShowDrawer(false);
  };

  // Copy wallet address to clipboard
  const copyWalletAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  // Render drawer portal to avoid being constrained by parent elements
  const DrawerPortal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);
    
    return mounted ? ReactDOM.createPortal(children, document.body) : null;
  };

  return (
    <>
      <button
        onClick={() => setShowDrawer(!showDrawer)}
        className="flex items-center h-full px-3 hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green border-l border-cyber-green/20"
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
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${showDrawer ? 'transform rotate-180' : ''}`} />
      </button>

      {/* Wallet Drawer - rendered outside of navigation constrains */}
      <DrawerPortal>
        <div className={`fixed inset-0 z-40 ${showDrawer ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-cyber-black/70 backdrop-blur-sm transition-opacity duration-300 ${
              showDrawer ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setShowDrawer(false)}
          />
          
          {/* Drawer panel - positioned below nav bar */}
          <div 
            className={`absolute top-14 left-0 w-80 max-w-[80vw] bg-cyber-black border-r border-cyber-green/50 shadow-neon-green transition-transform duration-300 transform ${
              showDrawer ? 'translate-x-0' : '-translate-x-full'
            } h-[calc(100%-3.5rem)] flex flex-col z-50`}
          >
            {/* Drawer header */}
            <div className="p-4 border-b border-cyber-green/20 flex justify-between items-center">
              <button
                onClick={handleManageWallets}
                className="text-left flex items-center text-cyber-green hover:text-cyber-purple transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="font-terminal text-sm">MANAGE WALLETS</span>
              </button>
              <button 
                onClick={() => setShowDrawer(false)}
                className="text-cyber-green/80 hover:text-cyber-green p-1 rounded-sm hover:bg-cyber-green/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Wallet list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black">
              {wallets.map(wallet => (
                <div
                  key={wallet.id}
                  className={`p-3 flex items-center hover:bg-cyber-green/10 cursor-pointer border-b border-cyber-green/10 ${
                    wallet.isActive ? 'bg-cyber-green/10 text-cyber-green' : 'text-cyber-green/80'
                  }`}
                >
                  {/* Avatar and select area */}
                  <div 
                    className="flex items-center flex-1"
                    onClick={() => {
                      useStore.getState().switchWallet(wallet.id);
                      setShowDrawer(false);
                    }}
                  >
                    <div className="mr-3">
                      {wallet.avatar ? (
                        wallet.avatar.startsWith('data:') ? (
                          <img
                            src={wallet.avatar}
                            alt={`${wallet.name} avatar`}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <Jdenticon size={32} value={wallet.avatar} className="rounded-full" />
                        )
                      ) : (
                        <Jdenticon size={32} value={wallet.id} className="rounded-full" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-terminal text-sm truncate">
                        {wallet.name}
                      </div>
                      <div className="text-xs text-cyber-green/60 font-mono truncate">
                        {wallet.publicKey.substring(0, 6)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Copy button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyWalletAddress(wallet.publicKey);
                    }}
                    className="p-2 text-cyber-green/70 hover:text-cyber-green hover:bg-cyber-green/10 rounded-full relative"
                  >
                    {copiedWallet === wallet.publicKey ? (
                      <CheckCircle className="w-4 h-4 text-cyber-purple animate-pulse-fast" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerPortal>

      {/* Wallet manager modal (only used if onManageWallets is not provided) */}
      {showWalletManager && !onManageWallets && (
        <WalletManager onClose={() => setShowWalletManager(false)} />
      )}
    </>
  );
}; 