import { getTokenInfo } from './jupiterService';
import { getTokensData } from './heliusService';
import { storage } from '../utils/storage';

import type { CreatedCoin } from '../types';

const ALLOWED_TAGS = ['verified', 'strict', 'community'];

export async function filterCreatedCoins<C extends CreatedCoin>(
  coins: C[],
  {
    minVolume = 5000,
    minMarketCap = 50000,
    minHolders = 100,
    minLiquidity = 10000,
    minAgeHours = 24,
  }: {
    minVolume?: number;
    minMarketCap?: number;
    minHolders?: number;
    minLiquidity?: number;
    minAgeHours?: number;
  } = {}
): Promise<C[]> {
  const now = Date.now();
  const minAgeMs = minAgeHours * 60 * 60 * 1000;

  const [{ whitelist }, { blacklist }] = await Promise.all([
    storage.get('whitelist'),
    storage.get('blacklist'),
  ]);
  const whitelistSet = new Set(Array.isArray(whitelist) ? whitelist : []);
  const blacklistSet = new Set(Array.isArray(blacklist) ? blacklist : []);

  const mintAddresses = coins.map(coin => coin.address);

  const tokenInfoPromises = await Promise.allSettled(coins.map(coin => getTokenInfo(coin.address)));
  const tokensData = await getTokensData(mintAddresses);

  const filtered: C[] = [];
  for (const coin of coins) {
    const address = coin.address;
    const token = tokensData.find(t => t.address === address);

    if (blacklistSet.has(address)) continue;
    if (whitelistSet.has(address)) {
      filtered.push(coin);
      continue;
    }

    const info = tokenInfoPromises.filter(p => p.status === "fulfilled").find(t => t.value.address === address);

    if (!info?.value) {
      filtered.push(coin);
      continue;
    };

    // 1. Tag check
    if (!info.value.tags.every(tag => ALLOWED_TAGS.includes(tag))) continue;
    // 2. Age check
    const mintedAt = info.value.minted_at || info.value.created_at;
    if (!(new Date(mintedAt).getTime() >= now - minAgeMs)) continue;
    // 3. 24h volume
    if (info.value.daily_volume < minVolume) continue;

    if (!token) {
      filtered.push(coin);
      continue;
    }

    // 4. Market cap
    const marketCap = token?.marketCap || 0;
    if (marketCap < minMarketCap) continue;
    // 5. Holders
    const holders = token?.holders || 0;
    if (holders < minHolders) continue;
    // 6. Liquidity
    // const liquidity = info.extensions?.liquidity;
    // if (liquidity < minLiquidity) continue;
    filtered.push(coin);
  }

  return filtered;
}
