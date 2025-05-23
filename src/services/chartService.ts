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

export type ChartTimeframe = '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

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
        '1h': 7 * 24 * 60 * 60, // 7 days
        '4h': 30 * 24 * 60 * 60, // 30 days
        '1d': 90 * 24 * 60 * 60, // 90 days
        '1w': 365 * 24 * 60 * 60, // 1 year
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
  
  // Calculate price statistics
  calculateStats(bars: ChartBar[]) {
    if (bars.length === 0) return null;
    
    const prices = bars.map(b => b.c);
    const volumes = bars.map(b => b.v);
    
    const firstBar = bars[0];
    const lastBar = bars[bars.length - 1];
    const priceChange = lastBar.c - firstBar.c;
    const priceChangePercent = (priceChange / firstBar.c) * 100;
    
    return {
      currentPrice: lastBar.c,
      priceChange,
      priceChangePercent,
      high24h: Math.max(...bars.slice(-96).map(b => b.h)), // Last 96 15min bars = 24h
      low24h: Math.min(...bars.slice(-96).map(b => b.l)),
      volume24h: volumes.slice(-96).reduce((a, b) => a + b, 0),
      firstPrice: firstBar.c,
      lastPrice: lastBar.c,
    };
  }
}

export const chartService = ChartService.getInstance(); 