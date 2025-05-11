import React, { useState } from 'react';
import { RefreshCw, PanelRight, PanelLeft, Repeat } from 'lucide-react';
import { WalletIndicator } from './WalletIndicator';
import { WalletDrawer } from './WalletDrawer';
import { useStore } from '../store';

interface NavigationProps {
  isSidebar?: boolean;
  activeWallet: any;
  balance: number;
  isRefreshing: boolean;
  address: string;
  logoAnimated: boolean;
  navAnimated: boolean;
  controlsAnimated: boolean;
  showWallet: boolean;
  showWalletDrawer: boolean;
  glitching: boolean;
  onRefresh: () => void;
  onToggleWallet: () => void;
  onViewWallet: () => void;
  // Navigate to wallet overview screen
  onViewOverview: () => void;
  onCopyAddress: () => void;
  onToggleWalletDrawer: () => void;
  onManageWallets: () => void;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  // Swap page handler
  onSwap: () => void;
  onViewCreatedCoins: () => void;
  onViewMyCoins: () => void;
  // Token create handler
  onTokenCreate: () => void;
  showSwap: boolean;
  copyConfirm: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  isSidebar = false,
  activeWallet,
  balance,
  isRefreshing,
  navAnimated,
  controlsAnimated,
  showWallet,
  showWalletDrawer,
  onRefresh,
  onToggleWallet,
  onViewWallet,
  onViewOverview,
  onToggleWalletDrawer,
  onManageWallets,
  onOpenSidebar,
  onCloseSidebar,
  onSwap,
  onTokenCreate,
  onViewCreatedCoins,
  onViewMyCoins,
  showSwap,
  copyConfirm
}) => {
  const { wallets } = useStore();
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  // Handle wallet selection
  const handleSelectWallet = (walletId: string) => {
    useStore.getState().switchWallet(walletId);
    onToggleWalletDrawer(); // Close drawer after selection
  };

  // Handle copying wallet address
  const handleCopyWalletAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 2000);
  };
  
  // Close wallet drawer if open when other navigation items are clicked
  const maybeCloseDrawer = () => {
    if (showWalletDrawer) {
      onToggleWalletDrawer();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 nav-placeholder nav-animated nav-glow">
        <div className={`border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-sm ${navAnimated ? 'nav-border-animated border-highlight' : ''}`}>
          <div className="flex items-center h-14">
            
            {/* TKNS Logo */}
            <div
              className="h-full flex items-center px-4 cursor-pointer"
              onClick={() => { maybeCloseDrawer(); onTokenCreate(); }}
            >
              <img src="/assets/logo-01.png" alt="TKNS" className="h-10" />
            </div>
            
            {activeWallet && (
              <>
                {/* Wallet controls with sequential animation */}
                <WalletIndicator 
                  onToggleWalletDrawer={onToggleWalletDrawer}
                  isDrawerOpen={showWalletDrawer}
                />
                  
                {/* Swap page button */}
                <button
                  className={`h-full w-14 transition-colors flex items-center justify-center ${
                    showSwap
                      ? 'bg-cyber-green/20 text-cyber-green'
                      : 'hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green'
                  }`}
                  onClick={() => { maybeCloseDrawer(); onSwap(); }}
                  title="Swap Tokens"
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* SOL balance indicator with sequential animation */}
                <div className={`flex h-full mr-5 transition-all duration-500 ${controlsAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                  <div className="border-l border-r border-cyber-green/20 px-4 flex items-center">
                    <div className="flex flex-col items-end mr-2">
                      <button
                        onClick={() => { maybeCloseDrawer(); onViewOverview(); }}
                        className="font-terminal text-sm text-cyber-green tabular-nums text-right focus:outline-none px-2 py-1 rounded transition-all duration-200 hover:bg-cyber-green/10 hover:shadow-[0_0_5px_rgba(50,255,50,0.3)] group"
                        title="View Wallet Overview"
                      >
                        <span className="flex items-center">
                          <span>{balance.toFixed(2)} <span className="text-cyber-green/70">SOL</span></span>
                          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">→</span>
                        </span>
                      </button>
                    </div>
                    <button
                      onClick={() => { maybeCloseDrawer(); onRefresh(); }}
                      disabled={isRefreshing}
                      className="p-1.5 hover:bg-cyber-green/10 rounded-full"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyber-green/80 hover:text-cyber-green ${isRefreshing ? 'animate-cyber-spin' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Control buttons with sequential animation */}
                  <div className="flex h-full">
                    {!isSidebar ? (
                      <button
                        onClick={() => { maybeCloseDrawer(); onOpenSidebar(); }}
                        className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                        title="Open Sidebar Drawer"
                      >
                        <PanelRight className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { maybeCloseDrawer(); onCloseSidebar(); }}
                        className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                        title="Close Sidebar Drawer"
                      >
                        <PanelLeft className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Drawer component in main content area */}
      <WalletDrawer
        isOpen={showWalletDrawer}
        wallets={wallets}
        onClose={onToggleWalletDrawer}
        onSelectWallet={handleSelectWallet}
        onManageWallets={onManageWallets}
        onViewWallet={onViewWallet}
        onViewMyCoins={onViewMyCoins}
        onViewCreatedCoins={onViewCreatedCoins}
        onCopyAddress={handleCopyWalletAddress}
        copiedWallet={copiedWallet}
        onViewOverview={onViewOverview}
      />
    </>
  );
};
