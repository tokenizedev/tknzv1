import React from 'react';
import { FaArrowDown, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

interface SwapConfirmationProps {
  fromToken: {
    symbol: string;
    amount: string;
    logoUrl?: string;
    fiatValue?: string;
  };
  toToken: {
    symbol: string;
    amount: string;
    logoUrl?: string;
    fiatValue?: string;
  };
  rate: string;
  priceImpact: string;
  fee?: string;
  estimatedGas?: string;
  minimumReceived?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SwapConfirmation: React.FC<SwapConfirmationProps> = ({
  fromToken,
  toToken,
  rate,
  priceImpact,
  fee,
  estimatedGas,
  minimumReceived,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const isPriceImpactHigh = parseFloat(priceImpact) > 5;

  return (
    <div className="fixed inset-0 bg-cyber-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark border border-cyber-green/30 rounded-md w-full max-w-md relative animate-fade-scale-in shadow-terminal">
        <div className="flex justify-between items-center p-4 border-b border-cyber-green/20">
          <h2 className="text-cyber-green font-terminal text-lg">Confirm Swap</h2>
          <button 
            onClick={onCancel}
            className="text-cyber-green/70 hover:text-cyber-green transition-colors"
          >
            <FaTimesCircle />
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-cyber-black/50 border border-cyber-green/20 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center">
                  {fromToken.logoUrl && (
                    <img src={fromToken.logoUrl} alt={fromToken.symbol} className="w-6 h-6 mr-2 rounded-full" />
                  )}
                  <span className="text-white font-terminal">{fromToken.symbol}</span>
                </div>
                <div className="text-cyber-green/70 text-xs mt-1">You pay</div>
              </div>
              <div className="text-right">
                <div className="text-white font-terminal text-lg">{fromToken.amount}</div>
                {fromToken.fiatValue && (
                  <div className="text-cyber-green/70 text-xs">≈ ${fromToken.fiatValue}</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center my-2">
              <div className="w-8 h-8 bg-cyber-green/10 rounded-full flex items-center justify-center">
                <FaArrowDown className="text-cyber-green" />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center">
                  {toToken.logoUrl && (
                    <img src={toToken.logoUrl} alt={toToken.symbol} className="w-6 h-6 mr-2 rounded-full" />
                  )}
                  <span className="text-white font-terminal">{toToken.symbol}</span>
                </div>
                <div className="text-cyber-green/70 text-xs mt-1">You receive</div>
              </div>
              <div className="text-right">
                <div className="text-white font-terminal text-lg">{toToken.amount}</div>
                {toToken.fiatValue && (
                  <div className="text-cyber-green/70 text-xs">≈ ${toToken.fiatValue}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-cyber-green/70 text-sm">
                <span className="font-terminal">Rate</span>
              </div>
              <span className="text-white text-sm font-mono">{rate}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-cyber-green/70 text-sm">
                <span className="font-terminal">Price Impact</span>
                {isPriceImpactHigh && (
                  <div className="text-cyber-orange ml-1 flex items-center" title="High price impact">
                    <FaInfoCircle size={12} />
                  </div>
                )}
              </div>
              <span className={`text-sm font-mono ${
                isPriceImpactHigh 
                  ? 'text-cyber-orange' 
                  : parseInt(priceImpact) > 2 
                    ? 'text-cyber-yellow' 
                    : 'text-white'
              }`}>{priceImpact}%</span>
            </div>
            
            {fee && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 text-sm font-terminal">Swap Fee</span>
                <span className="text-white text-sm font-mono">{fee}</span>
              </div>
            )}
            
            {estimatedGas && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 text-sm font-terminal">Estimated Gas</span>
                <span className="text-white text-sm font-mono">{estimatedGas}</span>
              </div>
            )}
            
            {minimumReceived && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 text-sm font-terminal">Minimum Received</span>
                <span className="text-white text-sm font-mono">{minimumReceived}</span>
              </div>
            )}
          </div>
          
          {isPriceImpactHigh && (
            <div className="bg-cyber-orange/10 border border-cyber-orange/30 rounded-md p-3 mb-4 text-sm text-cyber-orange">
              <div className="flex items-start">
                <FaInfoCircle className="mt-0.5 mr-2 flex-shrink-0" />
                <span>
                  The price impact is high. You might get significantly less tokens than expected.
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-cyber-dark border border-cyber-green/30 text-cyber-green/70 rounded-md font-terminal hover:bg-cyber-green/10 hover:text-cyber-green transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 bg-cyber-green text-cyber-black rounded-md font-terminal hover:bg-cyber-green-dark transition-all shadow-neon-green
                        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Confirm Swap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 