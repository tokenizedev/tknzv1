import React, { useEffect, useState, useRef } from 'react';
import { Coins as Coin, Wallet, RefreshCw, Sidebar, X, Zap, Code, Shield, ExternalLink, Copy, AlertTriangle, Search, ArrowUpDown } from 'lucide-react';
import { useStore } from './store';
import { WalletSetup } from './components/WalletSetup';
import { CoinCreator } from './components/CoinCreator';
import { WalletPageCyber } from './components/WalletPageCyber';
import { VersionCheck } from './components/VersionCheck';
import { Leaderboard } from './components/Leaderboard';
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Add this for cypherpunk animation effects
  const [animateZap, setAnimateZap] = useState(false);
  
  const [glitching, setGlitching] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);

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

  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, token: 'AfyD', mc: 358576.00, creator: 'TKNZ...STEM', launched: 'less than a minute ago' },
    { rank: 2, token: 'BRNz', mc: 4484.78, creator: 'CTzA...uXvZ', launched: 'less than a minute ago' },
    { rank: 3, token: 'HagB', mc: 4359.05, creator: 'L6XU...eFEX', launched: 'less than a minute ago' },
    { rank: 4, token: 'EPSL', mc: 4354.24, creator: 'FL8o...4jRd', launched: 'less than a minute ago' },
    { rank: 5, token: 'CMzF', mc: 4354.22, creator: 'CTzA...uXvZ', launched: 'less than a minute ago' },
  ];

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
      
      <header className="glass-panel p-4 flex items-center justify-between sticky top-0 z-10">
        {/* Logo area with more space */}
        <div className="flex-none mr-4">
          <h1 className="leaderboard-title text-xl tracking-wider">TKNZ</h1>
        </div>
        
        {wallet && (
          <div className="flex items-center space-x-4">
            {/* Balance display - with proper spacing */}
            <div className="flex-none bg-cyber-dark/90 px-3 py-1.5 rounded-sm border border-cyber-green/30 shadow-terminal relative">
              <div className="flex items-center space-x-2">
                <span className="font-terminal text-sm text-cyber-green">
                  {balance.toFixed(2)}
                </span>
                <span className="font-terminal text-sm text-cyber-green/80">SOL</span>
                <button
                  onClick={triggerBalanceEffect}
                  disabled={isRefreshing}
                  className="p-1 hover:bg-cyber-green/10 rounded-sm transition-colors disabled:opacity-50"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyber-green ${isRefreshing ? 'animate-cyber-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Toggle between open and close based on context - properly spaced */}
            <div className="flex items-center space-x-2 flex-none">
              {!isSidebar ? (
                <button
                  onClick={openSidebar}
                  className="p-2 rounded-sm bg-cyber-dark border border-cyber-green/30 hover:bg-cyber-green/10 text-cyber-green transition-all duration-200"
                  title="Open Sidebar"
                >
                  <Sidebar className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-sm bg-cyber-dark border border-cyber-green/30 hover:bg-cyber-green/10 text-cyber-green transition-all duration-200"
                  title="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                className={`p-2 rounded-sm transition-all duration-200 ${
                  showWallet 
                    ? 'bg-cyber-green/20 border border-cyber-green/50 text-cyber-green' 
                    : 'bg-cyber-dark border border-cyber-green/30 hover:bg-cyber-green/10 text-cyber-green'
                }`}
                onClick={() => {
                  setShowWallet(!showWallet);
                  setShowLeaderboard(false);
                }}
                title="View Wallet"
              >
                <Wallet className="w-4 h-4" />
              </button>
              <button 
                className={`p-2 rounded-sm transition-all duration-200 ${
                  showLeaderboard 
                    ? 'bg-cyber-green/20 border border-cyber-green/50 text-cyber-green' 
                    : 'bg-cyber-dark border border-cyber-green/30 hover:bg-cyber-green/10 text-cyber-green'
                }`}
                onClick={() => {
                  setShowLeaderboard(!showLeaderboard);
                  setShowWallet(false);
                }}
                title="View Leaderboard"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
      
      <main 
        className={`overflow-auto px-4 relative ${glitching ? 'animate-glitch' : ''}`} 
        style={{ height: 'calc(100% - 64px)' }}
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
        ) : showLeaderboard ? (
          <div className="py-6">
            <Leaderboard leaderboardData={leaderboardData} />
          </div>
        ) : showWallet ? (
          <WalletPageCyber />
        ) : !isLatestVersion ? (
          <VersionCheck updateAvailable={updateAvailable || ''} />
        ) : (
          <CoinCreator />
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