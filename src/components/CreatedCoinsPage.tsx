import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { getAllCreatedCoins } from '../firebase';
import { CreatedCoin } from '../types';
import { Loader } from './Loader';
import { Coins, ExternalLink, ArrowLeft, Repeat } from 'lucide-react';

interface CreatedCoinsPageProps {
  onBack: () => void;
  onSwapToken?: (mint: string) => void;
}

export const CreatedCoinsPage: React.FC<CreatedCoinsPageProps> = ({ onBack, onSwapToken }) => {
  const { wallets } = useStore();
  const [coins, setCoins] = useState<CreatedCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const allCoins = await getAllCreatedCoins();
      setCoins(allCoins);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="py-2 space-y-2">
      <div className="flex items-center px-2 mb-2">
        <button
          onClick={onBack}
          className="p-1 hover:bg-cyber-green/10 rounded-full mr-3"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-cyber-green/80 hover:text-cyber-green" />
        </button>
        <h1 className="text-xl font-terminal text-cyber-green">Community Coins</h1>
      </div>

      <div className="crypto-card">
        <div className="crypto-card-header flex items-center justify-between">
          <h2 className="crypto-card-title">All Created Coins</h2>
          <Coins className="w-5 h-5 text-cyber-purple" />
        </div>
        <div className="crypto-card-body space-y-4">
          {coins.length > 0 ? (
            coins.map((coin) => {
              const address = (coin as any).walletAddress as string | undefined;
              const walletInfo = wallets.find(w => w.publicKey === address);
              const walletLabel = walletInfo
                ? walletInfo.name
                : address
                  ? `${address.substring(0, 6)}...${address.slice(-4)}`
                  : 'Unknown';
              return (
                <div key={coin.address} className="bg-cyber-dark/80 border border-cyber-green/30 rounded-md p-3 space-y-2">
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
                  <div className="text-xs text-white/70 font-terminal">Wallet: {walletLabel}</div>
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
            <p className="text-white/70 font-terminal">No created coins found.</p>
          )}
        </div>
      </div>
    </div>
  );
};