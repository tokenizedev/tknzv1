import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getUltraBalances, getTokenInfo, getPrices, BalanceInfo } from '../services/jupiterService';

/**
 * WalletOverview component shows total balance, change, chart, and list of tokens.
 */
export const WalletOverview: React.FC = () => {
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
        const balances: Record<string, BalanceInfo> = await getUltraBalances(publicKey);
        const entries = Object.entries(balances).filter(([, info]) => info.uiAmount > 0);
        if (entries.length === 0) {
          setTokens([]);
          return;
        }
        const mints = entries.map(([mint]) => mint);
        // Fetch metadata for all mints
        const metas = await Promise.all(mints.map(mint => getTokenInfo(mint)));
        // Fetch prices for all mints
        const priceResp = await getPrices(mints);
        const priceMap = priceResp.data;
        // Combine
        const list = mints.map((mint, i) => {
          const info = entries[i][1];
          const meta = metas[i];
          const priceDetail = priceMap[mint];
          const price = priceDetail ? parseFloat(priceDetail.price) : undefined;
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
        });
        setTokens(list);
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

      {/* Chart Placeholder */}
      <div className="w-full h-32 bg-cyber-dark/50 rounded-md flex items-center justify-center">
        <span className="text-sm text-cyber-green/50">Chart Placeholder</span>
      </div>

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
                  {token.amount.toFixed( token.decimals )}
                </span>
                <span className="text-xs text-cyber-green/70 font-mono">
                  {token.usdValue !== undefined
                    ? `$${token.usdValue.toFixed(2)}`
                    : 'N/A USD'}
                </span>
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