/**
 * Injection script for TKNZ Wallet Standard registration
 * This script runs in the page context to register the TKNZ wallet
 * with the Wallet Standard, enabling dapps to detect and select it.
 */
(function() {
  // Supported Solana chains
  const SOLANA_CHAINS = [
    'solana:mainnet',
    'solana:devnet',
    'solana:testnet',
    'solana:localnet'
  ];

  // Minimal transparent PNG icon as placeholder
  const TKNZ_ICON =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';

  // Wallet object implementing minimal Wallet Standard interface
  class TknzWallet {
    constructor() {
      this.version = '1.0.0';
      this.name = 'TKNZ';
      this.icon = TKNZ_ICON;
      this.chains = SOLANA_CHAINS;
      // Minimal features: connect, disconnect, events
      this.features = {
        // Standard Connect feature
        'standard:connect': {
          version: '1.0.0',
          connect: async (_input) => {
            throw new Error('TKNZ Wallet: connect not implemented');
          }
        },
        // Standard Disconnect feature
        'standard:disconnect': {
          version: '1.0.0',
          disconnect: async () => {
            throw new Error('TKNZ Wallet: disconnect not implemented');
          }
        },
        // Standard Events feature
        'standard:events': {
          version: '1.0.0',
          on: (_event, _listener) => {
            // No-op listener, return no-op off
            return () => {};
          }
        }
      };
      // No accounts initially
      this.accounts = [];
    }
  }

  // Internal RegisterWalletEvent for dispatch
  class RegisterWalletEvent extends Event {
    constructor(callback) {
      super('wallet-standard:register-wallet', { bubbles: false, cancelable: false, composed: false });
      this.detail = callback;
    }
  }

  /**
   * Register a wallet with the Wallet Standard API
   * Dispatches register event and listens for app-ready
   * Also registers in deprecated navigator.wallets
   */
  function registerWallet(wallet) {
    // Callback called by app to register wallet
    const callback = ({ register }) => register(wallet);
    // Dispatch registration event
    try {
      window.dispatchEvent(new RegisterWalletEvent(callback));
    } catch (error) {
      console.error('wallet-standard:register-wallet event could not be dispatched', error);
    }
    // Listen for app-ready to register if app loads after
    try {
      window.addEventListener('wallet-standard:app-ready', ({ detail: api }) => callback(api));
    } catch (error) {
      console.error('wallet-standard:app-ready event listener could not be added', error);
    }
    // Deprecated: support window.navigator.wallets
    try {
      window.navigator.wallets = window.navigator.wallets || [];
      window.navigator.wallets.push(({ register }) => register(wallet));
    } catch (error) {
      console.error('window.navigator.wallets could not be pushed', error);
    }
  }

  // Instantiate and register TKNZ Wallet
  try {
    registerWallet(new TknzWallet());
  } catch (e) {
    console.error('TKNZ Wallet registration failed', e);
  }
})();
// Phantom provider injection for dApps expecting window.solana
;(function() {
  // Avoid double injection
  if (window.solana && (window.solana as any).isPhantom) {
    return;
  }
  const callbacks: Record<string, any> = {};
  const provider: any = {
    isPhantom: true,
    isConnected: false,
    publicKey: null,
    _listeners: { connect: [] as Function[], disconnect: [] as Function[] },
    connect(): Promise<any> {
      const id = Math.random().toString(36).substring(2);
      window.postMessage({ type: 'TKNZ_PHANTOM_REQUEST', id, method: 'connect' }, '*');
      return new Promise((resolve, reject) => {
        callbacks[id] = { resolve, reject, method: 'connect' };
      });
    },
    disconnect(): Promise<void> {
      // No-op for now
      return Promise.resolve();
    },
    signTransaction(tx: any): Promise<any> {
      const id = Math.random().toString(36).substring(2);
      let serialized: Uint8Array;
      try {
        serialized = tx.serializeMessage();
      } catch (e) {
        return Promise.reject(e);
      }
      window.postMessage(
        { type: 'TKNZ_PHANTOM_REQUEST', id, method: 'signTransaction', serializedTransaction: Array.from(serialized) },
        '*'
      );
      return new Promise((resolve, reject) => {
        callbacks[id] = { resolve, reject, method: 'signTransaction', originalTx: tx };
      });
    },
    signAllTransactions(txs: any[]): Promise<any[]> {
      return Promise.all(txs.map(tx => this.signTransaction(tx)));
    },
    on(event: string, listener: Function) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(listener);
    }
  };
  // Handle responses from content/background
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.type !== 'TKNZ_PHANTOM_RESPONSE') return;
    const { id, error, payload } = event.data as any;
    const cb = callbacks[id];
    if (!cb) return;
    delete callbacks[id];
    if (error) {
      cb.reject(error);
      return;
    }
    if (cb.method === 'connect') {
      provider.publicKey = { toString: () => payload.publicKey };
      provider.isConnected = true;
      provider._listeners.connect.forEach(l => l(provider.publicKey));
      cb.resolve(provider.publicKey);
    } else if (cb.method === 'signTransaction') {
      // payload.signedTransaction expected as Array<number>
      const sigBytes = new Uint8Array(payload.signedTransaction);
      cb.originalTx.addSignature(provider.publicKey, sigBytes);
      cb.resolve(cb.originalTx);
    }
  });
  // Expose provider
  (window as any).solana = provider;
})();