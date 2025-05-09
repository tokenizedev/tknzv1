import React, { useState } from 'react';
import { Terminal, RefreshCw, PanelRight, PanelLeft, Repeat } from 'lucide-react';
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
  onCopyAddress: () => void;
  onToggleWalletDrawer: () => void;
  onManageWallets: () => void;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  // Swap page handler
  onSwap: () => void;
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
  onToggleWalletDrawer,
  onManageWallets,
  onOpenSidebar,
  onCloseSidebar,
  onSwap,
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 nav-placeholder nav-animated nav-glow">
        <div className={`border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-sm ${navAnimated ? 'nav-border-animated border-highlight' : ''}`}>
          <div className="flex items-center h-14">
            
            {activeWallet && (
              <>
                {/* Wallet controls with sequential animation */}
                <WalletIndicator 
                  onToggleWalletDrawer={onToggleWalletDrawer}
                  isDrawerOpen={showWalletDrawer}
                />
                  
                <button 
                  className={`h-full w-14 transition-colors flex items-center justify-center ${
                    showWallet 
                      ? 'bg-cyber-green/20 text-cyber-green' 
                      : 'hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green'
                  }`}
                  onClick={onToggleWallet}
                  title="View Wallet"
                >
                  <Terminal className="w-4 h-4" />
                </button>
                {/* Swap page button */}
                <button
                  className={`h-full w-14 transition-colors flex items-center justify-center ${
                    showSwap
                      ? 'bg-cyber-green/20 text-cyber-green'
                      : 'hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green'
                  }`}
                  onClick={onSwap}
                  title="Swap Tokens"
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* SOL balance indicator with sequential animation */}
                <div className={`flex h-full mr-5 transition-all duration-500 ${controlsAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                  <div className="border-l border-r border-cyber-green/20 px-4 flex items-center">
                    <div className="flex flex-col items-end mr-2">
                      <div className="font-terminal text-sm text-cyber-green tabular-nums">
                        {balance.toFixed(2)} <span className="text-cyber-green/70">SOL</span>
                      </div>
                    </div>
                    <button
                      onClick={onRefresh}
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
                        onClick={onOpenSidebar}
                        className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                        title="Open Sidebar Drawer"
                      >
                        <PanelRight className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                      </button>
                    ) : (
                      <button
                        onClick={onCloseSidebar}
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
        onCopyAddress={handleCopyWalletAddress}
        copiedWallet={copiedWallet}
      />
    </>
  );
};
