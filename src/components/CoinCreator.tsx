import React, { useState, useEffect } from 'react';
import { Image, Type, FileText, Send, Loader2, AlertCircle, Globe, Sparkles, DollarSign, Hand as BrandX, GitBranch as BrandTelegram, Terminal, Zap, Target, X, Upload } from 'lucide-react';
import { useStore } from '../store';
import { TerminalLoader } from './TerminalLoader';

interface ArticleData {
  title: string
  image: string
  description: string
  url: string
  author?: string
  xUrl?: string,
  isXPost: boolean
}

const DEV_MODE = process.env.NODE_ENV === 'development' && !chrome?.tabs;

const MOCK_ARTICLE_DATA: ArticleData = {
  title: "Bitcoin Reaches New All-Time High",
  image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
  description: "The world's largest cryptocurrency by market cap has reached a new milestone...",
  url: "https://example.com/bitcoin-ath",
  xUrl: "https://x.com/bitcoin",
  isXPost: false
};

interface CoinCreatorProps {
  isSidebar?: boolean;
}
export const CoinCreator: React.FC<CoinCreatorProps> = ({ isSidebar = false }) => {
  const { balance, error: walletError, investmentAmount: defaultInvestment, addCreatedCoin, createCoin } = useStore();
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    image: '',
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
        image: '',
        description: '',
        url: '',
        isXPost: false
      };
    }
    
    // Return data with defaults for any missing properties
    return {
      title: data.title || '',
      image: data.image || '',
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
      const tokenCreationData = await useStore.getState().getTokenCreationData(article, level)
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
      setImageUrl(article.image);
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
          setImageUrl(data.image);
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

  const handleSubmit = async () => {
    if (balance < requiredBalance) {
      setError(`Insufficient balance. Please add at least ${requiredBalance.toFixed(2)} SOL to your wallet (${investmentAmount} SOL for investment + 0.03 SOL for fees).`);
      return;
    }

    setIsCreating(true);
    setLoadingProgress(0);
    setError(null);

    try {
      // Simulate initial progress
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoadingProgress(prev => Math.min(prev + Math.random() * 15, 95));
      }

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

      setLoadingProgress(100);
      
      await addCreatedCoin({
        address: response.address,
        name: coinName,
        ticker: ticker,
        pumpUrl: response.pumpUrl,
        balance: investmentAmount
      });

      setCreatedCoin(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create coin';
      setError(`Failed to create coin: ${errorMessage}`);
    } finally {
      setTimeout(() => {
        setIsCreating(false);
      }, 500);
    }
  };

  const clearForm = () => {
    setArticleData({
      title: '',
      image: '',
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
  const handleImageUpload = (file: File) => {
    if (!file) return;
    setImageFile(file);
    setIsUploading(false);
    setUploadProgress(100);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const localPreview = e.target?.result as string;
      setImageUrl(localPreview);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-cyber-green rounded-full animate-spin relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-cyber-purple rounded-full animate-pulse-fast"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-cyber-green animate-pulse" />
          </div>
          <div className="absolute -bottom-6 w-full text-center text-cyber-green text-xs animate-pulse font-terminal">
            LOADING
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Compact header with logo, address dropdown, and action buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-cyber-green font-terminal text-xl mr-2">TKNZ</span>
          <div className="relative group">
            <button className="text-cyber-green/70 hover:text-cyber-green flex items-center font-terminal text-xs">
              <div className="w-2 h-2 bg-cyber-green rounded-full mr-1 animate-pulse"></div>
              <span className="truncate max-w-[60px] md:max-w-[120px]">AfyDiEpt...</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="w-3 h-3 ml-1"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-10">
              <div className="bg-black border border-cyber-green/50 rounded-sm p-2 shadow-lg font-terminal text-xs min-w-[240px]">
                <div className="flex items-center mb-1">
                  <span className="text-cyber-green">Token Address:</span>
                </div>
                <a 
                  href="https://birdeye.so/token/AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyber-green/80 hover:text-cyber-purple truncate font-mono text-xs break-all"
                >
                  AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump
                </a>
                <div className="mt-2 pt-1 border-t border-cyber-green/20 flex space-x-2">
                  <a 
                    href="https://birdeye.so/token/AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyber-green/80 hover:text-cyber-purple text-xs flex items-center"
                  >
                    <span className="w-1 h-1 bg-cyber-green rounded-full mr-1"></span>
                    Birdeye
                  </a>
                  <a 
                    href="https://dexscreener.com/solana/AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyber-green/80 hover:text-cyber-purple text-xs flex items-center"
                  >
                    <span className="w-1 h-1 bg-cyber-green rounded-full mr-1"></span>
                    Dexscreener
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
                  onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }}
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
                <div className="mt-2 relative">
                  <div className="border border-cyber-green/30 rounded-sm overflow-hidden" style={{ maxHeight: '120px' }}>
                    <img 
                      src={imageUrl} 
                      alt="Token preview" 
                      className="object-contain w-full max-h-[120px]"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yNCAxaDtgTWFnZSBub3QgZm91bmQiIHN0eWxlPSJmaWxsOiMwMGZmNDE7Zm9udC1mYW1pbHk6bW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB4OyIvPjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-full max-w-[80%]">
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
    </div>
  );
};

export default CoinCreator;
