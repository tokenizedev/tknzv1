import React, { useState, useEffect } from 'react';
import { Keypair } from '@solana/web3.js';
import { Lock, Shield, Code, Terminal, KeySquare, Fingerprint, AlertTriangle } from 'lucide-react';
import { storage } from '../utils/storage';
// Derive seed from mnemonic using PBKDF2-HMAC-SHA512 via Web Crypto API.
async function deriveSeedFromMnemonic(mnemonic: string, password: string = ''): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const mnemonicBuffer = encoder.encode(mnemonic.normalize('NFKD'));
  const saltBuffer = encoder.encode(('mnemonic' + password).normalize('NFKD'));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    mnemonicBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBitsArray = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 2048,
      hash: 'SHA-512'
    },
    keyMaterial,
    512
  );
  return new Uint8Array(derivedBitsArray);
}

interface PasskeyCredential {
  id: string;
  name: string;
  createdAt: number;
}

interface PasswordUnlockProps {
  onUnlock: () => void;
}

export const PasswordUnlock: React.FC<PasswordUnlockProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [hasMultiPasskeys, setHasMultiPasskeys] = useState(false);
  const [hasLegacyPasskey, setHasLegacyPasskey] = useState(false);
  const [hasPasswordAuth, setHasPasswordAuth] = useState(false);
  const [legacyPasskeyId, setLegacyPasskeyId] = useState<string>('');
  const [legacyPasskeyUserId, setLegacyPasskeyUserId] = useState<string>('');
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [securityText, setSecurityText] = useState<string[]>([]);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check WebAuthn support
    setIsWebAuthnSupported(
      window.PublicKeyCredential !== undefined && 
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    );
    
    // Check for available authentication methods
    (async () => {
      try {
        // Check if password is set
        const { walletPasswordHash } = await storage.get('walletPasswordHash');
        setHasPasswordAuth(!!walletPasswordHash);
        
        // Check for legacy passkey
        const resId = await storage.get('walletPasskeyId');
        const id = resId.walletPasskeyId;
        const resUser = await storage.get('walletPasskeyUserId');
        const userId = resUser.walletPasskeyUserId;
        
        if (id && userId) {
          setHasLegacyPasskey(true);
          setLegacyPasskeyId(id);
          setLegacyPasskeyUserId(userId);
        }
        
        // Check for new passkey credentials
        const { passkeyCredentials } = await storage.get('passkeyCredentials');
        if (passkeyCredentials && passkeyCredentials.length > 0) {
          setPasskeys(passkeyCredentials);
          setHasMultiPasskeys(true);
        }
        
        setInitialLoading(false);
      } catch (e) {
        console.error('Failed to load authentication methods:', e);
        setInitialLoading(false);
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

  // Handle legacy passkey authentication
  const handleLegacyPasskeyUnlock = async () => {
    if (!hasLegacyPasskey || !isWebAuthnSupported) {
      setError('No legacy passkey available');
      return;
    }
    
    setError('');
    setPasskeyLoading(true);
    setGlitchEffect(true);
    
    try {
      // Convert base64 string to ArrayBuffer
      const rawId = Uint8Array.from(atob(legacyPasskeyId), c => c.charCodeAt(0));
      
      // Create a random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      // Legacy authentication
      const options: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{ id: rawId, type: 'public-key' }],
        timeout: 60000,
        userVerification: 'preferred'
      };
      
      await navigator.credentials.get({ publicKey: options });
      await storage.set({ walletLastUnlocked: Date.now() });
      
      setTimeout(() => {
        setGlitchEffect(false);
        setPasskeyLoading(false);
        onUnlock();
      }, 800);
    } catch (e) {
      console.error('Legacy passkey unlock failed:', e);
      setError(`Biometric verification failed: ${e instanceof Error ? e.message : String(e)}`);
      setGlitchEffect(false);
      setPasskeyLoading(false);
    }
  };

  // Handle new multi-passkey authentication
  const handleMultiPasskeyUnlock = async () => {
    if (!hasMultiPasskeys || !isWebAuthnSupported) {
      setError('No passkeys available');
      return;
    }
    
    setError('');
    setPasskeyLoading(true);
    setGlitchEffect(true);
    
    try {
      // For passkey authentication, we need to collect the credential IDs
      const allowCredentials = passkeys.map(passkey => {
        // Convert base64 string to ArrayBuffer
        const rawId = Uint8Array.from(atob(passkey.id), c => c.charCodeAt(0));
        return {
          id: rawId,
          type: 'public-key' as PublicKeyCredentialType
        };
      });
      
      // Create a random challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      
      // Create authentication options
      const authOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials,
        timeout: 60000,
        userVerification: 'preferred'
      };
      
      // Authenticate with WebAuthn
      const credential = await navigator.credentials.get({
        publicKey: authOptions
      });
      
      if (credential) {
        // Authentication successful
        await storage.set({ walletLastUnlocked: Date.now() });
        setTimeout(() => {
          setGlitchEffect(false);
          setPasskeyLoading(false);
          onUnlock();
        }, 800);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (e) {
      console.error('Passkey authentication failed:', e);
      setError(`Biometric authentication failed: ${e instanceof Error ? e.message : String(e)}`);
      setGlitchEffect(false);
      setPasskeyLoading(false);
    }
  };

  // Combined passkey handler
  const handlePasskeyUnlock = async () => {
    // Try the multi-passkey system first if available
    if (hasMultiPasskeys) {
      return handleMultiPasskeyUnlock();
    }
    // Fall back to legacy passkey if available
    else if (hasLegacyPasskey) {
      return handleLegacyPasskeyUnlock();
    }
    // No passkeys available
    else {
      setError('No passkeys available');
    }
  };

  // Handle recovery via mnemonic seed phrase
  const handleMnemonicRecover = async () => {
    setError('');
    try {
      setGlitchEffect(true);
      const trimmed = mnemonic.trim();
      if (!trimmed) {
        setError('Please enter your seed phrase');
        setGlitchEffect(false);
        return;
      }
      const bip39 = await import('bip39');
      if (!bip39.validateMnemonic(trimmed)) {
        setError('Invalid seed phrase');
        setGlitchEffect(false);
        return;
      }
      const seedArray = await deriveSeedFromMnemonic(trimmed);
      const seed = seedArray.slice(0, 32);
      const recovered = Keypair.fromSeed(seed);
      const stored = await storage.get('wallets');
      const walletsList = stored.wallets || [];
      const match = walletsList.find((w: any) => w.publicKey === recovered.publicKey.toString());
      if (!match) {
        setError('Seed phrase does not match any wallet');
        setGlitchEffect(false);
        return;
      }
      await storage.set({ activeWalletId: match.id, walletLastUnlocked: Date.now() });
      setTimeout(() => {
        setGlitchEffect(false);
        onUnlock();
      }, 800);
    } catch (e: any) {
      console.error('Recovery failed:', e);
      setError(e.message || 'Recovery failed');
      setGlitchEffect(false);
    }
  };

  // Check if we have any authentication methods available
  const hasAnyAuthMethod = hasPasswordAuth || hasMultiPasskeys || hasLegacyPasskey;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[536px]">
        <div className="text-cyber-green font-terminal animate-pulse">
          INITIALIZING SECURITY SYSTEMS...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[536px] space-y-8 py-4 relative">
      <div className={`leaderboard-frame w-full max-w-[320px] mx-auto relative ${glitchEffect ? 'animate-glitch' : ''}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden border border-cyber-green/30 z-10" />
        <div className="absolute top-1 left-1 text-[6px] font-terminal text-cyber-green/40 z-0">{securityText[0]}</div>
        <div className="absolute bottom-1 right-1 text-[6px] font-terminal text-cyber-green/40 z-0">{securityText[1]}</div>
        
        <div className="leaderboard-title text-center p-4 border-b border-cyber-green/30 relative">
          <Terminal className="absolute left-3 top-4 w-4 h-4 text-cyber-pink/70" />
          <span className="text-cyber-green font-bold tracking-widest">TKNZ VAULT UNLOCK</span>
          <Code className="absolute right-3 top-4 w-4 h-4 text-cyber-pink/70" />
        </div>
        <div className="p-6 space-y-6 relative bg-gradient-to-b from-cyber-black to-cyber-black/80">
          {/* Decorative scanlines */}
          <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
          
          <div className="space-y-4 animate-slide-up">
            {forgot ? (
              <>
                <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center border-b border-cyber-green/20 pb-2">
                  <KeySquare className="w-4 h-4 mr-1 text-cyber-pink" />
                  <span className="tracking-wider">RECOVER WALLET</span>
                </h3>
                <div>
                  <textarea
                    rows={3}
                    value={mnemonic}
                    onChange={e => setMnemonic(e.target.value)}
                    placeholder="Enter your seed phrase"
                    className="w-full bg-cyber-black/70 border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-terminal text-sm focus:border-cyber-pink focus:outline-none shadow-[0_0_8px_rgba(37,255,151,0.3)]"
                  />
                </div>
                {error && (
                  <p className="text-cyber-pink text-xs font-terminal border border-cyber-pink/30 bg-cyber-pink/10 p-2 animate-pulse">
                    [ERROR] {error}
                  </p>
                )}
                <button
                  onClick={handleMnemonicRecover}
                  disabled={!mnemonic.trim()}
                  className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal text-xs disabled:opacity-50 disabled:cursor-not-allowed border-cyber-pink hover:bg-cyber-pink/20 transition-all duration-300"
                >
                  <span className="text-cyber-pink mr-1">&gt;</span> RECOVER
                </button>
                <button
                  onClick={() => { setForgot(false); setError(''); }}
                  className="w-full text-cyber-green font-terminal text-xs underline mt-2"
                >
                  BACK TO LOGIN
                </button>
              </>
            ) : (
              <>
                {!hasAnyAuthMethod && (
                  <div className="bg-cyber-orange/10 border border-cyber-orange/30 p-4 rounded-sm mb-4 animate-pulse">
                    <div className="flex items-center text-cyber-orange">
                      <AlertTriangle className="w-5 h-5 mr-2 text-cyber-orange" />
                      <h3 className="text-sm font-terminal">NO AUTHENTICATION METHODS</h3>
                    </div>
                    <p className="text-cyber-orange/80 text-xs font-terminal mt-2">
                      No password or passkeys are set up for this wallet. Use the recovery option below.
                    </p>
                  </div>
                )}

                <h3 className="text-cyber-green font-terminal text-sm mb-3 flex items-center border-b border-cyber-green/20 pb-2">
                  <Lock className="w-4 h-4 mr-1 text-cyber-pink" />
                  <span className="tracking-wider">DECRYPT ACCESS KEY</span>
                </h3>
                
                {(hasMultiPasskeys || hasLegacyPasskey) && isWebAuthnSupported && (
                  <button
                    onClick={handlePasskeyUnlock}
                    disabled={passkeyLoading}
                    className="w-full p-3 mb-3 bg-cyber-green/5 text-cyber-green border border-cyber-green/50 rounded-sm hover:bg-cyber-green/10 transition-all duration-300 font-terminal text-sm flex items-center justify-center shadow-[0_0_12px_rgba(37,255,151,0.2)]"
                  >
                    {passkeyLoading ? (
                      <span className="flex items-center animate-pulse">
                        <Shield className="w-4 h-4 text-cyber-green mr-2 animate-pulse" />
                        VERIFYING...
                      </span>
                    ) : (
                      <>
                        <Fingerprint className="w-5 h-5 text-cyber-green mr-2" />
                        UNLOCK WITH PASSKEY
                      </>
                    )}
                  </button>
                )}
                
                {hasPasswordAuth && (
                  <>
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
                    
                    <button
                      onClick={handlePasswordUnlock}
                      disabled={!password}
                      className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal text-xs disabled:opacity-50 disabled:cursor-not-allowed border-cyber-pink hover:bg-cyber-pink/20 transition-all duration-300"
                    >
                      <span className="text-cyber-pink mr-1">&gt;</span> AUTHENTICATE
                    </button>
                  </>
                )}
                
                {error && (
                  <p className="text-cyber-pink text-xs font-terminal border border-cyber-pink/30 bg-cyber-pink/10 p-2 animate-pulse">
                    [ERROR] {error}
                  </p>
                )}
                
                {/* Matrix-like raining code effect */}
                <div className="absolute right-3 bottom-20 text-[6px] font-terminal text-cyber-green/60 opacity-70" style={{writingMode: 'vertical-rl'}}>
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="animate-rain" style={{animationDelay: `${i * 0.2}s`}}>
                      {Math.random() > 0.5 ? '01' : '10'}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setForgot(true); setError(''); }}
                  className="w-full text-cyber-pink font-terminal text-xs underline mt-2"
                >
                  FORGOT PASSWORD?
                </button>
              </>
            )}
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