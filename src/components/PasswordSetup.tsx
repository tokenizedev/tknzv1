import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { storage } from '../utils/storage';

interface PasswordSetupProps {
  onComplete: () => void;
}

export const PasswordSetup: React.FC<PasswordSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'password' | 'passkey'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Handle password creation and store hash
  const handleSetPassword = async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const enc = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(password));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      await storage.set({ walletPasswordHash: hashHex });
      setStep('passkey');
    } catch (e) {
      console.error('Failed to set password', e);
      setError('Failed to set password');
    }
  };

  // Handle passkey (WebAuthn) setup
  const handleSetupPasskey = async () => {
    try {
      // Generate random challenge and user id
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: 'TKNZ Wallet' },
        user: {
          id: userId,
          name: 'user',
          displayName: 'TKNZ User'
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'preferred' },
        timeout: 60000,
        attestation: 'none'
      };
      const cred = await navigator.credentials.create({ publicKey: publicKeyOptions });
      if (cred instanceof PublicKeyCredential) {
        const rawId = new Uint8Array(cred.rawId);
        const idBase64 = btoa(String.fromCharCode(...rawId));
        const userIdBase64 = btoa(String.fromCharCode(...userId));
        await storage.set({ walletPasskeyId: idBase64, walletPasskeyUserId: userIdBase64 });
      }
    } catch (e) {
      console.error('Passkey setup failed', e);
      // proceed without blocking
    } finally {
      onComplete();
    }
  };

  const skipPasskey = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-8 py-4 relative">
      <div className="leaderboard-frame w-full max-w-[320px] mx-auto">
        <div className="leaderboard-title text-center p-4 border-b border-cyber-green/30">
          TKNZ WALLET SECURE SETUP
        </div>
        <div className="p-6 space-y-6">
          {step === 'password' && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                CREATE PASSWORD
              </h3>
              <div>
                <label className="text-xs text-cyber-green/70 font-terminal mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-green focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-cyber-green/70 font-terminal mb-1 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-green focus:outline-none"
                />
              </div>
              {error && <p className="text-cyber-pink text-xs font-terminal">{error}</p>}
              <button
                onClick={handleSetPassword}
                disabled={!password || password !== confirmPassword}
                className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Password
              </button>
            </div>
          )}
          {step === 'passkey' && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" />
                SETUP PASSKEY
              </h3>
              <p className="text-cyber-green/70 font-terminal text-sm">
                Use your device's biometric or security key to unlock your wallet securely.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleSetupPasskey}
                  className="flex-1 p-2 bg-cyber-green/10 text-cyber-green border border-cyber-green rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-xs"
                >
                  Setup Passkey
                </button>
                <button
                  onClick={skipPasskey}
                  className="flex-1 p-2 bg-cyber-purple/10 text-cyber-purple border border-cyber-purple rounded-sm hover:bg-cyber-purple/20 transition-colors font-terminal text-xs"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};