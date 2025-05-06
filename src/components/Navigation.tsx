import React from 'react';
import { Terminal, RefreshCw, Sidebar, X, Copy, CheckCircle } from 'lucide-react';
import { WalletIndicator } from './WalletIndicator';

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
  onRefresh: () => void;
  onToggleWallet: () => void;
  onCopyAddress: () => void;
  onToggleWalletDrawer: () => void;
  onManageWallets: () => void;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  copyConfirm: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  isSidebar = false,
  activeWallet,
  balance,
  isRefreshing,
  address,
  logoAnimated,
  navAnimated,
  controlsAnimated,
  showWallet,
  showWalletDrawer,
  onRefresh,
  onToggleWallet,
  onCopyAddress,
  onToggleWalletDrawer,
  onManageWallets,
  onOpenSidebar,
  onCloseSidebar,
  copyConfirm
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 nav-placeholder nav-animated nav-glow">
      <div className={`border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-sm ${navAnimated ? 'nav-border-animated border-highlight' : ''}`}>
        <div className="flex items-center h-14">
          {/* Logo with sequential animation */}
          <div className={`px-5 flex-none transition-all duration-300 ${logoAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <h1 className="leaderboard-title text-2xl tracking-widest">
              {/* Individual letter animation */}
              <span className="inline-block" style={{ animationDelay: '0.1s', animation: logoAnimated ? 'float 3s ease-in-out infinite' : 'none' }}>T</span>
              <span className="inline-block" style={{ animationDelay: '0.2s', animation: logoAnimated ? 'float 3s ease-in-out infinite' : 'none' }}>K</span>
              <span className="inline-block" style={{ animationDelay: '0.3s', animation: logoAnimated ? 'float 3s ease-in-out infinite' : 'none' }}>N</span>
              <span className="inline-block" style={{ animationDelay: '0.4s', animation: logoAnimated ? 'float 3s ease-in-out infinite' : 'none' }}>Z</span>
            </h1>
          </div>
          
          {activeWallet && (
            <>
              {/* SOL balance indicator with sequential animation */}
              <div className={`ml-auto flex h-full transition-all duration-500 ${controlsAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
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
                
                {/* Wallet controls with sequential animation */}
                <WalletIndicator onManageWallets={onManageWallets} />
                
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
                
                <button 
                  onClick={onToggleWalletDrawer}
                  className="border-r border-cyber-green/20 w-14 h-full flex items-center justify-center hover:bg-cyber-green/10 transition-colors relative"
                  title="Toggle wallet address"
                >
                  {copyConfirm ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-cyber-green/10 text-cyber-green animate-pulse-fast">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <Copy 
                      className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyAddress();
                      }} 
                    />
                  )}
                </button>
                
                {/* Control buttons with sequential animation */}
                <div className="flex h-full">
                  {!isSidebar ? (
                    <button
                      onClick={onOpenSidebar}
                      className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                      title="Open Sidebar"
                    >
                      <Sidebar className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                    </button>
                  ) : (
                    <button
                      onClick={onCloseSidebar}
                      className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                      title="Close Sidebar"
                    >
                      <X className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wallet drawer with slide animation */}
      <div className={`overflow-hidden transition-all duration-200 border-b border-cyber-green/20 bg-cyber-black/80 backdrop-blur-md ${
        showWalletDrawer ? 'max-h-12 nav-drawer-animated nav-border-animated' : 'max-h-0'
      }`}>
        <div className="flex items-center px-5 h-12">
          {/* Full wallet address */}
          <div className="font-terminal text-xs text-cyber-green/90 flex-1 truncate">
            {address}
          </div>
          <button
            onClick={onCopyAddress}
            className="ml-2 p-1.5 hover:bg-cyber-green/10 rounded-sm transition-colors text-cyber-green/80 hover:text-cyber-green relative"
            title="Copy address"
          >
            {copyConfirm ? (
              <CheckCircle className="w-3.5 h-3.5 text-cyber-green animate-pulse-fast" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
