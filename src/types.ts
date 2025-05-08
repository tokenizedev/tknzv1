import { Keypair } from '@solana/web3.js';
import { Timestamp } from 'firebase/firestore';

export interface WalletInfo {
    id: string; // Unique identifier for the wallet
    name: string; // User-friendly name for the wallet
    publicKey: string; // Public key in string format for easy use
    keypair: Keypair; // The actual wallet keypair
    isActive: boolean; // Whether this is the currently active wallet
    avatar?: string; // Optional avatar image (data URI or URL)
}

export interface CreatedCoin {
    address: string;
    name: string;
    ticker: string;
    pumpUrl: string;
    balance: number;
    createdAt?: Timestamp | Date;
}
  
export interface CoinCreationParams {
    name: string;
    ticker: string;
    description: string;
    // Provide either an image URL or a local file blob
    imageUrl?: string;
    imageFile?: Blob;
    websiteUrl: string;
    twitter?: string;
    telegram?: string;
    investmentAmount: number;
}
  
  //make a tyhpe for this data
export interface TokenCreationData {
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
  
export interface WalletState {
    wallets: WalletInfo[]; // List of all wallets
    activeWallet: WalletInfo | null; // Currently active wallet
    wallet: Keypair | null; // Kept for backward compatibility
    balance: number;
    error: string | null;
    createdCoins: CreatedCoin[];
    isRefreshing: boolean;
    investmentAmount: number;
    isLatestVersion: boolean;
    updateAvailable: string | null;
    migrationStatus: 'idle' | 'running' | 'complete' | 'error';
    initializeWallet: () => Promise<void>;
    createNewWallet: (name: string) => Promise<WalletInfo>;
    importWallet: (name: string, privateKeyString: string) => Promise<WalletInfo>;
    switchWallet: (walletId: string) => Promise<void>;
    removeWallet: (walletId: string) => Promise<void>;
    renameWallet: (walletId: string, newName: string) => Promise<void>;
    getBalance: () => Promise<void>;
    addCreatedCoin: (coin: CreatedCoin) => Promise<void>;
    setInvestmentAmount: (amount: number) => Promise<void>;
    updateCoinBalance: (address: string, balance: number) => Promise<void>;
    refreshTokenBalances: () => Promise<void>;
    createCoin: (params: CoinCreationParams) => Promise<{ address: string; pumpUrl: string; }>;
    getArticleData: () => Promise<ArticleData>;
    getTokenCreationData: (article: ArticleData, level: number) => Promise<TokenCreationData>;
    checkVersion: () => Promise<void>;
    migrateLocalStorageToFirestore: (wallet: Keypair) => Promise<void>;
    /**
     * Update the avatar for a given wallet
     */
    updateWalletAvatar: (walletId: string, avatar: string) => Promise<void>;
}
  
export interface ArticleData {
    title: string
    image: string
    description: string
    url: string
    author?: string
    xUrl?: string,
    isXPost: boolean
}

export interface NavigationProps {
    wallet: Wallet | null;
    balance: number;
    logoAnimated: boolean;
    navAnimated: boolean;
    controlsAnimated: boolean;
}