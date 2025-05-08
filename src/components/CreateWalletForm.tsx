import React, { ChangeEvent } from 'react';
import Jdenticon from 'react-jdenticon';
import { Key, Shield, Plus, X, Upload, Repeat } from 'lucide-react';

interface CreateWalletFormProps {
  name: string;
  avatar: string | null;
  isCreating: boolean;
  onNameChange: (name: string) => void;
  onAvatarChange: (avatar: string | null) => void;
  onGenerateAvatar: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Form for creating a new wallet, including optional avatar upload or identicon generation.
 */
export const CreateWalletForm: React.FC<CreateWalletFormProps> = ({
  name,
  avatar,
  isCreating,
  onNameChange,
  onAvatarChange,
  onGenerateAvatar,
  onSubmit,
  onCancel
}) => (
  <div className="border border-cyber-green p-4 rounded-sm animate-slide-up">
    <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center">
      <Key className="w-4 h-4 mr-1" />
      CREATE NEW WALLET
    </h3>
    <div className="space-y-4">
      <div>
        <label className="text-xs text-cyber-green/70 font-terminal mb-1 block">Wallet Name</label>
        <input
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Enter wallet name"
          className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-green focus:outline-none"
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs text-cyber-green/70 font-terminal mb-1 flex items-center">
          <Upload className="w-3 h-3 mr-1 text-cyber-green/60" />
          Avatar (optional)
        </label>
        <div className="flex flex-col space-y-3">
          {/* Drop area for avatar upload */}
          <div 
            className={`relative w-full h-32 border-2 ${avatar ? 'border-solid' : 'border-dashed'} border-cyber-green/40 rounded-md flex flex-col items-center justify-center bg-cyber-black/30 overflow-hidden transition-colors hover:border-cyber-green/60 cursor-pointer`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                
                const reader = new FileReader();
                reader.onloadend = () => {
                  onAvatarChange(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            onClick={() => document.getElementById('avatar-file-input')?.click()}
          >
            {avatar ? (
              <div className="flex items-center justify-center w-full h-full">
                {avatar.startsWith('data:') ? (
                  <img 
                    src={avatar} 
                    alt="Avatar preview" 
                    className="h-auto max-h-full max-w-full object-contain p-3"
                  />
                ) : (
                  <Jdenticon 
                    size={80} 
                    value={avatar} 
                    className="rounded-full"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Upload className="h-8 w-8 text-cyber-green/50 mb-2" />
                <p className="text-cyber-green/70 font-terminal text-xs">Drop image here or click to browse</p>
              </div>
            )}
            
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => onAvatarChange(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="sr-only"
            />
          </div>
          
          {/* Generate random button */}
          <button
            type="button"
            onClick={onGenerateAvatar}
            className="p-2 bg-cyber-black/80 border border-cyber-green/40 rounded-sm text-cyber-green font-terminal text-xs hover:bg-cyber-green/10 transition-colors flex items-center justify-center"
          >
            <Repeat className="w-3 h-3 mr-2" />
            GENERATE RANDOM
          </button>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onSubmit}
          disabled={isCreating}
          className="flex-1 p-2 bg-cyber-green/10 text-cyber-green border border-cyber-green rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-xs flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <><Shield className="w-3 h-3 mr-1 animate-spin"/>CREATING...</>
          ) : (
            <><Plus className="w-3 h-3 mr-1"/>CREATE WALLET</>
          )}
        </button>
        <button
          onClick={onCancel}
          className="p-2 border border-cyber-green/30 text-cyber-green/70 rounded-sm hover:text-cyber-green hover:border-cyber-green/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default CreateWalletForm;