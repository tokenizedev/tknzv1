import React, { useState, useEffect } from 'react';
import { VersionedTransaction } from '@solana/web3.js';
import { useStore } from '../store';
import {
  getTaggedTokens,
  getTokenInfo,
  TokenInfoAPI,
  getUltraBalances,
  BalanceInfo,
  getOrder,
  executeOrder,
  getPrices,
} from '../services/jupiterService';
import type { CreatedCoin } from '../types';
import { TokenSelector } from './swap/TokenSelector';
import { AmountInput } from './swap/AmountInput';
import { SwapDetails } from './swap/SwapDetails';
import { SwitchButton } from './swap/SwitchButton';
import { TokenList } from './swap/TokenList';
import { SwapConfirmation } from './swap/SwapConfirmation';
import { SwapStatus, SwapStatusType } from './swap/SwapStatus';
import { FaInfoCircle } from 'react-icons/fa';
const SYSTEM_TOKEN = 'AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump'
// Simplified token option for UI
interface TokenOption {
  id: string;
  symbol: string;
  name: string;
  logoURI?: string;
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
    logoURI: t.logoURI,
    decimals: t.decimals,
  }));
  console.log('uiTokens', uiTokens)
  
  // Fetch user balances via Jupiter Ultra API
  const [balances, setBalances] = useState<Record<string, BalanceInfo>>({});

  useEffect(() => {
    if (!activeWallet) return;
    getUltraBalances(activeWallet.publicKey)
      .then(setBalances)
      .catch(err => console.error('Balance load error:', err));
  }, [activeWallet]);
  // Load all platform-created tokens from the api
  
  // Fetch verified Jupiter tokens, merge with custom TKNZ, SOL, platform-created, and leaderboard tokens
  useEffect(() => {
    setLoadingTokens(true);
    (async () => {
      try {
        // Fetch verified tokens from Jupiter
        const tokens = await getTaggedTokens('verified');
        // Define custom TKNZ stub
        const customStub: TokenInfoAPI = {
          address: 'AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump',
          name: 'TKNZ.fun',
          symbol: 'TKNZ',
          decimals: 0, // placeholder
          logoURI: 'https://ipfs.io/ipfs/QmPjLEGEcvEDgGrxNPZdFy1RzfiWRyJYu6YaicM6oZGddQ',
          tags: [],
          daily_volume: 0,
          created_at: new Date('2025-04-30 17:07:42').toISOString(),
          freeze_authority: null,
          mint_authority: null,
          permanent_delegate: null,
          minted_at: null,
          extensions: {},
        };
        // Fetch real metadata for custom token
        const customMeta = await getTokenInfo(customStub.address);
        const customToken: TokenInfoAPI = {
          ...customStub,
          decimals: customMeta.decimals,
          logoURI: customStub.logoURI || customMeta.logoURI,
        };
        // Identify SOL token
        const solMint = 'So11111111111111111111111111111111111111112';
        const solToken = tokens.find(t => t.address === solMint);
        // Filter out duplicates
        const remaining = tokens.filter(
          t => t.address !== solMint && t.address !== customToken.address
        );
        // Map platform-created coins into token info objects with on-chain decimals
        const createdTokens: TokenInfoAPI[] = await Promise.all(
          platformCoins.map(async c => {
            const info = await getTokenInfo(c.address);
            return {
              address: c.address,
              name: c.name,
              symbol: c.ticker,
              decimals: info.decimals,
              logoURI: info.logoURI || '',
              tags: [],
              daily_volume: 0,
              created_at: c.createdAt
                ? new Date(c.createdAt).toISOString()
                : new Date().toISOString(),
              freeze_authority: info.freeze_authority,
              mint_authority: info.mint_authority,
              permanent_delegate: info.permanent_delegate,
              minted_at: info.minted_at,
              extensions: info.extensions,
            };
          })
        );
        // Build the final token list: custom, SOL, created, verified remaining
        const finalList: TokenInfoAPI[] = [customToken];
        if (solToken) finalList.push(solToken);
        finalList.push(...createdTokens);
        
        // Fetch leaderboard tokens
        const lbResponse = await fetch('https://tknz.fun/.netlify/functions/leaderboard');
        if (!lbResponse.ok) {
          throw new Error(`Leaderboard fetch error: ${lbResponse.status} ${lbResponse.statusText}`);
        }

        const lbData = await lbResponse.json()
        const { entries: lbTokens } = lbData
        
        // Map leaderboard tokens with on-chain decimals
        const leaderboardTokens: TokenInfoAPI[] = await Promise.all(
          lbTokens.map(async r => {
            const info = await getTokenInfo(r.address);
            return {
              address: r.address,
              name: r.name,
              symbol: (r.symbol || '').toString(),
              decimals: info.decimals,
              logoURI: r.logoURI || info.logoURI,
              tags: [],
              daily_volume: 0,
              created_at: r.launchTime
                ? new Date(r.launchTime).toISOString()
                : new Date().toISOString(),
              freeze_authority: info.freeze_authority,
              mint_authority: info.mint_authority,
              permanent_delegate: info.permanent_delegate,
              minted_at: info.minted_at,
              extensions: info.extensions,
            };
          })
        );

        if (leaderboardTokens.find(t => t.address === SYSTEM_TOKEN)) {
          leaderboardTokens.splice(leaderboardTokens.findIndex(t => t.address === SYSTEM_TOKEN), 1)
        }

        const allTokens = [...finalList, ...leaderboardTokens]
        allTokens.push(...remaining);
        setTokenList(allTokens);
      } catch (err) {
        console.log('error', err)
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

  // Manual forward conversion using previewData rate
  const calculateToAmount = (_amount: string) => {
    if (!fromToken || !toToken || !previewData || !_amount || parseFloat(_amount) <= 0) {
      setToAmount('');
      setToAmountUsd('');
      return;
    }
    const inTokens = parseFloat(_amount);
    // Compute rate from previewData: outputTokens per inputToken
    const rate =
      (previewData.outputAmount / Math.pow(10, toToken.decimals)) /
      (previewData.inputAmount / Math.pow(10, fromToken.decimals));
    const outTokens = inTokens * rate;
    setToAmount(outTokens.toFixed(toToken.decimals));
    // Update USD values
    getPrices([fromToken.id, toToken.id], 'usd')
      .then(prices => {
        const fromPrice = parseFloat(prices.data[fromToken.id].price);
        const toPrice = parseFloat(prices.data[toToken.id].price);
        setFromAmountUsd((inTokens * fromPrice).toFixed(2));
        setToAmountUsd((outTokens * toPrice).toFixed(2));
      })
      .catch(err => console.error('Price fetch error:', err));
  };

  // Manual reverse conversion using Jupiter order preview
  const calculateFromAmount = async (_amount: string) => {
    if (!fromToken || !toToken || !_amount || parseFloat(_amount) <= 0 || !activeWallet) {
      setFromAmount('');
      setFromAmountUsd('');
      return;
    }
    setIsPreviewLoading(true);
    try {
      // Convert the entered 'to' value to raw units
      const rawToAmount = Math.floor(parseFloat(_amount) * 10 ** toToken.decimals);
      // Fetch a reverse order quote
      const reverseOrder = await getOrder({
        inputMint: toToken.id,
        outputMint: fromToken.id,
        amount: rawToAmount,
        taker: activeWallet.publicKey,
      });
      // Parse raw 'from' output
      const fromRaw = parseInt(reverseOrder.outAmount);
      const fromTokens = fromRaw / 10 ** fromToken.decimals;
      setFromAmount(fromTokens.toFixed(fromToken.decimals));
      // Update USD values
      const prices = await getPrices([fromToken.id, toToken.id], 'usd');
      const fromPrice = parseFloat(prices.data[fromToken.id].price);
      const toPrice = parseFloat(prices.data[toToken.id].price);
      setFromAmountUsd((fromTokens * fromPrice).toFixed(2));
      const toTokens = parseFloat(_amount);
      setToAmountUsd((toTokens * toPrice).toFixed(2));
    } catch (err) {
      console.error('Reverse preview error:', err);
    } finally {
      setIsPreviewLoading(false);
    }
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
    calculateFromAmount(value);
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (fromToken) {
      const bal = getUiBalance(fromToken);
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

    /**
   * Helper to get UI balance for a token (handling native SOL as special case).
   */
    const getUiBalance = (token: TokenOption): number => {
      // Ultra API returns native SOL under key 'SOL'
      if (token.symbol === 'SOL') {
        return balances['SOL']?.uiAmount ?? 0;
      }
      return balances[token.id]?.uiAmount ?? 0;
    };

  // Check if user has enough balance (handles SOL specially)
  const hasEnoughBalance = fromToken && fromAmount
    ? (() => {
        const bal = getUiBalance(fromToken);
        return bal >= parseFloat(fromAmount);
      })()
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
            tokenLogo={fromToken?.logoURI}
            balance={
              fromToken
                ? `Balance: ${getUiBalance(fromToken).toFixed(fromToken.decimals)}`
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
            tokenLogo={toToken?.logoURI}
            balance={
              toToken
                ? `Balance: ${getUiBalance(toToken).toFixed(toToken.decimals)}`
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
                Insufficient {fromToken.symbol} balance. You need {(parseFloat(fromAmount) - getUiBalance(fromToken)).toFixed(fromToken.decimals)} more {fromToken.symbol}.
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
            logoURI: fromToken.logoURI,
            fiatValue: fromAmountUsd,
          }}
          toToken={{
            symbol: toToken.symbol,
            amount: toAmount,
            logoURI: toToken.logoURI,
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