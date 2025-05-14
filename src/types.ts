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
    balance: number; // Quantity of the token
    usdPrice?: number; // USD price per token
    usdValue?: number; // Total USD value of this coin holding (balance * usdPrice)
    createdAt?: Timestamp | Date;
    /**
     * The wallet address under which this coin was created
     */
    walletAddress?: string;
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
    nativeSolBalance: number; // Balance of native SOL
    totalPortfolioUsdValue: number; // Total USD value of all assets (SOL + SPL tokens)
    error: string | null;
    createdCoins: CreatedCoin[];
    isRefreshing: boolean;
    investmentAmount: number;
    isLatestVersion: boolean;
    updateAvailable: string | null;
    migrationStatus: 'idle' | 'running' | 'complete' | 'error';
    initializeWallet: () => Promise<void>;
    /**
     * Create a new wallet using a generated mnemonic seed phrase.
     * Returns the wallet info along with the mnemonic for user backup.
     */
    createNewWallet: (name: string) => Promise<WalletInfo & { mnemonic: string }>;
    importWallet: (name: string, privateKeyString: string) => Promise<WalletInfo>;
    switchWallet: (walletId: string) => Promise<void>;
    removeWallet: (walletId: string) => Promise<void>;
    renameWallet: (walletId: string, newName: string) => Promise<void>;
    // getBalance: () => Promise<void>; // Will be replaced by refreshPortfolioData
    addCreatedCoin: (coin: CreatedCoin) => Promise<void>;
    setInvestmentAmount: (amount: number) => Promise<void>;
    updateCoinBalance: (address: string, balance: number) => Promise<void>; // This might need re-evaluation if balance includes USD value
    // refreshTokenBalances: () => Promise<void>; // Will be replaced by refreshPortfolioData
    refreshPortfolioData: () => Promise<void>; // New consolidated refresh function
    /**
     * Address book mapping from address to user label
     */
    addressBook: Record<string, string>;
    /**
     * Add or update an entry in the address book
     */
    addAddressBookEntry: (address: string, label: string) => Promise<void>;
    /**
     * Remove an entry from the address book
     */
    removeAddressBookEntry: (address: string) => Promise<void>;
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
    // wallet: Wallet | null; // This type seems problematic, WalletInfo might be intended.
    activeWallet: WalletInfo | null; // Assuming activeWallet info is needed
    // balance: number; // Removed, will be sourced from store
    isRefreshing: boolean;
    address: string;
    logoAnimated: boolean;
    navAnimated: boolean;
    controlsAnimated: boolean;
    showWallet: boolean;
    showWalletDrawer: boolean;
    glitching: boolean;
    onRefresh: () => void;
    onToggleWallet: () => void;
    onViewWallet: () => void;
    onViewOverview: () => void;
    onCopyAddress: () => void;
    onToggleWalletDrawer: () => void;
    onManageWallets: () => void;
    onOpenSidebar: () => void;
    onCloseSidebar: () => void;
    onSwap: () => void;
    onViewCreatedCoins: () => void;
    onViewMyCoins: () => void;
    onTokenCreate: () => void;
    showSwap: boolean;
    copyConfirm: boolean;
}

export interface WalletData {
  id: string;
  name: string;
  publicKey: string;
  isActive: boolean;
  avatar?: string;
}