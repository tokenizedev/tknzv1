import React, { useState } from 'react';
import { FaChevronDown, FaUsers, FaChartLine, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

interface TokenStatsProps {
  stats?: {
    holderCount?: number;
    topHoldersPercentage?: number;
    stats24h?: {
      priceChange?: number;
      holderChange?: number;
      volumeChange?: number;
      buyVolume?: number;
      sellVolume?: number;
      numBuys?: number;
      numSells?: number;
    };
    stats1h?: {
      priceChange?: number;
      holderChange?: number;
    };
    organicScore?: number;
    organicScoreLabel?: string;
    audit?: {
      mintAuthorityDisabled?: boolean;
      freezeAuthorityDisabled?: boolean;
      isSus?: boolean;
    };
    fdv?: number;
    mcap?: number;
    liquidity?: number;
  };
  loading?: boolean;
}

export const TokenStats: React.FC<TokenStatsProps> = ({ stats, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="mt-2 mb-3 px-3 py-2 bg-cyber-dark/50 rounded border border-cyber-green/20">
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-cyber-green border-l-cyber-green animate-spin"></div>
          <span className="ml-2 text-xs text-cyber-green/50 font-terminal">Loading stats...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;


  const formatNumber = (num: number | undefined, decimals: number = 2): string => {
    if (num === undefined) return 'N/A';
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(decimals)}T`;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(decimals)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatPercent = (num: number | undefined): string => {
    if (num === undefined) return 'N/A';
    const prefix = num > 0 ? '+' : '';
    return `${prefix}${num.toFixed(2)}%`;
  };

  const getChangeColor = (change: number | undefined): string => {
    if (change === undefined) return 'text-cyber-green/50';
    return change >= 0 ? 'text-cyber-green' : 'text-red-500';
  };

  const getScoreColor = (score: string | undefined): string => {
    switch (score?.toLowerCase()) {
      case 'high': return 'text-cyber-green';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-cyber-green/50';
    }
  };

  // Calculate buy/sell ratio
  const buyRatio = stats.stats24h?.numBuys && stats.stats24h?.numSells 
    ? (stats.stats24h.numBuys / (stats.stats24h.numBuys + stats.stats24h.numSells)) * 100
    : 50;

  // Check for warning conditions
  const hasWarnings = stats.audit?.isSus || 
    (stats.topHoldersPercentage && stats.topHoldersPercentage > 50) ||
    stats.organicScoreLabel === 'low';

  return (
    <div className="mt-2 mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-cyber-dark/50 rounded border border-cyber-green/20 hover:border-cyber-green/40 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyber-green/70 font-terminal">Token Stats</span>
            {hasWarnings && (
              <FaExclamationTriangle className="text-yellow-500 text-xs animate-pulse" />
            )}
          </div>
          <FaChevronDown
            className={`text-cyber-green/50 text-xs transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="mt-1 px-3 py-3 bg-cyber-dark/30 rounded border border-cyber-green/10 space-y-3 animate-fadeIn">
          {/* Holder Stats */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyber-green/70 text-xs font-terminal">
              <FaUsers className="text-cyber-green/50" />
              <span>Holder Stats</span>
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-cyber-green/50">Total Holders:</span>
                <span className="text-cyber-green font-mono">{formatNumber(stats.holderCount, 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-cyber-green/50">24h Change:</span>
                <span className={`font-mono ${getChangeColor(stats.stats24h?.holderChange)}`}>
                  {formatPercent(stats.stats24h?.holderChange)}
                </span>
              </div>
              {stats.topHoldersPercentage !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-cyber-green/50">Top Holders Own:</span>
                  <span className={`font-mono ${stats.topHoldersPercentage > 50 ? 'text-yellow-500' : 'text-cyber-green'}`}>
                    {stats.topHoldersPercentage.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price & Volume Stats */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyber-green/70 text-xs font-terminal">
              <FaChartLine className="text-cyber-green/50" />
              <span>Market Stats</span>
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-cyber-green/50">24h Price:</span>
                <span className={`font-mono ${getChangeColor(stats.stats24h?.priceChange)}`}>
                  {formatPercent(stats.stats24h?.priceChange)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-cyber-green/50">1h Price:</span>
                <span className={`font-mono ${getChangeColor(stats.stats1h?.priceChange)}`}>
                  {formatPercent(stats.stats1h?.priceChange)}
                </span>
              </div>
              {stats.liquidity !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-cyber-green/50">Liquidity:</span>
                  <span className="text-cyber-green font-mono">${formatNumber(stats.liquidity)}</span>
                </div>
              )}
              {stats.mcap !== undefined && (
                <div className="flex justify-between text-xs">
                  <span className="text-cyber-green/50">Market Cap:</span>
                  <span className="text-cyber-green font-mono">${formatNumber(stats.mcap)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Buy/Sell Activity */}
          {stats.stats24h?.numBuys !== undefined && stats.stats24h?.numSells !== undefined && (
            <div className="space-y-1.5">
              <div className="text-cyber-green/70 text-xs font-terminal">24h Activity</div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-cyber-green/50">Buys/Sells:</span>
                  <span className="text-cyber-green font-mono">
                    {stats.stats24h.numBuys} / {stats.stats24h.numSells}
                  </span>
                </div>
                {/* Buy/Sell ratio bar */}
                <div className="mt-1">
                  <div className="h-1.5 bg-cyber-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyber-green to-cyber-green-dark transition-all duration-300"
                      style={{ width: `${buyRatio}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] mt-0.5">
                    <span className="text-cyber-green/50">Buy {buyRatio.toFixed(0)}%</span>
                    <span className="text-red-500/70">Sell {(100 - buyRatio).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Trust */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyber-green/70 text-xs font-terminal">
              <FaShieldAlt className="text-cyber-green/50" />
              <span>Security</span>
            </div>
            <div className="pl-4 space-y-1">
              {stats.organicScoreLabel && (
                <div className="flex justify-between text-xs">
                  <span className="text-cyber-green/50">Organic Score:</span>
                  <span className={`font-mono uppercase ${getScoreColor(stats.organicScoreLabel)}`}>
                    {stats.organicScoreLabel}
                  </span>
                </div>
              )}
              {stats.audit && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-cyber-green/50">Mint Authority:</span>
                    <span className={`font-mono ${stats.audit.mintAuthorityDisabled ? 'text-cyber-green' : 'text-yellow-500'}`}>
                      {stats.audit.mintAuthorityDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-cyber-green/50">Freeze Authority:</span>
                    <span className={`font-mono ${stats.audit.freezeAuthorityDisabled ? 'text-cyber-green' : 'text-yellow-500'}`}>
                      {stats.audit.freezeAuthorityDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </div>
                  {stats.audit.isSus && (
                    <div className="mt-1 p-1.5 bg-red-500/10 border border-red-500/30 rounded">
                      <span className="text-red-500 text-[10px] font-terminal">⚠️ Suspicious activity detected</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 