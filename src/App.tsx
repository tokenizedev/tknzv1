import { useEffect, useState, useRef } from 'react';
import { Wallet, RefreshCw, Sidebar, X, Copy, ChevronDown, ChevronUp, Menu, CheckCircle } from 'lucide-react';
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
  const [copyConfirm, setCopyConfirm] = useState(false);
  
  // Wallet address and copy handler
  const address = wallet?.publicKey.toString() || '';
  const truncatedAddress = address ? `${address.slice(0,4)}...${address.slice(-4)}` : '';
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
      
      {/* Streamlined cyberpunk header */}
      <header className="sticky top-0 z-10">
        <div className="border-b border-cyber-green/20 bg-cyber-black/90 backdrop-blur-sm">
          <div className="flex items-center h-14">
            {/* Logo with more breathing room */}
            <div className="px-5 flex-none">
              <h1 className="leaderboard-title text-2xl tracking-widest">TKNZ</h1>
            </div>
            
            {wallet && (
              <>
                {/* SOL balance indicator */}
                <div className="ml-auto flex h-full">
                  <div className="border-l border-r border-cyber-green/20 px-4 flex items-center">
                    <div className="flex flex-col items-end mr-2">
                      <div className="font-terminal text-sm text-cyber-green tabular-nums">
                        {balance.toFixed(2)} <span className="text-cyber-green/70">SOL</span>
                      </div>
                    </div>
                    <button
                      onClick={triggerBalanceEffect}
                      disabled={isRefreshing}
                      className="p-1.5 hover:bg-cyber-green/10 rounded-full"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyber-green/80 hover:text-cyber-green ${isRefreshing ? 'animate-cyber-spin' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Wallet controls - simplified */}
                  <button 
                    onClick={toggleWalletDrawer}
                    className="border-r border-cyber-green/20 w-14 h-full flex items-center justify-center hover:bg-cyber-green/10 transition-colors relative"
                    title="Toggle wallet address"
                  >
                    {copyConfirm ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-cyber-green/10 text-cyber-green animate-pulse-fast">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <Copy className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" onClick={(e) => {
                        e.stopPropagation();
                        copyAddress();
                      }} />
                    )}
                  </button>
                  
                  {/* Control buttons */}
                  <div className="flex h-full">
                    {!isSidebar ? (
                      <button
                        onClick={openSidebar}
                        className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                        title="Open Sidebar"
                      >
                        <Sidebar className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                      </button>
                    ) : (
                      <button
                        onClick={closeSidebar}
                        className="border-r border-cyber-green/20 h-full w-14 flex items-center justify-center hover:bg-cyber-green/10 transition-colors"
                        title="Close Sidebar"
                      >
                        <X className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                      </button>
                    )}
                    <button 
                      className={`h-full w-14 transition-colors flex items-center justify-center ${
                        showWallet 
                          ? 'bg-cyber-green/20 text-cyber-green' 
                          : 'hover:bg-cyber-green/10 text-cyber-green/80 hover:text-cyber-green'
                      }`}
                      onClick={() => setShowWallet(!showWallet)}
                      title="View Wallet"
                    >
                      <Wallet className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Wallet drawer - simplified */}
        <div className={`overflow-hidden transition-all duration-200 border-b border-cyber-green/20 bg-cyber-black/80 backdrop-blur-md ${
          showWalletDrawer ? 'max-h-12' : 'max-h-0'
        }`}>
          <div className="flex items-center px-5 h-12">
            {/* Full wallet address */}
            <div className="font-terminal text-xs text-cyber-green/90 flex-1 truncate">
              {address}
            </div>
            <button
              onClick={copyAddress}
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
      
      <main 
        className={`overflow-auto px-4 relative ${glitching ? 'animate-glitch' : ''}`} 
        style={{ height: `calc(100% - ${showWalletDrawer ? '104px' : '56px'})` }}
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