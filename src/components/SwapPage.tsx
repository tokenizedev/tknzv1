import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

// Simple token list for selection, with TKNZ as primary token
const TOKENS = [
  { symbol: 'TKNZ', address: 'AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump' },
  { symbol: 'SOL',  address: 'So11111111111111111111111111111111111111112' },
  { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'USDT', address: 'Es9vMFrzaCERfNYKhgaKsWKkzcY591M4V1mB2BsWZUMH' },
];

// SwapPage component with basic UI and confirm modal
export const SwapPage: React.FC = () => {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Swap selected tokens
  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // When from amount changes, update to amount (1:1 placeholder)
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromAmount(val);
    setToAmount(val);
  };

  // Handle swap confirmation (placeholder)
  const handleConfirm = () => {
    console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
    setShowConfirm(false);
  };

  const isSwapDisabled = !fromAmount || parseFloat(fromAmount) <= 0;

  return (
    <div className="py-6">
      <h2 className="text-lg font-bold text-cyber-green mb-4">Token Swap</h2>
      <div className="space-y-4">
        {/* From input */}
        <div>
          <label className="block text-cyber-green text-sm mb-1">From</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-cyber-dark border border-cyber-green/30 rounded-sm px-2 py-1 text-cyber-green"
              value={fromAmount}
              onChange={handleFromAmountChange}
            />
            <select
              className="bg-cyber-dark border border-cyber-green/30 rounded-sm px-2 py-1 text-cyber-green"
              value={fromToken.address}
              onChange={(e) => {
                const tok = TOKENS.find((t) => t.address === e.target.value);
                if (tok) setFromToken(tok);
              }}
            >
              {TOKENS.map((tok) => (
                <option key={tok.address} value={tok.address} className="bg-cyber-dark">
                  {tok.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Swap arrow */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 bg-cyber-dark border border-cyber-green/30 hover:bg-cyber-green/10 rounded-full"
            title="Switch tokens"
          >
            <ArrowUpDown className="w-5 h-5 text-cyber-green" />
          </button>
        </div>
        {/* To input */}
        <div>
          <label className="block text-cyber-green text-sm mb-1">To</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="0.0"
              className="flex-1 bg-cyber-dark border border-cyber-green/30 rounded-sm px-2 py-1 text-cyber-green"
              value={toAmount}
              readOnly
            />
            <select
              className="bg-cyber-dark border border-cyber-green/30 rounded-sm px-2 py-1 text-cyber-green"
              value={toToken.address}
              onChange={(e) => {
                const tok = TOKENS.find((t) => t.address === e.target.value);
                if (tok) setToToken(tok);
              }}
            >
              {TOKENS.map((tok) => (
                <option key={tok.address} value={tok.address} className="bg-cyber-dark">
                  {tok.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Swap button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isSwapDisabled}
          className="w-full bg-cyber-green text-black font-bold py-2 rounded-sm hover:opacity-80 disabled:opacity-50"
        >
          Swap
        </button>
      </div>
      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
          <div className="bg-cyber-dark border border-cyber-green/30 rounded-sm p-4 w-80 space-y-4">
            <h3 className="text-lg font-bold text-cyber-green">Confirm Swap</h3>
            <p className="text-cyber-green">
              Swap <span className="font-bold">{fromAmount} {fromToken.symbol}</span> for{' '}
              <span className="font-bold">{toAmount} {toToken.symbol}</span>
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 bg-cyber-dark border border-cyber-green/30 rounded-sm text-cyber-green hover:bg-cyber-green/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-1 bg-cyber-green text-black font-bold rounded-sm hover:opacity-80"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};