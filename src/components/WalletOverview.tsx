import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getUltraBalances, getTokenInfo, getPrices, BalanceInfo } from '../services/jupiterService';
import { Send, Repeat } from 'lucide-react';

// Native SOL mint address for token metadata and pricing
const NATIVE_MINT = 'So11111111111111111111111111111111111111112';

/**
 * WalletOverview component shows total balance, change, chart, and list of tokens.
 */
export const WalletOverview: React.FC<{
  onSwapToken: (mint: string) => void;
  onSendToken: (mint: string) => void;
}> = ({ onSwapToken, onSendToken }) => {
  const { activeWallet, balance } = useStore();
  const [tokens, setTokens] = useState<{
    mint: string;
    amount: number;
    symbol: string;
    name: string;
    decimals: number;
    priceUsd?: number;
    usdValue?: number;
  }[]>([]);
  if (!activeWallet) return null;
  const publicKey = activeWallet.publicKey;

  // Load all SPL tokens in wallet
  useEffect(() => {
    const loadTokens = async () => {
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
      if (entries.length === 0) {
        setTokens([]);
        return;
      }
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
      setTokens(tokenList);
      } catch (error) {
        console.error('Failed to load wallet tokens:', error);
        setTokens([]);
      }
    };
    loadTokens();
  }, [publicKey]);

  return (
    <div className="space-y-6 p-4">
      {/* Header: Wallet Address */}
      <div className="text-center">
        <h2 className="text-lg font-medium text-cyber-green font-terminal">Wallet Overview</h2>
        <p className="text-xs text-cyber-green/70 font-mono truncate">{publicKey}</p>
      </div>

      {/* Total Balance and Change */}
      <div className="text-center space-y-1">
        <div className="text-4xl font-bold text-cyber-green font-terminal">
          {balance.toFixed(2)} SOL
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
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-cyber-green font-terminal">
                  {token.amount.toFixed(token.decimals)}
                </span>
                <span className="text-xs text-cyber-green/70 font-mono">
                  {token.usdValue !== undefined ? `$${token.usdValue.toFixed(2)}` : 'N/A USD'}
                </span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onSendToken(token.mint)}
                  className="p-1 hover:bg-cyber-green/10 rounded-full"
                  title="Send Token"
                >
                  <Send className="w-4 h-4 text-cyber-green/80 hover:text-cyber-green" />
                </button>
                <button
                  onClick={() => onSwapToken(token.mint)}
                  className="p-1 hover:bg-cyber-green/10 rounded-full"
                  title="Swap Token"
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