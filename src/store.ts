import { create } from 'zustand';
import { Keypair, PublicKey, Connection, VersionedTransaction } from '@solana/web3.js';
import OpenAI from 'openai';
import bs58 from 'bs58';

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

interface WalletState {
  wallet: Keypair | null;
  balance: number;
  error: string | null;
  createdCoins: CreatedCoin[];
  isRefreshing: boolean;
  investmentAmount: number;
  initializeWallet: () => Promise<void>;
  getBalance: () => Promise<void>;
  addCreatedCoin: (coin: CreatedCoin) => Promise<void>;
  setInvestmentAmount: (amount: number) => Promise<void>;
  updateCoinBalance: (address: string, balance: number) => Promise<void>;
  refreshTokenBalances: () => Promise<void>;
  generateAIMeme: (prompt: string, level: number) => Promise<{ name: string; ticker: string; description: string; }>;
  createCoin: (params: CoinCreationParams) => Promise<{ address: string; pumpUrl: string; }>;
}

// Development mode mock data
const DEV_MODE = process.env.NODE_ENV === 'development' && !window.chrome?.storage;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

// Mock storage for development
const devStorage = {
  data: new Map<string, any>(),
  get: async (key: string) => ({ [key]: devStorage.data.get(key) }),
  set: async (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      devStorage.data.set(key, value);
    });
  }
};

// Storage interface that works in both environments
const storage = {
  get: async (key: string): Promise<Record<string, any>> => {
    try {
      if (DEV_MODE || !window.chrome?.storage?.local) {
        return devStorage.get(key);
      }
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            resolve({});
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Storage get error:', error);
      return {};
    }
  },
  set: async (data: Record<string, any>): Promise<void> => {
    try {
      if (DEV_MODE || !window.chrome?.storage?.local) {
        return devStorage.set(data);
      }
      return new Promise((resolve, reject) => {
        chrome.storage.local.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }
};

// RPC endpoint
const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=8fb5b733-fd3e-41e0-8493-e1c994cf008a';

// Create web3 connection
const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Create a connection with retry support for balance checks
const createConnection = () => {
  const getBalance = async (publicKey: string): Promise<number> => {
    const body = {
      jsonrpc: '2.0',
      id: 'bolt',
      method: 'getBalance',
      params: [
        publicKey,
        { commitment: 'confirmed' }
      ]
    };

    try {
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      return data.result?.value ?? 0;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  };

  const getTokenBalance = async (tokenAddress: string, ownerAddress: string): Promise<number> => {
    const body = {
      jsonrpc: '2.0',
      id: 'bolt',
      method: 'getTokenAccountsByOwner',
      params: [
        ownerAddress,
        {
          mint: tokenAddress
        },
        {
          encoding: 'jsonParsed'
        }
      ]
    };

    try {
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }

      const accounts = data.result?.value || [];
      if (accounts.length === 0) return 0;

      // Get the first account's balance
      const balance = accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      return balance;
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
      return 0;
    }
  };

  return { getBalance, getTokenBalance };
};

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
  
  generateAIMeme: async (prompt: string, level: number) => {
    const systemPrompt = `You are a blockchain tokenization expert specializing in creating literal and accurate token names for social media content. Your primary goal is to accurately represent the content, especially at Level 0.

### **Level 0 (Most Important - Current level: ${level === 0}):**
- **Core Principle:** 100% literal, no creativity, just facts
- **Name Format:**
  - For tweets with images: Use format "[Subject] Image" (e.g., "Bitcoin Chart Image", "Cat Photo")
  - For text-only tweets: Use 2-4 key words that summarize the main point
- **Ticker:** Direct abbreviation of key words (2-5 chars recommended, but can be up to 15)
- **Description:**
  - Long tweets (>100 chars): Summarize the key point in one clear sentence
  - Short tweets: Use the exact tweet text
  - Remove hashtags and @mentions
- **Absolutely NO:**
  - Emojis
  - Meme references
  - Crypto slang
  - Marketing language
  - Exclamation marks
- **Example:**
  Tweet: "Just deployed our new AI model that can generate photorealistic images from text descriptions! #AI #Tech"
  Output:
  {
    "name": "AI Model Deployment",
    "ticker": "AIMD",
    "description": "Announcement of new AI model deployment for text-to-image generation"
  }

### **Level 1 (Current level: ${level === 1}):**
- 90% literal content, 10% style
- One emoji maximum
- Keep focus on the actual content
- Example:
  {
    "name": "AI Vision Launch",
    "ticker": "AIVL",
    "description": "New AI model transforms text into photorealistic images ✨"
  }

### **Level 2 (Current level: ${level === 2}):**
- 75% literal content, 25% style
- Two emojis maximum
- Example:
  {
    "name": "AI Creator Pro",
    "ticker": "AIC",
    "description": "Text-to-image AI technology revolutionizing digital art 🎨 🤖"
  }

### **Level 3 (Current level: ${level === 3}):**
- 50% literal content, 50% style
- Three emojis maximum
- Example:
  {
    "name": "AI Pixel Magic",
    "ticker": "MAGIC",
    "description": "Turn your words into masterpieces with our new AI! 🎨 ✨ 🚀"
  }

### **Critical Rules:**
1. Level 0 must be COMPLETELY LITERAL - no creative elements
2. All levels must clearly reference the actual content
3. Never use generic names
4. Ticker suggestions should be 2-5 characters, all caps (though user can input up to 15)
5. No "coin" or "token" words
6. For Level 0, if it's a retweet or quote tweet, focus on the quoted content
7. For Level 0, if there's an image, explicitly mention it in the name

Output Format:
{
  "name": "Literal Name",
  "ticker": "TICK",
  "description": "Literal Description"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7 + (level * 0.1) // Increase creativity with level
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      return JSON.parse(response);
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
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

      return {
        address: tokenAddress,
        pumpUrl
      };

    } catch (error) {
      console.error('Failed to create coin:', error);
      throw error;
    }
  },

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
      const balance = await connection.getBalance(wallet.publicKey.toString());
      
      set({ 
        balance: balance / 1e9, // Convert lamports to SOL
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
  }
}));