import React, { useState, useEffect } from 'react';
import { Image, Type, FileText, Send, Loader2, AlertCircle, Globe, Sparkles, DollarSign, Hand as BrandX, GitBranch as BrandTelegram, Terminal, Zap } from 'lucide-react';
import { useStore } from '../store';

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

// Terminal loading animation component
const TerminalLoading: React.FC<{ text: string; progress: number }> = ({ text, progress }) => {
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between mb-1">
        <span className="font-terminal text-xs text-cyber-green">{text}</span>
        <span className="font-terminal text-xs text-cyber-green">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-cyber-dark border border-cyber-green/30 h-2 overflow-hidden">
        <div 
          className="h-full bg-cyber-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="font-terminal text-xs text-cyber-green/60 font-mono">
        {Array.from({ length: Math.floor(progress / 10) }).map((_, i) => (
          <span key={i} className="opacity-70">█</span>
        ))}
        <span className="animate-terminal-cursor">_</span>
      </div>
    </div>
  );
};

export const CoinCreator: React.FC = () => {
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
          const articleData = await useStore.getState().getArticleData();
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
        const article = await useStore.getState().getArticleData();
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

      const response = await createCoin({
        name: coinName,
        ticker: ticker,
        description: description,
        imageUrl: imageUrl,
        websiteUrl: websiteUrl,
        twitter: xUrl,
        telegram: telegramUrl,
        investmentAmount: investmentAmount
      });

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
    <div className="space-y-6 py-6">
      {(error || walletError) && (
        <div className="terminal-window p-4 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-cyber-pink" />
          <div>
            <p className="text-sm text-cyber-pink font-terminal">ERROR_CODE: 0xE1A2</p>
            <p className="text-sm text-left font-terminal text-cyber-pink">{error || walletError}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyber-green/30 pb-2">
          <h3 className="font-terminal text-cyber-green text-lg uppercase tracking-wide">Token Details</h3>
          <button
            onClick={() => generateSuggestions(articleData)}
            disabled={isGenerating || websiteUrl.includes('tknz.fun')}
            className="flex items-center space-x-2 px-4 py-1.5 bg-cyber-black border border-cyber-purple text-cyber-purple rounded-sm hover:bg-cyber-purple/10 transition-all duration-200 font-terminal tracking-wider disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
          >
            {isGenerating ? (
              <>
                <Terminal className="w-4 h-4 animate-pulse mr-1" />
                <span className="animate-pulse">GENERATING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                <span>MEMIER!!</span>
              </>
            )}
          </button>
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
              maxLength={15}
              placeholder="Enter ticker (max 15 chars)"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-terminal text-cyber-pink">
              <Image className="w-4 h-4 mr-2" />
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field font-terminal"
              placeholder="Enter image URL"
            />
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
              <TerminalLoading text="Initializing transaction..." progress={loadingProgress} />
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
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
