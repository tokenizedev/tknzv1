import React, { useState, useEffect } from 'react';
import { AlertCircle, Terminal, Key, Lock, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../store';

export const WalletSetup: React.FC = () => {
  const { error, initializeWallet } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [binaryIndex, setBinaryIndex] = useState(0);
  
  const hackText = "INITIALIZING_SECURE_WALLET_CONNECTION";
  const binaryText = "01001011 01000101 01011001 00100000 01000111 01000101 01001110 01000101 01010010 01000001 01010100 01001001 01001111 01001110";
  
  useEffect(() => {
    if (isLoading) {
      const textInterval = setInterval(() => {
        setCharIndex((prev) => (prev < hackText.length - 1 ? prev + 1 : 0));
      }, 80);
      
      const binaryInterval = setInterval(() => {
        setBinaryIndex((prev) => (prev < binaryText.length - 1 ? prev + 1 : 0));
      }, 40);
      
      return () => {
        clearInterval(textInterval);
        clearInterval(binaryInterval);
      };
    }
  }, [isLoading]);

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      await initializeWallet();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-8 py-4 relative">
      {/* Terminal frame header */}
      <div className="leaderboard-frame w-full max-w-[320px] mx-auto">
        <div className="leaderboard-title text-center p-4 border-b border-cyber-green/30">
          TKNZ WALLET
        </div>
        
        <div className="p-6 space-y-6">
          {error && (
            <div className="terminal-window p-4 flex items-start space-x-2 text-cyber-pink">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-cyber-pink" />
              <div>
                <p className="text-sm text-cyber-pink font-terminal">ERROR_CODE: 0xE2A3</p>
                <p className="text-sm text-left font-terminal">{error}</p>
              </div>
            </div>
          )}
          
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 mx-auto relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Terminal className="w-16 h-16 text-cyber-green animate-pulse" />
                    <div className="absolute inset-0 border-2 border-cyber-green/30 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Key className="w-16 h-16 text-cyber-green" />
                    <div className="absolute bottom-1 right-1">
                      <Lock className="w-8 h-8 text-cyber-purple" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="leaderboard-title text-3xl">
                INITIALIZE
              </h1>
              
              <div className="text-cyber-green font-terminal text-sm">
                <div className="bg-cyber-dark border border-cyber-green/20 p-2 mb-2 text-left">
                  <span className="text-cyber-purple"></span>
                  <span className="text-cyber-green">
                    {isLoading ? (
                      <span>
                        {hackText.substring(0, charIndex)}
                        <span className="animate-terminal-cursor">_</span>
                      </span>
                    ) : (
                      "SECURE CRYPTOGRAPHIC KEY GENERATION"
                    )}
                  </span>
                </div>
                <p className="text-cyber-green/70 max-w-[280px] mx-auto text-center">
                  Create self-custody cryptographic wallet to tokenize assets on the Solana blockchain.
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCreateWallet}
            disabled={isLoading}
            className="btn-primary w-full max-w-[320px] flex items-center justify-center space-x-2 relative group overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-cyber-green/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            
            {isLoading ? (
              <div className="font-terminal flex items-center">
                <div className="animate-pulse mr-2">
                  <Terminal className="w-4 h-4" />
                </div>
                <span className="tracking-wide">GENERATING KEYS</span>
              </div>
            ) : (
              <div className="font-terminal flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span className="tracking-wide">GENERATE WALLET</span>
              </div>
            )}
          </button>
          
          {isLoading && (
            <div className="bg-cyber-dark p-2 overflow-hidden text-xs font-terminal text-left">
              <span className="text-cyber-purple"></span>
              <span className="text-cyber-green/70">
                {binaryText.substring(0, binaryIndex)}
                <span className="animate-terminal-cursor">_</span>
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-cyber-green/50 text-center font-terminal max-w-[320px] flex flex-col items-center">
        <div className="mb-1 border border-cyber-green/30 px-2 py-1 rounded-sm">
          <span className="text-cyber-purple">ENCRYPTION:</span> AES-256
        </div>
        <p>WALLET KEYS STORED LOCALLY IN ENCRYPTED FORMAT</p>
      </div>
    </div>
  );
};