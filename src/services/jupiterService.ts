import { PublicKey, Transaction, Commitment } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { createConnection, web3Connection } from '../utils/connection';
import { useStore } from '../store';
import axios from 'axios';
// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v4/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v4/swap';

/**
 * Jupiter Price API base URL
 */
// const PRICE_API_BASE = 'https://lite-api.jup.ag/price/v2';

/**
 * Jupiter Ultra Balances API base URL
 */
// const ULTRA_BALANCES_BASE = 'https://lite-api.jup.ag/ultra/v1/balances';

function createClient() {
  return axios.create({
    baseURL: 'https://lite-api.jup.ag/',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_JUPITER_API_KEY,
    },
  });
}

const client = createClient();
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

/**
 * Token info returned by Jupiter Token API
 */
export interface TokenInfoAPI {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  created_at: string;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  minted_at: string | null;
  extensions: Record<string, any>;
}

/**
 * Fetches all tradable token mint addresses
 */
export async function getTradableMints(): Promise<string[]> {
  try {
    const response = await client.get<string[]>(`tokens/v1/mints/tradable`);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`getTradableMints HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`getTradableMints network error: ${(err as Error).message}`);
  }
}

/**
 * Fetch token metadata for a given mint address
 */
export async function getTokenInfo(mintAddress: string): Promise<TokenInfoAPI> {
  try {
    const response = await client.get<TokenInfoAPI>(`tokens/v1/token/${encodeURIComponent(mintAddress)}`);
    const data = response.data;

    if (!data || typeof data.address !== 'string') {
      throw new Error('getTokenInfo: invalid token data');
    }
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`getTokenInfo HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`getTokenInfo network error: ${(err as Error).message}`);
  }
}

/**
 * Fetch tokens for a given tag (e.g. 'verified', 'lst')
 */
export async function getTaggedTokens(tag: string): Promise<TokenInfoAPI[]> {
  try {
    const response = await client.get<TokenInfoAPI[]>(`tokens/v1/tagged/${encodeURIComponent(tag)}`);

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`getTaggedTokens HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`getTaggedTokens network error: ${(err as Error).message}`);
  }
}

/**
 * Price detail for a single token
 */
export interface PriceDetail {
  id: string;
  type: string;
  price: string;
  extraInfo?: any;
}

/**
 * Response from Jupiter Price API
 */
export interface PriceResponse {
  data: Record<string, PriceDetail>;
  timeTaken: number;
}

/**
 * In-memory cache for price data to reduce API calls
 */
const _priceCache: Map<string, { timestamp: number; data: PriceResponse }> = new Map();
/** Cache time-to-live in milliseconds */
const PRICE_CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Fetches price data for given token IDs, with simple in-memory caching
 */
export async function getPrices(
  ids: string[],
  vsToken?: string,
  showExtraInfo: boolean = false
): Promise<PriceResponse> {
  // build cache key based on parameters
  const key = [ids.join(','), vsToken || '', showExtraInfo ? '1' : '0'].join('|');
  const cached = _priceCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < PRICE_CACHE_TTL) {
    return cached.data;
  }
  try {
    const response = await client.get<PriceResponse>('price/v2', {
      params: {
        ids: ids.join(','),
        ...(vsToken && !showExtraInfo ? { vsToken } : {}),
        ...(showExtraInfo ? { showExtraInfo: true } : {}),
      },
    });
    if (!response.data?.data) {
      throw new Error('getPrices: missing data field');
    }
    // cache the result
    _priceCache.set(key, { timestamp: Date.now(), data: response.data });
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`getPrices HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`getPrices network error: ${(err as Error).message}`);
  }
}

/**
 * Balance info for a token in user's wallet
 */
export interface BalanceInfo {
  amount: string;
  uiAmount: number;
  slot: number;
  isFrozen: boolean;
}

/**
 * Fetches all token balances for a wallet address
 */
export async function getUltraBalances(
  walletAddress: string
): Promise<Record<string, BalanceInfo>> {
  try {
    const response = await client.get<Record<string, BalanceInfo>>(
      `ultra/v1/balances/${encodeURIComponent(walletAddress)}`
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`getUltraBalances HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`getUltraBalances network error: ${(err as Error).message}`);
  }
}
/**
 * Order response from Jupiter Ultra API
 */
export interface OrderResponse {
  swapType: string;
  requestId: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  transaction: string | null;
  [key: string]: any;
}

/**
 * Execution response from Jupiter Ultra API
 */
export interface ExecuteResponse {
  status: 'Success' | 'Failed';
  signature: string;
  code: number;
  error?: string;
  [key: string]: any;
}

/**
 * Retrieves a swap order (transaction + requestId) from Jupiter Ultra API
 */
export async function getOrder(params: {
  inputMint: string;
  outputMint: string;
  amount: number;
  taker: string;
  referralAccount?: string;
  referralFee?: number;
}): Promise<OrderResponse> {
  try {


    // Inject affiliate (referral) account and fee if configured via environment
    const affiliateAccount = import.meta.env.VITE_AFFILIATE_WALLET;
    // Default affiliate fee in basis points (bps) if not specified via env
    const affiliateFeeBps = parseInt(import.meta.env.VITE_AFFILIATE_FEE_BPS ?? '50', 10);

    // Build request parameters, merging any passed params and affiliate settings
    const requestParams: Record<string, any> = { ...params };

    if (affiliateAccount) {
      requestParams.referralAccount = affiliateAccount
      requestParams.referralFee = affiliateFeeBps;
    }

    const response = await client.get<OrderResponse>('ultra/v1/order', {
      params: requestParams,
    });
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`getOrder HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`getOrder network error: ${(err as Error).message}`);
  }
}

/**
 * Executes a previously signed swap order via Jupiter Ultra API
 */
export async function executeOrder(params: {
  signedTransaction: string;
  requestId: string;
}): Promise<ExecuteResponse> {
  try {
    const response = await client.post<ExecuteResponse>('ultra/v1/execute', params);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(`executeOrder HTTP ${err.response.status}: ${err.response.statusText}`);
    }
    throw new Error(`executeOrder network error: ${(err as Error).message}`);
  }
}

/**
 * Search for a token asset by symbol or query string.
 * Fetches multiple results and selects the asset with the highest organicScore (tie-breaker: usdPrice).
 */
export async function searchToken(query: string) {
  try {
    // Fetch multiple matching assets to choose the best one
    const limit = 50;
    const url = `https://datapi.jup.ag/v1/assets/search?query=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await axios.get<Array<{ id: string; organicScore: number; usdPrice: number }>>(url);
    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
      return undefined;
    }
    // Select asset with highest organicScore; tie-breaker: highest usdPrice
    const best = data.reduce((prev, curr) => {
      const prevScore = prev.organicScore ?? 0;
      const currScore = curr.organicScore ?? 0;
      if (currScore > prevScore) {
        return curr;
      } else if (currScore === prevScore) {
        const prevPrice = prev.usdPrice ?? 0;
        const currPrice = curr.usdPrice ?? 0;
        return currPrice > prevPrice ? curr : prev;
      }
      return prev;
    });
    return best;
  } catch (err) {
    throw new Error(`assetsSearch network error: ${err instanceof Error ? err.message : err}`);
  }
}
