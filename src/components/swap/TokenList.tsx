import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaTimesCircle } from 'react-icons/fa';
import { getTokenInfo } from '../../services/jupiterService';

interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  logoURI?: string;
  balance?: string;
  balanceUsd?: string;
  decimals: number;
}

interface TokenListProps {
  tokens: TokenInfo[];
  onSelect: (token: TokenInfo) => void;
  onClose: () => void;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Trimmed lowercase search term
  // Raw trimmed input (case preserved) vs lowercase for map lookups
  const rawSearch = searchTerm.trim();
  const trimmedSearch = rawSearch.toLowerCase();
  // Build in-memory index of tokens by symbol and address
  const { tickerMap, addressMap, symbolKeys } = useMemo(() => {
    const tickerMap = new Map<string, TokenInfo[]>();
    const addressMap = new Map<string, TokenInfo>();
    tokens.forEach(token => {
      const key = token.symbol.toLowerCase();
      if (tickerMap.has(key)) {
        tickerMap.get(key)!.push(token);
      } else {
        tickerMap.set(key, [token]);
      }
      addressMap.set(token.id.toLowerCase(), token);
    });
    return { tickerMap, addressMap, symbolKeys: Array.from(tickerMap.keys()) };
  }, [tokens]);
  // Fallback: fetch token info by address if no local match
  const [fallbackToken, setFallbackToken] = useState<TokenInfo | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  useEffect(() => {
    // reset any prior fallback selection
    setFallbackToken(null);
    // require non-empty input
    if (!rawSearch) return;
    // skip if we already match a known token
    if (addressMap.has(trimmedSearch) || tickerMap.has(trimmedSearch)) return;
    // only attempt fallback for plausible mint lengths
    if (rawSearch.length < 32) return;
    let canceled = false;
    setFallbackLoading(true);
    // use rawSearch to preserve proper casing
    getTokenInfo(rawSearch)
      .then(data => {
        if (canceled) return;
        setFallbackToken({
          id: data.address,
          symbol: data.symbol,
          name: data.name,
          logoURI: data.logoURI,
          decimals: data.decimals,
        });
      })
      .catch(() => {
        // ignore lookup failures
      })
      .finally(() => {
        if (!canceled) setFallbackLoading(false);
      });
    return () => { canceled = true; setFallbackLoading(false); };
  }, [rawSearch, trimmedSearch, addressMap, tickerMap]);
  
  // Search tokens by address (exact), symbol (exact or prefix), or substring (symbol/name)
  let filteredTokens: TokenInfo[] = [];
  const DEFAULT_IDS = [
    'AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump', // TKNZ
    'So11111111111111111111111111111111111111112',   // SOL
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  ];
  if (trimmedSearch.length === 0) {
    // Default view: show TKNZ, SOL, USDC
    filteredTokens = DEFAULT_IDS
      .map(id => addressMap.get(id.toLowerCase()))
      .filter((t): t is TokenInfo => !!t);
  } else if (addressMap.has(trimmedSearch)) {
    filteredTokens = [addressMap.get(trimmedSearch)!];
  } else if (tickerMap.has(trimmedSearch)) {
    filteredTokens = tickerMap.get(trimmedSearch)!;
  } else {
    // Prefix match on symbol
    const prefixResults: TokenInfo[] = [];
    for (const key of symbolKeys) {
      if (key.startsWith(trimmedSearch)) {
        const list = tickerMap.get(key)!;
        for (const token of list) {
          prefixResults.push(token);
          if (prefixResults.length >= 50) break;
        }
      }
      if (prefixResults.length >= 50) break;
    }
    if (prefixResults.length > 0) {
      filteredTokens = prefixResults;
    } else {
      // Substring match on symbol or name
      const substringResults: TokenInfo[] = [];
      for (const token of tokens) {
        if (
          token.symbol.toLowerCase().includes(trimmedSearch) ||
          token.name.toLowerCase().includes(trimmedSearch)
        ) {
          substringResults.push(token);
          if (substringResults.length >= 50) break;
        }
      }
      filteredTokens = substringResults;
    }
  }

  return (
    <div className="fixed inset-0 bg-cyber-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark border border-cyber-green/30 rounded-md w-full max-w-md relative animate-fade-scale-in shadow-neon-green">
        <div className="flex justify-between items-center p-4 border-b border-cyber-green/20">
          <h2 className="text-cyber-green font-terminal text-lg">Select Token</h2>
          <button 
            onClick={onClose}
            className="text-cyber-green/70 hover:text-cyber-green transition-colors"
          >
            <FaTimesCircle />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              className="w-full bg-cyber-black border border-cyber-green/30 rounded-md pl-10 pr-4 py-2 text-white font-mono focus:border-cyber-green/50 focus:outline-none"
              placeholder="Search symbol or paste address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-green/50" />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-green/50 hover:text-cyber-green"
                onClick={() => setSearchTerm('')}
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {filteredTokens.length > 0 ? (
              filteredTokens.map(token => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 hover:bg-cyber-green/5 cursor-pointer border-b border-cyber-green/10 transition-colors"
                  onClick={() => onSelect(token)}
                >
                  <div className="flex items-center">
                    {token.logoURI ? (
                      <div className="w-8 h-8 rounded-full bg-cyber-gray flex items-center justify-center mr-3 border border-cyber-green/20">
                        <img src={token.logoURI} alt={token.symbol} className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-cyber-gray flex items-center justify-center mr-3 border border-cyber-green/20">
                        <span className="text-cyber-green font-bold">
                          {token.symbol.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-white font-terminal">{token.symbol}</div>
                      <div className="text-cyber-green/70 text-xs">{token.name}</div>
                    </div>
                  </div>
                  {token.balance && (
                    <div className="text-right">
                      <div className="text-white font-mono text-sm">
                        {token.balance}
                      </div>
                      {token.balanceUsd && (
                        <div className="text-cyber-green/70 text-xs">
                          ${token.balanceUsd}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : fallbackLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin border-t-2 border-cyber-green/50 rounded-full w-6 h-6 mx-auto mb-2"></div>
                <div className="text-cyber-green/50 font-terminal">Loading token info...</div>
              </div>
            ) : fallbackToken ? (
              <div
                key={fallbackToken.id}
                className="flex items-center justify-between p-3 hover:bg-cyber-green/5 cursor-pointer border-b border-cyber-green/10 transition-colors"
                onClick={() => onSelect(fallbackToken)}
              >
                <div className="flex items-center">
                  {fallbackToken.logoURI ? (
                    <div className="w-8 h-8 rounded-full bg-cyber-gray flex items-center justify-center mr-3 border border-cyber-green/20">
                      <img src={fallbackToken.logoURI} alt={fallbackToken.symbol} className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyber-gray flex items-center justify-center mr-3 border border-cyber-green/20">
                      <span className="text-cyber-green font-bold">
                        {fallbackToken.symbol.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-white font-terminal">{fallbackToken.symbol}</div>
                    <div className="text-cyber-green/70 text-xs">{fallbackToken.name}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-cyber-green/50 font-terminal mb-2">
                  No tokens found
                </div>
                <div className="text-cyber-green/30 text-sm">
                  Try a different search term
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 