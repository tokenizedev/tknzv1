import React from 'react';

interface BalanceDisplayProps {
  balance: number;
  usdValue?: number; // Optional USD value of the balance
  maybeCloseDrawer: () => void;
  onViewOverview: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  usdValue,
  maybeCloseDrawer,
  onViewOverview,
}) => {
  return (
    <div className="flex items-center h-full mx-2">
      <button
        onClick={() => { maybeCloseDrawer(); onViewOverview(); }}
        className="font-terminal text-right focus:outline-none px-3 py-1 rounded-md transition-all duration-200 hover:bg-cyber-green/10 hover:shadow-[0_0_8px_rgba(50,255,50,0.4)] active:scale-95 relative overflow-hidden"
        title="View Wallet Overview"
      >
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className="text-lg font-medium text-cyber-green tabular-nums tracking-tight">
              {balance.toFixed(2)}
            </span>
            <span className="ml-1 text-sm text-cyber-green/70">SOL</span>
          </div>
          
          {usdValue !== undefined && (
            <span className="text-xs text-cyber-green/80 tabular-nums">
              ${usdValue.toFixed(2)}
            </span>
          )}
        </div>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-cyber-green ml-1">→</span>
      </button>
    </div>
  );
}; 