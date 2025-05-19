import { Helius } from 'helius-sdk';

const helius = new Helius(import.meta.env.VITE_HELIUS_API_KEY);

async function getTokenHolders(mintAddress: string) {
  try {
    const holders = await helius.rpc.getTokenHolders(mintAddress)

    return holders.length
  } catch (error) {
    return 0
  }
}

export async function getAsset(mintAddress: string) {
  const asset = await helius.rpc.getAsset({
    'id': mintAddress,
  }).catch(() => null)

  const holders = await getTokenHolders(mintAddress);

  return {
    ...asset,
    marketCap: asset?.token_info?.price_info?.total_price || 0,
    holders
  }
}