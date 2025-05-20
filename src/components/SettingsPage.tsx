import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Key, Shield, RefreshCw, Check, X, Plus, Trash2, LogIn, ShoppingCart, Ban, CheckCircle, Filter } from 'lucide-react';
import { FaSync } from 'react-icons/fa';
import { storage } from '../utils/storage';
import { ExchangeSelector } from './ExchangeSelector'

interface PasskeyCredential {
  id: string;
  name: string;
  createdAt: number;
}

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<'password' | 'buy' | 'passkey' | 'blackwhite' | 'validation' | 'scan' | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [hasLegacyPasskey, setHasLegacyPasskey] = useState(false);
  const [legacyPasskeyId, setLegacyPasskeyId] = useState<string>('');
  const [legacyMigrationName, setLegacyMigrationName] = useState('Primary Passkey');
  const [migrationLoading, setMigrationLoading] = useState(false);
  // Buy button feature toggle
  const [buyEnabled, setBuyEnabled] = useState<boolean>(true);
  // Token validation feature toggle
  const [validationEnabled, setValidationEnabled] = useState<boolean>(true);
  const [blocklist, setBlocklist] = useState<string[]>([]);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [blocklistInput, setBlocklistInput] = useState('');
  const [allowlistInput, setAllowlistInput] = useState('');

  // Check if WebAuthn is supported on this device/browser
  useEffect(() => {
    setIsWebAuthnSupported(
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    );

    // Load existing passkey credentials
    const loadPasskeys = async () => {
      try {
        // Check for legacy passkey
        const resId = await storage.get('walletPasskeyId');
        const id = resId.walletPasskeyId;
        if (id) {
          setHasLegacyPasskey(true);
          setLegacyPasskeyId(id);
        }

        // Check for new passkey credentials
        const { passkeyCredentials } = await storage.get('passkeyCredentials');
        if (passkeyCredentials) {
          setCredentials(passkeyCredentials);
        }
      } catch (err) {
        console.error('Failed to load passkey credentials:', err);
        setCredentials([]);
      }
    };

    loadPasskeys();
  }, []);
  // Load token validation setting
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get('validationEnabled');
        const enabled = res.validationEnabled;
        setValidationEnabled(enabled === undefined ? true : enabled);
      } catch (err) {
        console.error('Failed to load validation setting:', err);
        setValidationEnabled(true);
      }
    })();
  }, []);
  // Load buy button setting
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get('buyModeEnabled');
        const enabled = res.buyModeEnabled;
        setBuyEnabled(enabled === undefined ? true : enabled);
      } catch (err) {
        console.error('Failed to load buy mode setting:', err);
        setBuyEnabled(true);
      }
    })();
  }, []);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);

      // Verify current password
      const { walletPasswordHash } = await storage.get('walletPasswordHash');
      const currentHashed = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(currentPassword)
      );
      const currentHashedHex = Array.from(new Uint8Array(currentHashed))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (currentHashedHex !== walletPasswordHash) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // Hash new password
      const newHashed = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(newPassword)
      );
      const newHashedHex = Array.from(new Uint8Array(newHashed))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Save new password hash
      await storage.set({ walletPasswordHash: newHashedHex });

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch (err) {
      setError('Failed to update password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form state when closing a section
  const handleCloseSection = () => {
    setActiveSection(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasskeyName('');
    setError('');
  };

  // Register a new passkey
  const registerPasskey = async () => {
    if (!passkeyName) {
      setError('Please enter a name for your passkey');
      return;
    }

    setPasskeyLoading(true);
    setError('');

    try {
      // Generate user ID - here we're using current timestamp for simplicity
      const userId = new Uint8Array(8);
      const timestamp = Date.now();
      new DataView(userId.buffer).setBigUint64(0, BigInt(timestamp), false);

      // Challenge should be a random value, using a random array here
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create publicKey credential request options
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'TKNZ Wallet',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: `user_${timestamp}`,
          displayName: passkeyName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 } // RS256
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'required',
          requireResidentKey: true
        }
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Extract credential ID
      const credentialId = btoa(
        String.fromCharCode(...new Uint8Array(credential.rawId))
      );

      // Save credential info
      const newCredential: PasskeyCredential = {
        id: credentialId,
        name: passkeyName,
        createdAt: Date.now()
      };

      // Add to existing credentials
      const updatedCredentials = [...credentials, newCredential];
      setCredentials(updatedCredentials);

      // Save to storage
      await storage.set({ passkeyCredentials: updatedCredentials });

      setSuccess('Passkey successfully registered');
      setPasskeyName('');
    } catch (err) {
      console.error('Error registering passkey:', err);
      setError(`Failed to register passkey: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Delete a passkey
  const deletePasskey = async (credentialId: string) => {
    try {
      setPasskeyLoading(true);

      // Filter out the credential to delete
      const updatedCredentials = credentials.filter(cred => cred.id !== credentialId);

      // Update state and storage
      setCredentials(updatedCredentials);
      await storage.set({ passkeyCredentials: updatedCredentials });

      setSuccess('Passkey removed successfully');
    } catch (err) {
      console.error('Error removing passkey:', err);
      setError('Failed to remove passkey');
    } finally {
      setPasskeyLoading(false);
    }
  };

  // Migrate legacy passkey to new format
  const migrateLegacyPasskey = async () => {
    if (!hasLegacyPasskey) {
      setError('No legacy passkey to migrate');
      return;
    }

    if (!legacyMigrationName.trim()) {
      setError('Please enter a name for the migrated passkey');
      return;
    }

    setMigrationLoading(true);
    setError('');

    try {
      // Fetch the user ID from storage
      const resUser = await storage.get('walletPasskeyUserId');
      const userId = resUser.walletPasskeyUserId;

      if (!userId) {
        throw new Error('Legacy passkey is missing user ID');
      }

      // Create new passkey credential entry
      const newCredential: PasskeyCredential = {
        id: legacyPasskeyId,
        name: legacyMigrationName,
        createdAt: Date.now()
      };

      // Add the legacy passkey to the credentials array
      const updatedCredentials = [...credentials, newCredential];
      setCredentials(updatedCredentials);

      // Save to storage
      await storage.set({ passkeyCredentials: updatedCredentials });

      // Mark migration as complete
      setHasLegacyPasskey(false);
      setLegacyPasskeyId('');
      setLegacyMigrationName('');

      setSuccess('Legacy passkey successfully migrated');
    } catch (err) {
      console.error('Error migrating legacy passkey:', err);
      setError(`Migration failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setMigrationLoading(false);
    }
  };

  useEffect(() => {
    const loadLists = async () => {
      try {
        const { blocklist } = await storage.get('blocklist');
        const { allowlist } = await storage.get('allowlist');

        setBlocklist(Array.isArray(blocklist) ? blocklist : []);
        setAllowlist(Array.isArray(allowlist) ? allowlist : []);
      } catch {
        setBlocklist([]);
        setAllowlist([]);
      }
    };

    loadLists();
  }, []);

  const addblocklist = async () => {
    if (!blocklistInput.trim() || blocklist.includes(blocklistInput.trim())) return;
    const updated = [...blocklist, blocklistInput.trim()];
    setBlocklist(updated);
    setBlocklistInput('');
    await storage.set({ blocklist: updated });
  };

  const removeblocklist = async (entry: string) => {
    const updated = blocklist.filter(e => e !== entry);
    setBlocklist(updated);
    await storage.set({ blocklist: updated });
  };

  const addallowlist = async () => {
    if (!allowlistInput.trim() || allowlist.includes(allowlistInput.trim())) return;
    const updated = [...allowlist, allowlistInput.trim()];
    setAllowlist(updated);
    setAllowlistInput('');
    await storage.set({ allowlist: updated });
  };

  const removeallowlist = async (entry: string) => {
    const updated = allowlist.filter(e => e !== entry);
    setAllowlist(updated);
    await storage.set({ allowlist: updated });
  };

  // Manual scan trigger for buy button injection
  const manualScan = () => {
    if (window.chrome?.tabs?.query) {
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId !== undefined) {
          window.chrome.tabs.sendMessage(tabId, { type: 'MANUAL_SCAN' });
          setSuccess('Page scan triggered successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      });
    } else {
      setError('Browser API not available');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="h-full bg-cyber-black overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cyber-black/90 backdrop-blur-sm border-b border-cyber-green/20 p-4 flex items-center">
        <button
          onClick={onBack}
          className="mr-2 p-1 rounded-sm hover:bg-cyber-green/10 text-cyber-green transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-cyber-green font-terminal text-lg">
          <span className="text-cyber-green/70 mr-1">$&gt;</span>
          GLOBAL SETTINGS
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Success message */}
        {success && (
          <div className="bg-cyber-green/10 border border-cyber-green/50 p-3 rounded-sm text-cyber-green font-terminal text-sm mb-4 flex items-start">
            <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-cyber-orange/10 border border-cyber-orange/50 p-3 rounded-sm text-cyber-orange font-terminal text-sm mb-4 flex items-start">
            <X className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Management Section */}
        <div className="border border-cyber-green/30 rounded-sm overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80 ${activeSection === 'password' ? 'border-b border-cyber-green/30' : ''}`}
            onClick={() => activeSection !== 'password' ? setActiveSection('password') : null}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="w-5 h-5 mr-3 text-cyber-green" />
                <h2 className="text-cyber-green font-terminal">Password Management</h2>
              </div>
              {activeSection !== 'password' && (
                <button className="text-cyber-green border border-cyber-green/50 px-2 py-1 rounded-sm text-xs font-terminal hover:bg-cyber-green/10 transition-colors">
                  CHANGE
                </button>
              )}
            </div>
            <p className="text-cyber-green/70 text-sm mt-1 ml-8">Update your wallet password</p>
          </div>

          {activeSection === 'password' && (
            <div className="p-4 bg-cyber-black/50 animate-slide-down">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-cyber-green/80 text-xs font-terminal mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-cyber-black border border-cyber-green/30 rounded-sm p-2 text-cyber-green focus:border-cyber-green/70 focus:outline-none focus:ring-1 focus:ring-cyber-green/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyber-green/80 text-xs font-terminal mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-cyber-black border border-cyber-green/30 rounded-sm p-2 text-cyber-green focus:border-cyber-green/70 focus:outline-none focus:ring-1 focus:ring-cyber-green/30"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-cyber-green/80 text-xs font-terminal mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-cyber-black border border-cyber-green/30 rounded-sm p-2 text-cyber-green focus:border-cyber-green/70 focus:outline-none focus:ring-1 focus:ring-cyber-green/30"
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-cyber-green/20 border border-cyber-green text-cyber-green p-2 rounded-sm hover:bg-cyber-green/30 font-terminal text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        UPDATING...
                      </span>
                    ) : (
                      'UPDATE PASSWORD'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseSection}
                    className="px-3 border border-cyber-green/30 text-cyber-green/70 rounded-sm hover:bg-cyber-green/10 hover:text-cyber-green transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Buy Button Feature Section */}
        <div className="border border-cyber-green/30 rounded-sm overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80 ${activeSection === 'buy' ? 'border-b border-cyber-green/30' : ''}`}
            onClick={() => activeSection !== 'buy' ? setActiveSection('buy') : null}
          >
            <div className="flex items-center justify-between">
              <ShoppingCart className="w-5 h-5 mr-3 text-cyber-green" />
              <h2 className="text-cyber-green font-terminal">Buy Button Feature</h2>
              {activeSection !== 'buy' && (
                <button className="text-cyber-green border border-cyber-green/50 px-2 py-1 rounded-sm text-xs font-terminal hover:bg-cyber-green/10 transition-colors">
                  SETTINGS
                </button>
              )}
            </div>
            <p className="text-cyber-green/70 text-sm mt-1 ml-8">Enable or disable on-page Buy buttons</p>
          </div>
          {activeSection === 'buy' && (
            <div className="p-4 bg-cyber-black/50 animate-slide-down space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-cyber-green bg-cyber-black border border-cyber-green/50 rounded"
                  checked={buyEnabled}
                  onChange={e => {
                    const enabled = e.target.checked;
                    setBuyEnabled(enabled);
                    storage.set({ buyModeEnabled: enabled });
                  }}
                />
                <span className="text-cyber-green text-sm font-terminal">Enable Buy Buttons</span>
              </label>
              <p className="text-cyber-green/50 text-xs font-terminal">
                Changes will take effect after page refresh.
              </p>
            </div>
          )}
        </div>
        {/* Token Validation Section */}
        <div className="border border-cyber-green/30 rounded-sm overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80 ${activeSection === 'validation' ? 'border-b border-cyber-green/30' : ''}`}
            onClick={() => activeSection !== 'validation' ? setActiveSection('validation') : null}
          >
            <div className="flex items-center justify-between">
              <Filter className="w-5 h-5 mr-3 text-cyber-green" />
              <h2 className="text-cyber-green font-terminal">Token Validation</h2>
              {activeSection !== 'validation' && (
                <button className="text-cyber-green border border-cyber-green/50 px-2 py-1 rounded-sm text-xs font-terminal hover:bg-cyber-green/10 transition-colors">
                  SETTINGS
                </button>
              )}
            </div>
            <p className="text-cyber-green/70 text-sm mt-1 ml-8">Enable or disable token validation</p>
          </div>
          {activeSection === 'validation' && (
            <div className="p-4 bg-cyber-black/50 animate-slide-down space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-cyber-green bg-cyber-black border border-cyber-green/50 rounded"
                  checked={validationEnabled}
                  onChange={e => {
                    const enabled = e.target.checked;
                    setValidationEnabled(enabled);
                    storage.set({ validationEnabled: enabled });
                  }}
                />
                <span className="text-cyber-green text-sm font-terminal">Enable Token Validation</span>
              </label>
              <p className="text-cyber-green/50 text-xs font-terminal">
                Changes will take effect immediately.
              </p>
            </div>
          )}
        </div>
        {/* Passkey Management Section */}
        <div className="border border-cyber-green/30 rounded-sm overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80 ${activeSection === 'passkey' ? 'border-b border-cyber-green/30' : ''}`}
            onClick={() => activeSection !== 'passkey' ? setActiveSection('passkey') : null}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="w-5 h-5 mr-3 text-cyber-green" />
                <h2 className="text-cyber-green font-terminal">Passkey Management</h2>
              </div>
              {activeSection !== 'passkey' && (
                <button className="text-cyber-green border border-cyber-green/50 px-2 py-1 rounded-sm text-xs font-terminal hover:bg-cyber-green/10 transition-colors">
                  CONFIGURE
                </button>
              )}
            </div>
            <p className="text-cyber-green/70 text-sm mt-1 ml-8">Set up passkeys for secure authentication</p>
          </div>

          {activeSection === 'passkey' && (
            <div className="p-4 bg-cyber-black/50 animate-slide-down">
              {!isWebAuthnSupported ? (
                <div className="flex items-center p-3 border border-cyber-orange/30 rounded-sm bg-cyber-orange/5 mb-4">
                  <Shield className="w-5 h-5 text-cyber-orange mr-3" />
                  <p className="text-cyber-orange/90 text-sm font-terminal">
                    Your browser does not support passkeys (WebAuthn). Please use a modern browser that supports this feature.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Legacy passkey migration section */}
                  {hasLegacyPasskey && (
                    <div className="border border-cyber-purple/30 p-3 rounded-sm bg-cyber-purple/5 space-y-3">
                      <div className="flex items-start">
                        <LogIn className="w-5 h-5 text-cyber-purple mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-cyber-purple/90 text-sm font-terminal mb-1">Legacy Passkey Detected</h3>
                          <p className="text-cyber-purple/80 text-xs font-terminal">
                            Migrate your existing passkey to the new system to enable multiple passkeys.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Passkey Name"
                          value={legacyMigrationName}
                          onChange={(e) => setLegacyMigrationName(e.target.value)}
                          className="flex-1 bg-cyber-black border border-cyber-purple/30 rounded-sm p-2 text-cyber-purple focus:border-cyber-purple/70 focus:outline-none focus:ring-1 focus:ring-cyber-purple/30 text-sm"
                        />
                        <button
                          onClick={migrateLegacyPasskey}
                          disabled={migrationLoading || !legacyMigrationName.trim()}
                          className="px-3 py-2 bg-cyber-purple/10 border border-cyber-purple/50 text-cyber-purple rounded-sm hover:bg-cyber-purple/20 transition-colors font-terminal text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {migrationLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            'MIGRATE'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Registered passkeys list */}
                  <div className="space-y-2">
                    <h3 className="text-cyber-green/90 text-sm font-terminal">Registered Passkeys</h3>
                    {credentials.length === 0 ? (
                      <p className="text-cyber-green/70 text-xs font-terminal py-2">
                        No passkeys registered yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {credentials.map((cred) => (
                          <div
                            key={cred.id}
                            className="flex items-center justify-between p-2 border border-cyber-green/20 rounded-sm bg-cyber-green/5"
                          >
                            <div>
                              <div className="text-cyber-green font-terminal text-sm">{cred.name}</div>
                              <div className="text-cyber-green/50 text-xs font-terminal">
                                Added: {new Date(cred.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={() => deletePasskey(cred.id)}
                              disabled={passkeyLoading}
                              className="p-1.5 text-cyber-orange hover:bg-cyber-orange/10 rounded-sm transition-colors"
                              title="Remove Passkey"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Register new passkey form */}
                  <div className="pt-2 border-t border-cyber-green/20">
                    <h3 className="text-cyber-green/90 text-sm font-terminal mb-2">Register New Passkey</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Passkey Name"
                        value={passkeyName}
                        onChange={(e) => setPasskeyName(e.target.value)}
                        className="flex-1 bg-cyber-black border border-cyber-green/30 rounded-sm p-2 text-cyber-green focus:border-cyber-green/70 focus:outline-none focus:ring-1 focus:ring-cyber-green/30 text-sm"
                      />
                      <button
                        onClick={registerPasskey}
                        disabled={passkeyLoading || !passkeyName}
                        className="px-3 py-2 bg-cyber-green/10 border border-cyber-green/50 text-cyber-green rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {passkeyLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            ADD
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-cyber-green/60 text-xs font-terminal mt-2">
                      Passkeys provide passwordless authentication using your device's biometrics or screen lock.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCloseSection}
                className="w-full mt-4 border border-cyber-green/30 text-cyber-green p-2 rounded-sm hover:bg-cyber-green/10 transition-colors font-terminal text-sm"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>

        {/* blocklist & allowlist Section */}
        <div className="border border-cyber-green/30 rounded-sm overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80 ${activeSection === 'blackwhite' ? 'border-b border-cyber-green/30' : ''}`}
            onClick={() => activeSection !== 'blackwhite' ? setActiveSection('blackwhite') : null}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Ban className="w-5 h-5 text-cyber-green" />
                <h2 className="text-cyber-green font-terminal">Token list management</h2>
              </div>
              {activeSection !== 'blackwhite' && (
                <button className="text-cyber-green border border-cyber-green/50 px-2 py-1 rounded-sm text-xs font-terminal hover:bg-cyber-green/10 transition-colors">
                  MANAGE
                </button>
              )}
            </div>
            <p className="text-cyber-green/70 text-sm mt-1 ml-8">Manage blocklist and allowlist CA entries</p>
          </div>
          {activeSection === 'blackwhite' && (
            <div className="p-4 bg-cyber-black/50 animate-slide-down space-y-6">
              <div>
                <h3 className="text-cyber-orange font-terminal text-sm mb-2 flex items-center"><Ban className="w-4 h-4 mr-2" />blocklist CAs </h3>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add to blocklist"
                    value={blocklistInput}
                    onChange={e => setBlocklistInput(e.target.value)}
                    className="flex-1 bg-cyber-black border border-cyber-orange/30 rounded-sm p-2 text-cyber-orange focus:border-cyber-orange/70 focus:outline-none focus:ring-1 focus:ring-cyber-orange/30 text-sm"
                  />
                  <button
                    onClick={addblocklist}
                    className="px-3 py-2 bg-cyber-orange/10 border border-cyber-orange/50 text-cyber-orange rounded-sm hover:bg-cyber-orange/20 transition-colors font-terminal text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!blocklistInput.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />ADD
                  </button>
                </div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                  {!blocklist.length ? (
                    <p className="text-cyber-orange/60 text-xs font-terminal">No blocklist entries.</p>
                  ) : (
                    blocklist.map(entry => (
                      <div key={entry} className="flex items-center justify-between p-2 border border-cyber-orange/20 rounded-sm bg-cyber-orange/5">
                        <span className="text-cyber-orange font-terminal text-sm break-all">{entry}</span>
                        <button
                          onClick={() => removeblocklist(entry)}
                          className="p-1.5 text-cyber-orange hover:bg-cyber-orange/10 rounded-sm transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-cyber-green font-terminal text-sm mb-2 flex items-center"><CheckCircle className="w-4 h-4 mr-2" />allowlist CAs</h3>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add to allowlist"
                    value={allowlistInput}
                    onChange={e => setAllowlistInput(e.target.value)}
                    className="flex-1 bg-cyber-black border border-cyber-green/30 rounded-sm p-2 text-cyber-green focus:border-cyber-green/70 focus:outline-none focus:ring-1 focus:ring-cyber-green/30 text-sm"
                  />
                  <button
                    onClick={addallowlist}
                    className="px-3 py-2 bg-cyber-green/10 border border-cyber-green/50 text-cyber-green rounded-sm hover:bg-cyber-green/20 transition-colors font-terminal text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!allowlistInput.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />ADD
                  </button>
                </div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                  {!allowlist.length ? (
                    <p className="text-cyber-green/60 text-xs font-terminal">No allowlist entries.</p>
                  ) : (
                    allowlist.map(entry => (
                      <div key={entry} className="flex items-center justify-between p-2 border border-cyber-green/20 rounded-sm bg-cyber-green/5">
                        <span className="text-cyber-green font-terminal text-sm break-all">{entry}</span>
                        <button
                          onClick={() => removeallowlist(entry)}
                          className="p-1.5 text-cyber-green hover:bg-cyber-green/10 rounded-sm transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseSection}
                className="w-full mt-4 border border-cyber-green/30 text-cyber-green p-2 rounded-sm hover:bg-cyber-green/10 transition-colors font-terminal text-sm"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>

        {/* Page Scanning Section */}
        <div className="border border-cyber-green/30 rounded-sm overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80 ${activeSection === 'scan' ? 'border-b border-cyber-green/30' : ''}`}
            onClick={() => activeSection !== 'scan' ? setActiveSection('scan') : null}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaSync className="w-5 h-5 mr-3 text-cyber-green" />
                <h2 className="text-cyber-green font-terminal">Page Scanning</h2>
              </div>
              {activeSection !== 'scan' && (
                <button className="text-cyber-green border border-cyber-green/50 px-2 py-1 rounded-sm text-xs font-terminal hover:bg-cyber-green/10 transition-colors">
                  SCAN
                </button>
              )}
            </div>
            <p className="text-cyber-green/70 text-sm mt-1 ml-8">Scan current webpage for token addresses and symbols</p>
          </div>

          {activeSection === 'scan' && (
            <div className="p-4 bg-cyber-black/50 animate-slide-down">
              <p className="text-cyber-green/80 text-sm font-terminal mb-4">
                Scan the current active webpage to detect token addresses and symbols. TKNZ will add "Buy" buttons next to identified tokens.
              </p>
              
              <button
                onClick={manualScan}
                className="w-full bg-cyber-green/20 border border-cyber-green text-cyber-green p-3 rounded-sm hover:bg-cyber-green/30 font-terminal text-sm transition-colors flex items-center justify-center"
              >
                <FaSync className="w-4 h-4 mr-2" />
                SCAN CURRENT PAGE
              </button>
              
              <p className="text-cyber-green/50 text-xs font-terminal mt-2">
                Note: This feature requires the buy button functionality to be enabled.
              </p>
            </div>
          )}
        </div>

        {/* Exchange Selector Settings*/}
        <ExchangeSelector />
        
        {/* Additional settings sections can be added here */}
      </div>
    </div>
  );
};