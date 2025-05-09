import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useStore } from '../store';
import { getQuote, buildSwapTransaction, executeSwap, confirmTransaction, previewSwap, QuoteResponse, PreviewData } from '../services/jupiterService';
import { TokenSelector } from './swap/TokenSelector';
import { AmountInput } from './swap/AmountInput';
import { SwapDetails } from './swap/SwapDetails';
import { SwitchButton } from './swap/SwitchButton';
import { TokenList } from './swap/TokenList';
import { SwapConfirmation } from './swap/SwapConfirmation';
import { SwapStatus, SwapStatusType } from './swap/SwapStatus';
import { FaInfoCircle } from 'react-icons/fa';

// Mock token data with mint addresses (used as id) and decimals for Jupiter integration
const MOCK_TOKENS = [
  {
    id: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    mintAddress: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    symbol: 'SOL',
    name: 'Solana',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    balance: '12.5',
    balanceUsd: '420.75',
  },
  {
    id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    balance: '1503.25',
    balanceUsd: '1503.25',
  },
  {
    id: 'DezXAZ8z7PnrnRJjz1YzWfe1mqwMTZ7iZw6NtGuxKP7', // BONK
    mintAddress: 'DezXAZ8z7PnrnRJjz1YzWfe1mqwMTZ7iZw6NtGuxKP7',
    decimals: 9,
    symbol: 'BONK',
    name: 'Bonk',
    logoUrl: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg',
    balance: '15000000',
    balanceUsd: '125.35',
  },
  {
    id: '6oHdWzevEn9us1psSf81qChMfx7tcTtq7Xg4mP83GmZt', // JUP
    mintAddress: '6oHdWzevEn9us1psSf81qChMfx7tcTtq7Xg4mP83GmZt',
    decimals: 6,
    symbol: 'JUP',
    name: 'Jupiter',
    logoUrl: 'https://assets.coingecko.com/coins/images/34173/small/jup.png',
    balance: '950',
    balanceUsd: '712.50',
  },
  {
    id: '2yY2L9fQD4XD9FxwERp4fapBhDSR6hS73fckMhPwLjPc', // RNDR (example)
    mintAddress: '2yY2L9fQD4XD9FxwERp4fapBhDSR6hS73fckMhPwLjPc',
    decimals: 6,
    symbol: 'RNDR',
    name: 'Render Token',
    logoUrl: 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
    balance: '85.2',
    balanceUsd: '563.17',
  },
];

interface SwapPageProps {
  isSidebar?: boolean;
}

