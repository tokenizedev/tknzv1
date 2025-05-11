import { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { WalletSetup } from './components/WalletSetup';
import { CoinCreator } from './components/CoinCreator';
import { WalletPageCyber } from './components/WalletPageCyber';
import { CreatedCoinsPage } from './components/CreatedCoinsPage';
import { MyCreatedCoinsPage } from './components/MyCreatedCoinsPage';
import { VersionCheck } from './components/VersionCheck';
import { Loader } from './components/Loader';
import { PasswordSetup } from './components/PasswordSetup';
import { PasswordUnlock } from './components/PasswordUnlock';
import { storage } from './utils/storage';
import { TokenCreationProgress } from './components/TokenCreationProgress';
import { WalletManagerPage } from './components/WalletManagerPage';
import { Navigation } from './components/Navigation';
import { SwapPage } from './components/SwapPage';
import { VersionBadge } from './components/VersionBadge';
import { WalletOverview } from './components/WalletOverview';
import SendTokenModal from './components/SendTokenModal';

interface AppProps { isSidebar?: boolean; }
function App({ isSidebar = false }: AppProps = {}) {
  // Notify background that side panel is open for this tab
  useEffect(() => {
    if (isSidebar && chrome?.tabs) {
      (async () => {
        try {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs[0];
          if (tab?.id != null) {
            chrome.runtime.sendMessage({ type: 'SIDEBAR_READY', tabId: tab.id });
          }
        } catch (error) {
          console.error('Failed to notify sidebar ready:', error);
        }
      })();
    }
  }, [isSidebar]);
  
  const { 
    activeWallet, 
    balance, 
    initializeWallet, 
    getBalance, 
    isRefreshing, 
    isLatestVersion,
    updateAvailable,
    checkVersion,
    sendToken,
    refreshTokenBalances
  } = useStore();
  
  const [loading, setLoading] = useState(true);
  // Show initial password & passkey setup or unlock guard
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  // Wallet drawer visibility
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  // Exclusive UI panels: 'wallet', 'swap', 'manager'
  // Views: null shows default creation page, others show specific screens
  const [activeView, setActiveView] = useState<'wallet' | 'swap' | 'manager' | 'createdCoins' | 'myCoins' | 'overview' | null>(null);

  // Derived view flags
  const showWallet = activeView === 'wallet';
  const showSwapPage = activeView === 'swap';
  const showWalletManager = activeView === 'manager';
  const showCreatedCoins = activeView === 'createdCoins';
  const showMyCoins = activeView === 'myCoins';
  const showOverview = activeView === 'overview';
  // Track a specific token mint to swap
  const [selectedSwapMint, setSelectedSwapMint] = useState<string | null>(null);
  // Timeout for wallet unlock in milliseconds (1 hour)
  const UNLOCK_TIMEOUT = 60 * 60 * 1000;
  
  // Add this for cypherpunk animation effects
  const [_animateZap, setAnimateZap] = useState(false);
  
  const [glitching, setGlitching] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [isCreatingCoin, setIsCreatingCoin] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [newCoinAddress, setNewCoinAddress] = useState<string | null>(null);
  // Send token modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendModalMint, setSendModalMint] = useState<string | null>(null);
  
  // Animation state for nav components
  const [navAnimated, setNavAnimated] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const [controlsAnimated, setControlsAnimated] = useState(false);
  
  // Wallet address and copy handler
  const address = activeWallet?.publicKey || '';
  
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopyConfirm(true);
      setTimeout(() => setCopyConfirm(false), 1500);
    } catch (e) {
      console.error('Failed to copy address:', e);
    }
  };

  // Trigger random glitch effects - less frequent for cleaner UI
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.97) { // Occasionally glitch
        setGlitching(true);
        setTimeout(() => setGlitching(false), 100 + Math.random() * 100);
      }
    }, 10000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  // Sequential animation for nav elements when component mounts
  useEffect(() => {
    // Main nav animation
    const navTimer = setTimeout(() => {
      setNavAnimated(true);
      
      // Logo animation with slight delay
      setTimeout(() => {
        setLogoAnimated(true);
        
        // Controls animation follows
        setTimeout(() => {
          setControlsAnimated(true);
          
          // Trigger a subtle glitch when animations complete
          setTimeout(() => {
            setGlitching(true);
            setTimeout(() => setGlitching(false), 150);
          }, 400);
        }, 150);
      }, 100);
    }, 300);
    
    return () => clearTimeout(navTimer);
  }, []);

  // Open the Chrome extension side panel for the current tab
  const openSidebar = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (tab?.id != null) {
        await chrome.sidePanel.open({ tabId: tab.id });
        await chrome.sidePanel.setOptions({ tabId: tab.id, path: 'sidebar.html', enabled: true });
      }
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
    // Close the popup window if we're in popup context
    if (!isSidebar) {
      window.close();
    }
  };
  // Close the side panel and return to popup mode
  const closeSidebar = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      
      if (tab?.id != null) {
        if (isSidebar) {
          chrome.tabs.sendMessage(tab.id, { type: 'SIDE_PANEL_CLOSED' });
          window.close();
        } else {
          await chrome.sidePanel.setOptions({ tabId: tab.id, enabled: false });
          // Open the extension popup
          await chrome.action.openPopup();
        }
      }
    } catch (error) {
      console.error('Failed to close side panel:', error);
    }
  };

  // Trigger coin balance animation
  const triggerBalanceEffect = () => {
    setAnimateZap(true);
    getBalance();
    setTimeout(() => setAnimateZap(false), 1500);
  };
  
  // Toggle the wallet drawer
  const toggleWalletDrawer = () => {
    setShowWalletDrawer(!showWalletDrawer);
    // Add a glitch effect when toggling
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // Function to handle wallet manager navigation
  const openWalletManager = () => {
    // Switch to wallet-manager view
    setActiveView('manager');
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // Open Created Coins page for all wallets (community)
  const openCreatedCoins = () => {
    setActiveView('createdCoins');
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };
  // Open My Created Coins page (user-specific)
  const openMyCoins = () => {
    setActiveView('myCoins');
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  const closeWalletManager = () => {
    // Close wallet-manager view if active
    if (activeView === 'manager') {
      setActiveView(null);
    }
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // Toggle wallet view
  const toggleWallet = () => {
    // Toggle wallet view, ensuring exclusivity
    setActiveView(prev => (prev === 'wallet' ? null : 'wallet'));
  };
  // Toggle wallet overview view
  const toggleOverview = () => {
    setActiveView(prev => (prev === 'overview' ? null : 'overview'));
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };
  // Toggle swap page
  const toggleSwapPage = () => {
    // Toggle swap view, ensuring exclusivity
    setActiveView(prev => (prev === 'swap' ? null : 'swap'));
  };
  // Swap a specific token
  const handleSwapToken = (mint: string) => {
    setSelectedSwapMint(mint);
    setActiveView('swap');
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };
  // Open send token modal for a specific mint
  const openSendModal = (mint: string) => {
    setSendModalMint(mint);
    setShowSendModal(true);
  };
  // Close send modal
  const closeSendModal = () => {
    setShowSendModal(false);
    setSendModalMint(null);
  };
  // Confirm and send token
  const handleConfirmSend = async (mint: string, recipient: string, amt: number) => {
    try {
      const signature = await sendToken(mint, recipient, amt);
      closeSendModal();
      alert(`Transaction sent: ${signature}`);
      await getBalance();
      await refreshTokenBalances();
    } catch (error: any) {
      console.error('Send failed:', error);
      alert(`Send failed: ${error.message || error}`);
      // Propagate error so modal can reset state
      throw error;
    }
  };
  // Open wallet details view
  const openWalletView = () => {
    setActiveView('wallet');
  };

  // Navigate to token create panel
  const navigateToTokenCreate = () => {
    setActiveView(null);
    // Close any open drawers
    setShowWalletDrawer(false);
    // Add a glitch effect for transition
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // After setting up password or unlocking, initialize and record unlock time
  const handlePostUnlock = async () => {
    setShowPasswordSetup(false);
    setShowUnlock(false);
    setLoading(true);
    await storage.set({ walletLastUnlocked: Date.now() });
    await initializeWallet();
    await checkVersion();
    setLoading(false);
  };

  // Function to handle coin creation state
  const handleCoinCreationStart = async (innerHandleSubmit: () => Promise<void>) => {
    setIsCreatingCoin(true);
    setCreationProgress(0);
    
    // Start the animation
    const interval = setInterval(() => {
      setCreationProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 2;
      });
    }, 50);

    await innerHandleSubmit();
    // Add a subtle glitch effect
    setGlitching(true);

    setTimeout(() => setGlitching(false), 200);
  };
  
  // Function to handle coin creation completion
  const handleCoinCreationComplete = (coinAddress: string) => {
    setCreationProgress(100);
    // Store the new coin address for highlighting
    setNewCoinAddress(coinAddress);
    
    // Flash a glitch effect
    setGlitching(true);
    setTimeout(() => {
      setGlitching(false);
      // Transition to My Created Coins view
      setActiveView('myCoins');
      // Reset creation state after transition
      setTimeout(() => {
        setIsCreatingCoin(false);
        // Keep the address for highlighting for a while
        setTimeout(() => setNewCoinAddress(null), 10000);
      }, 300);
    }, 200);
  };

  const handleCoinCreationError = (_errorMessage: string) => {
    setGlitching(false);
    setIsCreatingCoin(false);
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Check if password is configured
        const { walletPasswordHash } = await storage.get('walletPasswordHash');
        if (!walletPasswordHash) {
          // Prompt initial password setup
          setShowPasswordSetup(true);
          setLoading(false);
          return;
        }
        // Check last unlock timestamp
        const { walletLastUnlocked } = await storage.get('walletLastUnlocked');
        const now = Date.now();
        if (!walletLastUnlocked || now - walletLastUnlocked > UNLOCK_TIMEOUT) {
          // Require unlock
          setShowUnlock(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load password settings:', e);
        // Proceed with initialization on error
      }
      // Already unlocked or no guard needed, initialize wallet and version
      await initializeWallet();
      await checkVersion();
      setLoading(false);
    };
    init();
  }, [initializeWallet, checkVersion]);

  return (
    <div className={`${isSidebar ? 'w-full h-full ' : 'w-[400px] h-[600px] '}bg-cyber-black bg-binary-pattern binary-overlay`}>
      {/* Background crypto pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-cyber-green/10"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyber-green/10"></div>
        <div className="absolute top-0 left-0 h-full w-0.5 bg-cyber-green/10"></div>
        <div className="absolute top-0 right-0 h-full w-0.5 bg-cyber-green/10"></div>
      </div>
      
      {/* Matrix-style code rain animation in background - very subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-cyber-green font-mono text-xs"
            style={{
              top: -20,
              left: `${(i * 10) + Math.random() * 5}%`,
              animation: `float ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {[...Array(20)].map((_, j) => (
              <div key={j} style={{ opacity: Math.random() > 0.5 ? 0.3 : 0.7 }}>
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {loading || showPasswordSetup || showUnlock ? (
        showPasswordSetup ? (
          <PasswordSetup onComplete={handlePostUnlock} />
        ) : showUnlock ? (
          <PasswordUnlock onUnlock={handlePostUnlock} />
        ) : (
          <Loader isSidebar={isSidebar} />
        )
      ) : (
        <>
          {/* Use the Navigation component here */}
          <Navigation
            isSidebar={isSidebar}
            activeWallet={activeWallet}
            balance={balance}
            isRefreshing={isRefreshing}
            address={address}
            logoAnimated={logoAnimated}
            navAnimated={navAnimated}
            controlsAnimated={controlsAnimated}
            showWallet={showWallet}
            showWalletDrawer={showWalletDrawer}
            glitching={glitching}
            onRefresh={triggerBalanceEffect}
            onToggleWallet={toggleWallet}
            onViewWallet={openWalletView}
            onCopyAddress={copyAddress}
            onViewOverview={toggleOverview}
            onToggleWalletDrawer={toggleWalletDrawer}
            onManageWallets={openWalletManager}
            onOpenSidebar={openSidebar}
            onCloseSidebar={closeSidebar}
            onSwap={toggleSwapPage}
            onTokenCreate={navigateToTokenCreate}
            onViewCreatedCoins={openCreatedCoins}
            onViewMyCoins={openMyCoins}
            showSwap={showSwapPage}
            copyConfirm={copyConfirm}
          />
          
          <main 
            className={`overflow-auto px-4 relative main-content-transition ${glitching ? 'animate-glitch' : ''}`}
            style={{ 
              height: '90%', 
              transition: 'padding-top 0.3s ease-out'
            }}
            ref={mainAreaRef}
          >
            {/* CRT screen effect - subtle for cypherpunk */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.02)_50%)] bg-[length:100%_4px] opacity-20"></div>
              
              {/* Screen flicker */}
              <div className={`absolute inset-0 bg-cyber-green/5 opacity-0 ${glitching ? 'animate-flicker' : ''}`}></div>
            </div>

            {/* Conditional rendering of main content */}
            {!activeWallet ? (
              <WalletSetup />
            ) : showSwapPage ? (
              <SwapPage
                isSidebar={isSidebar}
                initialFromMint={selectedSwapMint || undefined}
              />
            ) : showWalletManager ? (
              <WalletManagerPage onBack={closeWalletManager} />
            ) : isCreatingCoin ? (
              /* Using our new TokenCreationProgress component */
              <TokenCreationProgress progress={creationProgress} />
            ) : showWallet ? (
              <WalletPageCyber highlightCoinAddress={newCoinAddress} />
            ) : showOverview ? (
              <WalletOverview
                onSwapToken={handleSwapToken}
                onSendToken={openSendModal}
              />
            ) : showMyCoins ? (
              <MyCreatedCoinsPage highlightCoinAddress={newCoinAddress} />
            ) : showCreatedCoins ? (
              <CreatedCoinsPage />
            ) : !isLatestVersion ? (
              <VersionCheck updateAvailable={updateAvailable || ''} />
            ) : (
              <CoinCreator 
                isSidebar={isSidebar} 
                onCreationStart={handleCoinCreationStart}
                onCreationComplete={handleCoinCreationComplete}
                onCreationError={handleCoinCreationError}
              />
            )}
            
            {/* Subtle floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 rounded-full opacity-20"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#00ff41' : '#ff00ff',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `float ${3 + Math.random() * 7}s linear infinite`,
                    boxShadow: `0 0 3px ${i % 2 === 0 ? '#00ff41' : '#ff00ff'}`
                  }}
                />
              ))}
            </div>
          </main>
          {/* Send Token Modal */}
          <SendTokenModal
            visible={showSendModal}
            mint={sendModalMint || ''}
            onClose={closeSendModal}
            onSend={handleConfirmSend}
          />
        </>
      )}
    </div>
  );
}

export default App;