export interface ChartBar {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  t: number; // timestamp
}

export interface ChartData {
  bars: ChartBar[];
}

// Only include timeframes that are actually supported by Jupiter API
// Note: 5m and 15m use lowercase, 1H and 1W use uppercase
export type ChartTimeframe = '5m' | '15m' | '1H' | '1W';

const CHART_API_BASE = 'https://fe-api.jup.ag/api/v1/charts';

export class ChartService {
  private static instance: ChartService;
  
  private constructor() {}
  
  static getInstance(): ChartService {
    if (!ChartService.instance) {
      ChartService.instance = new ChartService();
    }
    return ChartService.instance;
  }
  
  async getChartData(
    tokenAddress: string,
    timeframe: ChartTimeframe = '15m',
    customTimeRange?: { from: number; to: number }
  ): Promise<ChartData> {
    try {
      // Calculate time range - default to last 24 hours
      const now = Math.floor(Date.now() / 1000);
      const timeRanges: Record<ChartTimeframe, number> = {
        '5m': 12 * 60 * 60,    // 12 hours
        '15m': 24 * 60 * 60,   // 24 hours
        '1H': 7 * 24 * 60 * 60, // 7 days
        '1W': 365 * 24 * 60 * 60, // 1 year
      };
      
      const timeFrom = customTimeRange?.from || (now - timeRanges[timeframe]);
      const timeTo = customTimeRange?.to || now;
      
      const url = `${CHART_API_BASE}/${tokenAddress}?type=${timeframe}&time_from=${timeFrom}&time_to=${timeTo}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Chart API error: ${response.status}`);
      }
      
      const data = await response.json() as ChartData;
      
      // Validate data
      if (!data.bars || !Array.isArray(data.bars)) {
        throw new Error('Invalid chart data format');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      // Return empty data on error
      return { bars: [] };
    }
  }
  
  // Convert OHLCV bars to simple price points for sparkline
  barsToSparklineData(bars: ChartBar[]): { timestamp: number; price: number }[] {
    return bars.map(bar => ({
      timestamp: bar.t * 1000, // Convert to milliseconds
      price: bar.c, // Use close price
    }));
  }
  
  // Format volume with appropriate suffix (K, M, B)
  formatVolume(volume: number): string {
    if (volume >= 1_000_000_000) {
      return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    } else if (volume >= 1_000_000) {
      return `$${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
      return `$${(volume / 1_000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  }
  
  // Calculate price statistics
  calculateStats(bars: ChartBar[]) {
    if (bars.length === 0) return null;
    
    const prices = bars.map(b => b.c);
    const volumes = bars.map(b => b.v);
    
    const firstBar = bars[0];
    const lastBar = bars[bars.length - 1];
    const priceChange = lastBar.c - firstBar.c;
    const priceChangePercent = (priceChange / firstBar.c) * 100;
    
    // Calculate how many bars represent 24 hours based on timeframe
    // For proper 24h stats calculation
    let bars24h: ChartBar[] = bars;
    
    // Get the timestamp 24 hours ago
    const now = lastBar.t * 1000; // Convert to milliseconds
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    // Filter bars from the last 24 hours
    bars24h = bars.filter(bar => (bar.t * 1000) >= twentyFourHoursAgo);
    
    // If we don't have any bars in the last 24h (e.g., for weekly timeframe), 
    // use the most recent bar's data
    if (bars24h.length === 0) {
      bars24h = [lastBar];
    }
    
    return {
      currentPrice: lastBar.c,
      priceChange,
      priceChangePercent,
      high24h: Math.max(...bars24h.map(b => b.h)),
      low24h: Math.min(...bars24h.map(b => b.l)),
      volume24h: bars24h.reduce((acc, b) => acc + b.v, 0),
      firstPrice: firstBar.c,
      lastPrice: lastBar.c,
    };
  }
}

export const chartService = ChartService.getInstance(); 