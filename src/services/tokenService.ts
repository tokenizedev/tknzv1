import type { CreatedCoin } from '../types';
import type { TokenInfoAPI } from './jupiterService';
import { getTokenDb } from './tokenDb';
import { getTaggedTokens, getTokenInfo } from './jupiterService';

const VERIFIED_META_KEY = 'verified-last-fetched';
const VERIFICATION_TTL = 30 * 60 * 1000; // 30 minutes

interface LeaderboardEntry {
  address: string;
  name: string;
  symbol?: string;
  logoURI?: string;
  launchTime?: string | number;
}

/**
 * Loads Jupiter-verified tokens, cached in IndexedDB via RxDB.
 * Fetches from network if cache is stale (>30min) or missing.
 */
export async function loadVerifiedTokens(): Promise<TokenInfoAPI[]> {
  console.log('[tokenService] loadVerifiedTokens starting');
  const db = await getTokenDb();
  console.log('[tokenService] got DB', db.name);
  const metaColl = db.meta;
  const tokenColl = db.verifiedTokens;
  // Determine whether to fetch fresh data
  const metaDoc = await metaColl.findOne(VERIFIED_META_KEY).exec();
  console.log('[tokenService] metaDoc:', metaDoc ? metaDoc.toJSON() : null);
  let fetchFromNetwork = true;
  if (metaDoc) {
    const last = new Date(metaDoc.value).getTime();
    if (Date.now() - last < VERIFICATION_TTL) {
      // TTL valid: check if cache has entries
      const cached = await tokenColl.find().exec();
      if (cached.length > 0) {
        fetchFromNetwork = false;
      }
    }
  }
  if (!fetchFromNetwork) {
    console.log('[tokenService] loading tokens from cache');
    const docs = await tokenColl.find().exec();
    console.log('[tokenService] cached docs count:', docs.length);
    return docs.map(doc => doc.toJSON() as unknown as TokenInfoAPI);
  }
  // Fetch from network
  console.log('[tokenService] fetching tokens from network');
  const tokens = await getTaggedTokens('verified');
  console.log('[tokenService] fetched tokens count:', tokens.length);
  // Clear old docs
  const oldDocs = await tokenColl.find().exec();
  await Promise.all(oldDocs.map(d => d.remove()));
  // Bulk insert new docs into collection
  // Use bulkInsert on the RxCollection (not storageInstance.bulkWrite)
  if (tokens.length > 0) {
    // Normalize tokens to schema-defined fields
    const normalized = tokens.map(t => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      ...(t.logoURI ? { logoURI: t.logoURI } : {}),
      decimals: t.decimals,
    }));
    console.log('[tokenService] inserting', normalized.length, 'normalized tokens into DB');
    try {
      const result = await tokenColl.bulkInsert(normalized);
      console.log('[tokenService] bulkInsert result counts:', result.success.length, 'successes,', result.error.length, 'errors');
      if (result.error.length > 0) {
        console.error('[tokenService] bulkInsert errors sample:', result.error.slice(0, 5));
      }
    } catch (err) {
      console.error('[tokenService] bulkInsert exception:', err);
    }
    // verify insertion via query
    const after = await tokenColl.find().exec();
    console.log('[tokenService] after insert docs count:', after.length);
  }
  // Update metadata
  const timestamp = new Date().toISOString();
  if (metaDoc) {
    // Update existing metadata document
    await metaDoc.incrementalPatch({ value: timestamp });
  } else {
    // Insert new metadata document
    await metaColl.insert({ key: VERIFIED_META_KEY, value: timestamp });
  }
  console.log(`[tokenService] Cached ${tokens.length} verified tokens`);
  return tokens;
}

/**
 * Loads full token list for UI, merging verified tokens, custom stub,
 * SOL, platform-created tokens, and leaderboard tokens.
 */
export async function loadAllTokens(
  platformCoins: CreatedCoin[]
): Promise<TokenInfoAPI[]> {
  const verified = await loadVerifiedTokens();
  // Custom TKNZ stub
  const customStub: TokenInfoAPI = {
    address: 'AfyDiEptGHEDgD69y56XjNSbTs23LaF1YHANVKnWpump',
    name: 'TKNZ.fun',
    symbol: 'TKNZ',
    decimals: 0,
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
  const customMeta = await getTokenInfo(customStub.address);
  const customToken: TokenInfoAPI = {
    ...customStub,
    decimals: 6,
    logoURI: customStub.logoURI || customMeta.logoURI,
    extensions: {},
  };
  // SOL token
  const solMint = 'So11111111111111111111111111111111111111112';
  const solToken = verified.find(t => t.address === solMint);
  // Exclude SOL and custom
  const remaining = verified.filter(
    t => t.address !== solMint && t.address !== customToken.address
  );
  // Platform-created tokens
  const created: TokenInfoAPI[] = await Promise.all(
    platformCoins.map(async c => {
      return {
        address: c.address,
        name: c.name,
        symbol: c.ticker,
        decimals: 6,
        logoURI: c.logoURI || '',
        tags: [],
        daily_volume: 0,
        created_at: new Date().toISOString(),
        freeze_authority: null,
        mint_authority: null,
        permanent_delegate: null,
        minted_at: null,
      };
    })
  );
  // Leaderboard tokens
  const lbRes = await fetch(
    'https://tknz.fun/.netlify/functions/leaderboard'
  );
  if (!lbRes.ok) {
    throw new Error(`Leaderboard fetch error: ${lbRes.status}`);
  }
  const lbJson = await lbRes.json();
  const lbTokens: LeaderboardEntry[] = lbJson.entries || [];
  const leaderboard: TokenInfoAPI[] = await Promise.all(
    lbTokens.map(async r => {
      return {
        address: r.address,
        name: r.name,
        symbol: (r.symbol || '').toString(),
        decimals: 6,
        logoURI: r.logoURI,
        tags: [],
        freeze_authority: null,
        mint_authority: null,
        permanent_delegate: null,
        minted_at: null,
      };
    })
  );
  // Remove custom/system token from leaderboard
  const SYSTEM_TOKEN = customStub.address;
  const cleanLb = leaderboard.filter(t => t.address !== SYSTEM_TOKEN);
  // Combine lists
  const all: TokenInfoAPI[] = [customToken];
  if (solToken) all.push(solToken);
  all.push(...created);
  all.push(...cleanLb);
  all.push(...remaining);
  return all;
}