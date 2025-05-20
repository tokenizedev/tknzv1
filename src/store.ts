import { create } from 'zustand';
import { Keypair, VersionedTransaction, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction, TokenAmount } from '@solana/web3.js';
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
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { getTokenInfo, getUltraBalances, getPrices, BalanceInfo } from './services/jupiterService';
import { WalletState, CreatedCoin, ArticleData, CoinCreationParams, TokenCreationData, WalletInfo } from './types';
import { v4 as uuidv4 } from 'uuid';

const TOKEN_CREATION_API_URL = 'https://tknz.fun/.netlify/functions/article-token';
const COIN_CREATE_API_URL = 'https://tknz.fun/.netlify/functions/create-token-tx';
const APP_VERSION_API_URL = 'https://tknz.fun/.netlify/functions/version';
const SOL_PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

const NATIVE_MINT = 'So11111111111111111111111111111111111111112';
const connection = createConnection();
const REFRESH_INTERVAL = 60 * 1000;

/**
 * Derive seed from mnemonic using PBKDF2-HMAC-SHA512 via Web Crypto API.
 * Returns a 64-byte Uint8Array.
 */
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
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 2048,
      hash: 'SHA-512'
    },
    keyMaterial,
    512
  );
  return new Uint8Array(derivedBits);
}

// Fetch the USD price for an SPL token or SOL using Jupiter lite-api
async function fetchPriceForToken(mintAddress: string): Promise<number> {
  // Native SOL price via Coingecko
  if (mintAddress === NATIVE_MINT) {
    try {
      const priceResponse = await fetch(SOL_PRICE_API_URL);
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        return priceData.solana?.usd || 0;
      }
    } catch (error) {
      console.error(`Failed to fetch SOL price for ${mintAddress}:`, error);
    }
    return 0;
  }
  // Example flat price for USDC (replace with actual mint if needed)
  if (mintAddress.toLowerCase() === 'epjfixtd3cvsmr9ftjmy5x5rpc17hm1ccly48jmyrhbf') {
    return 1.0;
  }
  // Other tokens: use Jupiter lite-api with caching
  try {
    const priceResp = await getPrices([mintAddress], 'usd');
    const detail = priceResp.data[mintAddress];
    return detail ? parseFloat(detail.price) : 0;
  } catch (error) {
    console.warn(`Could not fetch price for token ${mintAddress}:`, error);
    return 0;
  }
}

