import React from 'react';

interface BalanceDisplayProps {
  balance: number;
  maybeCloseDrawer: () => void;
  onViewOverview: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  maybeCloseDrawer,
  onViewOverview,
}) => {
  return (
    <div className="flex flex-col items-end mr-2">
      <button
        onClick={() => { maybeCloseDrawer(); onViewOverview(); }}
        className="font-terminal text-sm text-cyber-green tabular-nums text-right focus:outline-none px-2 py-1 rounded transition-all duration-200 hover:bg-cyber-green/10 hover:shadow-[0_0_5px_rgba(50,255,50,0.3)] group"
        title="View Wallet Overview"
      >
        <span className="flex items-center">
          <span>{balance.toFixed(2)} <span className="text-cyber-green/70">SOL</span></span>
          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">→</span>
        </span>
      </button>
    </div>
  );
}; 