import { PublicKey, Transaction, Commitment } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { createConnection, web3Connection } from '../utils/connection';
import { useStore } from '../store';

// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v4/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v4/swap';

/**
 * Response type for a single route/quote from Jupiter
 */
export interface QuoteRoute {
  inAmount: string | number;
  outAmount: string | number;
  priceImpactPct: number;
  otherAmountThresholds?: {
    outAmount: string | number;
  };
  marketInfos?: Array<{
    lpFee: number;
    platformFee: number;
  }>;
  // full route object may contain additional fields
  [key: string]: any;
}

/**
 * Full quote response from Jupiter API
 */
export interface QuoteResponse {
  data: QuoteRoute[];
  // may include other metadata
  [key: string]: any;
}

/**
 * Simplified preview data for UI
 */
export interface PreviewData {
  inputAmount: number;
  outputAmount: number;
  priceImpactPct: number;
  minimumOutAmount: number;
  feeAmount?: number;
}

/**
 * Fetches a price quote for swapping tokens via Jupiter
 */
export async function getQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
}): Promise<QuoteResponse> {
  const { inputMint, outputMint, amount, slippageBps } = params;
  const url = `${JUPITER_QUOTE_API}`
    + `?inputMint=${encodeURIComponent(inputMint)}`
    + `&outputMint=${encodeURIComponent(outputMint)}`
    + `&amount=${amount}`
    + `&slippageBps=${slippageBps}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`getQuote network error: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new Error(`getQuote HTTP ${res.status}: ${res.statusText}`);
  }
  const json = await res.json() as QuoteResponse;
  if (!json.data || json.data.length === 0) {
    throw new Error('getQuote: no routes found');
  }
  return json;
}

/**
 * Gets SPL token balance for the active wallet
 */
export async function getBalance(mintAddress: string): Promise<number> {
  const { activeWallet } = useStore.getState();
  if (!activeWallet) {
    throw new Error('getBalance: wallet not initialized');
  }
  const rpc = createConnection();
  try {
    return await rpc.getTokenBalance(mintAddress, activeWallet.publicKey);
  } catch (err) {
    throw new Error(`getBalance error: ${(err as Error).message}`);
  }
}

/**
 * Builds a Transaction object for a swap using Jupiter swap API
 */
export async function buildSwapTransaction(
  quote: QuoteResponse,
  userPublicKey: PublicKey
): Promise<Transaction> {
  // use the first route
  const route = quote.data[0];
  const body = {
    route,
    userPublicKey: userPublicKey.toBase58(),
  };
  let res: Response;
  try {
    res = await fetch(JUPITER_SWAP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`buildSwapTransaction network error: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new Error(`buildSwapTransaction HTTP ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  // swapTransaction may be under json.data.swapTransaction or json.swapTransaction
  const txBase64 = json.data?.swapTransaction || json.swapTransaction;
  if (!txBase64) {
    throw new Error('buildSwapTransaction: no swapTransaction in response');
  }
  try {
    const buf = Buffer.from(txBase64, 'base64');
    return Transaction.from(buf);
  } catch (err) {
    throw new Error(`buildSwapTransaction decode error: ${(err as Error).message}`);
  }
}

/**
 * Extracts simple preview data from a quote
 */
export function previewSwap(quote: QuoteResponse): PreviewData {
  const route = quote.data[0];
  // parse raw amounts
  const inRaw = typeof route.inAmount === 'string' ? parseFloat(route.inAmount) : route.inAmount;
  const outRaw = typeof route.outAmount === 'string' ? parseFloat(route.outAmount) : route.outAmount;
  // price impact in percent
  const priceImpactPct = (route.priceImpactPct ?? 0) * 100;
  // minimum out based on slippage
  let minOut = outRaw;
  if (route.otherAmountThresholds && route.otherAmountThresholds.outAmount != null) {
    const t = route.otherAmountThresholds.outAmount;
    minOut = typeof t === 'string' ? parseFloat(t) : t;
  }
  // sum fees if available
  let feeAmount: number | undefined;
  if (route.marketInfos) {
    feeAmount = route.marketInfos.reduce(
      (sum, m) => sum + (m.lpFee || 0) + (m.platformFee || 0),
      0
    );
  }
  return {
    inputAmount: inRaw,
    outputAmount: outRaw,
    priceImpactPct,
    minimumOutAmount: minOut,
    feeAmount,
  };
}

/**
 * Signs and sends a swap transaction, returns the signature
 */
export async function executeSwap(transaction: Transaction): Promise<string> {
  const { wallet } = useStore.getState();
  if (!wallet) {
    throw new Error('executeSwap: wallet not initialized');
  }
  try {
    // sign with keypair
    transaction.sign(wallet);
    const raw = transaction.serialize();
    return await web3Connection.sendRawTransaction(raw);
  } catch (err) {
    throw new Error(`executeSwap error: ${(err as Error).message}`);
  }
}

/**
 * Confirms a transaction until finalized or specified commitment
 */
export async function confirmTransaction(
  signature: string,
  commitment: Commitment = 'finalized'
): Promise<any> {
  try {
    return await web3Connection.confirmTransaction(signature, commitment);
  } catch (err) {
    throw new Error(`confirmTransaction error: ${(err as Error).message}`);
  }
}