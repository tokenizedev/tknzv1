export interface CreatedCoin {
    address: string;
    name: string;
    ticker: string;
    pumpUrl: string;
    balance: number;
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
  
export interface ArticleData {
    title: string
    image: string
    description: string
    url: string
    author?: string
    xUrl?: string,
    isXPost: boolean
}