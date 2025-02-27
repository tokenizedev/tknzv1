import React, { useState, useEffect } from 'react';
import { Image, Type, FileText, Send, Loader2, AlertCircle, Globe, Sparkles, DollarSign, Hand as BrandX, GitBranch as BrandTelegram } from 'lucide-react';
import { useStore } from '../store';

interface ArticleData {
  title: string;
  image: string;
  description: string;
  url: string;
  xUrl?: string;
}

const MOCK_ARTICLE_DATA: ArticleData = {
  title: "Bitcoin Reaches New All-Time High",
  image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
  description: "The world's largest cryptocurrency by market cap has reached a new milestone...",
  url: "https://example.com/bitcoin-ath"
};

export const CoinCreator: React.FC = () => {
  const { balance, error: walletError, investmentAmount: defaultInvestment, addCreatedCoin, createCoin } = useStore();
  const [_articleData, setArticleData] = useState<ArticleData>({
    title: '',
    image: '',
    description: '',
    url: ''
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
  const [createdCoin, setCreatedCoin] = useState<{
    address: string;
    pumpUrl: string;
  } | null>(null);

  const requiredBalance = investmentAmount + 0.03;

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

  const generateSuggestions = async (url: string, level = memeLevel) => {
    setIsGenerating(true);
    setError(null);
    try {
      // Check if it's TKNZ.FUN domain
      const isTknzDomain = url.includes('tknz.fun');

      if (isTknzDomain) {
        setCoinName('TKNZ.FUN');
        setTicker('TKNZ');
        setDescription('TKNZ - Tokenize Anything, Tokenize Everything');
        setIsGenerating(false);
        return;
      }
      const tokenCreationData = await useStore.getState().getTokenCreationData(url, level)
      const { article, token } = tokenCreationData;
      const { name } = token;
      
      if (!name) {
        throw new Error('No article title available');
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
          await generateSuggestions(data.url, 0);
        } else if (typeof chrome !== 'undefined' && chrome?.tabs) {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

          if (!tabs[0]?.id) {
            throw new Error('No active tab found');
          }
          const url = tabs[0]?.url;
          if (!url) {
            throw new Error('No URL found');
          }
          // Check if it's TKNZ.FUN domain
          const isTknzDomain = url.includes('tknz.fun');

          if (isTknzDomain) {
            setCoinName('TKNZ.FUN');
            setTicker('TKNZ');
            setDescription('TKNZ - Tokenize Anything, Tokenize Everything');
          }
          
          // Auto-populate URLs based on the type
          const isTwitterUrl = url.includes('twitter.com') || url.includes('x.com');

          if (isTwitterUrl) {
            setXUrl(url);
          } else {
            setWebsiteUrl(url);
          }
          
          if (!isTknzDomain) {
            await generateSuggestions(url, 0);
          }
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

  const handleSubmit = async () => {
    if (balance < requiredBalance) {
      setError(`Insufficient balance. Please add at least ${requiredBalance.toFixed(2)} SOL to your wallet (${investmentAmount} SOL for investment + 0.03 SOL for fees).`);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
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
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {(error || walletError) && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl p-4 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <p className="text-sm text-red-700">{error || walletError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Token Details</h3>
          <button
            onClick={() => generateSuggestions(websiteUrl)}
            disabled={isGenerating || websiteUrl.includes('tknz.fun')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'MEMIER!'}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Type className="w-4 h-4 mr-2" />
              Coin Name
            </label>
            <input
              type="text"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              className="input-field"
              placeholder="Enter coin name"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Type className="w-4 h-4 mr-2" />
              Ticker
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="input-field"
              maxLength={15}
              placeholder="Enter ticker (max 15 chars)"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Image className="w-4 h-4 mr-2" />
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="Enter image URL"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px]"
              rows={3}
              placeholder="Enter coin description"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Globe className="w-4 h-4 mr-2" />
                Website URL (Optional)
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="input-field"
                placeholder="Enter website URL"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <BrandX className="w-4 h-4 mr-2" />
                X/Twitter URL (Optional)
              </label>
              <input
                type="url"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                className="input-field"
                placeholder="Enter X/Twitter URL"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <BrandTelegram className="w-4 h-4 mr-2" />
                Telegram URL (Optional)
              </label>
              <input
                type="url"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                className="input-field"
                placeholder="Enter Telegram URL"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Investment Amount</span>
            </div>
            <span className="text-xs text-purple-600">Pump.Fun Fee: 0.02 SOL</span>
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
                className={`input-field w-full ${investmentAmount > 85 ? 'border-red-300 focus:ring-red-400' : ''}`}
                placeholder="Enter SOL amount (max 85)"
              />
              {investmentAmount > 85 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-600">SOL</span>
          </div>

          {balance < requiredBalance && (
            <div className="text-xs text-red-600 mt-1">
              Add at least {requiredBalance.toFixed(2)} SOL to create a meme coin
            </div>
          )}
        </div>

        {createdCoin && (
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-green-600">🎉 Coin Created Successfully!</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Your coin is now live on Pump.fun!</p>
              <a
                href={createdCoin.pumpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>View on Pump.fun</span>
              </a>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={balance < requiredBalance || isCreating}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Coin...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 space-y-4" />
              <span>Create Meme Coin</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CoinCreator;