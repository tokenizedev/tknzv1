import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Copy, AlertTriangle, ExternalLink, Coins, RefreshCw, DollarSign } from 'lucide-react';
import { useStore } from '../store';

export const WalletPage: React.FC = () => {
  const { wallet, balance, createdCoins, getBalance, isRefreshing, investmentAmount, setInvestmentAmount } = useStore();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="space-y-6 p-4">
      {/* Balance Section */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Wallet Balance</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-5 h-5 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-3xl font-bold text-gray-900">{balance.toFixed(4)} SOL</div>
        <div className="space-y-1">
          <div className="text-sm text-gray-500">
            Auto-refreshes every minute
          </div>
          <div className="text-xs text-gray-400">
            Balance also updates when you open the extension
          </div>
        </div>
      </div>

      {/* Investment Amount Section */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Investment per Coin</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-purple-600 font-medium">max 85 SOL</span>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="85"
            step="0.01"
            value={investmentAmount}
            onChange={handleInvestmentChange}
            className="input-field"
            placeholder="Enter SOL amount (max 85)"
          />
          <span className="text-sm font-medium text-gray-600">SOL</span>
        </div>
        <div className="space-y-2 text-xs text-gray-500">
          <p>This amount + 0.03 SOL will be required for each coin creation:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>0.02 SOL Pump.fun fee</li>
            <li>0.01 SOL transaction fee</li>
          </ul>
        </div>
      </div>

      {/* Fund Wallet Section */}
      <div className="bg-purple-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-purple-900">Fund Your Wallet</h3>
        <div className="flex items-center space-x-2 bg-white p-3 rounded-lg">
          <input
            type="text"
            readOnly
            value={publicKey}
            className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-sm"
          />
          <button
            onClick={() => copyToClipboard(publicKey)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy address"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex justify-center bg-white p-4 rounded-lg">
          <QRCodeSVG value={publicKey} size={200} />
        </div>
        <p className="text-sm text-purple-700">
          Scan this QR code or copy the address above to send SOL to your wallet
        </p>
      </div>

      {/* Created Coins Section */}
      {createdCoins && createdCoins.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
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
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
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
  );
};