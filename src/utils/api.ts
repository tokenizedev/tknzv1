// API client for PumpPortal and Meteora integrations
export interface PumpPortalResponse {
  transaction: string;
  estFee: number;
  metadataUri: string;
  [key: string]: any;
}

export interface MeteoraResponse {
  transaction: string;
  pool: string;
  positionNft: string;
  config: string;
  decimals: { A: number; B: number };
  rawAmounts: { A: string; B: string };
  initialLiquidity: string;
  estimatedNetworkFee: number;
  antiSnipeVault?: string;
  [key: string]: any;
}

/**
 * Create a new token via PumpPortal API
 */
export async function createPumpToken(payload: any): Promise<PumpPortalResponse> {
  const response = await fetch('/api/create-token-pumpportal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create PumpPortal token: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data as PumpPortalResponse;
}

/**
 * Create a new pool via Meteora API
 */
export async function createMeteoraPool(payload: any): Promise<MeteoraResponse> {
  const response = await fetch('/api/create-pool-meteora', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create Meteora pool: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data as MeteoraResponse;
}