import React, { useState, useEffect, useRef } from 'react';
import { Image, Type, FileText, Send, Loader2, AlertCircle, Globe, Sparkles, DollarSign, Hand as BrandX, GitBranch as BrandTelegram, Terminal, Zap, Target, X, Upload, ChevronLeft, ChevronRight, CheckCircle, Copy, ExternalLink, Hash } from 'lucide-react';
import { useStore } from '../store';
import { TerminalLoader } from './TerminalLoader';
import { Loader } from './Loader';

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
  onCreationStart?: (innerHandleSubmit: () => Promise<void>) => Promise<void>;
  onCreationComplete?: (coinAddress: string) => void;
  onCreationError?: (errorMessage: string) => void;
}

// CSS for animations
const carouselAnimationStyles = `
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
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out forwards;
  }
  
  .animate-fadeInOut {
    animation: fadeInOut 2s ease-out forwards;
  }
`;

export const CoinCreator: React.FC<CoinCreatorProps> = ({ 
  isSidebar = false, 
  onCreationStart, 
  onCreationComplete,
  onCreationError
}) => {
  useEffect(() => {
    // Add animation styles
    const styleEl = document.createElement('style');
    styleEl.textContent = carouselAnimationStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const { balance, error: walletError, investmentAmount: defaultInvestment, addCreatedCoin, createCoin } = useStore();
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(defaultInvestment);
  const [memeLevel, setMemeLevel] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [createdCoin, setCreatedCoin] = useState<{
    address: string;
    pumpUrl: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // State for image carousel
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle content selection toggle: directly ask content script to start selection mode
  const handleSelectContent = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (tabId) {
        // Send message directly to content script
        chrome.tabs.sendMessage(tabId, { type: 'START_SELECT_MODE' });
      } else {
        console.error('No active tab found for content selection');
      }
    } catch (e) {
      console.error('Failed to send START_SELECT_MODE message:', e);
    }
    if (!isSidebar) {
      window.close();
    }
  };

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

  const requiredBalance = investmentAmount + 0.03;

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

  useEffect(() => {
    setInvestmentAmount(defaultInvestment);
  }, [defaultInvestment]);

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      if (value > 85) {
        setError('Maximum investment amount is 85 SOL');
        setInvestmentAmount(85);
      } else if (value < 0) {
        setInvestmentAmount(0);
      } else {
        setError(null);
        setInvestmentAmount(value);
      }
    }
  };

  const generateSuggestions = async (article: ArticleData, level = memeLevel) => {
    setIsGenerating(true);
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
        setIsGenerating(false);
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
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const getArticleData = async () => {
      try {
        setError(null);
        let data: ArticleData;

        if (DEV_MODE) {
          data = MOCK_ARTICLE_DATA;
          setArticleData(data);
          setWebsiteUrl(data.url);
          setImageUrl(data.primaryImage);
          await generateSuggestions(data, 0);
        } else {
          const rawData = await getLocalStorageData() || await useStore.getState().getArticleData();
          const articleData = ensureArticleData(rawData);
          await generateSuggestions(articleData, 0);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to extract page data';
        console.error('Error getting article data:', error);
        setError(errorMessage);
        
        if (!DEV_MODE && chrome?.tabs) {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs[0]?.url) {
            const isTwitterUrl = tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com');
            if (isTwitterUrl) {
              setXUrl(tabs[0].url);
            } else {
              setWebsiteUrl(tabs[0].url);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    getArticleData().catch(err => {
      console.error('Unhandled error in getArticleData:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    });
  }, []);
  // Subscribe to active tab changes in side panel to re-fetch article data
  useEffect(() => {
    // Only in side panel environment
    if (!chrome?.tabs || !window.location.pathname.includes('sidebar.html')) {
      return;
    }
    const fetchForActiveTab = async () => {
      try {
        setError(null);
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };
    const handleActivated = async ({ tabId }: { tabId: number }) => {
      await fetchForActiveTab();
    };
    const handleUpdated = async (
      tabId: number,
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

  const innerHandleSubmit = async () => {
    setIsCreating(true);
    
    setError(null);

    try {
      // Prepare parameters, supporting either a URL or local file blob
      const params: any = {
        name: coinName,
        ticker: ticker,
        description: description,
        websiteUrl: websiteUrl,
        twitter: xUrl,
        telegram: telegramUrl,
        investmentAmount: investmentAmount
      };
      
      if (imageFile) {
        params.imageFile = imageFile;
      } else {
        params.imageUrl = imageUrl;
      }

      const response = await createCoin(params);

      await addCreatedCoin({
        address: response.address,
        name: coinName,
        ticker: ticker,
        pumpUrl: response.pumpUrl,
        balance: investmentAmount
      });

      setCreatedCoin(response);

      // Notify parent component that creation is complete
      if (onCreationComplete) {
        onCreationComplete(response.address);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create coin';
      setError(`Failed to create coin: ${errorMessage}`);
      if (onCreationError) {
        onCreationError(errorMessage);
      }
      setIsCreating(false);
    } finally {
      setIsCreating(false);
    }
  }
  const handleSubmit = async () => {
    if (balance < requiredBalance) {
      setError(`Insufficient balance. Please add at least ${requiredBalance.toFixed(2)} SOL to your wallet (${investmentAmount} SOL for investment + 0.03 SOL for fees).`);
      return;
    }

    // Notify parent component that creation is starting
    if (onCreationStart) {
      onCreationStart(innerHandleSubmit);
    }
  };

  const clearForm = () => {
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
  };

  // Handle local image upload: convert to data URL for preview
  const handleImageUpload = async (file: File) => {
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
  };

  // Copy image URL to clipboard
  const copyImageUrl = (url: string) => {
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
  };

  // Add this at the very end of the file, just before the export statement
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

  if (isLoading) {
    return <Loader isSidebar={isSidebar} />;
  }

  return (
    <div className="py-2">
      {/* Compact header with logo, address dropdown, and action buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex rounded-sm overflow-hidden">
          <button
            onClick={handleSelectContent}
            title="Select content to tokenize"
            className="bg-black border border-cyber-green/70 hover:bg-cyber-green/10 text-cyber-green px-3 py-1 font-terminal text-xs flex items-center border-r-0"
          >
            <Target className="w-3 h-3 mr-1" />
            <span className="uppercase">Select</span>
          </button>
          <button
            onClick={() => generateSuggestions(articleData)}
            disabled={isGenerating || websiteUrl.includes('tknz.fun')}
            title="Memier"
            className="bg-black border border-cyber-green/70 hover:bg-cyber-green/10 text-cyber-green px-2 py-1 font-terminal text-xs flex items-center disabled:opacity-50 disabled:cursor-not-allowed border-r-0"
          >
            {isGenerating ? (
              <Terminal className="w-3 h-3 animate-pulse" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span className="sr-only">MEMIER</span>
          </button>
          <button
            onClick={clearForm}
            title="Clear form and start fresh"
            className="bg-black border border-cyber-green/70 hover:bg-cyber-green/10 text-cyber-green px-2 py-1 font-terminal text-xs flex items-center"
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Clear</span>
          </button>
        </div>
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

      {/* Token details section - directly start form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-green/30 pb-1 mb-3">
          <h3 className="font-terminal text-cyber-green text-base uppercase tracking-wide">Token Details</h3>
        </div>

        <div className="space-y-4">
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
              placeholder="Enter coin name"
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
              placeholder="Enter ticker (max 10 chars)"
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
                  placeholder="Enter image URL or upload file"
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
              placeholder="Enter coin description"
            />
          </div>

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
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max="85"
                step="0.01"
                value={investmentAmount}
                onChange={handleInvestmentChange}
                className={`input-field w-full font-terminal ${investmentAmount > 85 ? 'border-cyber-pink' : ''}`}
                placeholder="Enter SOL amount (max 85)"
              />
              {investmentAmount > 85 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
                  <AlertCircle className="w-5 h-5 text-cyber-pink" />
                </div>
              )}
            </div>
            <span className="text-sm font-terminal text-white">SOL</span>
          </div>

          {balance < requiredBalance && (
            <div className="text-xs text-cyber-pink mt-1 font-terminal">
              Add at least {requiredBalance.toFixed(2)} SOL to create a meme coin
            </div>
          )}
        </div>

        {createdCoin && (
          <div className="crypto-card p-6 space-y-4 border-cyber-green">
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

        {/* Final create button with special styling */}
        <button
          onClick={handleSubmit}
          disabled={balance < requiredBalance || isCreating}
          className={`w-full font-terminal text-lg uppercase tracking-wider border rounded-sm transition-all duration-300 relative overflow-hidden ${
            isCreating 
              ? 'bg-cyber-dark border-cyber-green/70 text-cyber-green py-6' 
              : 'bg-cyber-black hover:bg-cyber-green/20 border-cyber-green text-cyber-green py-4 hover:shadow-neon-green'
          }`}
        >
          {isCreating ? (
            <div className="px-6 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-terminal text-sm">CREATING COIN...</span>
                <Terminal className="w-4 h-4 animate-pulse" />
              </div>
              <TerminalLoader text="Initializing transaction..." progress={loadingProgress} />
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 w-full h-full">
              <Zap className="w-5 h-5" />
              <span>CREATE MEME COIN</span>
            </div>
          )}
        </button>
      </div>

      {/* Image Carousel Modal */}
      {isCarouselOpen && articleData.images.length > 0 && (
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
