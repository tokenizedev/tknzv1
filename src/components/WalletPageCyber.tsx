import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, AlertTriangle, ExternalLink, Coins, RefreshCw, DollarSign, Wifi } from 'lucide-react';
import { useStore } from '../store';

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

export const WalletPageCyber: React.FC = () => {
  const { wallet, balance, createdCoins, getBalance, isRefreshing, investmentAmount, setInvestmentAmount } = useStore();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animateZap, setAnimateZap] = useState(false);
  const [inputValue, setInputValue] = useState(investmentAmount.toString());

  useEffect(() => {
    setInputValue(investmentAmount.toString());
  }, [investmentAmount]);

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
    
    
  return (
    <div className="py-6 space-y-4">
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

        {/* Created Coins Section */}
        {createdCoins && createdCoins.length > 0 && (
            <div className="crypto-card">
                <div className="crypto-card-header">
                    <h2 className="crypto-card-title flex items-center">
                        <span className="mr-2">Your Created Coins</span>
                        <span className="text-cyber-purple text-xs font-mono">[{createdCoins.length}]</span>
                    </h2>
                    <Coins className="w-5 h-5 text-cyber-purple" />
                </div>
                <div className="p-4 space-y-3">
                    {createdCoins.map((coin) => (
                        <div key={coin.address} className="bg-cyber-dark/80 border border-cyber-green/30 rounded-md p-3 space-y-3 hover:border-cyber-green/60 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-terminal text-cyber-purple">{coin.name}</div>
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
                                    className="flex-1 px-3 py-2 bg-cyber-black border border-cyber-purple/50 text-cyber-purple rounded-sm
                                            hover:bg-cyber-purple/10 hover:border-cyber-purple transition-all duration-200 
                                            text-sm font-terminal text-center uppercase tracking-wide"
                                >
                                    View on Pump.fun
                                </a>
                                <a
                                    href={`https://solscan.io/token/${coin.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 border border-cyber-green/30 hover:bg-cyber-green/10 rounded-sm transition-colors"
                                    title="View on Solscan"
                                >
                                    <ExternalLink className="w-4 h-4 text-cyber-green" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
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