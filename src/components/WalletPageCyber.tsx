import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, AlertTriangle, ExternalLink, Coins, RefreshCw, DollarSign } from 'lucide-react';
import { useStore } from '../store';

export const WalletPageCyber: React.FC = () => {
  const { wallet, balance, createdCoins, getBalance, isRefreshing, investmentAmount, setInvestmentAmount } = useStore();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animateZap, setAnimateZap] = useState(false);
  
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

  const handleRefresh = async () => {
    await getBalance();
  };

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 20) {
      setInvestmentAmount(value);
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
                    value={investmentAmount}
                    onChange={handleInvestmentChange}
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
            {/* Placeholder for QR code */}
            <div className="w-full h-[150px] bg-cyber-black flex items-center justify-center text-black">
                <QRCodeSVG value={publicKey} size={200} />
            </div>
            </div>
            <p className="text-center text-cyber-green mt-4 text-sm font-terminal">
            Scan this QR code or copy the address above to send SOL to your wallet
            </p>
        </div>

        {/* Created Coins Section */}
        {createdCoins && createdCoins.length > 0 && (
            <div className="bg-cyber-black border border-cyber-green/30 rounded-md p-4 mb-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Created Coins</h3>
                <Coins className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-3">
                {createdCoins.map((coin) => (
                <div key={coin.address} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-gray-900">{coin.name}</div>
                        <div className="text-sm text-gray-500">{coin.ticker}</div>
                    </div>
                    <div className="text-right">
                        <div className="font-medium text-gray-900">{coin.balance.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">tokens</div>
                    </div>
                    </div>
                    <div className="flex items-center space-x-2">
                    <a
                        href={coin.pumpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 
                                transition-colors duration-200 text-sm font-medium text-center"
                    >
                        View on Pump.fun
                    </a>
                    <a
                        href={`https://solscan.io/token/${coin.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View on Solscan"
                    >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </a>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Export Private Key Section */}
        <div className="bg-cyber-black border border-cyber-green/30 rounded-md p-4 mb-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Export Private Key</h3>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
                Warning: Your private key is the only way to access your wallet. Never share it with anyone.
                Keep it stored safely and securely.
            </p>
            </div>
            {showPrivateKey ? (
            <div className="space-y-2">
                <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                <input
                    type="text"
                    readOnly
                    value={privateKey}
                    className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm"
                />
                <button
                    onClick={() => copyToClipboard(privateKey)}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy private key"
                >
                    <Copy className="w-4 h-4 text-gray-600" />
                </button>
                </div>
                <p className="text-xs text-gray-500">
                This is your private key in hexadecimal format
                </p>
            </div>
            ) : (
            <button
                onClick={() => setShowPrivateKey(true)}
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-900 rounded-lg hover:bg-yellow-200 
                        transition-colors duration-200 font-medium"
            >
                Show Private Key
            </button>
            )}
        </div>

        {/* Copy Confirmation Toast */}
        {copied && (
            <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
            Copied to clipboard!
            </div>
        )}
    </div>
  )
}