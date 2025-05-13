import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { getCreatedCoins } from '../firebase';
import { CreatedCoin, WalletInfo } from '../types';
import { Loader } from './Loader';
import { Coins, ExternalLink, ArrowLeft, Repeat } from 'lucide-react';

interface MyCreatedCoinsPageProps {
  onBack: () => void;
  highlightCoin?: string | null;
  onSwapToken?: (mint: string) => void;
}

export const MyCreatedCoinsPage: React.FC<MyCreatedCoinsPageProps> = ({ 
  onBack, 
  highlightCoin: highlightCoinAddress,
  onSwapToken
}) => {
  const { wallets } = useStore();
  const [coins, setCoins] = useState<CreatedCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all: CreatedCoin[] = [];
      for (const w of wallets) {
        try {
          const userCoins = await getCreatedCoins(w.publicKey);
          // attach walletAddress for labeling
          userCoins.forEach(c => (c.walletAddress = w.publicKey));
          all.push(...userCoins);
        } catch (e) {
          console.error('Error fetching coins for wallet', w.id, e);
        }
      }
      // sort descending by createdAt
      all.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setCoins(all);
      setLoading(false);
    })();
  }, [wallets]);

  // Scroll to highlighted coin when it appears
  useEffect(() => {
    if (highlightCoinAddress) {
      setTimeout(() => {
        const el = document.getElementById(`coin-${highlightCoinAddress}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightCoinAddress]);

  if (loading) return <Loader />;

  return (
    <div className="py-2 space-y-4">
      <div className="flex items-center px-4 mb-2">
        <button
          onClick={onBack}
          className="p-1 hover:bg-cyber-green/10 rounded-full mr-3"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-cyber-green/80 hover:text-cyber-green" />
        </button>
        <h1 className="text-xl font-terminal text-cyber-green">My Created Coins</h1>
      </div>
      
      <div className="crypto-card">
        <div className="crypto-card-header flex items-center justify-between">
          <h2 className="crypto-card-title">My Created Coins</h2>
          <Coins className="w-5 h-5 text-cyber-purple" />
        </div>
        <div className="crypto-card-body space-y-4">
          {coins.length > 0 ? (
            coins.map((coin) => {
              const isHighlighted = coin.address === highlightCoinAddress;
              const walletInfo: WalletInfo | undefined = wallets.find(w => w.publicKey === coin.walletAddress);
              const label = walletInfo ? walletInfo.name : coin.walletAddress;
              return (
                <div
                  id={`coin-${coin.address}`}
                  key={coin.address}
                  className={`rounded-md p-3 space-y-2 transition-all duration-200 ${
                    isHighlighted
                      ? 'border-2 border-cyber-green/70 bg-cyber-green/10 shadow-neon-green'
                      : 'bg-cyber-dark/80 border border-cyber-green/30'
                  }`}
                >
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
                  <div className="text-xs text-white/70 font-terminal">Wallet: {label}</div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={coin.pumpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-cyber-black border border-cyber-purple/50 text-cyber-purple rounded-sm hover:bg-cyber-purple/10 transition-all duration-200 text-sm font-terminal text-center uppercase tracking-wide"
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
                    <button
                      onClick={() => onSwapToken?.(coin.address)}
                      className="p-2 border border-cyber-green/30 hover:bg-cyber-green/10 rounded-sm transition-colors"
                      title="Swap Token"
                    >
                      <Repeat className="w-4 h-4 text-cyber-green" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-white/70 font-terminal">You have not created any coins yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};