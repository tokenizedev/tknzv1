import React from 'react';
import Jdenticon from 'react-jdenticon';
import { Users, Copy, CheckCircle, X } from 'lucide-react';
import { WalletInfo } from '../types';

// Add declaration for react-jdenticon to fix type error
declare module 'react-jdenticon';

interface WalletDrawerProps {
  isOpen: boolean;
  wallets: WalletInfo[];
  onClose: () => void;
  onSelectWallet: (walletId: string) => void;
  onManageWallets: () => void;
  onCopyAddress: (address: string) => void;
  copiedWallet: string | null;
}

export const WalletDrawer: React.FC<WalletDrawerProps> = ({
  isOpen,
  wallets,
  onClose,
  onSelectWallet,
  onManageWallets,
  onCopyAddress,
  copiedWallet
}) => {
  return (
    <div 
      className={`fixed top-14 left-0 bottom-0 z-20 transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-cyber-black/70 backdrop-blur-sm transition-opacity duration-300 z-0"
          onClick={onClose}
        />
      )}
      
      {/* Drawer panel */}
      <div 
        className="relative w-80 max-w-[80vw] bg-cyber-black border-r border-cyber-green/50 shadow-neon-green h-full flex flex-col z-10 overflow-hidden"
        style={{
          boxShadow: '0 0 15px 0 rgba(0, 255, 160, 0.3)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          willChange: 'transform',
        }}
      >
        {/* Drawer header */}
        <div 
          className="p-4 border-b border-cyber-green/20 flex justify-between items-center bg-cyber-black/90 backdrop-blur-md"
          style={{
            boxShadow: '0 1px 0 0 rgba(0, 255, 160, 0.1)'
          }}
        >
          <button
            onClick={onManageWallets}
            className="text-left flex items-center text-cyber-green hover:text-cyber-purple transition-all group"
          >
            <Users className="w-4 h-4 mr-2 group-hover:text-cyber-purple transition-colors" />
            <span className="font-terminal text-sm group-hover:translate-x-0.5 transition-transform duration-150">MANAGE WALLETS</span>
          </button>
          <button 
            onClick={onClose}
            className="text-cyber-green/80 hover:text-cyber-green p-1.5 rounded-full hover:bg-cyber-green/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Wallet list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black">
          {wallets.map((wallet, index) => (
            <div
              key={wallet.id}
              className={`p-3 flex items-center hover:bg-cyber-green/10 cursor-pointer border-b border-cyber-green/10 transition-all duration-200 ${
                wallet.isActive ? 'bg-cyber-green/10 text-cyber-green' : 'text-cyber-green/80'
              }`}
              style={{
                animation: isOpen ? `walletItemSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards ${0.1 + index * 0.05}s` : 'none',
                opacity: isOpen ? 1 : 0,
              }}
            >
              {/* Avatar and select area */}
              <div 
                className="flex items-center flex-1 transition-transform hover:translate-x-1 duration-150"
                onClick={() => onSelectWallet(wallet.id)}
              >
                <div className="mr-3 relative">
                  <div className={`absolute inset-0 rounded-full ${wallet.isActive ? 'animate-cyber-pulse' : ''}`} 
                      style={{ 
                        boxShadow: wallet.isActive ? '0 0 0 2px rgba(0, 255, 160, 0.3)' : 'none',
                      }} 
                  />
                  {wallet.avatar ? (
                    wallet.avatar.startsWith('data:') ? (
                      <img
                        src={wallet.avatar}
                        alt={`${wallet.name} avatar`}
                        className="w-8 h-8 rounded-full relative z-10"
                      />
                    ) : (
                      <Jdenticon size={32} value={wallet.avatar} className="rounded-full relative z-10" />
                    )
                  ) : (
                    <Jdenticon size={32} value={wallet.id} className="rounded-full relative z-10" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="font-terminal text-sm truncate">
                    {wallet.name}
                  </div>
                  <div className="text-xs text-cyber-green/60 font-mono truncate">
                    {wallet.publicKey.substring(0, 6)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
                  </div>
                </div>
              </div>
              
              {/* Copy button */}
              <button
                onClick={() => onCopyAddress(wallet.publicKey)}
                className="p-2 text-cyber-green/70 hover:text-cyber-green hover:bg-cyber-green/10 rounded-full relative transition-colors duration-150"
              >
                {copiedWallet === wallet.publicKey ? (
                  <CheckCircle className="w-4 h-4 text-cyber-purple animate-pulse-fast" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 