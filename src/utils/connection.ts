import { Connection } from '@solana/web3.js';
import { logEventToFirestore } from '../firebase';

/**
 * RPC endpoint for Solana network.
 */
const PROD_RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=8fb5b733-fd3e-41e0-8493-e1c994cf008a';
const DEVNET_RPC_ENDPOINT = 'https://devnet.helius-rpc.com/?api-key=5e4edb76-36ed-4740-942d-7843adcc1e22';
const RPC_ENDPOINT = (import.meta.env as any)?.VITE_ENV === 'prod' ? PROD_RPC_ENDPOINT : DEVNET_RPC_ENDPOINT;

/**
 * High-level Solana connection for sending and confirming transactions.
 */
export const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

/**
 * Lightweight RPC client for balance and token balance checks.
 */
export const createConnection = () => {
  /**
   * Fetch SOL balance for a given public key via RPC.
   */
  const getBalance = async (publicKey: string): Promise<number> => {
    const body = {
      jsonrpc: '2.0',
      id: 'bolt',
      method: 'getBalance',
      params: [publicKey, { commitment: 'confirmed' }]
    };
    try {
      const response = await window.fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }
      const balance = data.result?.value ?? 0;
      logEventToFirestore('balance_update', { walletAddress: publicKey, balance });
      return balance;
    } catch (error) {
      // Suppress error logs during testing
      if (!(import.meta as any).vitest) {
        console.error('Failed to fetch balance:', error);
      }
      throw error;
    }
  };

  /**
   * Fetch SPL token balance for a given token and owner via RPC.
   */
  const getTokenBalance = async (tokenAddress: string, ownerAddress: string): Promise<number> => {
    const body = {
      jsonrpc: '2.0',
      id: 'bolt',
      method: 'getTokenAccountsByOwner',
      params: [ownerAddress, { mint: tokenAddress }, { encoding: 'jsonParsed' }]
    };
    try {
      const response = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'RPC error');
      }
      const accounts = data.result?.value || [];
      if (accounts.length === 0) return 0;
      const balance = accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
      logEventToFirestore('token_balance_update', { walletAddress: ownerAddress, tokenAddress, balance });
      return balance;
    } catch (error) {
      // Suppress error logs during testing
      if (!(import.meta as any).vitest) {
        console.error('Failed to fetch token balance:', error);
      }
      return 0;
    }
  };

  return { getBalance, getTokenBalance };
};