import React, { useEffect, useState } from 'react';
import { Coins as Coin, Wallet, RefreshCw } from 'lucide-react';
import { useStore } from './store';
import { WalletSetup } from './components/WalletSetup';
import { CoinCreator } from './components/CoinCreator';
import { WalletPage } from './components/WalletPage';
import { APP_VERSION } from './config/version';

function App() {
  const { wallet, balance, initializeWallet, getBalance, isRefreshing, isLatestVersion } = useStore();
  const [loading, setLoading] = useState(true);
  const [showWallet, setShowWallet] = useState(false);
  const [latestVersion, setLatestVersion] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState('');
  useEffect(() => {
    const init = async () => {
      await initializeWallet();
      const [latestVersion, isLatest] = await isLatestVersion(APP_VERSION);
      setLatestVersion(isLatest);
      setUpdateAvailable(latestVersion);
      setLoading(false);
    };
    init();
  }, [initializeWallet]);

  if (loading) {
    return (
      <div className="w-[400px] h-[600px] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="animate-spin">
          <Coin className="w-8 h-8 text-purple-600" />
        </div>
      </div>
    );
  }

  if (!latestVersion) {
    return (
      <div className="w-[400px] h-[600px] flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">New version available</h1>
          <p>Please update to the latest version</p>
          <p>Current version: {APP_VERSION}</p>
          <p>Latest version: {updateAvailable}</p>
          <a href="https://chromewebstore.google.com/detail/eejballiemiamlndhkblapmlmjdgaaoi" className="text-purple-600">Update now</a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <header className="glass-panel p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          
      
           <img src="../assets/tknz.png" width="60%" height="60%" />
          
        </div>
        
        {wallet && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">{balance.toFixed(2)} SOL</span>
              <button
                onClick={getBalance}
                disabled={isRefreshing}
                className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh balance"
              >
                <RefreshCw className={`w-4 h-4 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button 
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                showWallet 
                  ? 'icon-container text-purple-600' 
                  : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
              }`}
              onClick={() => setShowWallet(!showWallet)}
              title="View Wallet"
            >
              <Wallet className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      <main className="overflow-auto px-4" style={{ height: 'calc(100% - 64px)' }}>
        {!wallet ? (
          <WalletSetup />
        ) : showWallet ? (
          <WalletPage />
        ) : (
          <CoinCreator />
        )}
      </main>
    </div>
  );
}

export default App;