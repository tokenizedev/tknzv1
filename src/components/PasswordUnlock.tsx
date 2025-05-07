import React, { useState, useEffect } from 'react';
import { Lock, Shield } from 'lucide-react';
import { storage } from '../utils/storage';

interface PasswordUnlockProps {
  onUnlock: () => void;
}

export const PasswordUnlock: React.FC<PasswordUnlockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [passkeyId, setPasskeyId] = useState<string>();
  const [passkeyUserId, setPasskeyUserId] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get('walletPasskeyId');
        if (res.walletPasskeyId) {
          setPasskeyAvailable(true);
          setPasskeyId(res.walletPasskeyId);
          setPasskeyUserId(res.walletPasskeyUserId);
        }
      } catch (e) {
        console.error('Failed to check passkey:', e);
      }
    })();
  }, []);

  const handlePasswordUnlock = async () => {
    setError('');
    try {
      const { walletPasswordHash } = await storage.get('walletPasswordHash');
      if (!walletPasswordHash) {
        setError('No password set');
        return;
      }
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(password));
      const hashArr = Array.from(new Uint8Array(hashBuf));
      const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
      if (hashHex !== walletPasswordHash) {
        setError('Incorrect password');
        return;
      }
      // record unlock timestamp
      await storage.set({ walletLastUnlocked: Date.now() });
      onUnlock();
    } catch (e) {
      console.error('Failed to unlock wallet:', e);
      setError('Error unlocking wallet');
    }
  };

  const handlePasskeyUnlock = async () => {
    setError('');
    try {
      if (!passkeyId || !passkeyUserId) {
        setError('Passkey not configured');
        return;
      }
      const rawId = Uint8Array.from(atob(passkeyId), c => c.charCodeAt(0));
      const userId = Uint8Array.from(atob(passkeyUserId), c => c.charCodeAt(0));
      const options: PublicKeyCredentialRequestOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: rawId, type: 'public-key' }],
        timeout: 60000,
        userVerification: 'preferred'
      };
      await navigator.credentials.get({ publicKey: options });
      await storage.set({ walletLastUnlocked: Date.now() });
      onUnlock();
    } catch (e) {
      console.error('Passkey unlock failed:', e);
      setError('Passkey authentication failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-8 py-4 relative">
      <div className="leaderboard-frame w-full max-w-[320px] mx-auto">
        <div className="leaderboard-title text-center p-4 border-b border-cyber-green/30">
          UNLOCK WALLET
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              ENTER PASSWORD
            </h3>
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-green focus:outline-none"
              />
            </div>
            {error && <p className="text-cyber-pink text-xs font-terminal">{error}</p>}
            <button
              onClick={handlePasswordUnlock}
              disabled={!password}
              className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Unlock
            </button>
            {passkeyAvailable && (
              <button
                onClick={handlePasskeyUnlock}
                className="w-full p-2 border border-cyber-green/50 text-cyber-green rounded-sm hover:bg-cyber-green/10 transition-colors font-terminal text-xs flex items-center justify-center space-x-1"
              >
                <Shield className="w-3 h-3" />
                <span>Unlock with Passkey</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};