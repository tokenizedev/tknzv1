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
          <div className="flex items-center h-14 justify-between">
            <div className="flex items-center h-full">
              {/* Panel button on the top left */}
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
              {/* Logo */}
              <div
                className="h-full flex items-center px-4 cursor-pointer"
                onClick={onTokenCreate}
              >
                <img src="/assets/logo-01.png" alt="TKNS" className="h-10" />
              </div>
            </div>
            {/* Wallet switcher at the top right */}
            {activeWallet && (
              <WalletIndicator
                onToggleWalletDrawer={onToggleWalletDrawer}
                isDrawerOpen={showWalletDrawer}
              />
            )}
          </div>
        </div>
      </header>
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