export const SwapPage: React.FC<SwapPageProps> = ({ isSidebar = false }) => {
  // Wallet state
  const activeWallet = useStore(state => state.activeWallet);
  // Token states
  const [fromToken, setFromToken] = useState<typeof MOCK_TOKENS[0] | null>(null);
  const [toToken, setToToken] = useState<typeof MOCK_TOKENS[0] | null>(null);
  
  // Amount states
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromAmountUsd, setFromAmountUsd] = useState('');
  const [toAmountUsd, setToAmountUsd] = useState('');
  
  // UI states
  const [showFromTokenList, setShowFromTokenList] = useState(false);
  const [showToTokenList, setShowToTokenList] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [swapStatus, setSwapStatus] = useState<{
    show: boolean;
    status: SwapStatusType;
    hash?: string;
    error?: string;
  }>({
    show: false,
    status: 'pending',
  });
  // Jupiter quote preview state
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Live preview: fetch quote whenever inputs change
  useEffect(() => {
    async function fetchPreview() {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        setQuote(null);
        setPreviewData(null);
        return;
      }
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const rawAmount = Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals);
        const slippageBps = Math.floor(parseFloat(slippage) * 100);
        const quoteRes = await getQuote({
          inputMint: fromToken.mintAddress,
          outputMint: toToken.mintAddress,
          amount: rawAmount,
          slippageBps,
        });
        const pd = previewSwap(quoteRes);
        setQuote(quoteRes);
        setPreviewData(pd);
        // update output amount
        const outTokens = pd.outputAmount / 10 ** toToken.decimals;
        setToAmount(outTokens.toFixed(toToken.decimals));
        // approximate USD: mirror input USD as conservative estimate
        setToAmountUsd(fromAmountUsd);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Quote preview error:', msg);
        setPreviewError(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    }
    fetchPreview();
  }, [fromToken, toToken, fromAmount, slippage]);

  // Swap calculations
  const calculateToAmount = (amount: string) => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) === 0) {
      setToAmount('');
      setToAmountUsd('');
      return;
    }

    // Mock price calculation - in real app this would come from an API
    const fromTokenPrice = parseFloat(fromToken.balanceUsd) / parseFloat(fromToken.balance);
    const toTokenPrice = parseFloat(toToken.balanceUsd) / parseFloat(toToken.balance);
    
    const fromValue = parseFloat(amount) * fromTokenPrice;
    const toValue = fromValue / toTokenPrice;
    
    setToAmount(toValue.toFixed(6));
    setToAmountUsd(fromValue.toFixed(2));
  };

  const calculateFromAmount = (amount: string) => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) === 0) {
      setFromAmount('');
      setFromAmountUsd('');
      return;
    }

    // Mock price calculation
    const fromTokenPrice = parseFloat(fromToken.balanceUsd) / parseFloat(fromToken.balance);
    const toTokenPrice = parseFloat(toToken.balanceUsd) / parseFloat(toToken.balance);
    
    const toValue = parseFloat(amount) * toTokenPrice;
    const fromValue = toValue / fromTokenPrice;
    
    setFromAmount(fromValue.toFixed(6));
    setFromAmountUsd(toValue.toFixed(2));
  };

  // Handle token selection
  const handleFromTokenSelect = (token: typeof MOCK_TOKENS[0]) => {
    if (toToken && token.id === toToken.id) {
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromTokenList(false);
    if (fromAmount) {
      calculateToAmount(fromAmount);
    }
  };

  const handleToTokenSelect = (token: typeof MOCK_TOKENS[0]) => {
    if (fromToken && token.id === fromToken.id) {
      setFromToken(toToken);
    }
    setToToken(token);
    setShowToTokenList(false);
    if (toAmount) {
      calculateFromAmount(toAmount);
    }
  };

  // Handle amount changes
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (fromToken && toToken) {
      const fromTokenPrice = parseFloat(fromToken.balanceUsd) / parseFloat(fromToken.balance);
      setFromAmountUsd((parseFloat(value || '0') * fromTokenPrice).toFixed(2));
      calculateToAmount(value);
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (fromToken && toToken) {
      const toTokenPrice = parseFloat(toToken.balanceUsd) / parseFloat(toToken.balance);
      setToAmountUsd((parseFloat(value || '0') * toTokenPrice).toFixed(2));
      calculateFromAmount(value);
    }
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (fromToken) {
      handleFromAmountChange(fromToken.balance);
    }
  };

  // Switch tokens
  const handleSwitchTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    const tempAmountUsd = fromAmountUsd;
    setFromAmountUsd(toAmountUsd);
    setToAmountUsd(tempAmountUsd);
  };

  // Real swap execution using Jupiter service
  const handleSwap = async () => {
    setShowConfirmation(false);
    setSwapStatus({ show: true, status: 'pending' });
    try {
      if (!fromToken || !toToken) {
        throw new Error('Please select both tokens to swap.');
      }
      if (!activeWallet) {
        throw new Error('Wallet not initialized.');
      }
      // Prepare quote parameters
      const inputMint = fromToken.mintAddress;
      const outputMint = toToken.mintAddress;
      const rawAmount = Math.floor(parseFloat(fromAmount) * Math.pow(10, fromToken.decimals));
      const slippageBps = Math.floor(parseFloat(slippage) * 100);
      // Fetch quote
      const quote = await getQuote({ inputMint, outputMint, amount: rawAmount, slippageBps });
      // Build transaction
      const tx = await buildSwapTransaction(quote, new PublicKey(activeWallet.publicKey));
      // Execute swap
      const sig = await executeSwap(tx);
      // Update status with tx hash
      setSwapStatus({ show: true, status: 'pending', hash: sig });
      // Wait for confirmation
      await confirmTransaction(sig);
      setSwapStatus({ show: true, status: 'success', hash: sig });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSwapStatus({ show: true, status: 'error', error: message });
    }
  };

  // Calculate swap rate
  const getSwapRate = () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) return null;
    
    const rate = parseFloat(toAmount) / parseFloat(fromAmount);
    return `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`;
  };

  // Check if swap is valid
  const isSwapValid = 
    fromToken && 
    toToken && 
    fromAmount && 
    parseFloat(fromAmount) > 0 && 
    toAmount && 
    parseFloat(toAmount) > 0;

  // Check if user has enough balance
  const hasEnoughBalance = fromToken && fromAmount 
    ? parseFloat(fromToken.balance) >= parseFloat(fromAmount)
    : false;

  return (
    <div className="flex flex-col items-center justify-start h-full p-4">
      <div className="w-full max-w-md">
        <h2 className="text-cyber-green font-terminal text-2xl mb-4 text-center">Token Swap</h2>
        
        {/* From token section */}
        <div className="bg-cyber-dark/50 rounded-md p-4 border border-cyber-green/30 mb-1">
          <TokenSelector
            tokenSymbol={fromToken?.symbol}
            tokenName={fromToken?.name}
            tokenLogo={fromToken?.logoUrl}
            balance={fromToken ? `Balance: ${fromToken.balance}` : undefined}
            onClick={() => setShowFromTokenList(true)}
            label="You pay"
          />
          <div className="mt-3">
            <AmountInput 
              value={fromAmount}
              onChange={handleFromAmountChange}
              fiatValue={fromAmountUsd}
              onMaxClick={handleMaxClick}
            />
          </div>
        </div>
        
        {/* Switch button */}
        <SwitchButton onClick={handleSwitchTokens} disabled={!fromToken || !toToken} />
        
        {/* To token section */}
        <div className="bg-cyber-dark/50 rounded-md p-4 border border-cyber-green/30 mt-1">
          <TokenSelector
            tokenSymbol={toToken?.symbol}
            tokenName={toToken?.name}
            tokenLogo={toToken?.logoUrl}
            balance={toToken ? `Balance: ${toToken.balance}` : undefined}
            onClick={() => setShowToTokenList(true)}
            label="You receive"
          />
          <div className="mt-3">
            <AmountInput 
              value={toAmount}
              onChange={handleToAmountChange}
              fiatValue={toAmountUsd}
            />
          </div>
        </div>
        
        {/* Swap details */}
        <SwapDetails
          rate={
            previewData && fromToken && toToken
              ? `1 ${fromToken.symbol} = ${(
                  (previewData.outputAmount / 10 ** toToken.decimals) /
                  (previewData.inputAmount / 10 ** fromToken.decimals)
                ).toFixed(6)} ${toToken.symbol}`
              : undefined
          }
          fee={
            previewData && fromToken
              ? `${((previewData.feeAmount ?? 0) / 10 ** fromToken.decimals).toFixed(fromToken.decimals)} ${fromToken.symbol}`
              : undefined
          }
          slippage={slippage}
          estimatedGas="~0.0005 SOL"
          minimumReceived={
            previewData && toToken
              ? `${(previewData.minimumOutAmount / 10 ** toToken.decimals).toFixed(toToken.decimals)} ${toToken.symbol}`
              : undefined
          }
          onSlippageChange={setSlippage}
        />
        
        {/* Insufficient balance warning */}
        {fromToken && fromAmount && !hasEnoughBalance && (
          <div className="bg-cyber-orange/10 border border-cyber-orange/30 rounded-md p-3 mt-3 text-sm text-cyber-orange">
            <div className="flex items-start">
              <FaInfoCircle className="mt-0.5 mr-2 flex-shrink-0" />
              <span>
                Insufficient {fromToken.symbol} balance. You need {parseFloat(fromAmount) - parseFloat(fromToken.balance)} more {fromToken.symbol}.
              </span>
            </div>
          </div>
        )}
        
        {/* Swap button */}
        <button
          className={`w-full mt-4 px-4 py-3 rounded-md font-terminal shadow-neon-green transition-all
                     ${isSwapValid && hasEnoughBalance
                        ? 'bg-cyber-green text-cyber-black hover:bg-cyber-green-dark' 
                        : 'bg-cyber-dark text-cyber-green/50 cursor-not-allowed border border-cyber-green/30'}`}
          disabled={!isSwapValid || !hasEnoughBalance}
          onClick={() => setShowConfirmation(true)}
        >
          {!fromToken || !toToken 
            ? 'Select Tokens'
            : !fromAmount || !toAmount
            ? 'Enter Amount'
            : !hasEnoughBalance
            ? `Insufficient ${fromToken.symbol} Balance`
            : 'Swap'}
        </button>
      </div>
      
      {/* Token selection modal */}
      {showFromTokenList && (
        <TokenList
          tokens={MOCK_TOKENS}
          onSelect={handleFromTokenSelect}
          onClose={() => setShowFromTokenList(false)}
        />
      )}
      
      {showToTokenList && (
        <TokenList
          tokens={MOCK_TOKENS}
          onSelect={handleToTokenSelect}
          onClose={() => setShowToTokenList(false)}
        />
      )}
      
      {/* Confirmation modal */}
      {showConfirmation && fromToken && toToken && (
        <SwapConfirmation
          fromToken={{
            symbol: fromToken.symbol,
            amount: fromAmount,
            logoUrl: fromToken.logoUrl,
            fiatValue: fromAmountUsd,
          }}
          toToken={{
            symbol: toToken.symbol,
            amount: toAmount,
            logoUrl: toToken.logoUrl,
            fiatValue: toAmountUsd,
          }}
          rate={
            previewData && fromToken && toToken
              ? `1 ${fromToken.symbol} = ${(
                  (previewData.outputAmount / 10 ** toToken.decimals) /
                  (previewData.inputAmount / 10 ** fromToken.decimals)
                ).toFixed(6)} ${toToken.symbol}`
              : ''
          }
          priceImpact={previewData ? previewData.priceImpactPct.toFixed(2) : '0'}
          fee={
            previewData && fromToken
              ? `${((previewData.feeAmount ?? 0) / 10 ** fromToken.decimals).toFixed(fromToken.decimals)} ${fromToken.symbol}`
              : undefined
          }
          estimatedGas="~0.0005 SOL"
          minimumReceived={
            previewData && toToken
              ? `${(previewData.minimumOutAmount / 10 ** toToken.decimals).toFixed(toToken.decimals)} ${toToken.symbol}`
              : undefined
          }
          onConfirm={handleSwap}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
      
      {/* Status modal */}
      {swapStatus.show && fromToken && toToken && (
        <SwapStatus
          status={swapStatus.status}
          fromToken={{
            symbol: fromToken.symbol,
            amount: fromAmount,
          }}
          toToken={{
            symbol: toToken.symbol,
            amount: toAmount,
          }}
          transactionHash={swapStatus.hash}
          errorMessage={swapStatus.error}
          onClose={() => setSwapStatus({ show: false, status: 'pending' })}
          explorerUrl="https://explorer.solana.com"
        />
      )}
    </div>
  );
};