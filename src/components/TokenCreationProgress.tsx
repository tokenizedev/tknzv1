import React from 'react';
import { Terminal } from 'lucide-react';
import { TerminalLoader } from './TerminalLoader';

interface TokenCreationProgressProps {
  progress: number;
  onComplete?: (success: boolean) => void;
}

export const TokenCreationProgress: React.FC<TokenCreationProgressProps> = ({ 
  progress,
  onComplete
}) => {
  // Determine the current stage based on progress
  const getCurrentStage = () => {
    if (progress < 30) return "Initializing transaction...";
    if (progress < 60) return "Generating token metadata...";
    if (progress < 90) return "Sending to blockchain...";
    return "Finalizing creation...";
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 bg-cyber-black/80 border border-cyber-green/30 rounded-md shadow-terminal">
        <div className="text-center mb-6">
          <h3 className="font-terminal text-xl text-cyber-green mb-2">TOKENIZING</h3>
          <p className="text-sm text-cyber-green/70 font-terminal">Creating your token on the blockchain...</p>
        </div>
        
        <div className="space-y-5">
          {/* Using the existing TerminalLoader component */}
          <TerminalLoader text={getCurrentStage()} progress={progress} />
          
          <div className="font-terminal text-sm text-cyber-green mt-4 flex items-center justify-between">
            <div className="animate-pulse">
              <Terminal className="w-4 h-4 text-cyber-green" />
            </div>
            <span className="text-xs text-cyber-green/70">TKNZ.FUN</span>
          </div>

          <div className="border border-cyber-green/20 rounded p-3 bg-cyber-black/50">
            <p className="font-terminal text-xs text-cyber-purple overflow-hidden">
              {/* Show different explanatory texts based on progress */}
              {progress < 30 && "Preparing transaction for the Solana blockchain..."}
              {progress >= 30 && progress < 60 && "Building metadata for your token on IPFS..."}
              {progress >= 60 && progress < 90 && "Creating token on Pump.fun..."}
              {progress >= 90 && "Waiting for confirmation..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCreationProgress; 