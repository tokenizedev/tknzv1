import React from 'react';
import { useStore } from '../store';
import { Coins, ExternalLink } from 'lucide-react';

export const CreatedCoinsPage: React.FC = () => {
  const { activeWallet, createdCoins } = useStore();
  if (!activeWallet) return null;

  return (
    <div className="py-6 space-y-4">
      <div className="crypto-card">
        <div className="crypto-card-header flex items-center justify-between">
          <h2 className="crypto-card-title">Created Coins for {activeWallet.name}</h2>
          <Coins className="w-5 h-5 text-cyber-purple" />
        </div>
        <div className="crypto-card-body space-y-4">
          {createdCoins.length > 0 ? (
            createdCoins.map((coin) => (
              <div key={coin.address} className="bg-cyber-dark/80 border border-cyber-green/30 rounded-md p-3 space-y-3">
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
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/70 font-terminal">No coins created for this wallet.</p>
          )}
        </div>
      </div>
    </div>
  );
};