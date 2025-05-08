import React, { useState } from 'react';
import { Download, X, Shield, Upload, TerminalSquare, AlertTriangle, Repeat } from 'lucide-react';
import { useStore } from '../store';

interface ImportWalletFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ImportWalletForm: React.FC<ImportWalletFormProps> = ({ onSuccess, onCancel }) => {
  const { importWallet, updateWalletAvatar } = useStore();
  const [importName, setImportName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate random avatar
  const generateRandomAvatar = () => {
    const randomId = Math.random().toString(36).substring(2, 15);
    setAvatarPreview(`https://api.dicebear.com/7.x/identicon/svg?seed=${randomId}`);
  };

  const handleImport = async () => {
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
      
      // Import the wallet
      const imported = await importWallet(importName.trim(), privateKey.trim());
      
      // Apply avatar if one is selected and wallet was imported successfully
      if (avatarPreview && imported) {
        await updateWalletAvatar(imported.id, avatarPreview);
      }
      
      // If successful, call the onSuccess callback
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import wallet');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="relative animate-glitch-in overflow-hidden">
      {/* Background matrix effect */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="bg-cyber-black grid grid-cols-10 gap-px h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="text-cyber-purple/30 font-mono text-xs text-center"
              style={{
                opacity: Math.random() > 0.5 ? 0.5 : 0.2,
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyber-purple/40 bg-cyber-black/80 backdrop-blur-md">
        <h2 className="text-cyber-purple font-terminal text-lg flex items-center">
          <Download className="w-5 h-5 mr-2 text-cyber-purple" />
          IMPORT EXISTING WALLET
        </h2>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full text-cyber-purple/70 hover:text-cyber-purple hover:bg-cyber-purple/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4 bg-cyber-black/60 backdrop-blur-md">
        {error && (
          <div className="bg-cyber-pink/10 border border-cyber-pink/40 p-3 rounded-sm animate-pulse-fast">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-cyber-pink mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-cyber-pink font-terminal text-sm flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Wallet Name */}
        <div>
          <label className="text-cyber-purple font-terminal text-sm mb-1 block flex items-center">
            <TerminalSquare className="w-4 h-4 mr-2 text-cyber-purple/60" />
            Wallet Name
          </label>
          <input
            type="text"
            value={importName}
            onChange={(e) => setImportName(e.target.value)}
            placeholder="Enter wallet name"
            className="w-full bg-cyber-black/80 border border-cyber-purple/40 rounded-sm p-3 text-cyber-purple font-terminal text-base focus:border-cyber-purple focus:outline-none placeholder-cyber-purple/30 focus:shadow-[0_0_10px_rgba(180,100,255,0.2)]"
            autoFocus
          />
        </div>

        {/* Private Key */}
        <div>
          <label className="text-cyber-purple font-terminal text-sm mb-1 block flex justify-between items-center">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-cyber-purple/60" />
              Private Key
            </span>
            <span className="text-cyber-purple/50 text-xs">Hex or Base58 Format</span>
          </label>
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Enter your private key"
            className="w-full h-28 bg-cyber-black/80 border border-cyber-purple/40 rounded-sm p-3 text-cyber-purple font-mono text-base focus:border-cyber-purple focus:outline-none placeholder-cyber-purple/30 resize-none focus:shadow-[0_0_10px_rgba(180,100,255,0.2)]"
          />
        </div>

        {/* Avatar (Optional) */}
        <div>
          <label className="text-cyber-purple font-terminal text-sm mb-1 block flex items-center">
            <Upload className="w-4 h-4 mr-2 text-cyber-purple/60" />
            Avatar (optional)
          </label>
          
          <div className="flex flex-col space-y-3">
            {/* Drop area for avatar upload */}
            <div 
              className={`relative w-full h-32 border-2 ${avatarPreview ? 'border-solid' : 'border-dashed'} border-cyber-purple/40 rounded-md flex flex-col items-center justify-center bg-cyber-black/30 overflow-hidden transition-colors hover:border-cyber-purple/60 cursor-pointer`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setAvatarFile(file);
                  
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              onClick={() => document.getElementById('avatar-file-input')?.click()}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="h-8 w-8 text-cyber-purple/50 mb-2" />
                  <p className="text-cyber-purple/70 font-terminal text-xs">Drop image here or click to browse</p>
                </div>
              )}
              
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </div>
            
            {/* Generate random button */}
            <button
              onClick={generateRandomAvatar}
              className="p-2 bg-cyber-black/80 border border-cyber-purple/40 rounded-sm text-cyber-purple font-terminal text-xs hover:bg-cyber-purple/10 transition-colors flex items-center justify-center"
            >
              <Repeat className="w-3 h-3 mr-2" />
              GENERATE RANDOM
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-r from-cyber-purple/20 via-cyber-purple/10 to-cyber-purple/5 border-l-2 border-cyber-purple p-3 rounded-sm">
            <p className="text-sm text-cyber-purple/90 font-terminal leading-tight">
              Your private key is never sent to any server and will be securely encrypted on this device.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyber-purple via-transparent to-cyber-purple/50 opacity-50"></div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 p-3 bg-gradient-to-r from-cyber-purple to-cyber-purple/70 text-white font-terminal text-sm rounded-sm flex items-center justify-center hover:from-cyber-purple/90 hover:to-cyber-purple transition-all shadow-lg hover:shadow-cyber-purple/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isImporting ? (
              <>
                <Shield className="w-4 h-4 mr-2 animate-spin" />
                IMPORTING...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                IMPORT WALLET
              </>
            )}
          </button>
          
          <button
            onClick={onCancel}
            className="px-3 py-3 border border-cyber-purple/30 text-cyber-purple/70 rounded-sm hover:text-cyber-purple hover:border-cyber-purple hover:bg-cyber-purple/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}; 