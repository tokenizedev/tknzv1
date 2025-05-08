import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Pen, Trash2, Key, Shield, Wallet, Check, X, Zap, Download, Upload } from 'lucide-react';
import { useStore } from '../store';
import { WalletInfo } from '../types';
import { ImportWalletForm } from './ImportWalletForm';

interface WalletManagerProps {
  onClose: () => void;
}

type WalletTab = 'list' | 'create' | 'import';

export const WalletManager: React.FC<WalletManagerProps> = ({ onClose }) => {
  const { wallets, activeWallet, createNewWallet, importWallet, switchWallet, removeWallet, renameWallet } = useStore();
  const [activeTab, setActiveTab] = useState<WalletTab>('list');
  
  // Create wallet state
  const [newWalletName, setNewWalletName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Import wallet state
  const [importName, setImportName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  
  // Editing state
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedWalletId, setExpandedWalletId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Error and success states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset states when component unmounts or when necessary
  useEffect(() => {
    return () => {
      setShowCreateForm(false);
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

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      setError('Wallet name cannot be empty');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      await createNewWallet(newWalletName.trim());
      setNewWalletName('');
      setActiveTab('list');
      setSuccessMessage('Wallet created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleImportWallet = async () => {
    if (!importName.trim()) {
      setError('Wallet name cannot be empty');
      return;
    }
    
    if (!privateKey.trim()) {
      setError('Private key cannot be empty');
      return;
    }

    try {
      setIsImporting(true);
      setError('');
      await importWallet(importName.trim(), privateKey.trim());
      setImportName('');
      setPrivateKey('');
      setActiveTab('list');
      setSuccessMessage('Wallet imported successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import wallet');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSwitchWallet = async (walletId: string) => {
    try {
      await switchWallet(walletId);
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
          <div className="border border-cyber-green p-3 rounded-sm animate-slide-up">
            <h3 className="text-cyber-green font-terminal text-sm mb-2 flex items-center">
              <Key className="w-4 h-4 mr-1" />
              CREATE NEW WALLET
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-cyber-green/70 font-terminal mb-1 block">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="Enter wallet name"
                  className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-green focus:outline-none"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateWallet}
                  disabled={isCreating}
                  className="flex-1 p-2 bg-cyber-green/10 text-cyber-green border border-cyber-green rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Shield className="w-3 h-3 mr-1 animate-spin" />
                      CREATING...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      CREATE WALLET
                    </>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className="p-2 border border-cyber-green/30 text-cyber-green/70 rounded-sm hover:text-cyber-green hover:border-cyber-green/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'import':
        return (
          <ImportWalletForm 
            onSuccess={() => {
              setActiveTab('list');
              setSuccessMessage('Wallet imported successfully');
            }}
            onCancel={() => setActiveTab('list')}
          />
        );
        
      default: // 'list'
        return (
          <div className="space-y-2 border border-cyber-green/20 p-3 rounded-sm">
            <h3 className="text-cyber-green font-terminal text-sm mb-2">YOUR WALLETS [{wallets.length}]</h3>
            {wallets.length === 0 ? (
              <div className="text-cyber-green/60 font-terminal text-xs italic p-2">
                No wallets available. Create your first wallet below.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-cyber-black">
                {wallets.map((wallet) => (
                  <div 
                    key={wallet.id}
                    className={`wallet-item border ${wallet.isActive 
                      ? 'border-cyber-green bg-cyber-green/10' 
                      : 'border-cyber-green/20 hover:border-cyber-green/50'
                    } rounded-sm transition-all duration-200 overflow-hidden`}
                  >
                    {/* Wallet header */}
                    <div className="flex items-center justify-between p-2">
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
                            <div className="font-terminal text-sm">
                              {wallet.name}
                              {wallet.isActive && (
                                <span className="ml-2 text-xs text-cyber-purple">[ACTIVE]</span>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs text-cyber-green/60 font-mono truncate">
                            {wallet.publicKey.substring(0, 12)}...{wallet.publicKey.substring(wallet.publicKey.length - 4)}
                          </div>
                        </div>
                      </div>
                      
                      {!wallet.isActive && (
                        <button
                          onClick={() => handleSwitchWallet(wallet.id)}
                          className="p-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 text-cyber-green rounded-sm ml-2 transition-colors"
                          title="Switch to this wallet"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Expanded wallet details */}
                    {expandedWalletId === wallet.id && (
                      <div className="bg-cyber-black/40 border-t border-cyber-green/20 p-3 space-y-3 animate-slide-down">
                        {editingWalletId === wallet.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveWalletName(wallet.id)}
                              className="flex-1 p-2 bg-cyber-green/10 text-cyber-green border border-cyber-green/50 rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-xs"
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
                              className="flex-1 p-2 bg-cyber-black text-cyber-green/80 border border-cyber-green/30 rounded-sm hover:bg-cyber-green/10 hover:text-cyber-green hover:border-cyber-green/50 transition-colors font-terminal text-xs flex items-center justify-center"
                            >
                              <Pen className="w-3 h-3 mr-1" />
                              RENAME
                            </button>
                            
                            {!wallet.isActive && wallets.length > 1 && (
                              <button
                                onClick={() => setConfirmingDelete(wallet.id)}
                                className="flex-1 p-2 bg-cyber-black text-cyber-pink/80 border border-cyber-pink/30 rounded-sm hover:bg-cyber-pink/10 hover:text-cyber-pink hover:border-cyber-pink/50 transition-colors font-terminal text-xs flex items-center justify-center"
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
                                className="flex-1 p-2 bg-cyber-pink/20 text-cyber-pink border border-cyber-pink rounded-sm hover:bg-cyber-pink/30 transition-colors font-terminal text-xs flex items-center justify-center"
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
                        
                        {/* Public key */}
                        <div className="font-mono text-xs bg-cyber-dark/80 p-2 rounded-sm border border-cyber-green/20 text-cyber-green/90 break-all">
                          {wallet.publicKey}
                        </div>
                        
                        {wallet.isActive && (
                          <div className="bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30 p-2 rounded-sm text-xs font-terminal flex items-center">
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
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setActiveTab('create')}
                className="flex-1 p-2 bg-cyber-black border border-cyber-green/50 text-cyber-green rounded-sm hover:bg-cyber-green/10 hover:border-cyber-green transition-colors font-terminal text-xs flex items-center justify-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                CREATE NEW
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className="flex-1 p-2 bg-cyber-black border border-cyber-purple/50 text-cyber-purple rounded-sm hover:bg-cyber-purple/10 hover:border-cyber-purple transition-colors font-terminal text-xs flex items-center justify-center"
              >
                <Download className="w-3 h-3 mr-1" />
                IMPORT
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
      <div className="w-[90%] max-w-md crypto-card relative overflow-hidden animate-glitch-in">
        {/* Header */}
        <div className="crypto-card-header flex items-center justify-between">
          <h2 className="crypto-card-title flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-cyber-green" />
            WALLET MANAGEMENT
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-cyber-green/10 rounded-full text-cyber-green/80 hover:text-cyber-green"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Panel */}
        <div className="crypto-card-body space-y-4">
          {/* Status message */}
          {successMessage && (
            <div className="bg-cyber-green/10 border border-cyber-green text-cyber-green p-3 rounded-sm font-terminal text-sm animate-pulse">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-cyber-pink/10 border border-cyber-pink text-cyber-pink p-3 rounded-sm font-terminal text-sm">
              {error}
              <button 
                onClick={() => setError('')} 
                className="float-right text-cyber-pink hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tabs content */}
          {renderTabContent()}
        </div>
        
        {/* Footer */}
        <div className="border-t border-cyber-green/20 p-3 text-xs text-cyber-green/60 font-terminal italic text-center">
          Encrypted with AES-256. Your keys never leave this device.
        </div>
        
        {/* Matrix rain effect */}
        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-cyber-green font-mono text-xs"
              style={{
                top: -20,
                left: `${(i * 20) + Math.random() * 5}%`,
                animation: `float ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {[...Array(10)].map((_, j) => (
                <div key={j} style={{ opacity: Math.random() > 0.5 ? 0.3 : 0.7 }}>
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 