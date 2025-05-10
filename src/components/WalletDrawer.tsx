import React from 'react';
import Jdenticon from 'react-jdenticon';
import { Users, Copy, CheckCircle, X, Settings } from 'lucide-react';
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
  onViewWallet: (walletId: string) => void;
}

export const WalletDrawer: React.FC<WalletDrawerProps> = ({
  isOpen,
  wallets,
  onClose,
  onSelectWallet,
  onManageWallets,
  onCopyAddress,
  copiedWallet
  , onViewWallet
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
          className="fixed inset-0 bg-cyber-black/80 backdrop-blur-md transition-opacity duration-300 z-0"
          onClick={onClose}
        />
      )}
      
      {/* Drawer panel */}
      <div 
        className="relative w-80 max-w-[80vw] bg-cyber-black border-r border-cyber-green/70 h-full flex flex-col z-10 overflow-hidden"
        style={{
          boxShadow: isOpen ? '0 0 20px 0 rgba(0, 255, 160, 0.4), 0 0 2px 1px rgba(0, 255, 160, 0.3) inset' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          willChange: 'transform',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #131313 100%)'
        }}
      >
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-green/20 via-cyber-green to-cyber-green/20"></div>
        
        {/* Drawer header */}
        <div 
          className="p-4 border-b border-cyber-green/30 flex justify-between items-center bg-cyber-black/90 backdrop-blur-md"
          style={{
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.4)',
            background: 'linear-gradient(180deg, rgba(15, 15, 15, 0.95) 0%, rgba(10, 10, 10, 0.9) 100%)'
          }}
        >
          <button
            onClick={onManageWallets}
            className="text-left flex items-center px-3 py-2 rounded bg-gradient-to-r from-cyber-green/20 to-cyber-purple/20 border border-cyber-green/40 hover:border-cyber-green/70 text-cyber-green transition-all group hover:shadow-[0_0_8px_rgba(0,255,160,0.4)] active:translate-y-[1px]"
          >
            <Users className="w-4 h-4 mr-2 group-hover:text-cyber-purple transition-colors" />
            <span className="font-terminal text-sm font-bold tracking-wider group-hover:translate-x-0.5 transition-transform duration-150">MANAGE WALLETS</span>
          </button>
          <button 
            onClick={onClose}
            className="text-cyber-green/80 hover:text-cyber-green p-1.5 rounded-full hover:bg-cyber-green/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Wallet list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black">
          {wallets.map((wallet, index) => (
            <div
              key={wallet.id}
              className={`p-3 flex items-center hover:bg-cyber-green/10 cursor-pointer border-b border-cyber-green/10 transition-all duration-200 ${
                wallet.isActive ? 'bg-gradient-to-r from-cyber-green/10 to-transparent text-cyber-green' : 'text-cyber-green/80'
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
                        boxShadow: wallet.isActive ? '0 0 0 2px rgba(0, 255, 160, 0.4)' : 'none',
                      }} 
                  />
                  <div className={`absolute inset-0 rounded-full ${wallet.isActive ? 'animate-ping opacity-30' : 'opacity-0'}`}
                      style={{
                        backgroundColor: wallet.isActive ? 'rgba(0, 255, 160, 0.2)' : 'transparent',
                        animationDuration: '2s'
                      }}
                  />
                  {wallet.avatar ? (
                    wallet.avatar.startsWith('data:') ? (
                      <img
                        src={wallet.avatar}
                        alt={`${wallet.name} avatar`}
                        className="w-10 h-10 rounded-full relative z-10 border-2 border-cyber-green/30"
                      />
                    ) : (
                      <Jdenticon size={40} value={wallet.avatar} className="rounded-full relative z-10 border-2 border-cyber-green/30" />
                    )
                  ) : (
                    <Jdenticon size={40} value={wallet.id} className="rounded-full relative z-10 border-2 border-cyber-green/30" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="font-terminal text-base font-bold truncate">
                    {wallet.name}
                    {wallet.isActive && <span className="ml-2 text-xs text-cyber-purple px-1.5 py-0.5 bg-cyber-purple/10 rounded-sm border border-cyber-purple/20">ACTIVE</span>}
                  </div>
                  <div className="text-xs text-cyber-green/60 font-mono truncate">
                    {wallet.publicKey.substring(0, 6)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
                  </div>
                </div>
              </div>
              
              {/* Copy button */}
              {/* Settings button: view wallet details */}
              <button
                onClick={() => onViewWallet(wallet.id)}
                className="p-2 text-cyber-green/70 hover:text-cyber-green hover:bg-cyber-green/10 rounded-full transition-colors duration-150 ml-2"
                title="Wallet Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {/* Copy button: copy wallet address */}
              <button
                onClick={() => onCopyAddress(wallet.publicKey)}
                className="p-2 text-cyber-green/70 hover:text-cyber-green hover:bg-cyber-green/10 rounded-full relative transition-colors duration-150 ml-2"
              >
                {copiedWallet === wallet.publicKey ? (
                  <CheckCircle className="w-5 h-5 text-cyber-purple animate-pulse-fast" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 