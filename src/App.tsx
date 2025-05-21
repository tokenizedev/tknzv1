import { useEffect, useState, useRef } from 'react';
import type { CoinCreationParams } from './types';
import { loadVerifiedTokens } from './services/tokenService';
import { useStore } from './store';
import { CoinCreator } from './components/CoinCreator';
import { WalletPageCyber } from './components/WalletPageCyber';
import { CreatedCoinsPage } from './components/CreatedCoinsPage';
import { MyCreatedCoinsPage } from './components/MyCreatedCoinsPage';
import { Loader } from './components/Loader';
import { PasswordSetup } from './components/PasswordSetup';
import { PasswordUnlock } from './components/PasswordUnlock';
import { storage } from './utils/storage';
import { TokenCreationProgress } from './components/TokenCreationProgress';
import { WalletManagerPage } from './components/WalletManagerPage';
import { Navigation } from './components/Navigation';
import { BottomNavigation } from './components/BottomNavigation';
import { SwapPage } from './components/SwapPage';
import { WalletOverview } from './components/WalletOverview';
import SendTokenModal from './components/SendTokenModal';
import { SettingsPage } from './components/SettingsPage';
import { ExternalLink } from 'lucide-react';
import { web3Connection } from './utils/connection';

interface AppProps { isSidebar?: boolean; }
function App({ isSidebar = false }: AppProps = {}) {
  // Seed token database: fetch verified tokens into IndexedDB on startup
  useEffect(() => {
    loadVerifiedTokens().catch(err => console.error('Token DB init error:', err));
  }, []);
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

  // Persist UI mode for content script to detect sidePanel vs popup
  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ isSidebarMode: !!isSidebar });
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
  // Exclusive UI panels: 'wallet', 'swap', 'manager', 'settings', etc.
  // Views: null shows default creation page, others show specific screens
  const [activeView, setActiveView] = useState<'wallet' | 'swap' | 'manager' | 'createdCoins' | 'myCoins' | 'overview' | 'settings' | null>(null);

  // Derived view flags
  const showWallet = activeView === 'wallet';
  const showSwapPage = activeView === 'swap';
  const showWalletManager = activeView === 'manager';
  const showCreatedCoins = activeView === 'createdCoins';
  const showMyCoins = activeView === 'myCoins';
  const showOverview = activeView === 'overview';
  const showSettings = activeView === 'settings';
  // Track specific token mints for swap: from and to
  const [selectedSwapMint, setSelectedSwapMint] = useState<string | null>(null);
  const [selectedSwapToMint, setSelectedSwapToMint] = useState<string | null>(null);
  // SDK token creation options (for pre-populating the create form)
  const [sdkOptions, setSdkOptions] = useState<Partial<CoinCreationParams> | null>(null);
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
  // On-screen notification for actions
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Pending transactions signatures
  const [pendingTxs, setPendingTxs] = useState<string[]>([]);
  // Auto-dismiss notifications after 5s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  // Open wallet manager page
  const openWalletManager = () => {
    // Switch to wallet-manager view
    setActiveView('manager');
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // Open settings page
  const openSettings = () => {
    setActiveView('settings');
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
  // Swap a specific token (as input)
  const handleSwapToken = (mint: string) => {
    setSelectedSwapMint(mint);
    setSelectedSwapToMint(null);
    setActiveView('swap');
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };
  // Swap to a specific token (as output), e.g., from community coins
  const handleSwapToToken = (mint: string) => {
    setSelectedSwapMint(null);
    setSelectedSwapToMint(mint);
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
  // Send token and handle pending/confirmation notifications
  const handleConfirmSend = async (mint: string, recipient: string, amt: number) => {
    try {
      // Send transaction and get signature quickly (no confirmation wait)
      const signature = await sendToken(mint, recipient, amt);
      // Close modal immediately
      closeSendModal();
      // Add to pending transactions
      setPendingTxs(prev => [...prev, signature]);
      // Optionally refresh balances immediately
      getBalance();
      refreshTokenBalances();
      // Confirm transaction in background
      web3Connection.confirmTransaction(signature, 'confirmed')
        .then((confirmation) => {
          // Remove from pending
          setPendingTxs(prev => prev.filter(sig => sig !== signature));
          // Notify user of result
          if (confirmation.value.err) {
            setNotification({ message: `Transaction failed to confirm: ${signature}`, type: 'error' });
          } else {
            setNotification({ message: `Transaction confirmed: ${signature}`, type: 'success' });
          }
          // Refresh balances after confirmation
          getBalance();
          refreshTokenBalances();
        })
        .catch((err) => {
          setPendingTxs(prev => prev.filter(sig => sig !== signature));
          setNotification({ message: `Transaction confirmation error: ${err}`, type: 'error' });
        });
    } catch (error: any) {
      console.error('Send failed:', error);
      setNotification({ message: `Send failed: ${error.message || error}`, type: 'error' });
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
    // Store last unlocked timestamp for session management
    // This works for both password and passkey authentication
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
    
    // Create more dramatic success effect with classes instead of direct DOM manipulation
    setTimeout(() => {
      // Set success state that will trigger CSS classes in render
      setCreationSuccessState('glitch');
      
      setTimeout(() => {
        setGlitching(false);
        setCreationSuccessState('fade');
        
        // Add a brief congratulatory message
        setNotification({ 
          message: `Token successfully created at ${coinAddress.slice(0, 8)}...${coinAddress.slice(-8)}`, 
          type: 'success' 
        });
        
        // Transition to My Created Coins view with state
        setTimeout(() => {
          setActiveView('myCoins');
          // Reset creation state after transition
          setTimeout(() => {
            setIsCreatingCoin(false);
            setCreationSuccessState(null);
            // Keep the address for highlighting for a while
            setTimeout(() => setNewCoinAddress(null), 10000);
          }, 300);
        }, 400);
      }, 500);
    }, 200);
  };

  const handleCoinCreationError = (_errorMessage: string) => {
    setGlitching(false);
    setIsCreatingCoin(false);
    setNotification({ message: _errorMessage, type: 'error' });
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
  

    
  // Handle token buy requests from content script or background
  useEffect(() => {
    const DEFAULT_INPUT_MINT = 'So11111111111111111111111111111111111111112';
    // On initial load, check for stored buy token (popup context only)
    if (!isSidebar && chrome?.storage?.local) {
      chrome.storage.local.get(['lastBuyToken'], (result) => {
        if (result.lastBuyToken) {
          try {
            const token = JSON.parse(result.lastBuyToken);
            setSelectedSwapMint(DEFAULT_INPUT_MINT);
            setSelectedSwapToMint(token.address || token.symbol || null);
            setActiveView('swap');
          } catch (_) {}
          // Clear stored token
          chrome.storage.local.remove(['lastBuyToken']);
        }
      });
    }
    // Listen for direct messages to show swap
    const listener = (message: any) => {
      if (message.type === 'SHOW_SWAP' && message.token) {
        // Only handle in correct UI context
        if (message.isSidebar !== isSidebar) return;
        setSelectedSwapMint(DEFAULT_INPUT_MINT);
        setSelectedSwapToMint(message.token.address || message.token.symbol || null);
        setActiveView('swap');
      }
      // Handle SDK token create init: pre-populate and navigate to create view
      if (message.type === 'SDK_TOKEN_CREATE' && message.options) {
        setSdkOptions(message.options); 
        useStore.getState().setInitialTokenCreateParams(message.options);
        if (message.isSidebar !== isSidebar) return;
        // Enter SDK mode and store options locally
        
        // Navigate to token creation view
        navigateToTokenCreate();
      }
    };
    if (chrome?.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(listener);
    }
    return () => {
      if (chrome?.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
  }, []);
  
  // Navigation to home/TKNZ button
  const navigateToHome = () => {
    setActiveView(null);
    setShowWalletDrawer(false);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // Add this style to your file, outside of any components
  useEffect(() => {
    // Add these styles for the success effects
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes success-glitch {
        0% {
          clip-path: inset(40% 0 61% 0);
          transform: skew(0.15deg);
          filter: hue-rotate(0deg);
        }
        20% {
          clip-path: inset(92% 0 1% 0);
          transform: skew(-0.3deg);
          filter: hue-rotate(20deg);
        }
        40% {
          clip-path: inset(43% 0 1% 0);
          transform: skew(0.4deg);
          filter: hue-rotate(-10deg);
        }
        60% {
          clip-path: inset(25% 0 58% 0);
          transform: skew(-0.25deg);
          filter: hue-rotate(5deg);
        }
        80% {
          clip-path: inset(54% 0 7% 0);
          transform: skew(0.2deg);
          filter: hue-rotate(-20deg);
        }
        100% {
          clip-path: inset(0% 0 0% 0);
          transform: skew(0deg);
          filter: hue-rotate(0deg);
        }
      }
      
      .success-glitch::after {
        content: '';
        position: fixed;
        inset: 0;
        background: linear-gradient(
          rgba(0, 255, 65, 0.3),
          transparent 3px,
          transparent 9px,
          rgba(0, 255, 65, 0.3) 9px
        );
        background-size: 100% 12px;
        z-index: 9999;
        pointer-events: none;
        animation: success-glitch 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .view-transition {
        opacity: 0;
        transform: scale(1.05) translateY(-10px);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add this to your state declarations section
  const [creationSuccessState, setCreationSuccessState] = useState<'glitch' | 'fade' | null>(null);

  return (
    <div className={`${isSidebar ? 'w-full h-full ' : 'w-[400px] h-[650px] '}bg-cyber-black bg-binary-pattern binary-overlay ${
      creationSuccessState === 'glitch' ? 'success-glitch' : ''
    } ${creationSuccessState === 'fade' ? 'view-transition' : ''}`}>
      {/* In-app notification */}
      {notification && (
        <div
          className={`fixed bottom-4 inset-x-4 z-50 px-4 py-3 rounded font-terminal shadow-neon-green backdrop-blur-sm border transition-all ${
            notification.type === 'success'
              ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/40'
              : 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm break-all">
              {notification.type === 'success' &&
               (notification.message.includes('Transaction sent:') || notification.message.includes('Transaction confirmed:')) ? (
                <>
                  <div className="text-xs opacity-80 mb-1">
                    {notification.message.includes('Transaction sent:')
                      ? 'Transaction sent'
                      : 'Transaction confirmed'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs break-all mr-2 font-mono tracking-tight">
                      {notification.message.split(': ')[1]}
                    </code>
                    <a
                      href={`https://solscan.io/tx/${notification.message.split(': ')[1]}?cluster=mainnet-beta`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-0.5 bg-cyber-green/30 hover:bg-cyber-green/50 rounded transition-colors flex items-center"
                      onClick={e => e.stopPropagation()}
                      title="View on Solscan"
                    >
                      <ExternalLink size={14} className="text-cyber-green" />
                    </a>
                  </div>
                </>
              ) : (
                notification.message
              )}
            </div>
            <button
              className="ml-2 text-xs opacity-70 hover:opacity-100"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* Pending transaction notifications */}
      {pendingTxs.map((sig) => (
        <div
          key={sig}
          className="fixed bottom-4 inset-x-4 z-50 px-4 py-3 rounded font-terminal shadow-neon-green backdrop-blur-sm border transition-all bg-cyber-green/20 text-cyber-green border-cyber-green/40"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm break-all">
              <div className="text-xs opacity-80 mb-1">Transaction pending</div>
              <div className="flex items-center space-x-2">
                <code className="text-xs break-all mr-2 font-mono tracking-tight">{sig}</code>
                <a
                  href={`https://solscan.io/tx/${sig}?cluster=mainnet-beta`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-0.5 bg-cyber-green/30 hover:bg-cyber-green/50 rounded transition-colors flex items-center"
                  onClick={(e) => e.stopPropagation()}
                  title="View on Solscan"
                >
                  <ExternalLink size={14} className="text-cyber-green" />
                </a>
              </div>
            </div>
            <button
              className="ml-2 text-xs opacity-70 hover:opacity-100"
              onClick={() => setPendingTxs(prev => prev.filter(s => s !== sig))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
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
              height: 'calc(100vh - 112px)',
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
            <div 
              ref={mainAreaRef}
              className={`bg-cyber-black h-full ${glitching ? 'glitch-text' : ''} pt-3 ${isCreatingCoin ? 'flex items-center justify-center' : ''}`}
            >
              {isCreatingCoin ? (
                /* Token creation progress display */
                <TokenCreationProgress progress={creationProgress} />
              ) : showSettings ? (
                /* Settings page */
                <SettingsPage onBack={() => setActiveView(null)} />
              ) : showWalletManager ? (
                /* Wallet manager interface */
                <WalletManagerPage onBack={closeWalletManager} />
              ) : showWallet ? (
                /* Wallet details view */
                <WalletPageCyber onBack={closeWalletManager} />
              ) : showSwapPage ? (
                /* Swap interface */
                <SwapPage
                  initialMint={selectedSwapMint}
                  initialToMint={selectedSwapToMint}
                  onBack={() => {
                    setActiveView(null);
                    setSelectedSwapMint(null);
                    setSelectedSwapToMint(null);
                  }}
                />
              ) : showOverview ? (
                /* Portfolio overview */
                <WalletOverview 
                  onBack={() => setActiveView(null)}
                  onSwapToken={handleSwapToken}
                  onSendToken={openSendModal}
                />
              ) : showCreatedCoins ? (
                /* Created coins community page */
                <CreatedCoinsPage
                  onBack={() => setActiveView(null)}
                  onSwapToken={handleSwapToToken}
                />
              ) : showMyCoins ? (
                /* My created coins page */
                <MyCreatedCoinsPage
                  onBack={() => setActiveView(null)}
                  highlightCoin={newCoinAddress}
                  onSwapToken={handleSwapToken}
                />
              ) : (
                /* Default token creator view */
                <CoinCreator
                  key={sdkOptions ? 'sdk' : 'default'}
                  isSidebar={isSidebar}
                  sdkOptions={sdkOptions}
                  /* Trigger the creation loader modal when starting */
                  onCreationStart={handleCoinCreationStart}
                  /* Navigate to My Created Coins on successful creation */
                  onCreationComplete={handleCoinCreationComplete}
                  /* Handle errors by stopping the loader */
                  onCreationError={handleCoinCreationError}
                />
              )}
            </div>

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

          <BottomNavigation
            active={activeView}
            onHome={navigateToHome}
            onSwap={toggleSwapPage}
            onPortfolio={toggleOverview}
            onSettings={openSettings}
            onWalletManager={openWalletManager}
          />

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