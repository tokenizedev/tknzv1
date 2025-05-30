import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Image, Type, FileText, Send, Loader2, AlertCircle, Globe, Sparkles, DollarSign, Hand as BrandX, GitBranch as BrandTelegram, Terminal, Zap, Target, X, Upload, ChevronLeft, ChevronRight, CheckCircle, Copy, ExternalLink, Hash } from 'lucide-react';
import { useStore } from '../store';
import type { CoinCreationParams } from '../types';
import { VersionBadge } from './VersionBadge';
import { Loader } from './Loader';
import { InsufficientFundsModal } from './InsufficientFundsModal';

interface ArticleData {
  title: string
  primaryImage: string
  image: string
  images: string[]
  description: string
  url: string
  author?: string
  xUrl?: string,
  isXPost: boolean
}

const DEV_MODE = process.env.NODE_ENV === 'development' && !chrome?.tabs;

const MOCK_ARTICLE_DATA: ArticleData = {
  title: "Bitcoin Reaches New All-Time High",
  primaryImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
  image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
  images: ["https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800"],
  description: "The world's largest cryptocurrency by market cap has reached a new milestone...",
  url: "https://example.com/bitcoin-ath",
  xUrl: "https://x.com/bitcoin",
  isXPost: false
};

interface CoinCreatorProps {
  isSidebar?: boolean;
  /** SDK initialization options for pre-filling the form */
  sdkOptions?: Partial<CoinCreationParams>;
  onCreationStart?: (innerHandleSubmit: () => Promise<void>) => Promise<void>;
  onCreationComplete?: (coinAddress: string) => void;
  onCreationError?: (errorMessage: string) => void;
}

