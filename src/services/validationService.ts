import { getAsset } from './heliusService';
import { storage } from '../utils/storage';

type Token = {
  id: string;
  symbol: string;
  name: string;
  mintedAt: string | null;
  createdAt: string;
  dailyVolume: number;
  tags: string[];
}

const MIN_AGE_HOURS = 24;
const MIN_DAILY_VOLUME = 5000;
const MIN_MARKET_CAP = 50000;
const MIN_HOLDERS = 100;
const ALLOWED_TAGS = ['verified', 'strict', 'community'];

async function validateToken<T extends Token>(token: T, tokens: T[], whitelist: string[], blacklist: string[]) {
  if (whitelist.includes(token.id)) return true;
  if (blacklist.includes(token.id)) return false;

  // 1. Duplicate check
  const duplicates = tokens.filter(t => t.name === token.name && t.symbol === token.symbol);
  if (duplicates.length < 2) return true;

  const original = duplicates.sort((a, b) => new Date(`${a.mintedAt}`).getTime() - new Date(`${b.mintedAt}`).getTime())[0];
  if (original.id === token.id) return true;

  // 2. Tag check
  if (!token.tags.every(tag => ALLOWED_TAGS.includes(tag))) return false;

  // 3. Age check
  const now = Date.now();
  const minAgeMs = MIN_AGE_HOURS * 60 * 60 * 1000;
  const mintedAt = token.mintedAt || token.createdAt;
  if (!(new Date(mintedAt).getTime() >= now - minAgeMs)) return false;

  // 4. 24h volume
  if (token.dailyVolume < MIN_DAILY_VOLUME) return false;

  const asset = await getAsset(token.id);
  if (!asset) return true;

  // 5. Market cap
  if (asset.marketCap < MIN_MARKET_CAP) return false;

  // 6. Holders
  if (asset.holders < MIN_HOLDERS) return false;

  return true;
}

export async function getValidatedTokens<T extends Token>(
  tokens: T[],
): Promise<T[]> {
  const [{ whitelist }, { blacklist }] = await Promise.all([
    storage.get('whitelist'),
    storage.get('blacklist'),
  ]);

  const validatedTokens = await Promise.all(
    tokens.map(token => validateToken(token, tokens, whitelist ?? [], blacklist ?? []))
  );

  return tokens.filter((_, index) => validatedTokens[index]);
}
