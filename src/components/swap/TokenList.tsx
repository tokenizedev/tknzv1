import React, { useState } from 'react';
import { FaSearch, FaTimesCircle } from 'react-icons/fa';

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
  
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search name or paste address"
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
                        <span className="text-cyber-green font-bold">{token.symbol.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-white font-terminal">{token.symbol}</div>
                      <div className="text-cyber-green/70 text-xs">{token.name}</div>
                    </div>
                  </div>
                  {token.balance && (
                    <div className="text-right">
                      <div className="text-white font-mono text-sm">{token.balance}</div>
                      {token.balanceUsd && (
                        <div className="text-cyber-green/70 text-xs">${token.balanceUsd}</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-cyber-green/50 font-terminal mb-2">No tokens found</div>
                <div className="text-cyber-green/30 text-sm">Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 