// Pre-inject CSS for animations to avoid runtime injection
const animationStyleEl = typeof document !== 'undefined' ? document.createElement('style') : null;
if (animationStyleEl) {
  animationStyleEl.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0;
        transform: translateY(10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInOut {
      0% { opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { opacity: 0; }
    }
    
    @keyframes glitchIn {
      0% {
        opacity: 0;
        clip-path: inset(40% 0 61% 0);
        transform: translate(-2px, 0);
      }
      20% {
        clip-path: inset(92% 0 1% 0);
        transform: translate(3px, 0);
      }
      40% {
        clip-path: inset(43% 0 1% 0);
        transform: translate(-3px, 0);
      }
      60% {
        clip-path: inset(25% 0 58% 0);
        transform: translate(2px, 0);
      }
      80% {
        clip-path: inset(54% 0 7% 0);
        transform: translate(-2px, 0);
      }
      100% {
        opacity: 1;
        clip-path: inset(0 0 0 0);
        transform: translate(0, 0);
      }
    }
    
    @keyframes scanline {
      0% {
        transform: translateY(-100%);
      }
      100% {
        transform: translateY(100%);
      }
    }
    
    @keyframes blink {
      0% { opacity: 1; }
      5% { opacity: 0.3; }
      10% { opacity: 1; }
      15% { opacity: 0.5; }
      20% { opacity: 1; }
      100% { opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { 
        box-shadow: 0 0 4px 1px rgba(0, 255, 65, 0.2); 
      }
      50% { 
        box-shadow: 0 0 10px 2px rgba(0, 255, 65, 0.4); 
      }
    }
    
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.3s ease-out forwards;
    }
    
    .animate-fadeInOut {
      animation: fadeInOut 2s ease-out forwards;
    }
    
    .animate-glitchIn {
      animation: glitchIn 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    .animate-scanline {
      animation: scanline 2s linear infinite;
    }
    
    .animate-blink {
      animation: blink 1.5s step-end infinite;
    }
    
    .animate-pulse-border {
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    .skeleton-shimmer {
      background: linear-gradient(90deg, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.1) 50%, rgba(0, 255, 65, 0.05) 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    .cyber-transition {
      position: relative;
      overflow: hidden;
      transform: translateZ(0);
    }
    
    .cyber-transition::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(0, 255, 65, 0.5);
      transform: translateX(-100%);
      transition: transform 0.3s ease-out;
      z-index: 1;
    }
    
    .cyber-transition.active::before {
      transform: translateX(100%);
      transition: transform 0.6s ease-in;
    }
    
    .terminal-appear {
      position: relative;
      overflow: hidden;
    }
    
    .terminal-appear::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 255, 65, 0.15),
        transparent 3px,
        transparent 5px,
        rgba(0, 255, 65, 0.05) 5px
      );
      background-size: 100% 8px;
      animation: scanline 3s linear infinite;
      opacity: 0.3;
      pointer-events: none;
    }
  `;
  document.head.appendChild(animationStyleEl);
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton loader for form fields
const FieldSkeleton: React.FC<{ label: string; icon: React.ReactNode }> = React.memo(({ label, icon }) => (
  <div className="space-y-2">
    <label className="flex items-center text-sm font-terminal text-cyber-pink">
      {icon}
      {label}
    </label>
    <div className="h-10 bg-cyber-dark/50 border border-cyber-green/20 rounded-sm skeleton-shimmer"></div>
  </div>
));

// Memoized header actions component
const HeaderActions = React.memo<{
  onSelectContent: () => void;
  onGenerateSuggestions: () => void;
  onClearForm: () => void;
  isSuggestionsLoading: boolean;
  websiteUrl: string;
}>(({ onSelectContent, onGenerateSuggestions, onClearForm, isSuggestionsLoading, websiteUrl }) => (
  <div className="inline-flex rounded-sm overflow-hidden">
    <button
      onClick={onSelectContent}
      title="Select content to tokenize"
      className="bg-black border border-cyber-green/70 hover:bg-cyber-green/10 text-cyber-green px-3 py-1 font-terminal text-xs flex items-center border-r-0"
    >
      <Target className="w-3 h-3 mr-1" />
      <span className="uppercase">Select</span>
    </button>
    <button
      onClick={onGenerateSuggestions}
      disabled={isSuggestionsLoading || websiteUrl.includes('tknz.fun')}
      title="Memier"
      className="bg-black border border-cyber-green/70 hover:bg-cyber-green/10 text-cyber-green px-2 py-1 font-terminal text-xs flex items-center disabled:opacity-50 disabled:cursor-not-allowed border-r-0"
    >
      {isSuggestionsLoading ? (
        <Terminal className="w-3 h-3 animate-pulse" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      <span className="sr-only">MEMIER</span>
    </button>
    <button
      onClick={onClearForm}
      title="Clear form and start fresh"
      className="bg-black border border-cyber-green/70 hover:bg-cyber-green/10 text-cyber-green px-2 py-1 font-terminal text-xs flex items-center"
    >
      <X className="w-3 h-3" />
      <span className="sr-only">Clear</span>
    </button>
  </div>
));

// Memoized cost breakdown component
const CostBreakdown = React.memo<{
  previewData: any;
  isAutoPreviewLoading: boolean;
}>(({ previewData, isAutoPreviewLoading }) => (
  <div 
    className={`crypto-card p-4 space-y-3 border border-cyber-green/20 relative transition-all duration-300 ${
      isAutoPreviewLoading ? 'opacity-60' : 'opacity-100'
    }`}
  >
    <h3 className="text-sm font-terminal text-cyber-green uppercase">
      Cost Breakdown
      {isAutoPreviewLoading && (
        <span className="ml-2 text-cyber-green/60">
          <Loader2 className="w-3 h-3 inline animate-spin" />
        </span>
      )}
    </h3>
    
    {previewData && !isAutoPreviewLoading ? (
      <div className="space-y-1 font-terminal text-xs text-white">
        <p className="flex justify-between">
          <span>Pump Fee:</span> 
          <span>{previewData.pumpFeeAmount.toFixed(4)} SOL</span>
        </p>
        <p className="flex justify-between">
          <span>TKNZ Fee:</span> 
          <span>{previewData.feeAmount.toFixed(4)} SOL</span>
        </p>
        <p className="flex justify-between border-t border-cyber-green/30 pt-1 mt-1">
          <span>Investment:</span> 
          <span>{previewData.totalAmount.toFixed(4)} SOL</span>
        </p>
        <p className="flex justify-between border-t border-cyber-green/30 pt-1 mt-1">
          <span>Total:</span> 
          <span className="text-cyber-green">{previewData.totalCost.toFixed(4)} SOL</span>
        </p>
      </div>
    ) : (
      <div className="space-y-1">
        <div className="h-4 bg-cyber-green/10 rounded skeleton-shimmer"></div>
        <div className="h-4 bg-cyber-green/10 rounded skeleton-shimmer"></div>
        <div className="h-4 bg-cyber-green/10 rounded skeleton-shimmer"></div>
      </div>
    )}
  </div>
));

export const CoinCreator: React.FC<CoinCreatorProps> = ({ 
  isSidebar = false, 
  sdkOptions,
  onCreationStart, 
  onCreationComplete,
  onCreationError
}) => {
  // Combine SDK options and store-initialized params
  const initialParams = useStore(state => state.initialTokenCreateParams);
  const clearInitialParams = useStore(state => state.clearInitialTokenCreateParams);
  const sdkParams = sdkOptions ?? initialParams;

  // New helper function to handle errors consistently
  const handleError = (err: any) => {
    // extract detailed logs if available
    let msg = err instanceof Error ? err.message : String(err);
    try {
      if (typeof err.getLogs === 'function') {
        const logs: string[] = err.getLogs();
        msg += '\n' + logs.join('\n');
      } else if (Array.isArray(err.logs)) {
        msg += '\n' + err.logs.join('\n');
      }
    } catch {}
    
    setError(msg);
    if (onCreationError) {
      if (msg.includes('Transfer: insufficient lamports')) {
        onCreationError('Insufficient SOL balance');
      } else {
        onCreationError(msg.slice(0, 100));
      }
    }
    
    setIsCreating(false);
    setIsDeployTransitioning(false);
  };

  // Wallet and store hooks
  const { nativeSolBalance: balance, error: walletError, investmentAmount: defaultInvestment } = useStore(state => ({
    nativeSolBalance: state.nativeSolBalance,
    error: state.error,
    investmentAmount: state.investmentAmount,
    totalPortfolioUsdValue: state.totalPortfolioUsdValue
  }));
  const previewData = useStore(state => state.previewData);
  const previewCreateCoinRemote = useStore(state => state.previewCreateCoinRemote);
  const confirmPreviewCreateCoin = useStore(state => state.confirmPreviewCreateCoin);
  const clearPreviewCreateCoin = useStore(state => state.clearPreviewCreateCoin);
  
  const refreshPortfolioData = useStore(state => state.refreshPortfolioData);

  // Form state - initialize immediately
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    primaryImage: '',
    image: '',
    images: [],
    description: '',
    url: '',
    isXPost: false
  });
  const [coinName, setCoinName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(defaultInvestment);
  const [memeLevel, setMemeLevel] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [_loadingProgress, setLoadingProgress] = useState(0);
  const [createdCoin, setCreatedCoin] = useState<{
    address: string;
    pumpUrl: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Separate loading states for progressive loading
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  // State for image carousel
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // State for insufficient funds notice
  const [insufficientFunds, setInsufficientFunds] = useState(false)

  const [_isDeployTransitioning, setIsDeployTransitioning] = useState(false);

  // Add state for auto-preview
  const [isAutoPreviewLoading, setIsAutoPreviewLoading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  const [investmentInputValue, setInvestmentInputValue] = useState('');
  const [solPriceUsd, setSolPriceUsd] = useState<number>(0);
  // Integration mode: 'meteora' for pool creation, 'pumpportal' for token minting
  const [integrationMode, setIntegrationMode] = useState<'meteora' | 'pumpportal'>('meteora');

  // Store action for Meteora pool creation
  const createMeteoraPool = useStore(state => state.createMeteoraPool);
  // State for successful Meteora response
  const [meteoraSuccess, setMeteoraSuccess] = useState<{
    signature: string;
    pool: string;
    positionNft: string;
    config: string;
    decimals: { A: number; B: number };
    rawAmounts: { A: string; B: string };
    initialLiquidity: string;
    estimatedNetworkFee: number;
    antiSnipeVault?: string;
  } | null>(null);

  // Create debounced values for auto-preview trigger
  const debouncedCoinName = useDebounce(coinName, 1500); // Increased from 1000ms
  const debouncedTicker = useDebounce(ticker, 1500);
  const debouncedDescription = useDebounce(description, 1500);
  const debouncedImageUrl = useDebounce(imageUrl, 1500);
  const debouncedInvestmentAmount = useDebounce(investmentAmount, 1500);

  // Pre-populate form if SDK params are provided - do this immediately
  useEffect(() => {
    if (!sdkParams) return;
    if (sdkParams.name) setCoinName(sdkParams.name);
    if (sdkParams.ticker) setTicker(sdkParams.ticker);
    if (sdkParams.description) setDescription(sdkParams.description);
    if (sdkParams.imageUrl) { setImageUrl(sdkParams.imageUrl); setImageFile(null); }
    if (sdkParams.websiteUrl) setWebsiteUrl(sdkParams.websiteUrl);
    if (sdkParams.twitter) setXUrl(sdkParams.twitter);
    if (sdkParams.telegram) setTelegramUrl(sdkParams.telegram);
    if (sdkParams.investmentAmount != null) {
      setInvestmentAmount(sdkParams.investmentAmount);
      setInvestmentInputValue(sdkParams.investmentAmount.toString());
    }
    // If SDK params exist, we're not loading initial data
    setIsInitialDataLoading(false);
    // Clear store-based params if any
    clearInitialParams();
  }, [sdkParams, clearInitialParams]);

  // Check if form has minimum required fields
  useEffect(() => {
    const hasRequiredFields = Boolean(
      coinName.trim() && 
      ticker.trim() && 
      description.trim() && 
      (imageUrl.trim() || imageFile) &&
      investmentAmount > 0
    );
    setFormReady(hasRequiredFields);
  }, [coinName, ticker, description, imageUrl, imageFile, investmentAmount]);

  // Format SOL amount for display
  const formatSolAmount = useCallback((value: string): string => {
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimals
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 4
    if (parts.length === 2 && parts[1].length > 4) {
      parts[1] = parts[1].slice(0, 4);
    }
    
    return parts.join('.');
  }, []);

  const handleInvestmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatSolAmount(rawValue);
    
    // Always update the input value to preserve user's typing (including trailing zeros)
    setInvestmentInputValue(formatted);
    
    // Parse for numeric value
    const numValue = parseFloat(formatted);
    
    if (formatted === '' || formatted === '.' || isNaN(numValue)) {
      setInvestmentAmount(0);
      return;
    }
    
    if (numValue > 85) {
      setError('Maximum investment amount is 85 SOL');
      setInvestmentAmount(85);
      setInvestmentInputValue('85');
    } else if (numValue < 0) {
      setInvestmentAmount(0);
      setInvestmentInputValue('0');
    } else {
      setError(null);
      setInvestmentAmount(numValue);
    }
  }, [formatSolAmount]);

  // Sync input value with investment amount on mount and when defaultInvestment changes
  useEffect(() => {
    if (investmentAmount > 0 && !investmentInputValue) {
      setInvestmentInputValue(investmentAmount.toString());
    }
  }, [investmentAmount]);

  useEffect(() => {
    setInvestmentAmount(defaultInvestment);
    if (defaultInvestment > 0) {
      setInvestmentInputValue(defaultInvestment.toString());
    }
  }, [defaultInvestment]);

  // Auto-preview effect
  useEffect(() => {
    if (!formReady) {
      // Clear preview if form becomes invalid
      if (previewData) {
        clearPreviewCreateCoin();
        setHasAutoScrolled(false);
      }
      return;
    }

    // Only trigger if we have all required fields and values have stabilized
    const triggerAutoPreview = async () => {
      if (isCreating || isAutoPreviewLoading) return;
      
      setIsAutoPreviewLoading(true);
      setError(null);
      
      try {
        const params = buildParams();
        await previewCreateCoinRemote(params);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        console.error('Auto-preview failed:', msg);
        // Don't show error for auto-preview failures
      } finally {
        setIsAutoPreviewLoading(false);
      }
    };

    triggerAutoPreview();
  }, [
    debouncedCoinName, 
    debouncedTicker, 
    debouncedDescription, 
    debouncedImageUrl, 
    debouncedInvestmentAmount,
    formReady
  ]);

  // Auto-scroll to preview when it appears
  useEffect(() => {
    if (formReady && previewData && !isAutoPreviewLoading && !hasAutoScrolled) {
      setHasAutoScrolled(true);
      
      // Smooth scroll to bottom
      setTimeout(() => {
        if (mainContainerRef.current) {
          mainContainerRef.current.scrollTo({
            top: mainContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
        
        // Focus create button after scroll
        setTimeout(() => {
          if (createButtonRef.current) {
            createButtonRef.current.focus();
          }
        }, 500);
      }, 100);
    }
  }, [formReady, previewData, isAutoPreviewLoading, hasAutoScrolled]);

  // Handle close insufficient funds modal
  const handleCloseModal = useCallback(() => {
    setInsufficientFunds(false);
  }, []);

  // Handle content selection toggle: directly ask content script to start selection mode
  const handleSelectContent = useCallback(async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (tabId) {
        // Send message directly to content script
        chrome.tabs.sendMessage(tabId, { type: 'START_SELECT_MODE', isSidebar });
      } else {
        console.error('No active tab found for content selection');
      }
    } catch (e) {
      console.error('Failed to send START_SELECT_MODE message:', e);
    }
    if (!isSidebar) {
      window.close();
    }
  }, [isSidebar]);

  function getLocalStorageData() {
    return new Promise((resolve, _reject) => {
      chrome.storage.local.get('selectedContent', async ({ selectedContent }) => {
        try {
          if (selectedContent && typeof selectedContent === 'string') {
            chrome.storage.local.remove('selectedContent');
            resolve(JSON.parse(selectedContent) as ArticleData);
          } else if (selectedContent && typeof selectedContent === 'object') {
            chrome.storage.local.remove('selectedContent');
            resolve(selectedContent as ArticleData);
          } else {
            console.log('No selected content found');
            resolve(null);
          }
        } catch (e) {
          console.error('Failed to parse selected content:', e);
        }
      });
    });
  }

  // Fix for TypeScript error - ensure ArticleData has all required properties
  const ensureArticleData = (data: any): ArticleData => {
    // If data is null or undefined, return a default ArticleData object
    if (!data) {
      return {
        title: '',
        primaryImage: '',
        image: '',
        images: [],
        description: '',
        url: '',
        isXPost: false
      };
    }
    
    // Make sure we have both image properties for compatibility
    const primaryImage = data.primaryImage || data.image || '';
    
    // Return data with defaults for any missing properties
    return {
      title: data.title || '',
      primaryImage: primaryImage,
      image: primaryImage, // Set both image properties to the same value
      images: data.images || (primaryImage ? [primaryImage] : []),
      description: data.description || '',
      url: data.url || '',
      isXPost: data.isXPost || false
    };
  };
  const PUMP_FEE = 0.03;
  const requiredBalance = useMemo(() => investmentAmount + PUMP_FEE, [investmentAmount]);

  // Progress animation effect for the terminal loading
  useEffect(() => {
    if (isCreating) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 5;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [isCreating]);

  const generateSuggestions = useCallback(async (article: ArticleData, level = memeLevel) => {
    // Skip AI suggestion generation when initialized via SDK params or SDK options
    if (sdkParams) {
      setIsSuggestionsLoading(false);
      return;
    }
    setIsSuggestionsLoading(true);
    setError(null);
    try {
      console.error('Generating suggestions for:', article);
      console.log('Generating suggestions for:', article);
      // Check if it's TKNZ.FUN domain
      const isTknzDomain = article.url.includes('tknz.fun');
      const isTwitterUrl = article.url.includes('twitter.com') || article.url.includes('x.com');
      
      if (isTknzDomain) {
        setCoinName('TKNZ.FUN');
        setTicker('TKNZ');
        setDescription('TKNZ -- Tokenize Anything, Tokenize Everything. TKNZ empowers users to create their own tokens on Pump.fun directly from any web page or social media post. With this tool, the friction of launching a token is removed. No need to copy paste links or images. Just one click and the content is tokenized onto the blockchain forever!');
        setIsSuggestionsLoading(false);
        setImageUrl('https://tknz.fun/assets/hero.png');
        setWebsiteUrl(article.url);
        setXUrl('https://x.com/tknzfun');
        return;
      }

      // Make sure article has the 'image' property before passing to API
      const apiArticle = {
        ...article,
        image: article.primaryImage // Ensure it has the image property
      };

      const tokenCreationData = await useStore.getState().getTokenCreationData(apiArticle, level);
      const { token } = tokenCreationData;
      const { name } = token;
      
      if (!name) {
        throw new Error('No article title available');
      }

      if (isTwitterUrl) {
        setXUrl(article.url);
      } else {
        setWebsiteUrl(article.url);
      }

      setArticleData(article);
      setImageUrl(article.primaryImage);
      setCoinName(token.name);
      setTicker(token.ticker);
      setDescription(token.description);
      setMemeLevel((level + 1) % 4);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
      console.error('Error generating suggestions:', error);
      setError(errorMessage);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [sdkParams, memeLevel]);

  // Optimize initial data loading
  useEffect(() => {
    // If SDK params are provided, skip article extraction
    if (sdkParams) {
      setIsInitialDataLoading(false);
      return;
    }
    
    const getArticleData = async () => {
      try {
        setError(null);
        let data: ArticleData;

        if (DEV_MODE) {
          data = MOCK_ARTICLE_DATA;
          setArticleData(data);
          setWebsiteUrl(data.url);
          setImageUrl(data.primaryImage);
          // Don't await - let it run in background
          generateSuggestions(data, 0);
        } else {
          // Start fetching article data
          const fetchArticlePromise = getLocalStorageData().then(async (rawData) => {
            if (!rawData) {
              return await useStore.getState().getArticleData();
            }
            return rawData;
          });

          // Set initial data loading to false quickly to show form
          setIsInitialDataLoading(false);

          // Process article data when ready
          const rawData = await fetchArticlePromise;
          const articleData = ensureArticleData(rawData);
          
          // Don't await - let suggestions generate in background
          generateSuggestions(articleData, 0);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to extract page data';
        console.error('Error getting article data:', error);
        setError(errorMessage);
        
        // Still try to get URL from current tab
        if (!DEV_MODE && chrome?.tabs) {
          try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.url) {
              const isTwitterUrl = tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com');
              if (isTwitterUrl) {
                setXUrl(tabs[0].url);
              } else {
                setWebsiteUrl(tabs[0].url);
              }
            }
          } catch (e) {
            console.error('Failed to get tab URL:', e);
          }
        }
      } finally {
        setIsInitialDataLoading(false);
      }
    };

    // Start data fetching immediately
    getArticleData().catch(err => {
      console.error('Unhandled error in getArticleData:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsInitialDataLoading(false);
    });
  }, [sdkParams]);

  // Subscribe to active tab changes in side panel to re-fetch article data
  useEffect(() => {
    // Only in side panel environment
    if (!chrome?.tabs || !window.location.pathname.includes('sidebar.html')) {
      return;
    }
    const fetchForActiveTab = async () => {
      try {
        setError(null);
        setIsSuggestionsLoading(true);
        const rawData = await useStore.getState().getArticleData();
        const article = ensureArticleData(rawData);
        await generateSuggestions(article, 0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to extract page data';
        console.error('Error updating article data on tab change:', error);
        setError(errorMessage);
        // Fallback to URL if extraction fails
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tabs[0]?.url || '';
        if (url.includes('twitter.com') || url.includes('x.com')) {
          setXUrl(url);
        } else {
          setWebsiteUrl(url);
        }
      } finally {
        setIsSuggestionsLoading(false);
      }
    };
    const handleActivated = async ({ tabId }: { tabId: number }) => {
      await fetchForActiveTab();
    };
    const handleUpdated = async (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      if (tab.active && changeInfo.status === 'complete') {
        await fetchForActiveTab();
      }
    };
    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
    };
  }, []);

  // Listen for selectedContent in local storage when in side panel to refresh content
  useEffect(() => {
    if (!isSidebar || !chrome?.storage) return;
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local' && changes.selectedContent) {
        const newVal = changes.selectedContent.newValue;
        let data: any;
        try {
          data = typeof newVal === 'string' ? JSON.parse(newVal) : newVal;
        } catch (e) {
          console.error('Failed to parse selectedContent from storage:', e);
          data = newVal;
        }
        // Remove the key so it doesn't re-trigger
        chrome.storage.local.remove('selectedContent');
        
        const article = ensureArticleData(data);

        if (article.url && article.description && article.title) {
          generateSuggestions(article, 0);
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [isSidebar]);

  // Build parameters object from form state
  const buildParams = useCallback(() => {
    const params: any = {
      name: coinName,
      ticker,
      description,
      websiteUrl,
      twitter: xUrl,
      telegram: telegramUrl,
      investmentAmount
    };
    if (imageFile) params.imageFile = imageFile;
    else params.imageUrl = imageUrl;
    return params;
  }, [coinName, ticker, description, websiteUrl, xUrl, telegramUrl, investmentAmount, imageFile, imageUrl]);
  
  // Modify the handleSubmit to handle both preview and creation in one step
  const handleCreateCoin = useCallback(async () => {
    // Refresh wallet balance before submitting
    await refreshPortfolioData();
    const currentBalance = useStore.getState().nativeSolBalance;
    if (currentBalance < requiredBalance) {
      setInsufficientFunds(true);
      setError(`Insufficient balance. Please add at least ${requiredBalance.toFixed(2)} SOL to your wallet (${investmentAmount} SOL for investment + 0.03 SOL for fees).`);
      return;
    }

    setIsCreating(true);
    setError(null);
    // Reset previous results
    setMeteoraSuccess(null);
    setCreatedCoin(null);

    const createCoinCallback = async () => {
      try {
        // Handle Meteora integration: build, sign, and send via store
        if (integrationMode === 'meteora') {
          const params = buildParams();
          const res = await createMeteoraPool(params);
          setMeteoraSuccess(res);
          if (onCreationComplete) onCreationComplete(res.signature);
          return;
        }
        // PumpPortal integration: preview then confirm
        if (!previewData) {
          const params = buildParams();
          await previewCreateCoinRemote(params);
        }
        const res = await confirmPreviewCreateCoin();
        setCreatedCoin(res);
        if (onCreationComplete) {
          onCreationComplete(res.address);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsCreating(false);
      }
    };

    try {
      if (onCreationStart) {
        await onCreationStart(createCoinCallback);
      } else {
        await createCoinCallback();
      }
    } catch (err: any) {
      handleError(err);
    }
  }, [
    onCreationStart,
    onCreationComplete,
    onCreationError,
    handleError,
    buildParams,
    refreshPortfolioData,
    requiredBalance,
    previewData,
    previewCreateCoinRemote,
    confirmPreviewCreateCoin,
    createMeteoraPool,
    integrationMode
  ]);

  const clearForm = useCallback(() => {
    setArticleData({
      title: '',
      primaryImage: '',
      image: '',
      images: [],
      description: '',
      url: '',
      isXPost: false
    });
    setCoinName('');
    setTicker('');
    setDescription('');
    setImageUrl('');
    setWebsiteUrl('');
    setXUrl('');
    setTelegramUrl('');
    setError(null);
  }, []);

  // Handle local image upload: convert to data URL for preview
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    setImageFile(file);
    // Reset image URL if a file is selected
    setImageUrl(''); 
    setIsUploading(false); // No longer uploading to Firebase
    setUploadProgress(0);
    setError(null);
    
    try {
      // Create a local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const localPreview = e.target?.result as string;
        // Set the preview URL
        setImageUrl(localPreview); 
        
        // Add preview to images array temporarily for carousel
        setArticleData(prev => {
          const newImages = [localPreview, ...prev.images.filter(img => !img.startsWith('data:'))];
          return {
            ...prev,
            primaryImage: localPreview,
            image: localPreview,
            images: newImages
          };
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling image file:', error);
      setError('Failed to process image file. Please try again.');
      // Keep isUploading false as we removed the upload step
    }
  }, []);

  // Copy image URL to clipboard
  const copyImageUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess('URL copied to clipboard!');
      setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      setCopySuccess('Failed to copy URL');
      setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    });
  }, []);

  // Add keydown handler for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselOpen) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCarouselIndex(prev => (prev - 1 + articleData.images.length) % articleData.images.length);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCarouselIndex(prev => (prev + 1) % articleData.images.length);
      } else if (e.key === 'Escape') {
        setIsCarouselOpen(false);
      } else if (e.key === 'Enter') {
        setImageUrl(articleData.images[carouselIndex]);
        setIsCarouselOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCarouselOpen, articleData.images, carouselIndex]);

  // Add a ref for the main container
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Add ref for create button
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch SOL price on mount with lower priority
  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        if (response.ok) {
          const data = await response.json();
          const price = data.solana?.usd || 0;
          setSolPriceUsd(price);
        }
      } catch (error) {
        console.error('Failed to fetch SOL price:', error);
      }
    };

    // Delay initial fetch to prioritize form rendering
    const initialTimeout = setTimeout(() => {
      fetchSolPrice();
    }, 2000);

    // Update every 60 seconds
    const interval = setInterval(fetchSolPrice, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Remove the full-screen loader. Form shows immediately now
  return (
    <div className="relative h-full overflow-y-auto p-2" ref={mainContainerRef}>
      {/* Overlay content (will blur when modal is open) */}  
      <div className={insufficientFunds ? "blur-sm pointer-events-none select-none" : ""}>
        <div>
          {/* Compact header with logo, address dropdown, and action buttons */}
          <div className="flex items-center justify-between my-2">
            <HeaderActions
              onSelectContent={handleSelectContent}
              onGenerateSuggestions={() => generateSuggestions(articleData)}
              onClearForm={clearForm}
              isSuggestionsLoading={isSuggestionsLoading}
              websiteUrl={websiteUrl}
            />
            <VersionBadge className="ml-auto mt-1" />
          </div>
          
          {(error || walletError) && (
            <div className="terminal-window p-3 flex items-start space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyber-pink" />
              <div>
                <p className="text-xs text-cyber-pink font-terminal">ERROR_CODE: 0xE1A2</p>
                <p className="text-xs text-left font-terminal text-cyber-pink">{error || walletError}</p>
              </div>
            </div>
          )}

          {/* Show loading hint only if suggestions are being generated */}
          {isSuggestionsLoading && !error && (
            <div className="terminal-window p-2 mb-3 border-cyber-green/30">
              <p className="text-xs text-cyber-green font-terminal flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Generating AI suggestions...
              </p>
            </div>
          )}

          {/* Integration Mode Toggle */}
          <div className="mb-4 flex items-center space-x-4">
            <label className="flex items-center space-x-2 font-terminal text-cyber-green">
              <input
                type="radio"
                name="integrationMode"
                value="meteora"
                checked={integrationMode === 'meteora'}
                onChange={e => { setIntegrationMode(e.target.value as 'meteora'|'pumpportal'); console.log('Integration mode:', e.target.value); }}
                className="cursor-pointer"
              />
              <span className="uppercase text-sm">Meteora</span>
            </label>
            <label className="flex items-center space-x-2 font-terminal text-cyber-green">
              <input
                type="radio"
                name="integrationMode"
                value="pumpportal"
                checked={integrationMode === 'pumpportal'}
                onChange={e => { setIntegrationMode(e.target.value as 'meteora'|'pumpportal'); console.log('Integration mode:', e.target.value); }}
                className="cursor-pointer"
              />
              <span className="uppercase text-sm">PumpPortal</span>
            </label>
          </div>
          {/* Token details section - shows immediately */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-green/30 pb-1 mb-3">
              <h3 className="font-terminal text-cyber-green text-base uppercase tracking-wide">Token Details</h3>
            </div>

            <div className="space-y-4">
              {/* Show skeleton loaders while AI is generating suggestions */}
              {isInitialDataLoading ? (
                <>
                  <FieldSkeleton label="Coin Name" icon={<Type className="w-4 h-4 mr-2" />} />
                  <FieldSkeleton label="Ticker" icon={<Type className="w-4 h-4 mr-2" />} />
                  <FieldSkeleton label="Image Upload / URL" icon={<Image className="w-4 h-4 mr-2" />} />
                  <FieldSkeleton label="Description" icon={<FileText className="w-4 h-4 mr-2" />} />
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-terminal text-cyber-pink">
                      <Type className="w-4 h-4 mr-2" />
                      Coin Name
                    </label>
                    <input
                      type="text"
                      value={coinName}
                      onChange={(e) => setCoinName(e.target.value)}
                      className="input-field font-terminal"
                      maxLength={32}
                      placeholder={isSuggestionsLoading ? "Loading..." : "Enter coin name"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-terminal text-cyber-pink">
                      <Type className="w-4 h-4 mr-2" />
                      Ticker
                    </label>
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      className="input-field font-terminal"
                      maxLength={10}
                      placeholder={isSuggestionsLoading ? "Loading..." : "Enter ticker (max 10 chars)"}
                    />
                  </div>
                
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-terminal text-cyber-pink">
                      <Image className="w-4 h-4 mr-2" />
                      Image Upload / URL
                    </label>
                    <div className="flex flex-col space-y-2">
                      <div className="relative">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImageFile(null);
                          }}
                          className="input-field font-terminal pr-10"
                          placeholder={isSuggestionsLoading ? "Loading..." : "Enter image URL or upload file"}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyber-green hover:text-cyber-purple"
                          title="Upload an image"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                        />
                      </div>
                      
                      {/* Image preview and upload progress */}
                      {imageUrl && (
                        <div className="mt-2 relative group">
                          <div className="border border-cyber-green/30 rounded-sm overflow-hidden bg-black/20" style={{ maxHeight: '120px' }}>
                            <img 
                              src={imageUrl} 
                              alt="Token preview" 
                              className="object-contain w-full max-h-[120px]"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxaDtgTWFnZSBub3QgZm91bmQiIHN0eWxlPSJmaWxsOiMwMGZmNDE7Zm9udC1mYW1pbHk6bW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB4OyIvPjwvc3ZnPg==';
                              }}
                            />
                          </div>
                          
                          {/* Hover overlay with actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copyImageUrl(imageUrl)}
                                className="bg-black/70 hover:bg-cyber-green/20 text-cyber-green p-1.5 rounded transition-all duration-200"
                                title="Copy image URL"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  // Find current image index, or default to 0
                                  const currentIndex = articleData.images.findIndex(img => img === imageUrl);
                                  setCarouselIndex(currentIndex !== -1 ? currentIndex : 0);
                                  setIsCarouselOpen(true);
                                }}
                                className="bg-black/70 hover:bg-cyber-green/20 text-cyber-green p-1.5 rounded transition-all duration-200"
                                title="Browse all images"
                              >
                                <Image className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Upload progress overlay */}
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <div className="w-full max-w-[80%] text-center">
                                <div className="font-terminal text-xs text-cyber-green mb-1">Uploading: {uploadProgress}%</div>
                                <div className="w-full bg-cyber-green/20 h-1 rounded-sm overflow-hidden">
                                  <div 
                                    className="bg-cyber-green h-full transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Multiple images indicator */}
                          {!isUploading && articleData.images.length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-cyber-green text-xs font-terminal px-1.5 py-0.5 rounded border border-cyber-green/40 flex items-center opacity-70 group-hover:opacity-0 transition-opacity duration-200">
                              <Image className="w-3 h-3 mr-1" />
                              {articleData.images.length} images
                            </div>
                          )}
                        </div>
                      )}
                      
                      {imageFile && !isUploading && (
                        <div className="text-xs text-cyber-green font-terminal">
                          {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-terminal text-cyber-pink">
                      <FileText className="w-4 h-4 mr-2" />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field font-terminal min-h-[100px]"
                      rows={3}
                      placeholder={isSuggestionsLoading ? "Loading..." : "Enter coin description"}
                    />
                  </div>
                </>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-terminal text-cyber-pink">
                    <Globe className="w-4 h-4 mr-2" />
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="input-field font-terminal"
                    placeholder="Enter website URL"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-terminal text-cyber-pink">
                    <BrandX className="w-4 h-4 mr-2" />
                    X/Twitter URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={xUrl}
                    onChange={(e) => setXUrl(e.target.value)}
                    className="input-field font-terminal"
                    placeholder="Enter X/Twitter URL"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-terminal text-cyber-pink">
                    <BrandTelegram className="w-4 h-4 mr-2" />
                    Telegram URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    className="input-field font-terminal"
                    placeholder="Enter Telegram URL"
                  />
                </div>
              </div>
            </div>

            <div className="crypto-card p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-cyber-green" />
                  <span className="text-sm font-terminal text-cyber-pink">Investment Amount</span>
                </div>
                <span className="text-xs font-terminal text-cyber-purple">Pump.Fun Fee: 0.02 SOL</span>
              </div>
              
              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={investmentInputValue}
                      onChange={handleInvestmentChange}
                      onWheel={(e) => e.currentTarget.blur()} // Prevent scroll
                      className={`input-field w-full font-terminal pr-16 text-lg ${investmentAmount > 85 ? 'border-cyber-pink' : ''}`}
                      placeholder="0.00"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
                      {investmentAmount > 85 && (
                        <AlertCircle className="w-5 h-5 text-cyber-pink" />
                      )}
                      <span className="text-cyber-green font-terminal font-bold text-lg">SOL</span>
                    </div>
                  </div>
                  {investmentAmount > 0 && solPriceUsd > 0 && (
                    <div className="text-xs text-cyber-green/60 font-terminal mt-1">
                      ≈ ${(investmentAmount * solPriceUsd).toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>

              {balance < requiredBalance && (
                <div className="text-xs text-cyber-pink mt-1 font-terminal">
                  Add at least {requiredBalance.toFixed(2)} SOL to create a coin
                </div>
              )}
            </div>

            {/* Auto-preview section - shows right after investment amount */}
            {formReady && (previewData || isAutoPreviewLoading) && (
              <CostBreakdown
                previewData={previewData}
                isAutoPreviewLoading={isAutoPreviewLoading}
              />
            )}

            {createdCoin && (
              <div className="crypto-card p-6 space-y-4 border-cyber-green animate-fadeInUp">
                <h3 className="text-lg font-terminal text-cyber-green uppercase tracking-wide">🎉 Coin Created Successfully!</h3>
                <div className="space-y-2">
                  <p className="text-sm font-terminal text-white">Your coin is now live on Pump.fun!</p>
                  <a
                    href={createdCoin.pumpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center space-x-2 font-terminal"
                  >
                    <Globe className="w-4 h-4" />
                    <span>VIEW ON PUMP.FUN</span>
                  </a>
                </div>
              </div>
            )}
            {meteoraSuccess && (
              <div className="crypto-card p-6 space-y-4 border-cyber-green animate-fadeInUp">
                <h3 className="text-lg font-terminal text-cyber-green uppercase tracking-wide">🎉 Pool Created Successfully!</h3>
                <div className="space-y-2 font-terminal text-white text-sm">
                  <p>Signature: <a href={`https://explorer.solana.com/tx/${meteoraSuccess.signature}`} target="_blank" rel="noopener noreferrer">{meteoraSuccess.signature}</a></p>
                  <p>Pool: {meteoraSuccess.pool}</p>
                  <p>Position NFT: {meteoraSuccess.positionNft}</p>
                  <p>Config: {meteoraSuccess.config}</p>
                  <p>Decimals: A={meteoraSuccess.decimals.A}, B={meteoraSuccess.decimals.B}</p>
                  <p>Raw Amounts: A={meteoraSuccess.rawAmounts.A}, B={meteoraSuccess.rawAmounts.B}</p>
                  <p>Initial Liquidity: {meteoraSuccess.initialLiquidity}</p>
                  <p>Network Fee (lamports): {meteoraSuccess.estimatedNetworkFee}</p>
                  {meteoraSuccess.antiSnipeVault && <p>Anti-Snipe Vault: {meteoraSuccess.antiSnipeVault}</p>}
                </div>
              </div>
            )}

            {/* Single create button */}
            <button
              ref={createButtonRef}
              onClick={handleCreateCoin}
              disabled={!formReady || isCreating || balance < requiredBalance}
              className={`w-full font-terminal text-lg uppercase tracking-wider border rounded-sm transition-all duration-300 relative overflow-hidden ${
                !formReady || balance < requiredBalance
                  ? 'bg-cyber-dark border-cyber-green/30 text-cyber-green/50 py-4 cursor-not-allowed'
                  : isCreating
                    ? 'bg-cyber-dark border-cyber-green text-cyber-green py-2 opacity-90'
                    : 'bg-cyber-black hover:bg-cyber-green/20 border-cyber-green text-cyber-green py-4 hover:shadow-neon-green focus:outline-none focus:ring-2 focus:ring-cyber-green/50 focus:ring-offset-2 focus:ring-offset-cyber-black'
              }`}
            >
              {isCreating ? (
                <div className="flex items-center justify-center space-x-2 w-full h-full">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>CREATING...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 w-full h-full">
                  <Zap className="w-5 h-5" />
                  <span>CREATE COIN</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {insufficientFunds &&
        <InsufficientFundsModal
          balance={balance}
          onClose={handleCloseModal}
          tryAgain={handleCreateCoin}
        />
      }
    
      {/* Lazy load Image Carousel Modal */}
      {isCarouselOpen && articleData.images.length > 0 && (
        <React.Suspense fallback={<div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyber-green" /></div>}>
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-terminal animate-fadeIn"
            onClick={() => setIsCarouselOpen(false)}
          >
            <div 
              ref={carouselRef}
              className="bg-cyber-dark border border-cyber-green/50 rounded-md max-w-2xl w-full relative shadow-lg shadow-cyber-green/20 overflow-hidden animate-fadeInUp"
              onClick={e => e.stopPropagation()}
            >
              {/* Header with counter and controls */}
              <div className="flex items-center justify-between bg-black/60 p-3 border-b border-cyber-green/30">
                <div className="flex items-center space-x-3">
                  <span className="text-cyber-green flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    <span>{carouselIndex + 1}/{articleData.images.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyImageUrl(articleData.images[carouselIndex])}
                    className="bg-black/50 hover:bg-cyber-green/20 text-cyber-green p-1.5 rounded-sm transition-all duration-200 flex items-center"
                    title="Copy image URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={articleData.images[carouselIndex]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/50 hover:bg-cyber-green/20 text-cyber-green p-1.5 rounded-sm transition-all duration-200 flex items-center"
                    title="Open image in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setIsCarouselOpen(false)}
                    className="bg-black/50 hover:bg-cyber-pink/20 text-cyber-pink p-1.5 rounded-sm transition-all duration-200"
                    title="Close carousel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image container */}
              <div className="relative">
                <div className="bg-black/40 flex items-center justify-center w-full aspect-video p-4 min-h-[300px] overflow-hidden">
                  <div className="flex items-center justify-center w-full h-full">
                    <img 
                      src={articleData.images[carouselIndex]} 
                      alt={`Image option ${carouselIndex + 1}`}
                      className="max-h-[60vh] max-w-[90%] h-auto w-auto object-contain shadow-lg shadow-black/20"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxaDtgTWFnZSBub3QgZm91bmQiIHN0eWxlPSJmaWxsOiMwMGZmNDE7Zm9udC1mYW1pbHk6bW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB4OyIvPjwvc3ZnPg=='; 
                      }} 
                    />
                  </div>
                </div>
                
                {/* Navigation controls */}
                {articleData.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex(prev => (prev - 1 + articleData.images.length) % articleData.images.length);
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 text-cyber-green hover:bg-black/90 hover:text-cyber-purple p-2 rounded-full transition-all duration-200 border border-cyber-green/30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCarouselIndex(prev => (prev + 1) % articleData.images.length);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 text-cyber-green hover:bg-black/90 hover:text-cyber-purple p-2 rounded-full transition-all duration-200 border border-cyber-green/30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {articleData.images.length > 1 && (
                <div className="bg-black/80 border-t border-cyber-green/20 p-2 overflow-x-auto">
                  <div className="flex justify-center space-x-2 mx-auto">
                    {articleData.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 border-2 transition-all duration-200 ${
                          idx === carouselIndex 
                            ? 'border-cyber-green shadow-lg shadow-cyber-green/30' 
                            : 'border-cyber-green/30 hover:border-cyber-green/60'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxaDtgTWFnZSBub3QgZm91bmQiIHN0eWxlPSJmaWxsOiMwMGZmNDE7Zm9udC1mYW1pbHk6bW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB4OyIvPjwvc3ZnPg=='; 
                          }}
                        />
                        {idx === carouselIndex && (
                          <div className="absolute inset-0 border-2 border-cyber-green/70 bg-cyber-green/10" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer with actions */}
              <div className="flex justify-between items-center bg-black/60 p-3 border-t border-cyber-green/30">
                <button
                  onClick={() => {
                    setImageUrl(articleData.images[carouselIndex]);
                    setIsCarouselOpen(false);
                  }}
                  className="bg-cyber-green text-black font-medium py-2 px-6 rounded transition-all duration-200 flex items-center space-x-2 hover:bg-cyber-green/90 shadow-md shadow-cyber-green/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Use This Image</span>
                </button>
                <div className="flex-1 text-xs text-cyber-green/80 text-center truncate max-w-[250px] ml-4">
                  {articleData.images[carouselIndex]?.slice(0, 30)}...
                </div>
              </div>

              {/* Copy success toast */}
              {copySuccess && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-cyber-green text-sm py-2 px-4 rounded border border-cyber-green/50 animate-fadeInOut flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {copySuccess}
                </div>
              )}
            </div>
          </div>
        </React.Suspense>
      )}

      {/* Copy success toast outside the modal */}
      {copySuccess && !isCarouselOpen && (
        <div className="fixed top-4 right-4 bg-black/90 text-cyber-green text-sm py-2 px-4 rounded border border-cyber-green/50 animate-fadeInOut flex items-center z-50">
          <CheckCircle className="w-4 h-4 mr-2" />
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default CoinCreator;
