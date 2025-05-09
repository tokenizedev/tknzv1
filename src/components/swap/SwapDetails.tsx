import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface SwapDetailsProps {
  rate?: string;
  fee?: string;
  slippage: string;
  estimatedGas?: string;
  minimumReceived?: string;
  onSlippageChange: (slippage: string) => void;
}

export const SwapDetails: React.FC<SwapDetailsProps> = ({
  rate,
  fee,
  slippage,
  estimatedGas,
  minimumReceived,
  onSlippageChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [customSlippage, setCustomSlippage] = useState(slippage);

  const handleSlippageChange = (value: string) => {
    setCustomSlippage(value);
    onSlippageChange(value);
  };

  const presetSlippages = ['0.5', '1.0', '3.0'];

  return (
    <div className="w-full bg-cyber-dark/50 rounded-md border border-cyber-green/20 overflow-hidden mt-3 transition-all">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer hover:bg-cyber-dark/70 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-cyber-green font-terminal">Swap Details</span>
        {expanded ? (
          <FaChevronUp className="text-cyber-green/70" />
        ) : (
          <FaChevronDown className="text-cyber-green/70" />
        )}
      </div>

      {expanded && (
        <div className="p-3 border-t border-cyber-green/20 animate-glitch-in">
          <div className="space-y-3">
            {rate && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 font-terminal text-sm">Rate</span>
                <span className="text-white font-mono text-sm">{rate}</span>
              </div>
            )}
            
            {fee && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 font-terminal text-sm">Swap Fee</span>
                <span className="text-white font-mono text-sm">{fee}</span>
              </div>
            )}
            
            {estimatedGas && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 font-terminal text-sm">Estimated Gas</span>
                <span className="text-white font-mono text-sm">{estimatedGas}</span>
              </div>
            )}
            
            {minimumReceived && (
              <div className="flex justify-between items-center">
                <span className="text-cyber-green/70 font-terminal text-sm">Minimum Received</span>
                <span className="text-white font-mono text-sm">{minimumReceived}</span>
              </div>
            )}
            
            <div className="pt-2 border-t border-cyber-green/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-cyber-green/70 font-terminal text-sm">Slippage Tolerance</span>
                <span className="text-white font-mono text-sm">{customSlippage}%</span>
              </div>
              
              <div className="flex gap-2">
                {presetSlippages.map((preset) => (
                  <button 
                    key={preset}
                    className={`px-3 py-1 text-xs rounded-md border transition-all ${
                      customSlippage === preset 
                        ? 'bg-cyber-green/20 border-cyber-green text-cyber-green' 
                        : 'bg-cyber-dark border-cyber-green/30 text-cyber-green/70 hover:border-cyber-green/50'
                    }`}
                    onClick={() => handleSlippageChange(preset)}
                  >
                    {preset}%
                  </button>
                ))}
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full bg-cyber-dark border border-cyber-green/30 rounded-md px-3 py-1 text-xs text-white font-mono focus:border-cyber-green/50 focus:outline-none"
                    placeholder="Custom"
                    value={!presetSlippages.includes(customSlippage) ? customSlippage : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleSlippageChange(value);
                      }
                    }}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-green/70 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 