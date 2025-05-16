import { Helius } from 'helius-sdk';

const helius = new Helius(import.meta.env.VITE_HELIUS_API_KEY);

async function getTokenHolders(mintAddresses: string[]) {
  return Promise.allSettled(mintAddresses.map(async (mintAddress) => {
    const holders = await helius.rpc.getTokenHolders(mintAddress)

    return {
      mintAddress,
      holders: holders.length
    }
  }))
}

export async function getTokensData(mintAddresses: string[]) {
  const assets = await helius.rpc.getAssetBatch({
    'ids': mintAddresses,
  }).catch(() => [])

  const results = await getTokenHolders(mintAddresses);
  const holders = results.filter(result => result.status === "fulfilled").map(result => result.value);

  return assets.map((asset) => ({
    address: asset.id,
    marketCap: asset.token_info?.price_info?.total_price || 0,
    holders: holders.find(({ mintAddress }) => mintAddress === asset.id)?.holders || 0
  }))
}