import React, { useState } from "react";
import { useStore } from '../store';
import { Copy, CheckCircle } from 'lucide-react';

interface InsufficientFundsModalProps {
  balance: number;
  onClose: (visible: boolean) => void;
  tryAgain: () => void;
}

export const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({ onClose, tryAgain, balance }) => {
  const { wallet } = useStore();

  if (!wallet) return null;
  const publicKey = wallet.publicKey.toString();
  const [copied, setCopied] = useState(false);
  // state for shake (jitter) effect on retry failure
  const [shake, setShake] = useState(false);

  const handleClose = () => {
    onClose(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  /**
   * Handle retry action: invoke tryAgain and trigger shake effect if retry fails
   */
  const handleTryAgain = () => {
    // invoke parent retry logic
    tryAgain();
    // trigger shake animation to indicate retry (e.g., if still insufficient funds)
    setShake(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 font-mono text-terminal-green flex justify-center items-center m-0 p-0">
      {/* modal box, apply short shake animation on retry failure */}
      <div
        className={
          // apply short glitch-in (shake) effect when retry fails
          `w-11/12 max-w-md bg-terminal-black border border-terminal-green shadow-lg shadow-terminal-green/30 rounded overflow-hidden ${shake ? 'animate-glitch-in' : ''}`
        }
        onAnimationEnd={() => {
          if (shake) {
            // reset shake state after animation completes
            setShake(false);
          }
        }}
      >
        <div className="bg-terminal-green bg-opacity-10 px-4 py-3 border-b border-terminal-green flex justify-between items-center">
          <h3 className="text-base font-bold uppercase m-0">HODL Up...</h3>
          <button
            className="bg-transparent border-none text-terminal-green text-lg cursor-pointer"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        <div className="p-5">
          <p className="mb-5 leading-relaxed">
            <span className="animate-blink inline-block">&gt;</span>{" "}
            Need <span className="font-bold">0.03 SOL</span> to create a meme coin. Current balance:{" "}
            <span className="font-bold">{balance.toFixed(2)} SOL</span>
          </p>

          <div className="bg-terminal-green bg-opacity-5 border border-dashed border-terminal-green p-3 rounded text-sm break-all mb-5">
            <span className="inline-flex items-center gap-2">
              {publicKey}
              {copied ? (
                <CheckCircle className="w-5 h-5 text-cyber-purple animate-pulse-fast" />
              ) : (
                <button
                  onClick={copyToClipboard}
                  className="text-base cursor-pointer hover:text-terminal-green/70 transition"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5 text-terminal-green" />
                </button>
              )}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 bg-terminal-green bg-opacity-10 border border-terminal-green text-terminal-green py-2.5 px-2.5 cursor-pointer font-mono text-sm uppercase transition-colors duration-200 hover:bg-terminal-green hover:bg-opacity-20"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button onClick={handleTryAgain} className="flex-1 bg-terminal-green bg-opacity-20 border border-terminal-green text-terminal-green py-2.5 px-2.5 cursor-pointer font-mono text-sm uppercase transition-colors duration-200 hover:bg-terminal-green hover:bg-opacity-30">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
