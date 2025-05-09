import React, { useState, useEffect } from 'react';
import { Lock, Shield, Code, Terminal, KeySquare } from 'lucide-react';
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
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [securityText, setSecurityText] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Retrieve stored passkey credential ID and user ID separately
        const resId = await storage.get('walletPasskeyId');
        const id = resId.walletPasskeyId;
        const resUser = await storage.get('walletPasskeyUserId');
        const userId = resUser.walletPasskeyUserId;
        if (id && userId) {
          setPasskeyAvailable(true);
          setPasskeyId(id);
          setPasskeyUserId(userId);
        }
      } catch (e) {
        console.error('Failed to check passkey:', e);
      }
    })();
  }, []);

  // Generate decorative security text
  useEffect(() => {
    const generateText = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      return Array(8).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };
    
    setSecurityText([generateText(), generateText()]);
    
    // Random glitch effect
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePasswordUnlock = async () => {
    setError('');
    try {
      setGlitchEffect(true);
      const { walletPasswordHash } = await storage.get('walletPasswordHash');
      if (!walletPasswordHash) {
        setError('No password set');
        setGlitchEffect(false);
        return;
      }
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(password));
      const hashArr = Array.from(new Uint8Array(hashBuf));
      const hashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
      if (hashHex !== walletPasswordHash) {
        setTimeout(() => {
          setError('Authentication failed: Invalid cryptographic key');
          setGlitchEffect(false);
        }, 800);
        return;
      }
      // record unlock timestamp
      await storage.set({ walletLastUnlocked: Date.now() });
      setTimeout(() => {
        setGlitchEffect(false);
        onUnlock();
      }, 800);
    } catch (e) {
      console.error('Failed to unlock wallet:', e);
      setError('System error: Authentication module failure');
      setGlitchEffect(false);
    }
  };

  const handlePasskeyUnlock = async () => {
    setError('');
    try {
      setGlitchEffect(true);
      if (!passkeyId || !passkeyUserId) {
        setError('Biometric authentication not configured');
        setGlitchEffect(false);
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
      setTimeout(() => {
        setGlitchEffect(false);
        onUnlock();
      }, 800);
    } catch (e) {
      console.error('Passkey unlock failed:', e);
      setError('Biometric verification failed');
      setGlitchEffect(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-8 py-4 relative">
      <div className={`leaderboard-frame w-full max-w-[320px] mx-auto relative ${glitchEffect ? 'animate-glitch' : ''}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden border border-cyber-green/30 z-10" />
        <div className="absolute top-1 left-1 text-[6px] font-terminal text-cyber-green/40 z-0">{securityText[0]}</div>
        <div className="absolute bottom-1 right-1 text-[6px] font-terminal text-cyber-green/40 z-0">{securityText[1]}</div>
        
        <div className="leaderboard-title text-center p-4 border-b border-cyber-green/30 relative">
          <Terminal className="absolute left-3 top-4 w-4 h-4 text-cyber-pink/70" />
          <span className="text-cyber-green font-bold tracking-widest">TKNZ VAULT AUTHENTICATION</span>
          <Code className="absolute right-3 top-4 w-4 h-4 text-cyber-pink/70" />
        </div>
        <div className="p-6 space-y-6 relative bg-gradient-to-b from-cyber-black to-cyber-black/80">
          {/* Decorative scanlines */}
          <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
          
          <div className="space-y-4 animate-slide-up">
            <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center border-b border-cyber-green/20 pb-2">
              <Lock className="w-4 h-4 mr-1 text-cyber-pink" />
              <span className="tracking-wider">DECRYPT ACCESS KEY</span>
            </h3>
            <div className="relative">
              <div className="absolute -left-2 -top-2 text-[8px] font-terminal text-cyber-green/60">SYS:// root/access</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter cryptographic key"
                className="w-full bg-cyber-black/70 border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-pink focus:outline-none shadow-[0_0_8px_rgba(37,255,151,0.3)]"
              />
              <div className="absolute right-2 top-2 text-[8px] font-terminal text-cyber-green/40">
                {password && Array(password.length).fill('*').join('')}
              </div>
              <div className="absolute -right-2 -bottom-2 text-[8px] font-terminal text-cyber-green/60">SEC://LVL.9</div>
            </div>
            {error && (
              <p className="text-cyber-pink text-xs font-terminal border border-cyber-pink/30 bg-cyber-pink/10 p-2 animate-pulse">
                [ERROR] {error}
              </p>
            )}
            <button
              onClick={handlePasswordUnlock}
              disabled={!password}
              className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal text-xs disabled:opacity-50 disabled:cursor-not-allowed border-cyber-pink hover:bg-cyber-pink/20 transition-all duration-300"
            >
              <span className="text-cyber-pink mr-1">&gt;</span> AUTHENTICATE
            </button>
            {passkeyAvailable && (
              <button
                onClick={handlePasskeyUnlock}
                className="w-full p-2 bg-cyber-green/5 text-cyber-green border border-cyber-green/50 rounded-sm hover:bg-cyber-green/10 transition-all duration-300 font-terminal text-xs flex items-center justify-center space-x-1 shadow-[0_0_12px_rgba(37,255,151,0.2)]"
              >
                <Shield className="w-3 h-3 text-cyber-pink" />
                <span className="ml-1">BIOMETRIC AUTH</span>
              </button>
            )}
            
            {/* Matrix-like raining code effect */}
            <div className="absolute right-3 bottom-20 text-[6px] font-terminal text-cyber-green/60 opacity-70" style={{writingMode: 'vertical-rl'}}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-rain" style={{animationDelay: `${i * 0.2}s`}}>
                  {Math.random() > 0.5 ? '01' : '10'}
                </div>
              ))}
            </div>
          </div>
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
        
        {/* Add a tech decoration */}
        <div className="absolute -right-3 -top-3 w-6 h-6 border-t border-r border-cyber-green/40 rounded-tr-sm"></div>
        <div className="absolute -left-3 -bottom-3 w-6 h-6 border-b border-l border-cyber-green/40 rounded-bl-sm"></div>
      </div>
    </div>
  );
};