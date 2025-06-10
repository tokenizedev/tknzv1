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
    createCoinRemote: (params: CoinCreationParams) => Promise<{ address: string; pumpUrl: string; }>;
    /**
     * Preview token creation: fetch unsigned transaction and fee/amount breakdown
     */
    /**
     * Preview data for token creation, including fees and totals
     */
    previewData: {
      mintKeypair: Keypair;
      serializedTransaction: string;
      feeAmount: number;       // Platform fee in SOL
      pumpFeeAmount: number;   // Pump portal fee in SOL
      totalAmount: number;     // Investment amount in SOL
      netAmount: number;       // Net investment amount (equal to totalAmount)
      totalCost: number;       // Total cost to user (totalAmount + pumpFeeAmount + feeAmount)
      name: string;
      ticker: string;
    } | null;
    /**
     * Preview token creation: fetch unsigned tx and fee/amount breakdown
     */
    previewCreateCoinRemote: (params: CoinCreationParams) => Promise<{
      feeAmount: number;
      pumpFeeAmount: number;
      totalAmount: number;
      netAmount: number;
      totalCost: number;
    }>;
    /**
     * Confirm and execute a previously previewed token creation transaction
     */
    confirmPreviewCreateCoin: () => Promise<{ address: string; pumpUrl: string }>;
    /**
     * Clear any preview transaction data without executing
     */
    clearPreviewCreateCoin: () => void;
    /**
     * Create a new liquidity pool via Meteora: builds, signs, and sends the transaction
     * Returns pool metadata and signature
     */
    /**
     * Create a new token and liquidity pool via Meteora: calls backend,
     * signs and sends mint + pool transactions, returns result details.
     */
    createMeteoraPool: (params: CoinCreationParams) => Promise<{
      /** Signature of the mint creation transaction */
      signatureMint: string;
      /** Signature of the pool creation transaction */
      signaturePool: string;
      /** Mint address of the new token */
      mint: string;
      /** Associated token account for the mint */
      ata: string;
      /** Metadata URI stored on IPFS */
      metadataUri: string;
      /** Pool address created by Meteora */
      pool: string;
      /** Token decimals */
      decimals: number;
      /** Initial supply (human-readable) */
      initialSupply: number;
      /** Initial supply in raw smallest units */
      initialSupplyRaw: string;
      /** SOL deposited into the pool (UI units) */
      depositSol: number;
      /** SOL deposit in lamports */
      depositLamports: number;
      /** Fee SOL amount (UI units) */
      feeSol: number;
      /** Fee in lamports */
      feeLamports: number;
      /** Whether liquidity is locked */
      isLockLiquidity: boolean;
    }>;
    /** Parameters for SDK token create, used to pre-populate form fields */
    initialTokenCreateParams: Partial<CoinCreationParams> | null;
    /** Set initial parameters for SDK token create prefill */
    setInitialTokenCreateParams: (params: Partial<CoinCreationParams>) => void;
    /** Clear initial SDK token create parameters */
    clearInitialTokenCreateParams: () => void;
    getArticleData: () => Promise<ArticleData>;
    getTokenCreationData: (article: ArticleData, level: number) => Promise<TokenCreationData>;
    checkVersion: () => Promise<void>;
    migrateLocalStorageToFirestore: (wallet: Keypair) => Promise<void>;
    /**
     * Update the avatar for a given wallet
     */
    updateWalletAvatar: (walletId: string, avatar: string) => Promise<void>;
    /**
     * Selected exchange domain (e.g., 'pump.fun')
     */
    selectedExchange: string;
    /**
     * Full URL of the selected exchange (e.g., 'https://pump.fun')
     */
    exchangeUrl: string;
    /**
     * Update the selected exchange
     */
    setSelectedExchange: (exchange: string) => Promise<void>;
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