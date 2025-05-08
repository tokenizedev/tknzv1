import { create } from 'zustand';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import { 
  logEventToFirestore, 
  getCreatedCoins, 
  addCreatedCoinToFirestore, 
  getLaunchedTokenEvents
} from './firebase';
import { APP_VERSION } from './config/version';
import { storage } from './utils/storage';
import { createConnection, web3Connection } from './utils/connection';
const DEV_MODE = process.env.NODE_ENV === 'development' && !chrome?.tabs;
import { compareVersions } from 'compare-versions'
import { WalletState, CreatedCoin, ArticleData, CoinCreationParams, TokenCreationData, WalletInfo } from './types';
import { v4 as uuidv4 } from 'uuid';

const TOKEN_CREATION_API_URL = 'https://tknz.fun/.netlify/functions/article-token';
const APP_VERSION_API_URL = 'https://tknz.fun/.netlify/functions/version';

const connection = createConnection();

// Refresh interval in milliseconds (1 minute)
const REFRESH_INTERVAL = 60 * 1000;

export const useStore = create<WalletState>((set, get) => ({
  wallets: [],
  activeWallet: null,
  wallet: null,
  balance: 0,
  error: null,
  createdCoins: [],
  isRefreshing: false,
  investmentAmount: 0,
  isLatestVersion: true,
  updateAvailable: null,
  migrationStatus: 'idle',

  initializeWallet: async () => {
    try {
      set({ error: null });

      // Get wallet data from storage
      const storedWallets = await storage.get('wallets');
      const storedActiveWalletId = await storage.get('activeWalletId');
      const storedInvestment = await storage.get('investmentAmount');
      let wallets: WalletInfo[] = [];
      let activeWallet: WalletInfo | null = null;

      // Check if we have stored wallets
      if (storedWallets.wallets && Array.isArray(storedWallets.wallets) && storedWallets.wallets.length > 0) {
        // Convert stored wallet data back to WalletInfo objects with Keypair
        wallets = storedWallets.wallets.map((walletData: any) => {
          // Convert secretKey from array to Uint8Array for Keypair
          const secretKey = new Uint8Array(walletData.keypairSecretKey);
          const keypair = Keypair.fromSecretKey(secretKey);

          return {
            id: walletData.id,
            name: walletData.name,
            publicKey: walletData.publicKey,
            keypair,
            isActive: walletData.id === storedActiveWalletId.activeWalletId
          };
        });

        // Find the active wallet
        activeWallet = wallets.find(w => w.isActive) || wallets[0];
        
        // If no active wallet set, mark first one as active
        if (!activeWallet.isActive) {
          activeWallet.isActive = true;
        }
      } else {
        // Check for legacy wallet data
        const storedLegacySecret = await storage.get('walletSecret');
        
        if (storedLegacySecret.walletSecret && Array.isArray(storedLegacySecret.walletSecret)) {
          try {
            // Convert legacy wallet to new format
            const secret = new Uint8Array(storedLegacySecret.walletSecret);
            const keypair = Keypair.fromSecretKey(secret);
            const walletId = uuidv4();
            
            activeWallet = {
              id: walletId,
              name: 'Primary Wallet',
              publicKey: keypair.publicKey.toString(),
              keypair,
              isActive: true
            };
            
            wallets = [activeWallet];
          } catch (e) {
            console.error('Invalid stored wallet secret, generating new wallet');
            // Create a new wallet
            const keypair = Keypair.generate();
            const walletId = uuidv4();
            
            activeWallet = {
              id: walletId,
              name: 'Primary Wallet',
              publicKey: keypair.publicKey.toString(),
              keypair,
              isActive: true
            };
            
            wallets = [activeWallet];
          }
        } else {
          // No wallets found, create a new wallet
          const keypair = Keypair.generate();
          const walletId = uuidv4();
          
          activeWallet = {
            id: walletId,
            name: 'Primary Wallet',
            publicKey: keypair.publicKey.toString(),
            keypair,
            isActive: true
          };
          
          wallets = [activeWallet];
        }
        
        // Save the new wallet data
        await storage.set({
          wallets: wallets.map(w => ({
            id: w.id,
            name: w.name,
            publicKey: w.publicKey,
            keypairSecretKey: Array.from(w.keypair.secretKey) // Store as array for JSON serialization
          })),
          activeWalletId: activeWallet.id
        });
      }

      // Run Migration for the active wallet
      if (activeWallet) {
        await get().migrateLocalStorageToFirestore(activeWallet.keypair);
      }
      
      // Fetch created coins from Firestore for active wallet
      const fetchedCoins = activeWallet 
        ? await getCreatedCoins(activeWallet.publicKey) 
        : [];
      
      // Set state with wallet data
      set({ 
        wallets,
        activeWallet,
        wallet: activeWallet?.keypair || null, // Backwards compatibility
        createdCoins: fetchedCoins || [],
        investmentAmount: storedInvestment.investmentAmount || 0
      });

      // Get initial balance and token balances
      await get().getBalance();
      await get().refreshTokenBalances();

      // Set up auto-refresh every minute
      const autoRefresh = setInterval(async () => {
        if (get().activeWallet) {
          await get().getBalance();
          await get().refreshTokenBalances();
        } else {
          clearInterval(autoRefresh);
        }
      }, REFRESH_INTERVAL);

      // Add visibility change listener for Chrome extension
      if (!DEV_MODE && document.hidden !== undefined) {
        document.addEventListener('visibilitychange', async () => {
          if (!document.hidden && get().activeWallet) {
            await get().getBalance();
            await get().refreshTokenBalances();
          }
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to initialize wallet:', error);
      set({ 
        error: `Failed to initialize wallet: ${errorMessage}. Please try reloading the extension.`,
        wallets: [],
        activeWallet: null,
        wallet: null 
      });
    }
  },

  createNewWallet: async (name: string) => {
    try {
      const { wallets } = get();
      
      // Generate new wallet
      const keypair = Keypair.generate();
      const walletId = uuidv4();
      
      // Create wallet info
      const newWallet: WalletInfo = {
        id: walletId,
        name: name.trim(),
        publicKey: keypair.publicKey.toString(),
        keypair,
        isActive: false
      };
      
      // Add to existing wallets (not making it active by default)
      const updatedWallets = [...wallets, newWallet];
      
      // Save to storage
      await storage.set({
        wallets: updatedWallets.map(w => ({
          id: w.id,
          name: w.name,
          publicKey: w.publicKey,
          keypairSecretKey: Array.from(w.keypair.secretKey)
        }))
      });
      
      // Log wallet creation event
      await logEventToFirestore('wallet_created', {
        walletAddress: newWallet.publicKey,
        timestamp: new Date().toISOString()
      });
      
      // Update state
      set({ wallets: updatedWallets });
      
      return newWallet;
    } catch (error) {
      console.error('Failed to create new wallet:', error);
      throw error;
    }
  },

  importWallet: async (name: string, privateKeyString: string) => {
    try {
      const { wallets } = get();
      
      // Parse input: JSON, seed phrase (mnemonic), or raw private key (hex/base58)
      let keypair: Keypair | undefined;
      // 1. Try JSON input (array of bytes or object with secretKey/data)
      try {
        const parsed = JSON.parse(privateKeyString);
        if (Array.isArray(parsed)) {
          if (parsed.length === 64) {
            keypair = Keypair.fromSecretKey(new Uint8Array(parsed));
          } else if (parsed.length === 32) {
            keypair = Keypair.fromSeed(new Uint8Array(parsed));
          }
        } else if (parsed && typeof parsed === 'object') {
          const arr = (parsed as any).secretKey ?? (parsed as any).data;
          if (Array.isArray(arr) && arr.length === 64) {
            keypair = Keypair.fromSecretKey(new Uint8Array(arr));
          }
        }
      } catch {
        // Not JSON or invalid JSON
      }
      // 2. Try seed phrase (mnemonic) if not JSON keypair
      if (!keypair) {
        const words = privateKeyString.trim().split(/\s+/);
        if (words.length >= 12 && words.length % 3 === 0) {
          try {
            const bip39 = await import('bip39');
            if (bip39.validateMnemonic(privateKeyString.trim())) {
              const seedBuffer = await bip39.mnemonicToSeed(privateKeyString.trim());
              const seed = new Uint8Array(seedBuffer).slice(0, 32);
              keypair = Keypair.fromSeed(seed);
            } else {
              throw new Error('Invalid seed phrase');
            }
          } catch {
            throw new Error('Invalid seed phrase. Please provide a valid mnemonic.');
          }
        }
      }
      // 3. Fallback: raw private key (hex or base58)
      if (!keypair) {
        let privateKeyBytes: Uint8Array;
        const cleanHex = privateKeyString.replace(/\s+/g, '').replace(/^0x/i, '');
        if (/^[0-9a-fA-F]{128}$/.test(cleanHex)) {
          privateKeyBytes = new Uint8Array(
            cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
          );
        } else {
          const bs58 = await import('bs58');
          privateKeyBytes = bs58.decode(privateKeyString.trim());
        }
        if (privateKeyBytes.length !== 64) {
          throw new Error('Invalid private key length. Expected 64-byte secret key.');
        }
        keypair = Keypair.fromSecretKey(privateKeyBytes);
      }
      const walletId = uuidv4();
      
      // Check if this wallet already exists
      const publicKey = keypair.publicKey.toString();
      const existingWallet = wallets.find(w => w.publicKey === publicKey);
      
      if (existingWallet) {
        throw new Error('This wallet has already been imported.');
      }
      
      // Create wallet info
      const importedWallet: WalletInfo = {
        id: walletId,
        name: name.trim(),
        publicKey,
        keypair,
        isActive: false
      };
      
      // Add to existing wallets
      const updatedWallets = [...wallets, importedWallet];
      
      // Save to storage
      await storage.set({
        wallets: updatedWallets.map(w => ({
          id: w.id,
          name: w.name,
          publicKey: w.publicKey,
          keypairSecretKey: Array.from(w.keypair.secretKey)
        }))
      });
      
      // Log wallet import event
      await logEventToFirestore('wallet_imported', {
        walletAddress: importedWallet.publicKey,
        timestamp: new Date().toISOString()
      });
      
      // Update state
      set({ wallets: updatedWallets });
      
      return importedWallet;
    } catch (error) {
      console.error('Failed to import wallet:', error);
      throw error;
    }
  },

  switchWallet: async (walletId: string) => {
    try {
      const { wallets } = get();
      
      // Find the wallet to switch to
      const targetWallet = wallets.find(w => w.id === walletId);
      
      if (!targetWallet) {
        throw new Error('Wallet not found');
      }
      
      // Update all wallets to set the active one
      const updatedWallets = wallets.map(w => ({
        ...w,
        isActive: w.id === walletId
      }));
      
      // Save the active wallet ID to storage
      await storage.set({
        activeWalletId: walletId,
        wallets: updatedWallets.map(w => ({
          id: w.id,
          name: w.name,
          publicKey: w.publicKey,
          keypairSecretKey: Array.from(w.keypair.secretKey)
        }))
      });
      
      // Fetch created coins for the new active wallet
      const fetchedCoins = await getCreatedCoins(targetWallet.publicKey);
      
      // Update state
      set({ 
        wallets: updatedWallets,
        activeWallet: targetWallet,
        wallet: targetWallet.keypair, // Backwards compatibility
        createdCoins: fetchedCoins || []
      });
      
      // Get balance for new active wallet
      await get().getBalance();
      await get().refreshTokenBalances();

    } catch (error) {
      console.error('Failed to switch wallet:', error);
      throw error;
    }
  },

  removeWallet: async (walletId: string) => {
    try {
      const { wallets, activeWallet } = get();
      
      // Cannot remove the active wallet
      if (activeWallet?.id === walletId) {
        throw new Error('Cannot remove the active wallet. Switch to another wallet first.');
      }
      
      // Need at least one wallet
      if (wallets.length <= 1) {
        throw new Error('Cannot remove the only wallet.');
      }
      
      // Remove the wallet
      const updatedWallets = wallets.filter(w => w.id !== walletId);
      
      // Save to storage
      await storage.set({
        wallets: updatedWallets.map(w => ({
          id: w.id,
          name: w.name,
          publicKey: w.publicKey,
          keypairSecretKey: Array.from(w.keypair.secretKey)
        }))
      });
      
      // Update state
      set({ wallets: updatedWallets });
      
    } catch (error) {
      console.error('Failed to remove wallet:', error);
      throw error;
    }
  },

  renameWallet: async (walletId: string, newName: string) => {
    try {
      const { wallets } = get();
      
      if (!newName.trim()) {
        throw new Error('Wallet name cannot be empty');
      }
      
      // Update the wallet name
      const updatedWallets = wallets.map(w => 
        w.id === walletId 
          ? { ...w, name: newName.trim() } 
          : w
      );
      
      // Save to storage
      await storage.set({
        wallets: updatedWallets.map(w => ({
          id: w.id,
          name: w.name,
          publicKey: w.publicKey,
          keypairSecretKey: Array.from(w.keypair.secretKey)
        }))
      });
      
      // Update state and activeWallet if it was the one renamed
      const updatedActiveWallet = get().activeWallet && get().activeWallet.id === walletId
        ? { ...get().activeWallet, name: newName.trim() }
        : get().activeWallet;
        
      set({ 
        wallets: updatedWallets,
        activeWallet: updatedActiveWallet
      });
      
    } catch (error) {
      console.error('Failed to rename wallet:', error);
      throw error;
    }
  },

  migrateLocalStorageToFirestore: async (wallet: Keypair) => {
    if (!wallet) return; // Should not happen if called after wallet init
    set({ migrationStatus: 'running' });
    const walletAddress = wallet.publicKey.toString();
    let migrationError: string | null = null;
    let localCoinsMigrated = 0;
    let eventCoinsMigrated = 0;
    let totalUniqueMigrated = 0;

    try {
      // 1. Check if migration already ran
      const migrationRecord = await storage.get('tokens_migrated');
      if (migrationRecord.tokens_migrated) {
        console.log('Token migration already completed on:', migrationRecord.tokens_migrated);
        set({ migrationStatus: 'complete' });
        return; 
      }

      console.log('Starting token migration...');

      // 2. Fetch data from local storage and events
      const localData = await storage.get('createdCoins');
      const localCoins: CreatedCoin[] = localData.createdCoins || [];
      const launchEvents = await getLaunchedTokenEvents(walletAddress);

      // 3. Combine and deduplicate
      const combinedCoinsMap = new Map<string, CreatedCoin>();

      // Process local coins first (potentially more complete data)
      localCoins.forEach(coin => {
        if (coin.address) { // Ensure address exists
          combinedCoinsMap.set(coin.address, { ...coin, balance: coin.balance || 0 }); // Ensure balance is set
        }
      });
      localCoinsMigrated = combinedCoinsMap.size;

      // Process event data, adding only if not already present from local storage
      launchEvents.forEach(event => {
        // Assuming event has contractAddress, name, ticker
        // Need to map event fields to CreatedCoin fields
        const address = event.contractAddress; 
        if (address && !combinedCoinsMap.has(address)) {
          combinedCoinsMap.set(address, {
            address: address,
            name: event.name || 'Unknown Name', 
            ticker: event.ticker || 'UNKNOWN', 
            pumpUrl: `https://pump.fun/coin/${address}`, // Construct pumpUrl
            balance: 0, // Initial balance, will be updated by refreshTokenBalances
          });
          eventCoinsMigrated++; // Count only those added from events
        }
      });

      totalUniqueMigrated = combinedCoinsMap.size;
      console.log(`Found ${localCoinsMigrated} coins locally, ${launchEvents.length} launch events. Migrating ${totalUniqueMigrated} unique coins.`);

      // 4. Add unique coins to Firestore
      const migrationPromises = Array.from(combinedCoinsMap.values()).map(coin => 
        addCreatedCoinToFirestore(walletAddress, coin)
      );
      
      await Promise.all(migrationPromises);
      console.log('Successfully migrated coins to Firestore.');

      // 5. Log migration event
      const migrationTimestamp = new Date().toISOString();
      await logEventToFirestore('tokens_migrated', {
        walletAddress,
        localCoinsMigrated,
        eventCoinsFound: launchEvents.length,
        eventCoinsAdded: eventCoinsMigrated,
        totalUniqueMigrated,
        migratedAt: migrationTimestamp
      });

      // 6. Set migration flag in local storage
      await storage.set({ tokens_migrated: migrationTimestamp });
      set({ migrationStatus: 'complete' });
      console.log('Token migration completed successfully.');

    } catch (error) {
      migrationError = error instanceof Error ? error.message : 'Unknown migration error';
      console.error('Token migration failed:', error);
      set({ migrationStatus: 'error', error: `Migration failed: ${migrationError}` });
    }
  },

  getBalance: async () => {
    const { activeWallet } = get();
    if (!activeWallet) return;

    try {
      set({ isRefreshing: true });
      const lamports = await connection.getBalance(activeWallet.publicKey);
      const solBalance = lamports / 1e9;

      set({ 
        balance: solBalance,
        error: null,
        isRefreshing: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to connect to Solana network';
      
      console.error('Failed to get balance:', error);
      set({ 
        error: `Failed to fetch wallet balance: ${errorMessage}`,
        isRefreshing: false
      });
    }
  },

  addCreatedCoin: async (coin: CreatedCoin) => {
    try {
      const { activeWallet, createdCoins } = get();
      if (!activeWallet) throw new Error('Wallet not initialized when adding coin');

      // Add the new coin (potentially without createdAt yet)
      let updatedCoins = [...createdCoins, { ...coin, createdAt: new Date() }]; // Add with client date temporarily
      
      // Sort immediately after adding
      updatedCoins.sort((a, b) => {
        const timeA = a.createdAt 
          ? (a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.toDate().getTime()) 
          : 0;
        const timeB = b.createdAt 
          ? (b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.toDate().getTime()) 
          : 0;
        return timeB - timeA; // Descending order
      });
      
      set({ createdCoins: updatedCoins }); // Update state optimistically

      // Save to Firestore (which adds server timestamp)
      await addCreatedCoinToFirestore(activeWallet.publicKey, coin); 
    } catch (error) {
      console.error('Failed to add created coin:', error);
      throw error;
    }
  },

  setInvestmentAmount: async (amount: number) => {
    try {
      await storage.set({ investmentAmount: amount });
      set({ investmentAmount: amount });
    } catch (error) {
      console.error('Failed to save investment amount:', error);
      throw error;
    }
  },

  updateCoinBalance: async (address: string, balance: number) => {
    try {
      const { createdCoins } = get();
      // Keep the existing order when updating balance
      const updatedCoins = createdCoins.map(coin => 
        coin.address === address ? { ...coin, balance } : coin
      );
      // No need to sort here as order doesn't change
      set({ createdCoins: updatedCoins });
    } catch (error) {
      console.error('Failed to update coin balance:', error);
      throw error;
    }
  },

  refreshTokenBalances: async () => {
    const { activeWallet, createdCoins } = get();
    if (!activeWallet || createdCoins.length === 0) return;

    try {
      const balancePromises = createdCoins.map(async (coin) => {
        const balance = await connection.getTokenBalance(
          coin.address,
          activeWallet.publicKey
        );
        return { address: coin.address, balance };
      });

      const balances = await Promise.all(balancePromises);
      
      // Keep the existing order when updating balances
      const updatedCoins = createdCoins.map(coin => {
        const balanceInfo = balances.find(b => b.address === coin.address);
        return balanceInfo ? { ...coin, balance: balanceInfo.balance } : coin;
      });

      // No need to sort here as order doesn't change
      set({ createdCoins: updatedCoins });
    } catch (error) {
      console.error('Failed to refresh token balances:', error);
    }
  },

  checkVersion: async () => {
    try {
      const response = await fetch(APP_VERSION_API_URL);
      if (!response.ok) throw new Error('Failed to fetch version');
      const { app: { version } } = await response.json();
      const isLatestVersion = compareVersions(APP_VERSION, version) >= 0
      set({ 
        updateAvailable: isLatestVersion ? null : version,
        isLatestVersion
      });
    } catch (error) {
      console.error('Version check failed:', error);
      // Fail safe - assume current version is latest if check fails
      set({ isLatestVersion: true });
    }
  },

  getArticleData: async () => {
    if (typeof chrome == 'undefined' ||  !chrome?.tabs) {
      throw new Error('Chrome tabs not supported');
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tabs[0]?.id) {
      throw new Error('No active tab found');
    }

    let response;

    try {
      response = await chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ARTICLE_DATA' });
    } catch (e) {
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['src/contentScript.tsx']
      });
      response = await chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ARTICLE_DATA' });
    }

    return response;
  },

  getTokenCreationData: async (article: ArticleData, level: number = 1): Promise<TokenCreationData> => {
    // Construct payload carefully, omitting image/images
    const payloadArticle = {
      title: article.title,
      description: article.description,
      url: article.url,
      isXPost: article.isXPost,
      author: article.author,
      xUrl: article.xUrl,
    };

    const response = await fetch(TOKEN_CREATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Send the cleaned payload
      body: JSON.stringify({ article: payloadArticle, level })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token creation data: ${response.statusText}`);
    }

    return response.json()
  },

  createCoin: async ({ name, ticker, description, imageUrl, imageFile, websiteUrl, twitter, telegram, investmentAmount }: CoinCreationParams) => {
    const { activeWallet } = get();
    if (!activeWallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      // Generate a random keypair for the token
      const mintKeypair = Keypair.generate();

      // Create form data for metadata
      const formData = new FormData();
      
      // Append image data: use provided blob or fetch from URL
      let fileBlob: Blob;
      if (imageFile) {
        fileBlob = imageFile;
      } else if (imageUrl) {
        const imgRes = await fetch(imageUrl);
        fileBlob = await imgRes.blob();
      } else {
        throw new Error('No image provided for coin creation');
      }
      formData.append("file", fileBlob);
      
      // Append other metadata
      formData.append("name", name);
      formData.append("symbol", ticker);
      formData.append("description", description);
      if (websiteUrl) formData.append("website", websiteUrl);
      if (twitter) formData.append("twitter", twitter);
      if (telegram) formData.append("telegram", telegram);
      formData.append("showName", "true");

      // Create IPFS metadata storage
      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
      });

      if (!metadataResponse.ok) {
        throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
      }

      const metadataResponseJSON = await metadataResponse.json();

      // Get the create transaction
      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          publicKey: activeWallet.publicKey,
          action: "create",
          tokenMetadata: {
            name: metadataResponseJSON.metadata.name,
            symbol: metadataResponseJSON.metadata.symbol,
            uri: metadataResponseJSON.metadataUri
          },
          mint: mintKeypair.publicKey.toString(),
          denominatedInSol: "true",
          amount: investmentAmount,
          slippage: 10,
          priorityFee: 0.0005,
          pool: "pump"
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create transaction: ${response.statusText}`);
      }

      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      
      // Sign with both the mint keypair and wallet
      tx.sign([mintKeypair, activeWallet.keypair]);
      
      // Send the transaction
      const signature = await web3Connection.sendTransaction(tx);
      
      // Wait for confirmation
      const confirmation = await web3Connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      const tokenAddress = mintKeypair.publicKey.toString();
      const pumpUrl = `https://pump.fun/coin/${tokenAddress}`;

      // Log an analytics event with relevant info
      logEventToFirestore('token_launched', {
        walletAddress: activeWallet.publicKey,
        contractAddress: tokenAddress,
        name,
        ticker,
        investmentAmount,
      });

      return {
        address: tokenAddress,
        pumpUrl
      };

    } catch (error) {
      console.error('Failed to create coin:', error);
      throw error;
    }
  }
}));