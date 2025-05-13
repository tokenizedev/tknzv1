import React, { useState } from 'react';
import { RefreshCw, PanelRight, PanelLeft, Repeat } from 'lucide-react';
import { WalletIndicator } from './WalletIndicator';
import { WalletDrawer } from './WalletDrawer';
import { BalanceDisplay } from './BalanceDisplay';
import { useStore } from '../store';
import { NavigationProps } from '../types'; // Assuming NavigationProps is here

export const Navigation: React.FC<NavigationProps> = ({
  isSidebar = false,
  activeWallet, // This prop might be from useStore directly if App.tsx doesn't pass it
  // balance, // Removed, will use nativeSolBalance from store
  isRefreshing: propIsRefreshing, // Renamed to avoid conflict with store's isRefreshing
  navAnimated,
  controlsAnimated,
  showWallet,
  showWalletDrawer,
  onRefresh, // This onRefresh might now call store.refreshPortfolioData or be store.isRefreshing
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
  const { 
    wallets, 
    nativeSolBalance, 
    totalPortfolioUsdValue, 
    isRefreshing, // Use isRefreshing from the store
    // activeWallet: storeActiveWallet // Use activeWallet from store if prop is not reliable
  } = useStore();
  
  // Use activeWallet from props, or fallback to store if necessary
  const currentActiveWallet = activeWallet || useStore(state => state.activeWallet);

  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const handleSelectWallet = (walletId: string) => {
    useStore.getState().switchWallet(walletId);
    onToggleWalletDrawer();
  };

  const handleCopyWalletAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(address);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const maybeCloseDrawer = () => {
    if (showWalletDrawer) {
      onToggleWalletDrawer();
    }
  };
  
  const handleRefreshClick = () => {
    useStore.getState().refreshPortfolioData();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 nav-placeholder nav-animated nav-glow">
        <div className={`border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-sm ${navAnimated ? 'nav-border-animated border-highlight' : ''}`}>
          <div className="flex items-center h-14 justify-between">
            <div className="flex items-center h-full">
              {currentActiveWallet && (
                <WalletIndicator
                  onToggleWalletDrawer={onToggleWalletDrawer}
                  isDrawerOpen={showWalletDrawer}
                />
              )}
            </div>
            <BalanceDisplay
              balance={nativeSolBalance} // Use nativeSolBalance from store
              usdValue={totalPortfolioUsdValue} // Use totalPortfolioUsdValue from store
              maybeCloseDrawer={maybeCloseDrawer}
              onViewOverview={onViewOverview}
            />
            {!isSidebar ? (
                <button
                  onClick={onOpenSidebar}
                  className="h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                  title="Open Sidebar Drawer"
                >
                  <PanelRight className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                </button>
              ) : (
                <button
                  onClick={onCloseSidebar}
                  className="h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                  title="Close Sidebar Drawer"
                >
                  <PanelLeft className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                </button>
              )}
          </div>
        </div>
      </header>
      <WalletDrawer
        isOpen={showWalletDrawer}
        wallets={wallets}
        activeWallet={currentActiveWallet} // Pass currentActiveWallet
        onClose={onToggleWalletDrawer}
        onSelectWallet={handleSelectWallet}
        onManageWallets={onManageWallets}
        onViewWallet={onViewWallet} // This likely navigates to a screen showing currentActiveWallet details
        onViewMyCoins={onViewMyCoins}
        onViewCreatedCoins={onViewCreatedCoins}
        onCopyAddress={handleCopyWalletAddress}
        copiedWallet={copiedWallet}
        onViewOverview={onViewOverview}
      />
    </>
  );
};
