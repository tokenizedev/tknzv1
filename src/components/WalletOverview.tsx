import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { getUltraBalances, getTokenInfo, getPrices, getBalance, BalanceInfo } from '../services/jupiterService';
import { Send, Repeat, ArrowLeft, Copy, Check } from 'lucide-react';

// Native SOL mint address for token metadata and pricing
const NATIVE_MINT = 'So11111111111111111111111111111111111111112';

/**
 * WalletOverview component shows total balance, change, chart, and list of tokens.
 */
export const WalletOverview: React.FC<{
  onBack: () => void;
  onSwapToken?: (mint: string) => void;
  onSendToken?: (mint: string) => void;
}> = ({ onBack, onSwapToken, onSendToken }) => {
  const { activeWallet, totalPortfolioUsdValue, refreshPortfolioData, createdCoins } = useStore();
  const [tokens, setTokens] = useState<Array<{
    mint: string;
    amount: number;
    symbol: string;
    name: string;
    decimals: number;
    priceUsd?: number;
    usdValue?: number;
    pendingOnJupiter?: boolean;
  }>>([]);
  if (!activeWallet) return null;
  const publicKey = activeWallet.publicKey;

  // State for loading tokens and refresh control
  const [isLoading, setIsLoading] = useState(false);
  const loadTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch raw balances (may include key 'SOL' for native)
      const rawBalances: Record<string, BalanceInfo> = await getUltraBalances(publicKey);
      // Normalize keys: map 'SOL' to NATIVE_MINT
      const balances: Record<string, BalanceInfo> = {};
      for (const [mint, info] of Object.entries(rawBalances)) {
        const key = mint === 'SOL' ? NATIVE_MINT : mint;
        balances[key] = info;
      }
      // Filter out zero balances
      const entries = Object.entries(balances).filter(([, info]) => info.uiAmount > 0);
      // Get list of mints for pricing
      const mints = entries.map(([mint]) => mint);
      // Fetch prices (best-effort)
      let priceMap: Record<string, { price: string }> = {};
      try {
        const priceResp = await getPrices(mints);
        priceMap = priceResp.data;
      } catch (err) {
        console.error('Failed to fetch prices:', err);
      }
      // Build token list, skipping metadata fetch failures
      const tokenList = (
        await Promise.all(entries.map(async ([mint, info]) => {
          try {
            const meta = await getTokenInfo(mint);
            const detail = priceMap[mint];
            const price = detail ? parseFloat(detail.price) : undefined;
            const usdValue = price !== undefined ? price * info.uiAmount : undefined;
            return {
              mint,
              amount: info.uiAmount,
              symbol: meta.symbol,
              name: meta.name,
              decimals: meta.decimals,
              priceUsd: price,
              usdValue,
            };
          } catch (err) {
            console.error(`Skipping token ${mint}, metadata failed:`, err);
            return null;
          }
        }))
      ).filter((x): x is NonNullable<typeof x> => x !== null);
      // Append locally created tokens not yet listed on Jupiter
      const combined = [...tokenList];
      const jupiterMints = tokenList.map(t => t.mint);
      for (const coin of createdCoins) {
        if (!jupiterMints.includes(coin.address)) {
          let amount = 0;
          try {
            amount = await getBalance(coin.address);
          } catch (err) {
            console.error(`Failed to fetch balance for local token ${coin.address}:`, err);
          }
          combined.push({
            mint: coin.address,
            amount,
            symbol: coin.ticker,
            name: coin.name,
            decimals: 0,
            priceUsd: coin.usdPrice,
            usdValue: coin.usdValue,
            pendingOnJupiter: true,
          });
        }
      }
      setTokens(combined);
    } catch (error) {
      console.error('Failed to load wallet tokens:', error);
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, createdCoins]);
  // Load tokens on mount or when publicKey changes
  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // Copy wallet address functionality
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error('Copy failed:', err));
  };
  // Use total USD value from the global store
  const formattedTotal = totalPortfolioUsdValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6 p-4">
      {/* Header: Wallet Address and Refresh */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1 hover:bg-cyber-green/10 rounded-full"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-cyber-green/80 hover:text-cyber-green" />
        </button>
        <div className="text-center flex-grow">
          <h2 className="text-lg font-medium text-cyber-green font-terminal">Portfolio</h2>
        </div>
        <button
          onClick={() => { loadTokens(); refreshPortfolioData(); }}
          className="p-1 hover:bg-cyber-green/10 rounded-full"
          title="Refresh"
        >
          <Repeat className={`w-5 h-5 text-cyber-green/80 hover:text-cyber-green ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-xs text-cyber-green/70 font-mono truncate">{publicKey}</p>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-cyber-green/10 rounded-full"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-cyber-green" />
          ) : (
            <Copy className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
          )}
        </button>
      </div>

      {/* Total Wallet Value (USD) */}
      <div className="text-center space-y-1">
        <div className="text-4xl font-bold text-cyber-green font-terminal">
          {formattedTotal}
        </div>
        {/* Placeholder for percentage change */}
        <div className="text-sm text-cyber-green/70 font-terminal">
          +0.00%
        </div>
      </div>

      {/* Chart Placeholder 
      <div className="w-full h-32 bg-cyber-dark/50 rounded-md flex items-center justify-center">
        <span className="text-sm text-cyber-green/50">Chart Placeholder</span>
      </div>
      */}

      {/* Tokens List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-cyber-green font-terminal">Tokens</h3>
        {tokens.length > 0 ? (
          tokens.map(token => (
            <div
              key={token.mint}
              className="flex justify-between items-center py-2 border-b border-cyber-green/20"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-cyber-green font-terminal">
                  {token.symbol}
                </span>
                <span className="text-xs text-cyber-green/70 font-mono truncate">
                  {token.name}
                </span>
              </div>
              <div className="flex flex-col items-end w-36 ml-auto mr-4">
                <span className="text-sm font-medium text-cyber-green font-terminal text-right w-full">
                  {token.amount >= 1000000 
                    ? token.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })
                    : token.amount >= 1000 
                      ? token.amount.toLocaleString('en-US', { maximumFractionDigits: 4 })
                      : token.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                </span>
                <span className="text-xs text-cyber-green/70 font-mono text-right w-full">
                  {token.usdValue !== undefined 
                    ? `$${token.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                    : 'N/A USD'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSendToken?.(token.mint)}
                  className="p-1 hover:bg-cyber-green/10 rounded-full"
                  title="Send Token"
                >
                  <Send className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                </button>
                <button
                  onClick={() => onSwapToken?.(token.mint)}
                  disabled={token.pendingOnJupiter}
                  className={`p-1 hover:bg-cyber-green/10 rounded-full ${token.pendingOnJupiter ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={token.pendingOnJupiter ? 'pending Jupiter trading support' : 'Swap Token'}
                >
                  <Repeat className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-cyber-green/70 font-terminal">
            No tokens in wallet.
          </div>
        )}
      </div>
    </div>
  );
};