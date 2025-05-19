import { getTokenInfo } from './jupiterService';
import { getAsset } from './heliusService';
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

  const filtered: C[] = [];
  for (const coin of coins) {
    const address = coin.address;

    if (blacklistSet.has(address)) continue;
    if (whitelistSet.has(address)) {
      filtered.push(coin);
      continue;
    }

    const duplicates = coins.filter(c => c.name === coin.name && c.ticker === coin.ticker);

    if (duplicates.length < 2) {
      filtered.push(coin);
      continue;
    }

    const original = duplicates.sort((a, b) => new Date(`${a.createdAt}`).getTime() - new Date(`${b.createdAt}`).getTime())[0];
    if (original.address === address) {
      filtered.push(coin);
      continue;
    }

    const info = await getTokenInfo(address);
    if (!info) {
      filtered.push(coin);
      continue;
    };

    // 1. Tag check
    if (!info.tags.every(tag => ALLOWED_TAGS.includes(tag))) continue;
    // 2. Age check
    const mintedAt = info.minted_at || info.created_at;
    if (!(new Date(mintedAt).getTime() >= now - minAgeMs)) continue;
    // 3. 24h volume
    if (info.daily_volume < minVolume) continue;

    const token = await getAsset(address);

    if (!token) {
      filtered.push(coin);
      continue;
    }

    // 4. Market cap
    if (token.marketCap < minMarketCap) continue;
    // 5. Holders
    if (token.holders < minHolders) continue;
    // 6. Liquidity
    // const liquidity = info.extensions?.liquidity;
    // if (liquidity < minLiquidity) continue;
    filtered.push(coin);
  }

  return filtered;
}
