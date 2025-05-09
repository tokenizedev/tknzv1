import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface TokenSelectorProps {
  tokenSymbol?: string;
  tokenName?: string;
  tokenLogo?: string;
  balance?: string;
  onClick: () => void;
  label: string;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokenSymbol,
  tokenName,
  tokenLogo,
  balance,
  onClick,
  label,
}) => {
  const hasToken = !!tokenSymbol;

  return (
    <div className="w-full">
      <div className="text-cyber-green/70 text-sm mb-1 font-terminal">{label}</div>
      <div 
        className="flex items-center justify-between bg-cyber-dark border border-cyber-green/30 rounded-md p-3 cursor-pointer hover:border-cyber-green/50 transition-all"
        onClick={onClick}
      >
        <div className="flex items-center">
          {hasToken ? (
            <>
              {tokenLogo ? (
                <div className="w-8 h-8 rounded-full bg-cyber-gray flex items-center justify-center mr-2 border border-cyber-green/20">
                  <img src={tokenLogo} alt={tokenSymbol} className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyber-gray flex items-center justify-center mr-2 border border-cyber-green/20">
                  <span className="text-cyber-green font-bold">{tokenSymbol?.charAt(0)}</span>
                </div>
              )}
              <div>
                <div className="font-terminal text-cyber-green text-lg">{tokenSymbol}</div>
                {tokenName && <div className="text-cyber-green/70 text-xs">{tokenName}</div>}
              </div>
            </>
          ) : (
            <div className="text-cyber-green font-terminal">Select Token</div>
          )}
        </div>
        <div className="flex items-center">
          {hasToken && balance && (
            <div className="text-cyber-green/70 mr-2 font-mono text-sm">{balance}</div>
          )}
          <FaChevronDown className="text-cyber-green/70" />
        </div>
      </div>
    </div>
  );
}; 