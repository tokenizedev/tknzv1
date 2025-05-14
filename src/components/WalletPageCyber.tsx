import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, AlertTriangle, ExternalLink, Coins, RefreshCw, DollarSign, Wifi, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { CreatedCoin } from '../types';

// Network environment indicator component
const NetworkIndicator: React.FC = () => {
  const isMainnet = import.meta.env.VITE_ENV === 'prod';
  
  return (
    <div className={`px-2 py-1 flex items-center space-x-1.5 rounded-sm border ${
      isMainnet 
        ? 'border-cyber-green/50 bg-cyber-green/5' 
        : 'border-cyber-yellow/50 bg-cyber-yellow/5'
    }`}>
      <Wifi className={`w-3 h-3 ${isMainnet ? 'text-cyber-green' : 'text-cyber-yellow'} animate-pulse`} />
      <span className={`text-xs font-terminal tracking-wider ${
        isMainnet ? 'text-cyber-green' : 'text-cyber-yellow'
      }`}>
        {isMainnet ? 'MAINNET' : 'DEVNET'}
      </span>
    </div>
  );
};

interface WalletPageCyberProps {
  highlightCoinAddress?: string | null;
}

const ITEMS_PER_PAGE = 3;

export const WalletPageCyber: React.FC<WalletPageCyberProps> = ({ highlightCoinAddress }) => {
  const { wallet, balance, createdCoins, getBalance, isRefreshing, investmentAmount, setInvestmentAmount } = useStore();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animateZap, setAnimateZap] = useState(false);
  const [inputValue, setInputValue] = useState(investmentAmount.toString());
  const [highlightedCoin, setHighlightedCoin] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coinsListRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // Scroll to highlighted coin when it changes
  useEffect(() => {
    if (highlightCoinAddress) {
      setHighlightedCoin(highlightCoinAddress);
      
      // Wait for render to complete
      setTimeout(() => {
        const element = document.getElementById(`coin-${highlightCoinAddress}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightCoinAddress]);

  useEffect(() => {
    setInputValue(investmentAmount.toString());
  }, [investmentAmount]);

  // Reset pagination if highlighted coin changes or list length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [highlightCoinAddress, createdCoins.length]);
  
  // Calculate pagination
  const totalPages = Math.ceil(createdCoins.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedCoins = createdCoins.slice(startIndex, endIndex);

  if (!wallet) return null;

  const publicKey = wallet.publicKey.toString();
  const privateKey = Array.from(wallet.secretKey)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0 && value <= 85) {
      setInvestmentAmount(value);
      setInputValue(value.toString());
    } else {
      setInvestmentAmount(investmentAmount);
      setInputValue(investmentAmount.toString());
    }
  };

  const triggerBalanceEffect = () => {
    setAnimateZap(true);
    getBalance();
    setTimeout(() => setAnimateZap(false), 1500);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Smooth scroll to the top of the list container
      coinsListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-2 space-y-4">
        {/* Wallet page styled as a terminal */}
        <div className="crypto-card">
            <div className="crypto-card-header flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="crypto-card-title">Wallet Balance</h2>
                <NetworkIndicator />
              </div>
              <button 
                  onClick={triggerBalanceEffect} 
                  className="text-cyber-green/70 hover:text-cyber-green"
              >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="crypto-card-body">
            <div className="balance-display">
                <span className={animateZap ? 'animate-glitch' : ''}>
                {balance.toFixed(2)} SOL
                </span>
            </div>
            <p className="text-white/70 text-sm font-terminal">
                Auto-refreshes every minute
            </p>
            <p className="text-white/70 text-sm font-terminal">
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
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="0"
                />
                <span className="ml-2 text-white font-terminal">SOL</span>
                <button className="ml-2 text-xl text-cyber-purple font-bold">$</button>
            </div>
            <p className="text-white/70 text-xs font-terminal mb-3">
                This amount + 0.03 SOL will be required for each coin creation:
            </p>
            <ul className="text-white/70 text-xs font-terminal space-y-1 list-inside list-disc">
                <li>0.02 SOL Pump.fun fee</li>
                <li>0.01 SOL transaction fee</li>
            </ul>
            </div>
        </div>

        {/* Fund your wallet */}
        <div className="bg-cyber-black border border-cyber-green/30 rounded-md p-4 mb-3">
            <h2 className="text-cyber-purple font-terminal text-xl uppercase text-center mb-4">Fund Your Wallet</h2>
            <div className="hash-display mb-4 flex items-center justify-center bg-cyber-dark/50 text-cyber-green">
            <input
                type="text"
                readOnly
                value={publicKey}
                className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm"
            />
            <button 
                onClick={() => copyToClipboard(publicKey)}
                className={`hover:text-cyber-green-dark ${copied ? 'text-cyber-purple' : 'text-cyber-green/70'}`}
            >
                <Copy className="w-4 h-4" />
            </button>
            </div>
            <div className="qr-container border border-cyber-green/20">
            <div className="w-full h-[150px] bg-cyber-black flex items-center justify-center">
                <QRCodeSVG value={publicKey} size={200} bgColor="#000000" fgColor="#00ff41" />
            </div>
            </div>
            <p className="text-center text-white mt-4 text-sm font-terminal">
            Scan this QR code or copy the address above to send SOL to your wallet
            </p>
        </div>

        {/* Created Coins Section moved to its own page via drawer */}
        {false && createdCoins && createdCoins.length > 0 && (
            <div className="crypto-card">
                <div className="crypto-card-header">
                    <h2 className="crypto-card-title flex items-center">
                        <span className="mr-2">Your Created Coins</span>
                        <span className="text-cyber-purple text-xs font-mono">[{createdCoins.length}]</span>
                    </h2>
                    <Coins className="w-5 h-5 text-cyber-purple" />
                </div>
                {/* Container with max-height and overflow */}
                <div ref={coinsListRef} className="p-4 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black">
                    {displayedCoins.map((coin) => { // Use displayedCoins
                        const isHighlighted = coin.address === highlightedCoin;
                        return (
                            <div 
                                id={`coin-${coin.address}`}
                                key={coin.address} 
                                className={`${
                                    isHighlighted 
                                        ? 'bg-cyber-green/10 border-cyber-green border-2 shadow-neon-green' 
                                        : 'bg-cyber-dark/80 border border-cyber-green/30 hover:border-cyber-green/60'
                                } rounded-md p-3 space-y-3 transition-all duration-300 relative`}
                            >
                                {isHighlighted && (
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-cyber-black border border-cyber-green px-2 py-0.5 text-xs font-terminal text-cyber-green">
                                        NEW TOKEN
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`font-terminal ${isHighlighted ? 'text-cyber-green font-bold' : 'text-cyber-purple'}`}>
                                            {coin.name}
                                        </div>
                                        <div className="text-sm text-white/70 font-terminal">{coin.ticker}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-terminal text-cyber-green">{coin.balance.toFixed(2)}</div>
                                        <div className="text-sm text-white/70 font-terminal">tokens</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <a
                                        href={coin.pumpUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex-1 px-3 py-2 ${
                                            isHighlighted
                                                ? 'bg-cyber-purple/20 border border-cyber-purple text-cyber-green'
                                                : 'bg-cyber-black border border-cyber-purple/50 text-cyber-purple'
                                        } rounded-sm hover:bg-cyber-purple/10 hover:border-cyber-purple 
                                        transition-all duration-200 text-sm font-terminal text-center uppercase tracking-wide`}
                                    >
                                        View on Pump.fun
                                    </a>
                                    <a
                                        href={`https://solscan.io/token/${coin.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-2 ${
                                            isHighlighted 
                                                ? 'border border-cyber-green bg-cyber-green/10'
                                                : 'border border-cyber-green/30 hover:bg-cyber-green/10'
                                        } rounded-sm transition-colors`}
                                        title="View on Solscan"
                                    >
                                        <ExternalLink className="w-4 h-4 text-cyber-green" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
                 {/* Pagination Controls */}
                 {totalPages > 1 && (
                    <div className="border-t border-cyber-green/30 bg-cyber-black/60 backdrop-blur-sm">
                        <div className="flex justify-between items-center p-3 relative">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-green/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                            
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center w-8 h-8 border border-cyber-green/40 rounded-sm 
                                          disabled:border-gray-700 disabled:text-gray-600 
                                          enabled:hover:border-cyber-green enabled:hover:text-cyber-green enabled:hover:bg-cyber-green/10 
                                          enabled:hover:shadow-[0_0_5px_rgba(0,255,65,0.5)] enabled:active:bg-cyber-green/20
                                          transition-all duration-200 transform enabled:hover:scale-105 enabled:active:scale-95"
                                title="Previous Page"
                            >
                                <ChevronUp className="w-5 h-5" />
                            </button>
                            
                            <div className="flex space-x-1 items-center">
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(idx + 1)}
                                        className={`w-5 h-5 flex items-center justify-center text-xs font-terminal transition-all duration-200
                                                  ${idx + 1 === currentPage 
                                                    ? 'bg-cyber-green text-cyber-black font-bold shadow-[0_0_5px_rgba(0,255,65,0.7)]' 
                                                    : 'bg-cyber-black/80 border border-cyber-green/40 text-cyber-green/80 hover:border-cyber-green hover:text-cyber-green hover:bg-cyber-green/10'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center w-8 h-8 border border-cyber-green/40 rounded-sm 
                                          disabled:border-gray-700 disabled:text-gray-600 
                                          enabled:hover:border-cyber-green enabled:hover:text-cyber-green enabled:hover:bg-cyber-green/10 
                                          enabled:hover:shadow-[0_0_5px_rgba(0,255,65,0.5)] enabled:active:bg-cyber-green/20
                                          transition-all duration-200 transform enabled:hover:scale-105 enabled:active:scale-95"
                                title="Next Page"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Export Private Key Section */}
        <div className="crypto-card border-cyber-green/50 border-2 relative overflow-hidden">
            <div className="crypto-card-header bg-cyber-black/80 border-b border-cyber-green flex items-center justify-between">
                <h3 className="text-xl text-cyber-green font-terminal tracking-wider uppercase flex items-center">
                    <span className="text-cyber-green mr-2">[ ! ]</span> Export Private Key
                </h3>
                <AlertTriangle className="w-5 h-5 text-cyber-yellow animate-pulse" />
            </div>
            
            {!showPrivateKey ? (
                <div className="p-5 space-y-4">
                    <div className="bg-[#332b00] border border-cyber-yellow/50 rounded-md p-4 shadow-neon-green">
                        <p className="text-[#f0e68c] text-sm font-terminal leading-relaxed">
                            Warning: Your private key is the only way to access your wallet. Never share it with 
                            anyone. Keep it stored safely and securely.
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowPrivateKey(true)}
                        className="w-full px-4 py-3 bg-cyber-black border-2 border-cyber-yellow text-cyber-yellow 
                                 rounded-sm hover:bg-cyber-yellow/10 hover:text-white hover:shadow-neon-green
                                 transition-all duration-200 font-terminal uppercase tracking-wider"
                    >
                        Show Private Key
                    </button>
                </div>
            ) : (
                <div className="p-5 space-y-4">
                    <div className="bg-[#332b00] border border-cyber-yellow/50 rounded-md p-4 shadow-neon-green">
                        <p className="text-[#f0e68c] text-sm font-terminal leading-relaxed">
                            Warning: Your private key is the only way to access your wallet. Never share it with 
                            anyone. Keep it stored safely and securely.
                        </p>
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center space-x-2 bg-cyber-dark p-3 rounded-md border border-cyber-purple/50 overflow-hidden">
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-cyber-purple scrollbar-track-cyber-dark/30 p-1 w-full">
                                <p className="font-mono text-sm text-cyber-purple select-all whitespace-nowrap">{privateKey}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(privateKey)}
                                className="p-2 hover:bg-cyber-purple/20 rounded-md transition-colors flex-shrink-0"
                                title="Copy private key"
                            >
                                <Copy className="w-4 h-4 text-cyber-purple" />
                            </button>
                        </div>
                        <p className="text-xs text-cyber-green/60 mt-2 italic font-terminal">
                            This is your private key in hexadecimal format
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowPrivateKey(false)}
                        className="w-full px-4 py-2 bg-cyber-black border border-cyber-green/50
                                text-cyber-green rounded-sm hover:bg-cyber-green/10 
                                transition-colors duration-200 font-terminal"
                    >
                        Hide Private Key
                    </button>
                </div>
            )}
            
            {/* Cyber decoration elements */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-yellow to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-yellow to-transparent"></div>
            <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-cyber-yellow to-transparent"></div>
            <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-cyber-yellow to-transparent"></div>
        </div>

        {/* Copy Confirmation Toast */}
        {copied && (
            <div className="fixed bottom-4 right-4 bg-cyber-dark text-cyber-green border border-cyber-green/50 px-4 py-2 
                          rounded-sm shadow-neon-green font-terminal tracking-wide z-50 animate-pulse">
                COPIED TO CLIPBOARD
            </div>
        )}
    </div>
  )
}