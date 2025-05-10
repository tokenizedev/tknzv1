import React, { useState, useEffect, ChangeEvent } from 'react';
import Jdenticon from 'react-jdenticon';
import { ChevronDown, ChevronUp, Plus, Pen, Trash2, Key, Shield, Check, X, Zap, Download, ArrowLeft, TerminalSquare, Lock } from 'lucide-react';
import { useStore } from '../store';
import { WalletInfo } from '../types';
import { ImportWalletForm } from './ImportWalletForm';
import CreateWalletForm from './CreateWalletForm';
import BackupMnemonicModal from './BackupMnemonicModal';

// Add TypeScript declaration for react-jdenticon to fix the error
declare module 'react-jdenticon' {
  export interface JdenticonProps {
    size?: number;
    value: string;
    className?: string;
  }
  const Jdenticon: React.FC<JdenticonProps>;
  export default Jdenticon;
}

interface WalletManagerPageProps {
  onBack: () => void;
}

type WalletTab = 'list' | 'create' | 'import';

export const WalletManagerPage: React.FC<WalletManagerPageProps> = ({ onBack }) => {
  const { wallets, activeWallet, createNewWallet, importWallet, switchWallet, removeWallet, renameWallet, updateWalletAvatar } = useStore();
  const [activeTab, setActiveTab] = useState<WalletTab>('list');
  
  // Create wallet state
  const [newWalletName, setNewWalletName] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  // Generate a random seed for identicon avatar
  const generateNewAvatar = () => {
    // create a short random string as identicon seed
    const randomSeed = Math.random().toString(36).substring(2, 12);
    setNewAvatar(randomSeed);
  };
  
  // Editing state
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedWalletId, setExpandedWalletId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  // Captured mnemonic for new wallet backup
  const [createdMnemonic, setCreatedMnemonic] = useState<string | null>(null);
  // Mnemonic copy state
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  
  // Error and success states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [glitching, setGlitching] = useState(false);
  
  // Glitch interval for title
  const [headerGlitch, setHeaderGlitch] = useState(false);

  // Random glitch effect for header
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7;
      if (shouldGlitch) {
        setHeaderGlitch(true);
        setTimeout(() => setHeaderGlitch(false), 150);
      }
    }, 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  // Add glitch effect when changing tabs
  const triggerGlitch = () => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 200);
  };

  // Reset states when component unmounts or when necessary
  useEffect(() => {
    return () => {
      setEditingWalletId(null);
      setExpandedWalletId(null);
      setConfirmingDelete(null);
    };
  }, []);

  // Clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  // Avatar update handlers
  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>, walletId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        try {
          await updateWalletAvatar(walletId, result);
          setSuccessMessage('Avatar updated successfully');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update avatar');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateRandomAvatar = async (walletId: string) => {
    const randomSeed = Math.random().toString(36).substring(2, 12);
    try {
      await updateWalletAvatar(walletId, randomSeed);
      setSuccessMessage('Avatar updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
    }
  };

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      setError('Wallet name cannot be empty');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      // Create wallet and obtain mnemonic for user backup
      const created = await createNewWallet(newWalletName.trim());
      if (newAvatar) {
        await updateWalletAvatar(created.id, newAvatar);
      }
      // Clear inputs but hold off navigation until user backs up mnemonic
      setNewWalletName('');
      setNewAvatar(null);
      setCreatedMnemonic(created.mnemonic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportSuccess = () => {
    setActiveTab('list');
    triggerGlitch();
    setSuccessMessage('Wallet imported successfully');
  };

  const handleSwitchWallet = async (walletId: string) => {
    try {
      await switchWallet(walletId);
      triggerGlitch();
      setSuccessMessage('Switched wallet successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch wallet');
    }
  };

  const handleEditWallet = (wallet: WalletInfo) => {
    setEditingWalletId(wallet.id);
    setEditName(wallet.name);
    setExpandedWalletId(wallet.id);
  };

  const saveWalletName = async (walletId: string) => {
    if (!editName.trim()) {
      setError('Wallet name cannot be empty');
      return;
    }

    try {
      await renameWallet(walletId, editName.trim());
      setEditingWalletId(null);
      triggerGlitch();
      setSuccessMessage('Wallet renamed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename wallet');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    try {
      await removeWallet(walletId);
      setConfirmingDelete(null);
      setExpandedWalletId(null);
      triggerGlitch();
      setSuccessMessage('Wallet removed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove wallet');
    }
  };

  const toggleWalletExpansion = (walletId: string) => {
    setExpandedWalletId(expandedWalletId === walletId ? null : walletId);
    setConfirmingDelete(null); // Reset delete confirmation when toggling
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <CreateWalletForm
            name={newWalletName}
            avatar={newAvatar}
            isCreating={isCreating}
            onNameChange={setNewWalletName}
            onAvatarChange={setNewAvatar}
            onGenerateAvatar={generateNewAvatar}
            onSubmit={handleCreateWallet}
            onCancel={() => {
              // reset create form state on cancel
              setNewWalletName('');
              setNewAvatar(null);
              setActiveTab('list');
              triggerGlitch();
            }}
          />
        );
      case 'import':
        return (
          <ImportWalletForm 
            onSuccess={handleImportSuccess}
            onCancel={() => {
              setActiveTab('list');
              triggerGlitch();
            }}
          />
        );
        
      default: // 'list'
        return (
          <div className="space-y-4">
            <div className="border border-cyber-green/30 p-4 rounded-sm bg-gradient-to-b from-cyber-black to-cyber-black/70 relative overflow-hidden">
              {/* Terminal-like decoration */}
              <div className="absolute top-0 left-0 w-full h-1 flex space-x-1 p-0.5">
                <div className="w-1 h-1 rounded-full bg-cyber-green/70"></div>
                <div className="w-1 h-1 rounded-full bg-cyber-pink/70"></div>
                <div className="w-1 h-1 rounded-full bg-cyber-purple/70"></div>
              </div>
              
              {/* Terminal prompt decoration */}
              <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center">
                <TerminalSquare className="w-4 h-4 mr-1" />
                <span className="text-cyber-green/70 mr-1">$&gt;</span>
                YOUR WALLETS [{wallets.length}]
              </h3>
              
              {wallets.length === 0 ? (
                <div className="text-cyber-green/60 font-terminal text-xs italic p-4 border border-dashed border-cyber-green/20 bg-cyber-black/30 rounded-sm">
                  <div className="flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2 text-cyber-green/40" />
                    <span>No wallets available. Create your first wallet below.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black/50">
                  {wallets.map((wallet) => (
                    <div 
                      key={wallet.id}
                      className={`wallet-item border backdrop-blur-sm ${wallet.isActive 
                        ? 'border-cyber-green bg-gradient-to-r from-cyber-green/20 to-cyber-green/5 shadow-[0_0_8px_rgba(0,255,100,0.2)]' 
                        : 'border-cyber-green/20 hover:border-cyber-green/50 bg-cyber-black/40'
                      } rounded-sm transition-all duration-200 overflow-hidden`}
                    >
                      {/* Wallet header */}
                      <div className={`flex items-center justify-between p-2 relative ${wallet.isActive ? 'text-glow-green' : ''}`}>
                        {/* Animation frame for active wallet */}
                        {wallet.isActive && (
                          <div className="absolute inset-0 border border-cyber-green/30 rounded-sm animate-pulse-slow opacity-70 pointer-events-none"></div>
                        )}
                        
                        <div 
                          className="flex-1 cursor-pointer flex items-center"
                          onClick={() => toggleWalletExpansion(wallet.id)}
                        >
                          <div className="mr-2">
                            {expandedWalletId === wallet.id ? 
                              <ChevronUp className="w-4 h-4 text-cyber-green" /> : 
                              <ChevronDown className="w-4 h-4 text-cyber-green/70" />
                            }
                          </div>
                          
                          <div className="flex items-center flex-1">
                            {wallet.avatar && (
                              <div className="mr-2 flex-shrink-0">
                                {wallet.avatar.startsWith('data:') ? (
                                  <img src={wallet.avatar} alt={wallet.name} className="w-6 h-6 rounded-full border border-cyber-green/30" />
                                ) : (
                                  <div className="border border-cyber-green/30 rounded-full p-0.5">
                                    <Jdenticon size={24} value={wallet.avatar} className="rounded-full" />
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex-1">
                              {editingWalletId === wallet.id ? (
                                <input 
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="bg-cyber-black/80 border-b border-cyber-green text-cyber-green font-terminal w-full text-sm px-1 py-0.5 focus:outline-none focus:border-cyber-purple"
                                  autoFocus
                                />
                              ) : (
                                <div className="font-terminal text-sm group flex items-center">
                                  {wallet.name}
                                  {wallet.isActive && (
                                    <span className="ml-2 text-xs text-cyber-green bg-cyber-green/10 px-1.5 py-0.5 rounded-sm border border-cyber-green/30 animate-pulse-slow group-hover:animate-none">ACTIVE</span>
                                  )}
                                </div>
                              )}
                              
                              <div className="text-xs text-cyber-green/60 font-mono truncate flex items-center">
                                <span className="mr-1 text-cyber-green/40">0x</span>
                                {wallet.publicKey.substring(0, 12)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {!wallet.isActive && (
                          <button
                            onClick={() => handleSwitchWallet(wallet.id)}
                            className="p-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 text-cyber-green rounded-sm ml-2 transition-colors hover:shadow-[0_0_8px_rgba(0,255,100,0.3)] border border-cyber-green/30"
                            title="Switch to this wallet"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Expanded wallet details */}
                      {expandedWalletId === wallet.id && (
                        <div className="bg-cyber-black/40 border-t border-cyber-green/20 p-3 space-y-3 animate-slide-down relative overflow-hidden">
                          {/* Grid decoration */}
                          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-6 opacity-5 pointer-events-none">
                            {Array.from({ length: 144 }).map((_, i) => (
                              <div key={i} className="w-full h-full border-b border-r border-cyber-green/30"></div>
                            ))}
                          </div>
                          
                          {editingWalletId === wallet.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveWalletName(wallet.id)}
                                className="flex-1 p-2 bg-cyber-green/10 text-cyber-green border border-cyber-green/50 rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-xs hover:shadow-[0_0_8px_rgba(0,255,100,0.2)]"
                              >
                                SAVE NAME
                              </button>
                              <button
                                onClick={() => setEditingWalletId(null)}
                                className="p-2 border border-cyber-green/30 text-cyber-green/70 rounded-sm hover:text-cyber-green hover:border-cyber-green/50 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditWallet(wallet)}
                                className="flex-1 p-2 bg-cyber-black text-cyber-green/80 border border-cyber-green/30 rounded-sm hover:bg-cyber-green/10 hover:text-cyber-green hover:border-cyber-green/50 transition-colors font-terminal text-xs flex items-center justify-center hover:shadow-[0_0_8px_rgba(0,255,100,0.15)]"
                              >
                                <Pen className="w-3 h-3 mr-1" />
                                RENAME
                              </button>
                              
                              {!wallet.isActive && wallets.length > 1 && (
                                <button
                                  onClick={() => setConfirmingDelete(wallet.id)}
                                  className="flex-1 p-2 bg-cyber-black text-cyber-pink/80 border border-cyber-pink/30 rounded-sm hover:bg-cyber-pink/10 hover:text-cyber-pink hover:border-cyber-pink/50 transition-colors font-terminal text-xs flex items-center justify-center hover:shadow-[0_0_8px_rgba(255,50,100,0.15)]"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  REMOVE
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Delete confirmation */}
                          {confirmingDelete === wallet.id && (
                            <div className="animate-slide-down">
                              <div className="bg-cyber-pink/10 border border-cyber-pink/50 p-2 rounded-sm mb-2">
                                <p className="text-xs text-cyber-pink font-terminal">
                                  This will permanently delete the wallet. Are you sure?
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDeleteWallet(wallet.id)}
                                  className="flex-1 p-2 bg-cyber-pink/20 text-cyber-pink border border-cyber-pink rounded-sm hover:bg-cyber-pink/30 transition-colors font-terminal text-xs flex items-center justify-center hover:shadow-[0_0_8px_rgba(255,50,100,0.3)]"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  CONFIRM DELETE
                                </button>
                                <button
                                  onClick={() => setConfirmingDelete(null)}
                                  className="flex-1 p-2 border border-cyber-green/50 text-cyber-green rounded-sm hover:bg-cyber-green/10 transition-colors font-terminal text-xs"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Avatar update */}
                          <div className="space-y-2 relative z-10">
                            <label className="text-xs text-cyber-green/70 font-terminal flex items-center">
                              <span className="text-cyber-green/50 mr-1">&gt;</span>
                              Avatar
                            </label>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 p-1 border border-cyber-green/30 rounded-full bg-cyber-black/60">
                                {wallet.avatar ? (
                                  wallet.avatar.startsWith('data:') ? (
                                    <img src={wallet.avatar} alt={wallet.name} className="w-12 h-12 rounded-full" />
                                  ) : (
                                    <Jdenticon size={48} value={wallet.avatar} className="rounded-full" />
                                  )
                                ) : (
                                  <Jdenticon size={48} value={wallet.publicKey} className="rounded-full" />
                                )}
                              </div>
                              <input
                                id={`avatar-input-${wallet.id}`}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleAvatarFileChange(e, wallet.id)}
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById(`avatar-input-${wallet.id}`)?.click()}
                                className="p-2 text-cyber-green bg-cyber-black/80 border border-cyber-green/40 rounded-sm hover:bg-cyber-green/10 transition-colors font-terminal text-xs hover:shadow-[0_0_5px_rgba(0,255,100,0.2)]"
                              >
                                Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => handleGenerateRandomAvatar(wallet.id)}
                                className="p-2 text-cyber-green bg-cyber-black/80 border border-cyber-green/40 rounded-sm hover:bg-cyber-green/10 transition-colors font-terminal text-xs hover:shadow-[0_0_5px_rgba(0,255,100,0.2)]"
                              >
                                Random
                              </button>
                            </div>
                          </div>
                          {/* Public key */}
                          <div className="font-mono text-xs bg-cyber-black/70 p-2 rounded-sm border border-cyber-green/20 text-cyber-green/90 break-all relative z-10">
                            <div className="flex items-center">
                              <span className="text-cyber-green/50 font-terminal mr-1">&gt;</span>
                              <span className="text-cyber-green/50 mr-1">0x</span>
                              {wallet.publicKey}
                            </div>
                          </div>
                          
                          {wallet.isActive && (
                            <div className="bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30 p-2 rounded-sm text-xs font-terminal flex items-center shadow-[0_0_10px_rgba(180,100,255,0.1)] relative z-10">
                              <Check className="w-3 h-3 mr-1" />
                              CURRENTLY ACTIVE WALLET
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2 pt-4 mt-2 border-t border-cyber-green/20">
                <button
                  onClick={() => {
                    setActiveTab('create');
                    triggerGlitch();
                  }}
                  className="flex-1 p-2 bg-cyber-black border border-cyber-green/50 text-cyber-green rounded-sm hover:bg-cyber-green/10 hover:border-cyber-green transition-colors font-terminal text-xs flex items-center justify-center hover:shadow-[0_0_10px_rgba(0,255,100,0.2)]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  CREATE NEW
                </button>
                <button
                  onClick={() => {
                    setActiveTab('import');
                    triggerGlitch();
                  }}
                  className="flex-1 p-2 bg-cyber-black border border-cyber-purple/50 text-cyber-purple rounded-sm hover:bg-cyber-purple/10 hover:border-cyber-purple transition-colors font-terminal text-xs flex items-center justify-center hover:shadow-[0_0_10px_rgba(180,100,255,0.2)]"
                >
                  <Download className="w-3 h-3 mr-1" />
                  IMPORT
                </button>
              </div>
            </div>
            
            <div className="border border-cyber-green/20 bg-cyber-black/40 p-3 rounded-sm text-xs text-cyber-green/60 font-terminal text-center relative overflow-hidden">
              {/* Decorative circuit pattern in background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-cyber-green/50 rounded-full"></div>
                  <div className="absolute w-24 h-24 border border-cyber-green/50 rounded-full"></div>
                  <div className="absolute w-48 h-16 border border-cyber-green/30"></div>
                  <div className="absolute w-16 h-48 border border-cyber-green/30"></div>
                  <div className="absolute w-full h-[1px] bg-cyber-green/20"></div>
                  <div className="absolute w-[1px] h-full bg-cyber-green/20"></div>
                </div>
              </div>
              
              <div className="relative z-10">
                <p className="flex items-center justify-center text-cyber-green/70">
                  <Shield className="w-3 h-3 mr-1" />
                  Encrypted with AES-256
                </p>
                <p className="mt-1">Your keys never leave this device</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Handle copy mnemonic
const handleCopyMnemonic = () => {
  if (createdMnemonic) {
    navigator.clipboard.writeText(createdMnemonic);
    setMnemonicCopied(true);
  }
};

// Handle confirm action when user acknowledges mnemonic backup
const handleConfirmBackup = () => {
  setCreatedMnemonic(null);
  setMnemonicCopied(false);
  setActiveTab('list');
  triggerGlitch();
  setSuccessMessage('Wallet created successfully');
};

  return (
    <div className={`py-5 px-4 relative ${glitching ? 'animate-glitch' : ''}`}>
      {/* CRT Scanlines effect */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-scanlines opacity-5"></div>
      
      {/* Backup mnemonic modal */}
      {createdMnemonic && (
        <BackupMnemonicModal
          mnemonic={createdMnemonic}
          mnemonicCopied={mnemonicCopied}
          onCopy={handleCopyMnemonic}
          onConfirm={handleConfirmBackup}
        />
      )}
      {/* Sleeker Page Header */}
      <div className="relative mb-6 border-b border-cyber-green/20 pb-3">
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden opacity-10">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent"></div>
          <div className="absolute -bottom-3 left-1/2 h-6 w-[1px] bg-cyber-green/30"></div>
          <div className="absolute -bottom-3 left-1/3 h-3 w-[1px] bg-cyber-green/20"></div>
          <div className="absolute -bottom-3 right-1/3 h-3 w-[1px] bg-cyber-green/20"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-cyber-green hover:text-cyber-green/80 transition-colors hover:shadow-[0_0_5px_rgba(0,255,100,0.3)] z-10 group rounded-sm px-2 py-1 border border-cyber-green/10 hover:border-cyber-green/30 bg-cyber-black/50"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:translate-x-[-2px] transition-transform" />
            <span className="font-terminal text-sm tracking-wide">BACK</span>
          </button>
          
          {/* Central subtle indicator replacing the title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyber-green/30 rounded-full animate-pulse-slow"></div>
            <div className="w-1 h-1 bg-cyber-green/20 rounded-full"></div>
          </div>
          
          {/* Status pill indicator on the right */}
          <div className="flex items-center text-xs font-terminal text-cyber-green/60 border border-cyber-green/20 rounded-full px-2 py-0.5 bg-cyber-black/50">
            <Shield className="w-3 h-3 mr-1 text-cyber-green/40" />
            <span>{wallets.length} WALLET{wallets.length !== 1 ? 'S' : ''}</span>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {successMessage && (
        <div className="bg-cyber-green/10 border border-cyber-green text-cyber-green p-3 rounded-sm font-terminal text-sm animate-pulse mb-4 shadow-[0_0_10px_rgba(0,255,100,0.2)]">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-cyber-pink/10 border border-cyber-pink text-cyber-pink p-3 rounded-sm font-terminal text-sm mb-4 shadow-[0_0_10px_rgba(255,50,100,0.2)]">
          {error}
          <button 
            onClick={() => setError('')} 
            className="float-right text-cyber-pink hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Page Content */}
      {renderTabContent()}
      
      {/* Enhanced Matrix rain effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-cyber-green font-mono text-sm"
            style={{
              top: -20,
              left: `${(i * 5) + Math.random() * 5}%`,
              animation: `matrix-rain ${5 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5
            }}
          >
            {[...Array(50)].map((_, j) => (
              <div 
                key={j} 
                style={{ 
                  opacity: Math.random() > 0.5 ? 0.3 : 0.7,
                  textShadow: Math.random() > 0.9 ? '0 0 8px #00ff66' : 'none',
                  transform: `translateY(${Math.random() * 2}px)`,
                  fontSize: Math.random() > 0.8 ? '16px' : '10px'
                }}
              >
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Add circuit board patterns in the background */}
      <div className="fixed inset-0 pointer-events-none z-[-2] opacity-[0.03]">
        <div className="w-full h-full">
          <div className="absolute top-0 left-0 w-1/4 h-1/4 border-r border-b border-cyber-green"></div>
          <div className="absolute top-0 right-0 w-1/4 h-1/4 border-l border-b border-cyber-green"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 border-r border-t border-cyber-green"></div>
          <div className="absolute bottom-0 right-0 w-1/4 h-1/4 border-l border-t border-cyber-green"></div>
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-cyber-green/50 rounded-full"></div>
          <div className="absolute top-[15%] left-[15%] w-[70%] h-[70%] border border-cyber-green/30 rounded-full"></div>
          <div className="absolute w-full h-[1px] top-1/2 bg-cyber-green/30"></div>
          <div className="absolute h-full w-[1px] left-1/2 bg-cyber-green/30"></div>
          
          {/* Add some circuit paths */}
          {[...Array(10)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-cyber-green/50"
              style={{
                height: '1px',
                width: `${20 + Math.random() * 30}%`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
          
          {/* Add circuit connection points */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyber-green/80"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}; 