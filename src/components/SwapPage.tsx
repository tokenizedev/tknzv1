import React, { useState, useEffect } from 'react';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { useStore } from '../store';
import {
  getTaggedTokens,
  TokenInfoAPI,
  getUltraBalances,
  BalanceInfo,
  getOrder,
  executeOrder,
  getPrices,
} from '../services/jupiterService';
import { getAllCreatedCoins } from '../firebase';
import type { CreatedCoin } from '../types';
import { TokenSelector } from './swap/TokenSelector';
import { AmountInput } from './swap/AmountInput';
import { SwapDetails } from './swap/SwapDetails';
import { SwitchButton } from './swap/SwitchButton';
import { TokenList } from './swap/TokenList';
import { SwapConfirmation } from './swap/SwapConfirmation';
import { SwapStatus, SwapStatusType } from './swap/SwapStatus';
import { FaInfoCircle } from 'react-icons/fa';

// Simplified token option for UI
interface TokenOption {
  id: string;
  symbol: string;
  name: string;
  logoUrl?: string;
  decimals: number;
}

// Token list state (fetched via Jupiter Token API)
interface SwapPageProps {
  isSidebar?: boolean;
}

interface SwapPageProps {
  isSidebar?: boolean;
}

export const SwapPage: React.FC<SwapPageProps> = ({ isSidebar = false }) => {
  // Wallet state
  const activeWallet = useStore(state => state.activeWallet);
  // Platform-wide created tokens
  const [platformCoins, setPlatformCoins] = useState<CreatedCoin[]>([]);
  // Token list fetched from Jupiter
  const [tokenList, setTokenList] = useState<TokenInfoAPI[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  // UI tokens array for TokenList component
  const uiTokens = tokenList.map(t => ({
    id: t.address,
    symbol: t.symbol,
    name: t.name,
    logoUrl: t.logoURI,
    decimals: t.decimals,
  }));
  
  // Fetch user balances via Jupiter Ultra API
  const [balances, setBalances] = useState<Record<string, BalanceInfo>>({});
  useEffect(() => {
    if (!activeWallet) return;
    getUltraBalances(activeWallet.publicKey)
      .then(setBalances)
      .catch(err => console.error('Balance load error:', err));
  }, [activeWallet]);
  // Load all platform-created tokens from Firebase
  useEffect(() => {
    getAllCreatedCoins()
      .then(coins => setPlatformCoins(coins))
      .catch(err => console.error('Failed to load platform coins:', err));
  }, []);
  // Fetch verified Jupiter tokens, merge with custom TKNZ, SOL, platform-created, and leaderboard tokens
  useEffect(() => {
    setLoadingTokens(true);
    (async () => {
      try {
        // Fetch verified tokens from Jupiter
        const tokens = await getTaggedTokens('verified');
        // Define custom TKNZ token
        const customToken: TokenInfoAPI = {
          address: 'AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump',
          name: 'TKNZ.fun',
          symbol: 'TKNZ',
          decimals: 9,
          logoURI: 'https://ipfs.io/ipfs/QmPjLEGEcvEDgGrxNPZdFy1RzfiWRyJYu6YaicM6oZGddQ',
          tags: [],
          daily_volume: 0,
          created_at: new Date().toISOString(),
          freeze_authority: null,
          mint_authority: null,
          permanent_delegate: null,
          minted_at: null,
          extensions: {},
        };
        // Identify SOL token
        const solMint = 'So11111111111111111111111111111111111111112';
        const solToken = tokens.find(t => t.address === solMint);
        // Filter out duplicates
        const remaining = tokens.filter(
          t => t.address !== solMint && t.address !== customToken.address
        );
        // Map platform-created coins into token info objects
        const createdTokens: TokenInfoAPI[] = platformCoins.map(c => ({
          address: c.address,
          name: c.name,
          symbol: c.ticker,
          decimals: 9,
          logoURI: '',
          tags: [],
          daily_volume: 0,
          created_at: c.createdAt
            ? new Date(c.createdAt).toISOString()
            : new Date().toISOString(),
          freeze_authority: null,
          mint_authority: null,
          permanent_delegate: null,
          minted_at: null,
          extensions: {},
        }));
        // Build the final token list: custom, SOL, created, verified remaining
        const finalList: TokenInfoAPI[] = [customToken];
        if (solToken) finalList.push(solToken);
        finalList.push(...createdTokens);
        finalList.push(...remaining);
        // Fetch leaderboard tokens
        const lbResponse = await fetch('https://tknz.fun/.netlify/functions/leaderboard');
        if (!lbResponse.ok) {
          throw new Error(`Leaderboard fetch error: ${lbResponse.status} ${lbResponse.statusText}`);
        }
        const lbData = (await lbResponse.json()) as Array<{
          address: string;
          name: string;
          symbol: string;
          logoURI: string;
          price: number;
          supply: number;
          creatorWallet: string;
          lastUpdated: number;
          marketCap: number;
          launchTime: number;
        }>;
        console.log('lbData', lbData)
        const leaderboardTokens: TokenInfoAPI[] = lbData.map(r => ({
          address: r.address,
          name: r.name,
          symbol: r.symbol,
          decimals: 9,
          logoURI: r.logoURI,
          tags: [],
          daily_volume: 0,
          created_at: r.launchTime
            ? new Date(r.launchTime).toISOString()
            : new Date().toISOString(),
          freeze_authority: null,
          mint_authority: null,
          permanent_delegate: null,
          minted_at: null,
          extensions: {},
        }));
        console.log('finalList', finalList)
        finalList.push(...leaderboardTokens);
        setTokenList(finalList);
      } catch (err) {
        setTokenError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingTokens(false);
      }
    })();
  }, [platformCoins]);
  // Token states
  const [fromToken, setFromToken] = useState<TokenOption | null>(null);
  const [toToken, setToToken] = useState<TokenOption | null>(null);
  
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
  // Jupiter order preview state
  const [previewData, setPreviewData] = useState<{
    inputAmount: number;
    outputAmount: number;
    priceImpactPct: number;
    minimumOutAmount: number;
    feeBps: number;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Live preview: fetch quote whenever inputs change
  useEffect(() => {
    async function fetchPreview() {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || !activeWallet) {
        setPreviewData(null);
        return;
      }
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const rawAmount = Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals);
        // taker is wallet address
        const order = await getOrder({
          inputMint: fromToken.id,
          outputMint: toToken.id,
          amount: rawAmount,
          taker: activeWallet.publicKey,
        });
        // parse numeric fields
        const inAmt = parseInt(order.inAmount);
        const outAmt = parseInt(order.outAmount);
        const minOut = parseInt(order.otherAmountThreshold || order.outAmount);
        const priceImpact = order.priceImpactPct != null ? parseFloat(order.priceImpactPct) : 0;
        const feeBps = order.feeBps != null ? order.feeBps : 0;
        setPreviewData({ inputAmount: inAmt, outputAmount: outAmt, priceImpactPct: priceImpact, minimumOutAmount: minOut, feeBps });
        // update UI amounts and USD values
        const inTokens = inAmt / 10 ** fromToken.decimals;
        const outTokens = outAmt / 10 ** toToken.decimals;
        setToAmount(outTokens.toFixed(toToken.decimals));
        // fetch USD price quotes
        const prices = await getPrices([fromToken.id, toToken.id], 'usd');
        const fromPrice = parseFloat(prices.data[fromToken.id].price);
        const toPrice = parseFloat(prices.data[toToken.id].price);
        setFromAmountUsd((inTokens * fromPrice).toFixed(2));
        setToAmountUsd((outTokens * toPrice).toFixed(2));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Order preview error:', msg);
        setPreviewError(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    }
    fetchPreview();
  }, [fromToken, toToken, fromAmount, slippage, activeWallet]);

  // Manual conversion disabled: preview fetch will update amounts and USD
  const calculateToAmount = (_amount: string) => {
    // No-op: preview fetch handles output amount and USD conversion
  };

  // Manual reverse conversion disabled: preview fetch handles amounts
  const calculateFromAmount = (_amount: string) => {
    // No-op
  };

  // Handle token selection
  const handleFromTokenSelect = (token: TokenOption) => {
    if (toToken && token.id === toToken.id) {
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromTokenList(false);
    if (fromAmount) {
      calculateToAmount(fromAmount);
    }
  };

  const handleToTokenSelect = (token: TokenOption) => {
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
    setFromAmountUsd('');
    // preview useEffect will update toAmount and toAmountUsd
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    setToAmountUsd('');
    // manual reverse conversion disabled
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (fromToken) {
      const bal = balances[fromToken.id]?.uiAmount ?? 0;
      setFromAmount(bal.toString());
      setFromAmountUsd('');
      // preview fetch will recalc USD and toAmount
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

  // Execute swap order using Jupiter Ultra API
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
      // Prepare order parameters
      const inputMint = fromToken.id;
      const outputMint = toToken.id;
      const amount = Math.floor(parseFloat(fromAmount) * 10 ** fromToken.decimals);
      const taker = activeWallet.publicKey;
      // Fetch swap order
      const order = await getOrder({ inputMint, outputMint, amount, taker });
      if (!order.transaction) {
        throw new Error('No transaction returned from order.');
      }
      // Deserialize and sign
      const txBuffer = Buffer.from(order.transaction, 'base64');
      const versionedTx = VersionedTransaction.deserialize(txBuffer);
      versionedTx.sign([useStore.getState().wallet]);
      const signedBase64 = Buffer.from(versionedTx.serialize()).toString('base64');
      // Execute order
      const exec = await executeOrder({ signedTransaction: signedBase64, requestId: order.requestId });
      if (exec.status === 'Success') {
        setSwapStatus({ show: true, status: 'success', hash: exec.signature });
      } else {
        throw new Error(exec.error || `Swap failed: ${exec.status}`);
      }
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
    ? (balances[fromToken.id]?.uiAmount ?? 0) >= parseFloat(fromAmount)
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
            balance={
              fromToken
                ? `Balance: ${balances[fromToken.id]?.uiAmount?.toFixed(fromToken.decimals) ?? '0'}`
                : undefined
            }
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
            balance={
              toToken
                ? `Balance: ${balances[toToken.id]?.uiAmount?.toFixed(toToken.decimals) ?? '0'}`
                : undefined
            }
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
            previewData
              ? `${(previewData.feeBps / 100).toFixed(2)}%`
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
                Insufficient {fromToken.symbol} balance. You need {(parseFloat(fromAmount) - (balances[fromToken.id]?.uiAmount ?? 0)).toFixed(fromToken.decimals)} more {fromToken.symbol}.
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
          tokens={uiTokens}
          onSelect={handleFromTokenSelect}
          onClose={() => setShowFromTokenList(false)}
        />
      )}
      
      {showToTokenList && (
        <TokenList
          tokens={uiTokens}
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
            previewData
              ? `${(previewData.feeBps / 100).toFixed(2)}%`
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