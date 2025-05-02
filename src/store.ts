import { create } from 'zustand';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import { logEventToFirestore } from './firebase';
import { APP_VERSION } from './config/version';
import { storage } from './utils/storage';
import { createConnection, web3Connection } from './utils/connection';
const DEV_MODE = process.env.NODE_ENV === 'development' && !chrome?.tabs;
import { compareVersions } from 'compare-versions'

interface CreatedCoin {
  address: string;
  name: string;
  ticker: string;
  pumpUrl: string;
  balance: number;
}

interface CoinCreationParams {
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  twitter?: string;
  telegram?: string;
  investmentAmount: number;
}

//make a tyhpe for this data
interface TokenCreationData {
  article: {
    title: string;
    image: string;
    description: string;
    url: string;
    isXPost: boolean;
  };
  token: {
    name: string;
    ticker: string;
    description: string;
  };
}

interface WalletState {
  wallet: Keypair | null;
  balance: number;
  error: string | null;
  createdCoins: CreatedCoin[];
  isRefreshing: boolean;
  investmentAmount: number;
  isLatestVersion: boolean;
  updateAvailable: string | null;
  initializeWallet: () => Promise<void>;
  getBalance: () => Promise<void>;
  addCreatedCoin: (coin: CreatedCoin) => Promise<void>;
  setInvestmentAmount: (amount: number) => Promise<void>;
  updateCoinBalance: (address: string, balance: number) => Promise<void>;
  refreshTokenBalances: () => Promise<void>;
  createCoin: (params: CoinCreationParams) => Promise<{ address: string; pumpUrl: string; }>;
  getArticleData: () => Promise<ArticleData>;
  getTokenCreationData: (article: ArticleData, level: number) => Promise<TokenCreationData>;
  checkVersion: () => Promise<void>;
}

interface ArticleData {
  title: string
  image: string
  description: string
  url: string
  author?: string
  xUrl?: string,
  isXPost: boolean
}

const TOKEN_CREATION_API_URL = 'https://tknz.fun/.netlify/functions/article-token';
const APP_VERSION_API_URL = 'https://tknz.fun/.netlify/functions/version';





const connection = createConnection();

// Refresh interval in milliseconds (1 minute)
const REFRESH_INTERVAL = 60 * 1000;

export const useStore = create<WalletState>((set, get) => ({
  wallet: null,
  balance: 0,
  error: null,
  createdCoins: [],
  isRefreshing: false,
  investmentAmount: 0,
  isLatestVersion: true,
  updateAvailable: null,

  initializeWallet: async () => {
    try {
      set({ error: null });

      const stored = await storage.get('walletSecret');
      const storedCoins = await storage.get('createdCoins');
      const storedInvestment = await storage.get('investmentAmount');
      let wallet: Keypair;
      
      if (stored.walletSecret && Array.isArray(stored.walletSecret)) {
        try {
          const secret = new Uint8Array(stored.walletSecret);
          wallet = Keypair.fromSecretKey(secret);
        } catch (e) {
          console.error('Invalid stored wallet secret, generating new wallet');
          wallet = Keypair.generate();
          await storage.set({
            walletSecret: Array.from(wallet.secretKey)
          });
        }
      } else {
        wallet = Keypair.generate();
        await storage.set({
          walletSecret: Array.from(wallet.secretKey)
        });
      }
      
      set({ 
        wallet,
        createdCoins: storedCoins.createdCoins || [],
        investmentAmount: storedInvestment.investmentAmount || 0
      });

      // Get initial balance and token balances
      await get().getBalance();
      await get().refreshTokenBalances();

      // Set up auto-refresh every minute
      const autoRefresh = setInterval(async () => {
        if (get().wallet) {
          await get().getBalance();
          await get().refreshTokenBalances();
        } else {
          clearInterval(autoRefresh);
        }
      }, REFRESH_INTERVAL);

      // Add visibility change listener for Chrome extension
      if (!DEV_MODE && document.hidden !== undefined) {
        document.addEventListener('visibilitychange', async () => {
          if (!document.hidden && get().wallet) {
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
        wallet: null 
      });
    }
  },

  getBalance: async () => {
    const { wallet } = get();
    if (!wallet) return;

    try {
      set({ isRefreshing: true });
      const lamports = await connection.getBalance(wallet.publicKey.toString());
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
      const { createdCoins } = get();
      const updatedCoins = [...createdCoins, coin];
      await storage.set({ createdCoins: updatedCoins });
      set({ createdCoins: updatedCoins });
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
      const updatedCoins = createdCoins.map(coin => 
        coin.address === address ? { ...coin, balance } : coin
      );
      await storage.set({ createdCoins: updatedCoins });
      set({ createdCoins: updatedCoins });
    } catch (error) {
      console.error('Failed to update coin balance:', error);
      throw error;
    }
  },

  refreshTokenBalances: async () => {
    const { wallet, createdCoins } = get();
    if (!wallet || createdCoins.length === 0) return;

    try {
      const balancePromises = createdCoins.map(async (coin) => {
        const balance = await connection.getTokenBalance(
          coin.address,
          wallet.publicKey.toString()
        );
        return { address: coin.address, balance };
      });

      const balances = await Promise.all(balancePromises);
      
      const updatedCoins = createdCoins.map(coin => {
        const balanceInfo = balances.find(b => b.address === coin.address);
        return balanceInfo ? { ...coin, balance: balanceInfo.balance } : coin;
      });

      await storage.set({ createdCoins: updatedCoins });
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
      set({ isLatestVersion });
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

  getTokenCreationData: async (article: ArticleData, level: number = 1) => {
    const response = await fetch(TOKEN_CREATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ article, level })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token creation data: ${response.statusText}`);
    }

    return response.json()
  },

  createCoin: async ({ name, ticker, description, imageUrl, websiteUrl, twitter, telegram, investmentAmount }) => {
    const { wallet } = get();
    if (!wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      // Generate a random keypair for the token
      const mintKeypair = Keypair.generate();

      // Create form data for metadata
      const formData = new FormData();
      
      // Fetch and append the image
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      formData.append("file", imageBlob);
      
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
          publicKey: wallet.publicKey.toString(),
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
      tx.sign([mintKeypair, wallet]);
      
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
        walletAddress: wallet.publicKey.toString(),
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