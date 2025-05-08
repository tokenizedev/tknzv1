import React, { ChangeEvent } from 'react';
import Jdenticon from 'react-jdenticon';
import { Key, Shield, Plus, X } from 'lucide-react';

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
        <label className="text-xs text-cyber-green/70 font-terminal mb-1 block">Avatar (optional)</label>
        <div className="flex items-center space-x-2">
          <input
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
          />
          <button
            type="button"
            onClick={onGenerateAvatar}
            className="p-1 border border-cyber-green rounded-sm text-cyber-green text-xs"
          >Generate Random</button>
        </div>
        {avatar && (
          avatar.startsWith('data:') ? (
            <img src={avatar} alt="Avatar Preview" className="w-12 h-12 rounded-full mt-2" />
          ) : (
            <Jdenticon size={48} value={avatar} className="mt-2 rounded-full" />
          )
        )}
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