import React, { useState, useEffect, useMemo } from 'react';
import { VersionedTransaction } from '@solana/web3.js';
import { useStore } from '../store';
import { web3Connection } from '../utils/connection';
import { logEventToFirestore } from '../firebase';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  getUltraBalances,
  getOrder,
  executeOrder,
  getPrices,
  getTokenInfo,
} from '../services/jupiterService';
import { storage } from '../utils/storage';
import type { TokenInfoAPI, BalanceInfo } from '../services/jupiterService';
import { loadAllTokens } from '../services/tokenService';
import { getValidatedTokens } from '../services/validationService';
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
// Native SOL mint address
const NATIVE_MINT = 'So11111111111111111111111111111111111111112';
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
  initialMint?: string | null;
  /**
   * Optional initial output mint; if provided, pre-selects the "to" token.
   */
  initialToMint?: string | null;
  onBack: () => void;
}


export const SwapPage: React.FC<SwapPageProps> = ({ initialMint, initialToMint, onBack }) => {
  // Wallet state
  const activeWallet = useStore(state => state.activeWallet);
  // Platform-wide created tokens
  const [platformCoins, setPlatformCoins] = useState<CreatedCoin[]>([]);
  // Token list fetched from Jupiter
  const [tokenList, setTokenList] = useState<TokenInfoAPI[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<typeof uiTokens>([]);
  // Initial selection and warning states
  const [initialMintHandled, setInitialMintHandled] = useState(false);
  const [initialToMintHandled, setInitialToMintHandled] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  // UI tokens array for TokenList component
  // Group tokens by symbol (ticker); if duplicates exist, select token with earliest creation date,
  // and if creation dates are equal, select token with higher daily_volume.
  const uniqueTokens = useMemo(() => {
    const symbolMap = new Map<string, TokenInfoAPI>();
    tokenList.forEach(t => {
      const key = t.symbol.toLowerCase();
      if (!symbolMap.has(key)) {
        symbolMap.set(key, t);
      } else {
        const existing = symbolMap.get(key)!;
        const existingDate = new Date(existing.created_at).getTime();
        const tDate = new Date(t.created_at).getTime();
        // select earliest creation date; if equal, select higher daily_volume
        if (tDate < existingDate || (tDate === existingDate && t.daily_volume > existing.daily_volume)) {
          symbolMap.set(key, t);
        }
      }
    });
    return Array.from(symbolMap.values());
  }, [tokenList]);

  const uiTokens = useMemo(() => {
    return uniqueTokens.map(t => ({
      id: t.address,
      symbol: t.symbol,
      name: t.name,
      logoURI: t.logoURI,
      decimals: t.decimals,
      mintedAt: t.minted_at,
      createdAt: t.created_at,
      dailyVolume: t.daily_volume,
      tags: t.tags
    }));
  }, [uniqueTokens]);


  // Fetch user balances via Jupiter Ultra API
  const [balances, setBalances] = useState<Record<string, BalanceInfo>>({});

  useEffect(() => {
    if (!activeWallet) return;
    getUltraBalances(activeWallet.publicKey)
      .then(setBalances)
      .catch(err => console.error('Balance load error:', err));
  }, [activeWallet]);
  // Load all platform-created tokens from the api

  // Load tokens (cached via RxDB) and merge with platform coins
  useEffect(() => {
    setLoadingTokens(true);
    loadAllTokens(platformCoins)
      .then(tokens => setTokenList(tokens))
      .catch(err => {
        setTokenError(err instanceof Error ? err.message : String(err))
        setLoadingTokens(false)
      })
  }, [platformCoins]);

  useEffect(() => {
    getValidatedTokens(uiTokens)
      .then(tokens => setFilteredTokens(tokens))
      .catch(err => setTokenError(err instanceof Error ? err.message : String(err)))
      .finally(() => {
        setLoadingTokens(false);
      });
  }, [uiTokens]);

  // Token states
  const [fromToken, setFromToken] = useState<TokenOption | null>(null);
  const [toToken, setToToken] = useState<TokenOption | null>(null);
  // Handle initial selection: allow contract-based tokens if not blocklisted
  // Handle initial selection: wait for tokenList, then allow address or symbol unless blocklisted
  useEffect(() => {
    if (tokenList.length === 0) return;
    // Input token override
    if (initialMint && !initialMintHandled) {
      console.log('[SwapPage] initialMint override start:', { initialMint, tokenListLength: tokenList.length });
      setInitialMintHandled(true);
      (async () => {
        const { blocklist = [] } = await storage.get('blocklist');
        console.log('[SwapPage] blocklist:', blocklist);
        if (blocklist.includes(initialMint)) {
          console.log('[SwapPage] initialMint is blocklisted:', initialMint);
          setWarningMessage('The selected token is blocked.');
          setTimeout(() => setWarningMessage(null), 5000);
          return;
        }
        // Try full token list by address or symbol
        let rawFrom = tokenList.find(tok => tok.address === initialMint);
        if (!rawFrom) {
          rawFrom = tokenList.find(tok => tok.symbol.toLowerCase() === initialMint.toLowerCase());
        }
        if (rawFrom) {
          console.log('[SwapPage] initialMint selected from tokenList:', rawFrom);
          setFromToken({ id: rawFrom.address, symbol: rawFrom.symbol, name: rawFrom.name, logoURI: rawFrom.logoURI, decimals: rawFrom.decimals });
          return;
        }
        // Fallback: fetch tokenInfo if address-like
        if (initialMint.length >= 32) {
          console.log('[SwapPage] initialMint not in tokenList, fetching via getTokenInfo:', initialMint);
          try {
            const data = await getTokenInfo(initialMint);
            console.log('[SwapPage] getTokenInfo success for initialMint:', data);
            setFromToken({ id: data.address, symbol: data.symbol, name: data.name, logoURI: data.logoURI, decimals: data.decimals });
          } catch (err) {
            console.error('[SwapPage] getTokenInfo failed for initialMint:', initialMint, err);
            setWarningMessage('The selected token is currently unsupported.');
            setTimeout(() => setWarningMessage(null), 5000);
          }
        }
      })();
    }
    // Output token override
    if (initialToMint && !initialToMintHandled) {
      console.log('[SwapPage] initialToMint override start:', { initialToMint, tokenListLength: tokenList.length });
      setInitialToMintHandled(true);
      (async () => {
        const { blocklist = [] } = await storage.get('blocklist');
        console.log('[SwapPage] blocklist:', blocklist);
        if (blocklist.includes(initialToMint)) {
          console.log('[SwapPage] initialToMint is blocklisted:', initialToMint);
          setWarningMessage('The selected token is blocked.');
          setTimeout(() => setWarningMessage(null), 5000);
          return;
        }
        let rawTo = tokenList.find(tok => tok.address === initialToMint);
        if (!rawTo) {
          rawTo = tokenList.find(tok => tok.symbol.toLowerCase() === initialToMint.toLowerCase());
        }
        if (rawTo) {
          console.log('[SwapPage] initialToMint selected from tokenList:', rawTo);
          setToToken({ id: rawTo.address, symbol: rawTo.symbol, name: rawTo.name, logoURI: rawTo.logoURI, decimals: rawTo.decimals });
          return;
        }
        if (initialToMint.length >= 32) {
          console.log('[SwapPage] initialToMint not in tokenList, fetching via getTokenInfo:', initialToMint);
          try {
            const data = await getTokenInfo(initialToMint);
            console.log('[SwapPage] getTokenInfo success for initialToMint:', data);
            setToToken({ id: data.address, symbol: data.symbol, name: data.name, logoURI: data.logoURI, decimals: data.decimals });
          } catch (err) {
            console.error('[SwapPage] getTokenInfo failed for initialToMint:', initialToMint, err);
            setWarningMessage('The selected token is currently unsupported.');
            setTimeout(() => setWarningMessage(null), 5000);
          }
        }
      })();
    }
  }, [initialMint, initialToMint, initialMintHandled, initialToMintHandled, tokenList]);

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
  /* Initial token selection is handled after validation to prevent unsupported tokens */
  // Jupiter order preview state, includes overall fee and platform (referral) fee in bps
  const [previewData, setPreviewData] = useState<{
    inputAmount: number;
    outputAmount: number;
    priceImpactPct: number;
    minimumOutAmount: number;
    feeBps: number;
    platformFeeBps: number;
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
        // platform (referral) fee breakdown (env fallback if missing)
        const envAffiliateFeeBps = parseInt(import.meta.env.VITE_AFFILIATE_FEE_BPS ?? '0', 10);
        const platformFeeBps = order.platformFee?.feeBps != null
          ? order.platformFee.feeBps
          : envAffiliateFeeBps;
        setPreviewData({
          inputAmount: inAmt,
          outputAmount: outAmt,
          priceImpactPct: priceImpact,
          minimumOutAmount: minOut,
          feeBps,
          platformFeeBps,
        });
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

  // Handle max button click, subtract platform & Jupiter fees and gas for SOL
  const handleMaxClick = async () => {
    if (!fromToken) return;
    // Get raw balance in token units
    let bal = getUiBalance(fromToken);
    // Subtract gas estimate for native SOL
    if (fromToken.id === NATIVE_MINT) {
      try {
        const latest = await web3Connection.getLatestBlockhash();
        const feeCalcRes = await web3Connection.getFeeCalculatorForBlockhash(latest.blockhash);
        const lamportsPerSig = feeCalcRes.value?.feeCalculator?.lamportsPerSignature ?? 0;
        const gasSol = lamportsPerSig / LAMPORTS_PER_SOL;
        bal = bal - gasSol;
      } catch (err) {
        console.error('Failed to estimate gas for swap max:', err);
      }
    }
    // Subtract total fee percentage (Jupiter fee + platform fee)
    const feeBps = previewData?.feeBps ?? 0;
    const platformFeeBps = previewData?.platformFeeBps
      ?? parseInt(import.meta.env.VITE_AFFILIATE_FEE_BPS ?? '0', 10);
    const totalFeePct = (feeBps + platformFeeBps) / 10000;
    const maxAmt = bal * (1 - totalFeePct);
    setFromAmount(maxAmt > 0 ? maxAmt.toString() : '0');
    setFromAmountUsd('');
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
        // Log token swap event to Firestore
        await logEventToFirestore('token_swapped', {
          walletAddress: activeWallet.publicKey,
          fromMint: inputMint,
          toMint: outputMint,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount),
          transactionHash: exec.signature
        });
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

  // Create random dot positions for the cyber background effect
  const createRandomDots = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      animationDelay: `${Math.random() * 5}s`,
    }));
  };

  const cyberDots = createRandomDots(50);

  // Custom CSS for animations that aren't in Tailwind config
  const customStyles = `
    @keyframes scanLineVertical {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    @keyframes scanLine {
      0% { background-position: 0 0; }
      100% { background-position: 0 100%; }
    }

    @keyframes glowPulse {
      0%, 100% { text-shadow: 0 0 8px rgba(0, 255, 65, 0.6); }
      50% { text-shadow: 0 0 15px rgba(0, 255, 65, 0.9), 0 0 25px rgba(0, 255, 65, 0.5); }
    }

    .animate-fadeIn {
      animation: fade-in 0.3s ease-out forwards;
    }
  `;

  return (
    <div className="flex flex-col items-center justify-start h-full p-4 relative">
      {warningMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-sm px-3 py-1 rounded z-20">
          {warningMessage}
        </div>
      )}
      {/* Custom animations */}
      <style>{customStyles}</style>

      {/* Animated background grid */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 160, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 160, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
        }}
      />

      {/* Random glowing dots */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {cyberDots.map(dot => (
          <div
            key={dot.id}
            className="absolute rounded-full bg-cyber-green animate-pulse-slow"
            style={{
              top: dot.top,
              left: dot.left,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: 0.6,
              boxShadow: '0 0 8px 2px rgba(0, 255, 160, 0.4)',
              animationDelay: dot.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Top horizontal scanning line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-cyber-green/30 z-0"
        style={{
          animation: 'scanLineVertical 15s infinite linear',
          boxShadow: '0 0 10px 1px rgba(0, 255, 160, 0.4)'
        }}
      />

      {/* Main swap container */}
      <div className="w-full max-w-md z-10 relative">
        <h2
          className="text-cyber-green font-terminal text-3xl mb-6 text-center font-bold tracking-wider"
          style={{
            textShadow: '0 0 10px rgba(0, 255, 160, 0.7)',
            animation: 'glowPulse 3s infinite ease-in-out'
          }}
        >
          Token Swap
        </h2>

        {/* Main swap interface container */}
        <div className="relative rounded-lg border border-cyber-green/40 p-5 backdrop-blur-sm bg-cyber-black/70 shadow-[0_0_15px_rgba(0,255,160,0.2)]">
          {/* Subtle corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green/70"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green/70"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-green/70"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-green/70"></div>

          {/* From token section */}
          <div
            className="bg-cyber-dark/70 rounded-md p-4 border border-cyber-green/30 mb-1 relative overflow-hidden transition-all duration-300 hover:border-cyber-green/60 hover:shadow-[0_0_10px_rgba(0,255,160,0.15)]"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
            }}
          >
            {/* Bottom highlight line animation */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyber-green/40"
              style={{
                boxShadow: '0 0 5px rgba(0, 255, 160, 0.5)'
              }}
            />

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
          <div
            className="bg-cyber-dark/70 rounded-md p-4 border border-cyber-green/30 mt-1 relative overflow-hidden transition-all duration-300 hover:border-cyber-green/60 hover:shadow-[0_0_10px_rgba(0,255,160,0.15)]"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%)',
            }}
          >
            {/* Bottom highlight line animation */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyber-green/40"
              style={{
                boxShadow: '0 0 5px rgba(0, 255, 160, 0.5)'
              }}
            />

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

          {/* Loading indicator when preview is loading */}
          {isPreviewLoading && (
            <div className="flex justify-center items-center py-2">
              <div className="w-5 h-5 rounded-full border-2 border-transparent border-t-cyber-green border-l-cyber-green animate-spin"></div>
              <span className="ml-2 text-xs text-cyber-green/70 font-terminal">CALCULATING</span>
            </div>
          )}

          {/* Swap details */}
          <div className="mt-4">
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
              platformFee={
                previewData
                  ? `${(previewData.platformFeeBps / 100).toFixed(2)}%`
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
          </div>

          {/* Insufficient balance warning */}
          {fromToken && fromAmount && !hasEnoughBalance && (
            <div
              className="bg-[#331500] border border-cyber-orange/50 rounded-md p-3 mt-3 text-sm text-cyber-orange/90 transition-all animate-fadeIn"
              style={{
                boxShadow: '0 0 10px rgba(255, 140, 0, 0.2) inset'
              }}
            >
              <div className="flex items-start">
                <FaInfoCircle className="mt-0.5 mr-2 flex-shrink-0 animate-pulse" />
                <span className="font-terminal">
                  Insufficient {fromToken.symbol} balance. You need {(parseFloat(fromAmount) - getUiBalance(fromToken)).toFixed(fromToken.decimals)} more {fromToken.symbol}.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Swap button */}
        <button
          className={`w-full mt-6 px-4 py-3.5 rounded-md font-terminal text-lg font-bold tracking-wider shadow-lg transition-all duration-300 relative overflow-hidden
                     ${isSwapValid && hasEnoughBalance
                        ? 'text-cyber-black bg-cyber-green hover:bg-cyber-green-dark active:translate-y-0.5 shadow-neon-green'
                        : 'bg-cyber-dark/80 text-cyber-green/50 cursor-not-allowed border border-cyber-green/10'}`}
          disabled={!isSwapValid || !hasEnoughBalance}
          onClick={() => setShowConfirmation(true)}
          style={{
            textShadow: isSwapValid && hasEnoughBalance ? 'none' : '0 0 5px rgba(0, 255, 160, 0.3)',
          }}
        >
          {/* Button scan line animation for active button */}
          {isSwapValid && hasEnoughBalance && (
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(transparent 0%, transparent 50%, rgba(0, 255, 160, 0.3) 50%, transparent 51%, transparent 100%)',
                backgroundSize: '100% 8px',
                animation: 'scanLine 5s linear infinite',
              }}
            />
          )}

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
          tokens={filteredTokens}
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
          platformFee={
            previewData
              ? `${(previewData.platformFeeBps / 100).toFixed(2)}%`
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