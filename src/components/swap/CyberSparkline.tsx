import React, { useMemo, useRef, useEffect } from 'react';
import { ChartBar } from '../../services/chartService';

// Define PricePoint interface locally
interface PricePoint {
  timestamp: number;
  price: number;
}

interface CyberSparklineProps {
  data: PricePoint[] | ChartBar[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  currentPrice?: number;
  showGradient?: boolean;
  showVolume?: boolean;
  chartType?: 'line' | 'candle';
}

export const CyberSparkline: React.FC<CyberSparklineProps> = ({
  data,
  width = 120,
  height = 40,
  isPositive = true,
  currentPrice,
  showGradient = true,
  showVolume = false,
  chartType = 'line',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  
  // Check if data is OHLCV or simple price points
  const isOHLCV = data.length > 0 && 'o' in data[0];
  
  // Convert data to consistent format
  const chartData = useMemo(() => {
    if (isOHLCV) {
      return (data as ChartBar[]).map(bar => ({
        timestamp: bar.t * 1000,
        price: bar.c,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
      }));
    } else {
      return (data as PricePoint[]).map(point => ({
        timestamp: point.timestamp,
        price: point.price,
      }));
    }
  }, [data, isOHLCV]);
  
  // Calculate SVG path for line chart
  const { path, volumeBars, priceStats } = useMemo(() => {
    if (chartData.length < 2) return { path: '', volumeBars: [], priceStats: null };
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    // Add padding
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = showVolume ? height * 0.7 - padding * 2 : height - padding * 2;
    const volumeHeight = height * 0.3;
    
    // Create path
    const points = chartData.map((point, index) => {
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    // Create volume bars if OHLCV data
    const volumeBars = isOHLCV && showVolume ? chartData.map((point, index) => {
      if (!point.volume) return null;
      const maxVolume = Math.max(...chartData.map(d => d.volume || 0));
      const x = padding + (index / (chartData.length - 1)) * chartWidth;
      const barWidth = Math.max(1, chartWidth / chartData.length - 1);
      const barHeight = (point.volume / maxVolume) * volumeHeight;
      const y = height - barHeight;
      
      return { x, y, width: barWidth, height: barHeight };
    }).filter(Boolean) : [];
    
    const priceStats = {
      high: maxPrice,
      low: minPrice,
      change: prices[prices.length - 1] - prices[0],
      changePercent: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
    };
    
    return { path: points.join(' '), volumeBars, priceStats };
  }, [chartData, width, height, showVolume, isOHLCV]);
  
  // Calculate percentage change
  const percentageChange = priceStats?.changePercent || 0;
  
  // Animate the chart with a cyber scan effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let scanPosition = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw scan line
      const gradient = ctx.createLinearGradient(scanPosition - 20, 0, scanPosition + 20, 0);
      gradient.addColorStop(0, 'rgba(0, 255, 160, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 160, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 160, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(scanPosition - 20, 0, 40, height);
      
      scanPosition += 2;
      if (scanPosition > width + 20) {
        scanPosition = -20;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height]);
  
  const strokeColor = percentageChange >= 0 ? '#00ffa0' : '#ff4757';
  const glowColor = percentageChange >= 0 ? 'rgba(0, 255, 160, 0.6)' : 'rgba(255, 71, 87, 0.6)';
  
  return (
    <div className="relative inline-block">
      {/* Canvas for scan effect */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* SVG Chart */}
      <svg width={width} height={height} className="relative">
        {showGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
            <filter id="cyber-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        )}
        
        {/* Volume bars */}
        {volumeBars.map((bar, index) => bar && (
          <rect
            key={index}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={strokeColor}
            opacity="0.2"
          />
        ))}
        
        {/* Area under the line */}
        {path && showGradient && (
          <path
            d={`${path} L ${width - 2} ${showVolume ? height * 0.7 - 2 : height - 2} L 2 ${showVolume ? height * 0.7 - 2 : height - 2} Z`}
            fill={`url(#${gradientId})`}
            opacity="0.6"
          />
        )}
        
        {/* Main line */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            filter="url(#cyber-glow)"
            style={{
              filter: `drop-shadow(0 0 4px ${glowColor})`,
            }}
          />
        )}
        
        {/* Current price dot */}
        {path && chartData.length > 0 && (
          <circle
            cx={width - 2}
            cy={2 + (showVolume ? height * 0.7 : height) - 4 - 
                ((chartData[chartData.length - 1].price - (priceStats?.low || 0)) / 
                ((priceStats?.high || 1) - (priceStats?.low || 0))) * 
                ((showVolume ? height * 0.7 : height) - 4)}
            r="3"
            fill={strokeColor}
            className="animate-pulse"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        )}
      </svg>
      
      {/* Percentage indicator */}
      {chartData.length > 1 && (
        <div
          className={`absolute -top-2 -right-2 text-xs font-terminal px-1 rounded ${
            percentageChange >= 0 ? 'text-cyber-green' : 'text-red-400'
          }`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            fontSize: '9px',
            textShadow: `0 0 4px ${percentageChange >= 0 ? glowColor : 'rgba(255, 71, 87, 0.6)'}`,
          }}
        >
          {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
        </div>
      )}
    </div>
  );
}; 