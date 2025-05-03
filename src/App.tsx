import React, { useEffect, useState, useRef } from 'react';
import { Coins as Coin, Wallet, RefreshCw, Sidebar, X, Zap, Code, Shield, ExternalLink, Copy, AlertTriangle, Search, ArrowUpDown } from 'lucide-react';
import { useStore } from './store';
import { WalletSetup } from './components/WalletSetup';
import { CoinCreator } from './components/CoinCreator';
import { WalletPage } from './components/WalletPage';
import { VersionCheck } from './components/VersionCheck';

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
  const [copiedAddress, setCopiedAddress] = useState(false);
  
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

  // Simulate copying wallet address
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
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
      <div className={`${isSidebar ? 'w-full h-full ' : 'w-[400px] h-[600px] '}flex items-center justify-center bg-cyber-black`}>
        {/* Cypherpunk loader */}
        <div className="relative">
          <div className="w-12 h-12 border-2 border-cyber-purple rounded-full animate-spin relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-cyber-purple rounded-full animate-pulse-fast"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Code className="w-6 h-6 text-cyber-green animate-pulse" />
          </div>
          <div className="absolute -bottom-6 w-full text-center text-cyber-green text-xs animate-pulse font-terminal">
            INITIALIZING
          </div>
        </div>
      </div>
    );
  }

  // Mock wallet address for demo
  const walletAddress = wallet ? "8MXXotWeXCLpNqPMbDS1M" : "";

  const renderLeaderboard = () => (
    <div className="leaderboard-container mb-6">
      <div className="p-4">
        <h1 className="leaderboard-title text-center mb-6">TKNZ LEADERBOARD</h1>
        
        <div className="flex justify-between mb-4">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-green/50 w-4 h-4" />
            <input 
              type="text" 
              className="search-field pl-10" 
              placeholder="SEARCH TOKEN || CREATOR" 
            />
          </div>
          
          <button className="leaderboard-sort">
            <span>SORT BY: MC</span>
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
        
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>TOKEN</th>
              <th>MC</th>
              <th>CREATOR</th>
              <th className="text-right">LAUNCHED</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((item) => (
              <tr key={item.rank}>
                <td className="text-cyber-green/70">#{item.rank}</td>
                <td>{item.token}</td>
                <td className="money">${item.mc.toFixed(2)} USD</td>
                <td className="creator">{item.creator}</td>
                <td className="time text-right">{item.launched}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
            {renderLeaderboard()}
          </div>
        ) : showWallet ? (
          <div className="py-6 space-y-4">
            {/* Wallet page styled as a terminal */}
            <div className="crypto-card">
              <div className="crypto-card-header">
                <h2 className="crypto-card-title">Wallet Balance</h2>
                <button 
                  onClick={triggerBalanceEffect} 
                  className="text-cyber-green/70 hover:text-cyber-green"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="crypto-card-body">
                <div className="balance-display">
                  <span className={animateZap ? 'animate-glitch' : ''}>
                    {balance.toFixed(2)} SOL
                  </span>
                </div>
                <p className="text-cyber-green/70 text-sm font-terminal">
                  Auto-refreshes every minute
                </p>
                <p className="text-cyber-green/70 text-sm font-terminal">
                  Balance also updates when you open the extension
                </p>
              </div>
            </div>

            {/* Investment per coin */}
            <div className="crypto-card">
              <div className="crypto-card-header">
                <h2 className="crypto-card-title">Investment per Coin</h2>
                <span className="text-cyber-purple text-xs font-mono">
                  max 85 SOL
                </span>
              </div>
              <div className="crypto-card-body">
                <div className="flex items-center mb-3">
                  <input 
                    type="text" 
                    className="input-field font-terminal" 
                    placeholder="0"
                  />
                  <span className="ml-2 text-cyber-green/80 font-terminal">SOL</span>
                  <button className="ml-2 text-xl text-cyber-purple font-bold">$</button>
                </div>
                <p className="text-cyber-green/70 text-xs font-terminal mb-3">
                  This amount + 0.03 SOL will be required for each coin creation:
                </p>
                <ul className="text-cyber-green/70 text-xs font-terminal space-y-1 list-inside list-disc">
                  <li>0.02 SOL Pump.fun fee</li>
                  <li>0.01 SOL transaction fee</li>
                </ul>
              </div>
            </div>

            {/* Fund your wallet */}
            <div className="bg-cyber-black border border-cyber-green/30 rounded-md p-4 mb-3">
              <h2 className="text-cyber-purple font-terminal text-xl uppercase text-center mb-4">Fund Your Wallet</h2>
              <div className="hash-display mb-4 flex items-center justify-center bg-cyber-dark/50 text-cyber-green">
                <span className="text-cyber-green mr-2 font-terminal">{walletAddress}</span>
                <button 
                  onClick={() => copyAddress(walletAddress)}
                  className={`hover:text-cyber-green-dark ${copiedAddress ? 'text-cyber-purple' : 'text-cyber-green/70'}`}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="qr-container border border-cyber-green/20">
                {/* Placeholder for QR code */}
                <div className="w-full h-[150px] bg-white flex items-center justify-center text-black">
                  {/* In a real implementation, this would be an actual QR code component */}
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0gMzAgMzAgTCA1MCAzMCBMIDUwIDUwIEwgMzAgNTAgWiBNIDcwIDMwIEwgOTAgMzAgTCA5MCA1MCBMIDY5IDUwIFogTSAzMCA3MCBMIDU2IDcwIEwgNTAgOTAgTCAzMCA5MCBaIE0gNzAgNzAgTCA5MCA3MCBMIDkwIDkwIEwgNzAgOTAgWiBNIDMwIDExMCBMIDUwIDExMCBMIDUwIDEzMCBMIDMwIDEzMCBaIE0gNzAgMTEwIEwgOTAgMTEwIEwgOTAgMTMwIEwgNzAgMTMwIFoiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=')] bg-no-repeat bg-center"></div>
                </div>
              </div>
              <p className="text-center text-cyber-green mt-4 text-sm font-terminal">
                Scan this QR code or copy the address above to send SOL to your wallet
              </p>
            </div>

            {/* Export private key */}
            <div className="bg-cyber-dark rounded-md p-4 flex items-center justify-between border border-cyber-green/30">
              <h3 className="text-cyber-green font-terminal text-sm uppercase">Export Private Key</h3>
              <AlertTriangle className="text-cyber-yellow w-4 h-4" />
            </div>
          </div>
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