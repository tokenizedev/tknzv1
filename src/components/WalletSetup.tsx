import React, { useState } from 'react';
import { ArrowRight, AlertCircle, Loader2, Rocket } from 'lucide-react';
import { useStore } from '../store';

export const WalletSetup: React.FC = () => {
  const { error, initializeWallet } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      await initializeWallet();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-10 py-8">
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl p-4 flex items-start space-x-2 text-red-700 max-w-[300px] mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-left">{error}</p>
        </div>
      )}
      
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-400/20 blur-2xl rounded-full"></div>
          <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-2xl shadow-inner">
            <Rocket className="w-16 h-16 text-purple-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
            Tokenize
          </h1>
          <p className="text-xl font-medium text-purple-600">Stop Racing, Start Winning</p>
          <p className="text-gray-600 max-w-[300px] mx-auto">
            Be the first to tokenize the news with Tokenize. 2 clicks to Pump.Fun
          </p>
        </div>
      </div>

      <button 
        onClick={handleCreateWallet}
        disabled={isLoading}
        className="btn-primary w-full max-w-[300px] flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Wallet...</span>
          </>
        ) : (
          <>
            <ArrowRight className="w-5 h-5" />
            <span>Get Started</span>
          </>
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Your wallet will be created securely and stored locally
      </p>
    </div>
  );
};