export const useStore = create<WalletState>((set, get) => ({
  wallets: [],
  activeWallet: null,
  wallet: null,
  nativeSolBalance: 0,
  totalPortfolioUsdValue: 0,
  error: null,
  createdCoins: [],
  isRefreshing: false,
  investmentAmount: 0,
  isLatestVersion: true,
  updateAvailable: null,
  migrationStatus: 'idle',
  // Address book entries (address -> label)
  addressBook: {},
  // Default exchange domain and URL
  selectedExchange: 'pump.fun',
  exchangeUrl: 'https://pump.fun',
  /**
   * Update the selected exchange and persist across sessions
   */
  setSelectedExchange: async (exchange: string) => {
    // Build URL based on selected exchange
    let url: string;
    switch (exchange) {
      case 'birdeye':
      case 'birdeye.so':
        url = 'https://birdeye.so/token/';
        break;
      case 'solscan':
      case 'solscan.io':
        url = 'https://solscan.io/token/';
        break;
      case 'gmgn':
      case 'GMGN':
        url = 'https://gmgn.ai/sol/token/solscan_';
        break;
      default:
        url = 'https://pump.fun';
    }
    // Persist selection
    try {
      await storage.set({ selectedExchange: exchange });
    } catch (err) {
      console.error('Failed to persist selected exchange:', err);
    }
    // Update store
    set({ selectedExchange: exchange, exchangeUrl: url });
  },

  initializeWallet: async () => {
    try {
      set({ error: null });
      // Load persisted exchange selection
      try {
        const storedExch = await storage.get('selectedExchange');
        const exch = storedExch.selectedExchange || get().selectedExchange;
        
        await get().setSelectedExchange(exch);
      } catch (e) {
        console.error('Failed to load persisted exchange:', e);
      }
      const storedWallets = await storage.get('wallets');
      const storedActiveWalletId = await storage.get('activeWalletId');
      const storedInvestment = await storage.get('investmentAmount');
      let wallets: WalletInfo[] = [];
      let activeWallet: WalletInfo | null = null;

      if (storedWallets.wallets && Array.isArray(storedWallets.wallets) && storedWallets.wallets.length > 0) {
        wallets = storedWallets.wallets.map((walletData: any) => {
          const secretKey = new Uint8Array(walletData.keypairSecretKey);
          const keypair = Keypair.fromSecretKey(secretKey);
          return {
            avatar: walletData.avatar,
            id: walletData.id,
            name: walletData.name,
            publicKey: walletData.publicKey,
            keypair,
            isActive: walletData.id === storedActiveWalletId.activeWalletId
          };
        });
        activeWallet = wallets.find(w => w.isActive) || wallets[0];
        if (activeWallet && !wallets.find(w => w.isActive)) activeWallet.isActive = true;
      } else {
        const storedLegacySecret = await storage.get('walletSecret');
        if (storedLegacySecret.walletSecret && Array.isArray(storedLegacySecret.walletSecret)) {
            try {
                const secret = new Uint8Array(storedLegacySecret.walletSecret);
                const keypair = Keypair.fromSecretKey(secret);
                const walletId = uuidv4();
                activeWallet = { id: walletId, name: 'Primary Wallet', publicKey: keypair.publicKey.toString(), keypair, isActive: true };
                wallets = [activeWallet];
            } catch (e) {
                console.error('Invalid legacy secret, generating new wallet');
                const keypair = Keypair.generate();
                const walletId = uuidv4();
                activeWallet = { id: walletId, name: 'Primary Wallet', publicKey: keypair.publicKey.toString(), keypair, isActive: true };
                wallets = [activeWallet];
            }
        } else {
            const keypair = Keypair.generate();
            const walletId = uuidv4();
            activeWallet = { id: walletId, name: 'Primary Wallet', publicKey: keypair.publicKey.toString(), keypair, isActive: true };
            wallets = [activeWallet];
        }
        await storage.set({
          wallets: wallets.map(w => ({ id: w.id, name: w.name, publicKey: w.publicKey, keypairSecretKey: Array.from(w.keypair.secretKey), avatar: (w as any).avatar })),
          activeWalletId: activeWallet.id
        });
      }

      if (activeWallet) {
        await get().migrateLocalStorageToFirestore(activeWallet.keypair);
      }
      
      const fetchedCoins = activeWallet ? await getCreatedCoins(activeWallet.publicKey) : [];
      
      // Load persisted address book
      const storedAB = await storage.get('addressBook');
      const addressBook = storedAB.addressBook ?? {};
      set({ 
        wallets,
        activeWallet,
        wallet: activeWallet?.keypair || null,
        createdCoins: fetchedCoins || [],
        investmentAmount: storedInvestment.investmentAmount || 0,
        addressBook
      });

      await get().refreshPortfolioData();

      const autoRefresh = setInterval(async () => {
        if (get().activeWallet) {
          await get().refreshPortfolioData();
        } else {
          clearInterval(autoRefresh);
        }
      }, REFRESH_INTERVAL);

      if (!DEV_MODE && document.hidden !== undefined) {
        document.addEventListener('visibilitychange', async () => {
          if (!document.hidden && get().activeWallet) {
            await get().refreshPortfolioData();
          }
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to initialize wallet:', error);
      set({ error: `Failed to initialize wallet: ${errorMessage}.`, wallets: [], activeWallet: null, wallet: null });
    }
  },
  
  refreshPortfolioData: async () => {
    const { activeWallet } = get();
    if (!activeWallet) return;

    set({ isRefreshing: true });
    let currentNativeSolBalance = 0;
    let nativeSolTotalUsdValue = 0;
    let sumOfSplTokensUsdValue = 0;
    const updatedCreatedCoins: CreatedCoin[] = [];

    try {
      // 1. Fetch Native SOL Data
      const lamports = await connection.getBalance(activeWallet.publicKey);
      currentNativeSolBalance = lamports / LAMPORTS_PER_SOL;
      
      const solPriceUsd = await fetchPriceForToken(NATIVE_MINT); // Using NATIVE_MINT for SOL price
      nativeSolTotalUsdValue = currentNativeSolBalance * solPriceUsd;

      // 2. Fetch SPL Token Data
      const currentCoins = get().createdCoins;
      for (const coin of currentCoins) {
        let tokenUiAmount = 0;
        let tokenPrice = 0;
        let tokenTotalUsdValue = 0;
        try {
          const tokenBalanceInfo = await web3Connection.getTokenAccountBalance(new PublicKey(coin.address));
          // Check if tokenBalanceInfo.value exists and has uiAmount
          if (tokenBalanceInfo && tokenBalanceInfo.value) {
             tokenUiAmount = tokenBalanceInfo.value.uiAmount || 0;
          } else {
            // If coin.address is not a token account but a mint, try to get ATA balance
             try {
                const ata = await getAssociatedTokenAddress(new PublicKey(coin.address), new PublicKey(activeWallet.publicKey));
                const ataBalanceInfo = await web3Connection.getTokenAccountBalance(ata);
                if (ataBalanceInfo && ataBalanceInfo.value) {
                    tokenUiAmount = ataBalanceInfo.value.uiAmount || 0;
                }
             } catch (ataError) {
                console.warn(`Could not get ATA balance for mint ${coin.address}:`, ataError);
             }
          }

          tokenPrice = await fetchPriceForToken(coin.address);
          tokenTotalUsdValue = tokenUiAmount * tokenPrice;
          sumOfSplTokensUsdValue += tokenTotalUsdValue;
          
          updatedCreatedCoins.push({ 
            ...coin, 
            balance: tokenUiAmount, 
            usdPrice: tokenPrice, 
            usdValue: tokenTotalUsdValue 
          });
        } catch (tokenError) {
          console.error(`Error processing token ${coin.name} (${coin.address}):`, tokenError);
          updatedCreatedCoins.push({ ...coin, balance: 0, usdPrice: 0, usdValue: 0 }); // Push with zero values on error
        }
      }

      // 3. Calculate Total Portfolio USD using Ultra Balances for all tokens
      let newTotalPortfolioUsdValue = 0;
      try {
        const rawBalances: Record<string, BalanceInfo> = await getUltraBalances(activeWallet.publicKey);
        const balances: Record<string, BalanceInfo> = {};
        for (const [mint, info] of Object.entries(rawBalances)) {
          const key = mint === 'SOL' ? NATIVE_MINT : mint;
          if (info.uiAmount > 0) {
            balances[key] = info;
          }
        }
        const entries = Object.entries(balances);
        if (entries.length > 0) {
          const mints = entries.map(([mint]) => mint);
          let priceMap: Record<string, { price: string }> = {};
          try {
            const priceResp = await getPrices(mints);
            priceMap = priceResp.data;
          } catch (priceErr) {
            console.error('Failed to fetch prices for portfolio value:', priceErr);
          }
          newTotalPortfolioUsdValue = entries.reduce((sum, [mint, info]) => {
            const detail = priceMap[mint];
            const price = detail ? parseFloat(detail.price) : 0;
            return sum + price * info.uiAmount;
          }, 0);
        }
      } catch (err) {
        console.error('Failed to compute total portfolio value via Ultra:', err);
      }

      // 4. Set State
      set({
        nativeSolBalance: currentNativeSolBalance,
        balance: currentNativeSolBalance,
        totalPortfolioUsdValue: newTotalPortfolioUsdValue,
        createdCoins: updatedCreatedCoins,
        isRefreshing: false,
        error: null,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh portfolio data';
      console.error('Failed to refresh portfolio data:', error);
      set({
        isRefreshing: false,
        error: errorMessage,
        // Optionally reset values or keep stale ones
        // nativeSolBalance: 0, 
        // totalPortfolioUsdValue: 0,
      });
    }
  },

  createNewWallet: async (name: string) => {
    try {
      const { wallets } = get();
      
      // Generate new wallet via a mnemonic seed phrase and derive keypair
      const bip39 = await import('bip39');
      const mnemonic: string = bip39.generateMnemonic();
      // Derive seed using Web Crypto instead of Buffer-dependent bip39.mnemonicToSeed
      const seedArray = await deriveSeedFromMnemonic(mnemonic);
      const seed = seedArray.slice(0, 32);
      const keypair = Keypair.fromSeed(seed);
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
          keypairSecretKey: Array.from(w.keypair.secretKey),
          avatar: w.avatar
        }))
      });
      
      // Log wallet creation event
      await logEventToFirestore('wallet_created', {
        walletAddress: newWallet.publicKey,
        timestamp: new Date().toISOString()
      });
      
      // Update state
      set({ wallets: updatedWallets });
      
      // Return wallet info along with the mnemonic for backup
      return Object.assign(newWallet, { mnemonic });
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
              // Derive seed from mnemonic using Web Crypto
              const seedArray = await deriveSeedFromMnemonic(privateKeyString.trim());
              const seed = seedArray.slice(0, 32);
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
          keypairSecretKey: Array.from(w.keypair.secretKey),
          avatar: w.avatar
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
      const targetWallet = wallets.find(w => w.id === walletId);
      if (!targetWallet) throw new Error('Wallet not found');

      const updatedWallets = wallets.map(w => ({ ...w, isActive: w.id === walletId }));
      await storage.set({
        activeWalletId: walletId,
        wallets: updatedWallets.map(w => ({ id: w.id, name: w.name, publicKey: w.publicKey, keypairSecretKey: Array.from(w.keypair.secretKey), avatar: w.avatar }))
      });
      
      const fetchedCoins = await getCreatedCoins(targetWallet.publicKey);
      
      set({ 
        wallets: updatedWallets,
        activeWallet: targetWallet,
        wallet: targetWallet.keypair,
        createdCoins: fetchedCoins || [] 
      });
      
      await get().refreshPortfolioData(); // Refresh for new wallet

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
          keypairSecretKey: Array.from(w.keypair.secretKey),
          avatar: w.avatar
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
          keypairSecretKey: Array.from(w.keypair.secretKey),
          avatar: w.avatar
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
  /**
   * Update the avatar for a wallet
   */
  updateWalletAvatar: async (walletId: string, avatar: string) => {
    try {
      const { wallets } = get();
      const updatedWallets = wallets.map(w =>
        w.id === walletId ? { ...w, avatar } : w
      );
      // Persist updated wallets with avatar
      await storage.set({
        wallets: updatedWallets.map(w => ({
          id: w.id,
          name: w.name,
          publicKey: w.publicKey,
          keypairSecretKey: Array.from(w.keypair.secretKey),
          avatar: w.avatar
        }))
      });
      set({ wallets: updatedWallets });
    } catch (error) {
      console.error('Failed to update wallet avatar:', error);
      throw error;
    }
  },
  /**
   * Add or update an entry in the address book
   */
  addAddressBookEntry: async (address: string, label: string) => {
    const { addressBook } = get();
    const newBook = { ...addressBook, [address]: label };
    await storage.set({ addressBook: newBook });
    set({ addressBook: newBook });
  },
  /**
   * Remove an entry from the address book
   */
  removeAddressBookEntry: async (address: string) => {
    const { addressBook } = get();
    const newBook = { ...addressBook };
    delete newBook[address];
    await storage.set({ addressBook: newBook });
    set({ addressBook: newBook });
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

      // Fetch SOL price and calculate USD balance
      let usdBalance = 0;
      try {
        const priceResponse = await fetch(SOL_PRICE_API_URL);
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          const solPriceUsd = priceData.solana?.usd;
          if (solPriceUsd) {
            usdBalance = solBalance * solPriceUsd;
          }
        }
      } catch (priceError) {
        console.error('Failed to fetch SOL price:', priceError);
        // Keep usdBalance as 0 or handle error as needed
      }

      set({ 
        balance: solBalance,
        usdBalance: usdBalance,
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

      let updatedCoins = [...createdCoins, { ...coin, createdAt: new Date(), usdPrice:0, usdValue: 0 }]; 
      updatedCoins.sort((a, b) => {
        const timeA = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any).toDate().getTime()) : 0;
        const timeB = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any).toDate().getTime()) : 0;
        return timeB - timeA;
      });
      
      set({ createdCoins: updatedCoins });
      try {
        await storage.set({ createdCoins: updatedCoins });
      } catch (err) {
        console.error('Failed to persist created coins to storage:', err);
      }
      try {
        await addCreatedCoinToFirestore(activeWallet.publicKey, coin); // Original coin without local enrichments
      } catch (err) {
        console.error('Failed to add created coin to Firestore:', err);
      }
      // Optionally trigger a portfolio refresh after adding a new coin
      await get().refreshPortfolioData();
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
    // This function might be less relevant if refreshPortfolioData handles all balance and value updates.
    // If used for optimistic updates, ensure it aligns with the CreatedCoin structure.
    try {
      const { createdCoins } = get();
      const coinToUpdate = createdCoins.find(c => c.address === address);
      const usdPrice = coinToUpdate?.usdPrice || 0;

      const updatedCoins = createdCoins.map(coin => 
        coin.address === address ? { ...coin, balance, usdValue: balance * usdPrice } : coin
      );
      set({ createdCoins: updatedCoins });
      try {
        await storage.set({ createdCoins: updatedCoins });
      } catch (err) {
        console.error('Failed to persist updated coin balances to storage:', err);
      }
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

      // Update state optimistically
      set({ createdCoins: updatedCoins });
      // Persist updated token balances to storage
      try {
        await storage.set({ createdCoins: updatedCoins });
      } catch (err) {
        console.error('Failed to persist refreshed token balances to storage:', err);
      }
    } catch (error) {
      console.error('Failed to refresh token balances:', error);
    }
  },

  checkVersion: async () => {
    try {
      const response = await fetch(APP_VERSION_API_URL);
      if (!response.ok) throw new Error('Failed to fetch version');
      // Parse version from response; support both { latest } and { app: { version } }
      const data = await response.json();
      const latestVersion = data.latest ?? data.app?.version ?? '';
      // Treat empty APP_VERSION as 0.0.0 for comparison
      const isLatestVersion = compareVersions(APP_VERSION || '0.0.0', latestVersion) >= 0;
      set({
        updateAvailable: isLatestVersion ? null : latestVersion,
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
    if (ticker.trim().toUpperCase() === 'TKNZ') {
      throw new Error("Ticker 'TKNZ' is reserved and cannot be used.");
    }
    try {
      const mintKeypair = Keypair.generate();
      const formData = new FormData();
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
      formData.append("name", name);
      formData.append("symbol", ticker);
      formData.append("description", description);
      if (websiteUrl) formData.append("website", websiteUrl);
      if (twitter) formData.append("twitter", twitter);
      if (telegram) formData.append("telegram", telegram);
      formData.append("showName", "true");

      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
      });
      if (!metadataResponse.ok) throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
      const metadataResponseJSON = await metadataResponse.json();

      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok) throw new Error(`Failed to create transaction: ${response.statusText}`);
      const data = await response.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(data));
      tx.sign([mintKeypair, activeWallet.keypair]);
      // Send raw signed versioned transaction
      const rawTx = tx.serialize();
      const signature = await web3Connection.sendRawTransaction(rawTx);
      const confirmation = await web3Connection.confirmTransaction(signature);
      if (confirmation.value.err) throw new Error('Transaction failed to confirm');

      const tokenAddress = mintKeypair.publicKey.toString();
      const pumpUrl = `https://pump.fun/coin/${tokenAddress}`;
      logEventToFirestore('token_launched', { walletAddress: activeWallet.publicKey, contractAddress: tokenAddress, name, ticker, investmentAmount });
      
      // Add to created coins and refresh portfolio
      await get().addCreatedCoin({ address: tokenAddress, name, ticker, pumpUrl, balance: 0 /* will be updated by refresh */ });
      // refreshPortfolioData is called by addCreatedCoin

      return { address: tokenAddress, pumpUrl };
    } catch (error) {
      console.error('Failed to create coin:', error);
      throw error;
    }
  },

  createCoinRemote: async ({ name, ticker, description, imageUrl, websiteUrl, twitter, telegram, investmentAmount }: CoinCreationParams) => {
    // Client-side token creation: call server endpoint, sign & send transaction
    const { activeWallet } = get();
    if (!activeWallet) throw new Error('Wallet not initialized');
    // Build request payload
    const mintKeypair = Keypair.generate();
    const payload = {
      walletAddress: activeWallet.publicKey,
      token: { name, ticker, description, imageUrl, websiteUrl, twitter, telegram },
      portalParams: { amount: investmentAmount, slippage: 10, mint: mintKeypair.publicKey.toString(), priorityFee: 0.0005, pool: 'pump' }
    };
    // Use timeout for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    let response: Response;
    try {
      response = await fetch(COIN_CREATE_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Network error creating token: ${msg}`);
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Server error: ${response.status} ${text}`);
    }
    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response JSON from create-token endpoint');
    }
    const { transaction } = data;
    if (typeof transaction !== 'string') {
      throw new Error('Missing transaction in server response');
    }
    // Deserialize, sign, and send versioned transaction
    let txV: VersionedTransaction;
    try {
      const txBytes = Buffer.from(transaction, 'base64');
      txV = VersionedTransaction.deserialize(txBytes);
    } catch (err) {
      throw new Error('Failed to deserialize versioned transaction');
    }
    try {
      txV.sign([mintKeypair, activeWallet.keypair]);
    } catch {
      throw new Error('Failed to sign transaction');
    }
    let signature: string;
    try {
      const rawTx = txV.serialize();
      signature = await web3Connection.sendRawTransaction(rawTx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to send transaction: ${msg}`);
    }
    const confirmation = await web3Connection.confirmTransaction(signature);
    if (confirmation.value.err) {
      throw new Error('Transaction failed on chain');
    }
    // Persist and return
    const tokenAddress = mintKeypair.publicKey.toString();
    const pumpUrl = `https://pump.fun/coin/${tokenAddress}`;
    try {
      logEventToFirestore('token_launched', { walletAddress: activeWallet.publicKey, contractAddress: tokenAddress, name, ticker, investmentAmount });
      await get().addCreatedCoin({ address: tokenAddress, name, ticker, pumpUrl, balance: 0 });
    } catch (err) {
      console.error('Error persisting created coin:', err);
    }
    return { address: tokenAddress, pumpUrl };
  },
  // Preview-only token creation: fetch unsigned tx and fee info
  previewData: null,
  previewCreateCoinRemote: async ({ name, ticker, description, imageUrl, websiteUrl, twitter, telegram, investmentAmount }: CoinCreationParams) => {
    const { activeWallet } = get();
    if (!activeWallet) throw new Error('Wallet not initialized');
    const mintKeypair = Keypair.generate();
    const response = await fetch(COIN_CREATE_API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: activeWallet.publicKey,
        token: { name, ticker, description, imageUrl, websiteUrl, twitter, telegram },
        portalParams: { amount: investmentAmount, slippage: 10, mint: mintKeypair.publicKey.toString(), priorityFee: 0.0005, pool: 'pump' }
      })
    });
    if (!response.ok) throw new Error(`Preview request failed: ${response.statusText}`);
    const data = await response.json();
    const { transaction, feeAmount, pumpFeeAmount, totalAmount, netAmount, totalCost } = data;
    // Store preview details including both fees and total cost
    set({ previewData: {
      mintKeypair,
      serializedTransaction: transaction,
      feeAmount,
      pumpFeeAmount,
      totalAmount,
      netAmount,
      totalCost,
      name,
      ticker
    } });
    return { feeAmount, pumpFeeAmount, totalAmount, netAmount, totalCost };
  },
  confirmPreviewCreateCoin: async () => {
    const { activeWallet, previewData } = get();
    if (!activeWallet) throw new Error('Wallet not initialized');
    if (!previewData) throw new Error('No preview transaction found');
    const { mintKeypair, serializedTransaction, feeAmount, totalAmount, netAmount, name, ticker } = previewData;
    // Deserialize, sign, and send versioned preview transaction
    const txV = VersionedTransaction.deserialize(Buffer.from(serializedTransaction, 'base64'));
    txV.sign([mintKeypair, activeWallet.keypair]);
    const rawTx = txV.serialize();
    const sig = await web3Connection.sendRawTransaction(rawTx);
    const conf = await web3Connection.confirmTransaction(sig);
    if (conf.value.err) throw new Error('Transaction failed to confirm');
    const tokenAddress = mintKeypair.publicKey.toString();
    const pumpUrl = `https://pump.fun/coin/${tokenAddress}`;
    logEventToFirestore('token_launched', { walletAddress: activeWallet.publicKey, contractAddress: tokenAddress, name, ticker, investmentAmount: totalAmount });
    await get().addCreatedCoin({ address: tokenAddress, name, ticker, pumpUrl, balance: 0 });
    set({ previewData: null });
    return { address: tokenAddress, pumpUrl };
  },
  clearPreviewCreateCoin: () => set({ previewData: null }),
  // Send native SOL or SPL token to a recipient address
  sendToken: async (mintAddress: string, recipient: string, amount: number): Promise<string> => {
    const { activeWallet } = get();
    if (!activeWallet) throw new Error('Wallet not initialized');
    try {
      const { keypair } = activeWallet;
      const destPubkey = new PublicKey(recipient);
      let signature = '';
      if (mintAddress === NATIVE_MINT) {
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: keypair.publicKey, toPubkey: destPubkey, lamports }));
        signature = await web3Connection.sendTransaction(tx, [keypair]);
      } else {
        const mintPubkey = new PublicKey(mintAddress);
        const fromATA = await getAssociatedTokenAddress(mintPubkey, keypair.publicKey);
        const toATA = await getAssociatedTokenAddress(mintPubkey, destPubkey);
        const instructions: TransactionInstruction[] = [];
        const ataInfo = await web3Connection.getAccountInfo(toATA);
        if (!ataInfo) {
          instructions.push(createAssociatedTokenAccountInstruction(keypair.publicKey, toATA, destPubkey, mintPubkey));
        }
        const meta = await getTokenInfo(mintAddress); // Potentially use this for decimals if not from balance info
        const rawAmount = BigInt(Math.floor(amount * 10 ** meta.decimals));
        instructions.push(createTransferInstruction(fromATA, toATA, keypair.publicKey, Number(rawAmount), [], TOKEN_PROGRAM_ID));
        const tx = new Transaction().add(...instructions);
        signature = await web3Connection.sendTransaction(tx, [keypair]);
      }
      // Return signature immediately; confirmation and portfolio refresh handled by UI
      return signature;
    } catch (error) {
      console.error('sendToken error:', error);
      throw error;
    }
  },
  
}));