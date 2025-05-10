import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExternalLinkAlt, FaSpinner, FaTimesCircle } from 'react-icons/fa';

export type SwapStatusType = 'pending' | 'success' | 'error';

interface SwapStatusProps {
  status: SwapStatusType;
  fromToken: {
    symbol: string;
    amount: string;
  };
  toToken: {
    symbol: string;
    amount: string;
  };
  transactionHash?: string;
  errorMessage?: string;
  onClose: () => void;
  explorerUrl?: string;
}

export const SwapStatus: React.FC<SwapStatusProps> = ({
  status,
  fromToken,
  toToken,
  transactionHash,
  errorMessage,
  onClose,
  explorerUrl,
}) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <FaSpinner className="animate-cyber-spin text-cyber-blue text-3xl" />,
          title: 'Transaction Pending',
          description: 'Your swap is being processed. This may take a few moments.',
          btnText: 'Close',
        };
      case 'success':
        return {
          icon: <FaCheckCircle className="text-cyber-green text-3xl" />,
          title: 'Swap Successful',
          description: `Successfully swapped ${fromToken.amount} ${fromToken.symbol} for ${toToken.amount} ${toToken.symbol}.`,
          btnText: 'Done',
        };
      case 'error':
        return {
          icon: <FaExclamationCircle className="text-cyber-orange text-3xl" />,
          title: 'Swap Failed',
          description: errorMessage || 'There was an error processing your swap. Please try again.',
          btnText: 'Close',
        };
      default:
        return {
          icon: null,
          title: '',
          description: '',
          btnText: 'Close',
        };
    }
  };

  const { icon, title, description, btnText } = getStatusDisplay();

  return (
    <div className="fixed inset-0 bg-cyber-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark border border-cyber-green/30 rounded-md w-full max-w-md relative animate-fade-scale-in shadow-terminal">
        <div className="flex justify-between items-center p-4 border-b border-cyber-green/20">
          <h2 className="text-cyber-green font-terminal text-lg">{title}</h2>
          <button 
            onClick={onClose}
            className="text-cyber-green/70 hover:text-cyber-green transition-colors"
          >
            <FaTimesCircle />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="mb-4">{icon}</div>
            <div className="text-center text-white mb-2">{description}</div>
            
            {transactionHash && (
              <div className="mt-4 w-full">
                <div className="text-cyber-green/70 text-sm mb-1 font-terminal">Transaction Hash</div>
                <div className="bg-cyber-black/50 border border-cyber-green/20 rounded-md p-2 flex items-center justify-between">
                  <div className="text-cyber-green/90 font-mono text-xs overflow-hidden text-ellipsis">
                    {transactionHash.slice(0, 12)}...{transactionHash.slice(-10)}
                  </div>
                  {explorerUrl && (
                    <a 
                      href={`${explorerUrl}/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyber-blue hover:text-cyber-blue-dark ml-2"
                      title="View on Explorer"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-cyber-green text-cyber-black rounded-md font-terminal hover:bg-cyber-green-dark transition-all shadow-neon-green"
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}; 