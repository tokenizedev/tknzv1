import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeySquare, Code } from 'lucide-react';
import { storage } from '../utils/storage';

interface PasswordSetupProps {
  onComplete: () => void;
}

export const PasswordSetup: React.FC<PasswordSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'password' | 'passkey'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [glitchEffect, setGlitchEffect] = useState(false);

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
      setGlitchEffect(true);
      const enc = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(password));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      await storage.set({ walletPasswordHash: hashHex });
      setTimeout(() => {
        setGlitchEffect(false);
        setStep('passkey');
      }, 800);
    } catch (e) {
      console.error('Failed to set password', e);
      setError('Failed to set password');
      setGlitchEffect(false);
    }
  };

  // Handle passkey (WebAuthn) setup
  const handleSetupPasskey = async () => {
    try {
      setGlitchEffect(true);
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
      setGlitchEffect(false);
      onComplete();
    }
  };

  const skipPasskey = () => {
    onComplete();
  };

  const generateSecurityText = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    return Array(8).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  // Decorative effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-8 py-4 relative">
      <div className={`leaderboard-frame w-full max-w-[320px] mx-auto relative ${glitchEffect ? 'animate-glitch' : ''}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden border border-cyber-green/30 z-10" />
        <div className="absolute top-1 left-1 text-[6px] font-terminal text-cyber-green/40 z-0">{generateSecurityText()}</div>
        <div className="absolute bottom-1 right-1 text-[6px] font-terminal text-cyber-green/40 z-0">{generateSecurityText()}</div>
        
        <div className="leaderboard-title text-center p-4 border-b border-cyber-green/30 relative">
          <Code className="absolute left-3 top-4 w-4 h-4 text-cyber-pink/70" />
          <span className="text-cyber-green font-bold tracking-widest">TKNZ VAULT ACCESS</span>
          <KeySquare className="absolute right-3 top-4 w-4 h-4 text-cyber-pink/70" />
        </div>
        <div className="p-6 space-y-6 relative bg-gradient-to-b from-cyber-black to-cyber-black/80">
          {/* Decorative scanlines */}
          <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
          
          {step === 'password' && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center border-b border-cyber-green/20 pb-2">
                <Lock className="w-4 h-4 mr-1 text-cyber-pink" />
                <span className="tracking-wider">ENCRYPTION KEY SETUP</span>
              </h3>
              <div>
                <label className="text-xs text-cyber-green/70 font-terminal mb-1 block flex items-center">
                  <span className="text-cyber-pink mr-1">&gt;</span> CRYPTOGRAPHIC KEY
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter encryption key"
                    className="w-full bg-cyber-black/70 border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-pink focus:outline-none shadow-[0_0_8px_rgba(37,255,151,0.3)]"
                  />
                  <div className="absolute right-2 top-2 text-[8px] font-terminal text-cyber-green/40">
                    {password && Array(password.length).fill('*').join('')}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-cyber-green/70 font-terminal mb-1 block flex items-center">
                  <span className="text-cyber-pink mr-1">&gt;</span> VERIFY KEY
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm encryption key"
                    className="w-full bg-cyber-black/70 border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-pink focus:outline-none shadow-[0_0_8px_rgba(37,255,151,0.3)]"
                  />
                  <div className="absolute right-2 top-2 text-[8px] font-terminal text-cyber-green/40">
                    {confirmPassword && Array(confirmPassword.length).fill('*').join('')}
                  </div>
                </div>
              </div>
              {error && (
                <p className="text-cyber-pink text-xs font-terminal border border-cyber-pink/30 bg-cyber-pink/10 p-2 animate-pulse">
                  [ERROR] {error}
                </p>
              )}
              <button
                onClick={handleSetPassword}
                disabled={!password || password !== confirmPassword}
                className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal text-xs disabled:opacity-50 disabled:cursor-not-allowed border-cyber-pink hover:bg-cyber-pink/20 transition-all duration-300"
              >
                <span className="text-cyber-pink mr-1">&gt;</span> ENCRYPT AND SECURE
              </button>
            </div>
          )}
          {step === 'passkey' && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center border-b border-cyber-green/20 pb-2">
                <ShieldCheck className="w-4 h-4 mr-1 text-cyber-pink" />
                <span className="tracking-wider">BIOMETRIC AUTHENTICATION</span>
              </h3>
              <p className="text-cyber-green/70 font-terminal text-xs border border-cyber-green/20 bg-cyber-green/5 p-2">
                <span className="text-cyber-pink">[INFO]</span> Enable hardware-level authentication using your device's biometric security or hardware key.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleSetupPasskey}
                  className="flex-1 p-2 bg-cyber-green/10 text-cyber-green border border-cyber-green rounded-sm hover:bg-cyber-green/20 transition-all duration-300 font-terminal text-xs shadow-[0_0_12px_rgba(37,255,151,0.2)]"
                >
                  <span className="text-cyber-pink mr-1">&gt;</span> ENABLE BIOMETRICS
                </button>
                <button
                  onClick={skipPasskey}
                  className="flex-1 p-2 bg-cyber-purple/10 text-cyber-purple border border-cyber-purple rounded-sm hover:bg-cyber-purple/20 transition-all duration-300 font-terminal text-xs shadow-[0_0_12px_rgba(142,36,170,0.2)]"
                >
                  <span className="text-cyber-pink mr-1">&gt;</span> SKIP
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Binary decoration at bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden h-[1px] flex">
          {Array(32).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="h-full flex-1" 
              style={{ 
                backgroundColor: Math.random() > 0.5 ? 'rgba(37,255,151,0.5)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};