import { useEffect, useState, useRef } from 'react';
import { Wallet, RefreshCw, Sidebar, X, Copy, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useStore } from './store';
import { WalletSetup } from './components/WalletSetup';
import { CoinCreator } from './components/CoinCreator';
import { WalletPageCyber } from './components/WalletPageCyber';
import { VersionCheck } from './components/VersionCheck';
import { Loader } from './components/Loader';

interface AppProps { isSidebar?: boolean; }
function App({ isSidebar = false }: AppProps = {}) {
  const { 
    wallet, 
    balance, 
    initializeWallet, 
    getBalance, 
    isRefreshing, 
    isLatestVersion,
    updateAvailable,
    checkVersion 
  } = useStore();
  
  const [loading, setLoading] = useState(true);
  const [showWallet, setShowWallet] = useState(false);
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);
  
  // Add this for cypherpunk animation effects
  const [_animateZap, setAnimateZap] = useState(false);
  
  const [glitching, setGlitching] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);
  // Wallet address and copy handler
  const address = wallet?.publicKey.toString() || '';
  const truncatedAddress = address ? `${address.slice(0,4)}...${address.slice(-4)}` : '';
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
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
          window.close()
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

  useEffect(() => {
    const init = async () => {
      await initializeWallet();
      await checkVersion();
      setLoading(false);
    };
    init();
  }, [initializeWallet, checkVersion]);

  if (loading) {
    return (
      <Loader isSidebar={isSidebar} />
    );
  }

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
      
      {/* Minimalist header */}
      <header className="sticky top-0 z-10">
        <div className="border-b border-cyber-green/20">
          <div className="flex items-center px-4 py-2">
            {/* TKNZ Logo */}
            <div className="flex-none mr-4">
              <h1 className="leaderboard-title text-3xl tracking-wider">TKNZ</h1>
            </div>
            
            {wallet && (
              <>
                {/* Minimal wallet info - just balance */}
                <div className="bg-cyber-black/70 backdrop-blur-sm border border-cyber-green/30 rounded-sm flex items-center px-3 py-1.5 mr-4">
                  <div className="mr-1">
                    <div className="font-terminal text-lg text-cyber-green">
                      {balance.toFixed(2)}
                    </div>
                    <div className="font-terminal text-xs text-cyber-green/70 -mt-1">
                      SOL
                    </div>
                  </div>
                  <button
                    onClick={triggerBalanceEffect}
                    disabled={isRefreshing}
                    className="p-1 hover:bg-cyber-green/10 rounded-full transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 text-cyber-green ${isRefreshing ? 'animate-cyber-spin' : ''}`} />
                  </button>
                </div>
                
                {/* Wallet drawer toggle */}
                <button 
                  onClick={toggleWalletDrawer}
                  className="relative bg-cyber-black/70 backdrop-blur-sm border border-cyber-green/30 p-1.5 rounded-sm hover:bg-cyber-green/10 transition-all duration-200"
                >
                  <Menu className="w-5 h-5 text-cyber-green" />
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-cyber-green shadow-[0_0_5px_#00ff41] transform -translate-y-1/4 translate-x-1/4"></span>
                </button>
                
                <div className="flex-1"></div>
                
                {/* Wallet action button */}
                <button 
                  className={`p-1.5 rounded-sm transition-all duration-200 ml-2 ${
                    showWallet 
                      ? 'bg-cyber-green/20 border border-cyber-green/50 text-cyber-green' 
                      : 'bg-cyber-black/70 backdrop-blur-sm border border-cyber-green/30 hover:bg-cyber-green/10'
                  }`}
                  onClick={() => setShowWallet(!showWallet)}
                >
                  <Wallet className="w-5 h-5 text-cyber-green" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Animated wallet drawer */}
        <div className={`overflow-hidden transition-all duration-300 border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-md ${
          showWalletDrawer ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-3 flex items-center justify-between">
            {/* Wallet address */}
            <div className="flex items-center space-x-2">
              <div className="bg-cyber-black/70 border border-cyber-green/20 rounded-sm px-2 py-1">
                <div className="font-terminal text-cyber-green/90 text-sm">{address}</div>
              </div>
              <button
                onClick={copyAddress}
                className="p-1.5 hover:bg-cyber-green/10 rounded-sm transition-colors text-cyber-green/80 hover:text-cyber-green"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sidebar toggle */}
            <div>
              {!isSidebar ? (
                <button
                  onClick={openSidebar}
                  className="p-1.5 bg-cyber-black/70 border border-cyber-green/30 hover:bg-cyber-green/10 rounded-sm transition-all duration-200"
                >
                  <Sidebar className="w-4 h-4 text-cyber-green" />
                </button>
              ) : (
                <button
                  onClick={closeSidebar}
                  className="p-1.5 bg-cyber-black/70 border border-cyber-green/30 hover:bg-cyber-green/10 rounded-sm transition-all duration-200"
                >
                  <X className="w-4 h-4 text-cyber-green" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main 
        className={`overflow-auto px-4 relative ${glitching ? 'animate-glitch' : ''}`} 
        style={{ height: `calc(100% - ${showWalletDrawer ? '104px' : '52px'})` }}
        ref={mainAreaRef}
      >
        {/* CRT screen effect - subtle for cypherpunk */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.02)_50%)] bg-[length:100%_4px] opacity-20"></div>
          
          {/* Screen flicker */}
          <div className={`absolute inset-0 bg-cyber-green/5 opacity-0 ${glitching ? 'animate-flicker' : ''}`}></div>
        </div>

        {/* Main content */}
        {!wallet ? (
          <WalletSetup />
        ) : showWallet ? (
          <WalletPageCyber />
        ) : !isLatestVersion ? (
          <VersionCheck updateAvailable={updateAvailable || ''} />
        ) : (
          <CoinCreator isSidebar={isSidebar} />
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
    </div>
  );
}

export default App;