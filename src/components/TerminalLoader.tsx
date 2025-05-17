import React, { useState, useEffect } from 'react';

export const TerminalLoader: React.FC<{ text: string; progress: number }> = ({ text, progress }) => {
  const [randomNumbers, setRandomNumbers] = useState<string>('');
  
  // Generate random binary/hex data for visual effect
  useEffect(() => {
    const generateRandomData = () => {
      const chars = "01";
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    };
    
    const interval = setInterval(() => {
      setRandomNumbers(generateRandomData());
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate how "loud" the visual effects should be based on progress
  const isActive = progress > 5;
  const isNearCompletion = progress > 90;
  
  // Map progress to color intensity
  const getGlowIntensity = () => {
    if (progress > 90) return '0 0 10px rgba(0, 255, 65, 0.6)';
    if (progress > 60) return '0 0 8px rgba(0, 255, 65, 0.4)';
    if (progress > 30) return '0 0 6px rgba(0, 255, 65, 0.3)';
    return '0 0 4px rgba(0, 255, 65, 0.2)';
  };
  
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between mb-1">
        <div className="font-terminal text-xs text-cyber-green flex items-center">
          <span className={`mr-1 ${isActive ? 'terminal-flicker' : ''}`}>{text}</span>
          <span className="terminal-cursor text-cyber-green/70">_</span>
        </div>
        <span className={`font-terminal text-xs ${isNearCompletion ? 'text-cyber-purple font-bold' : 'text-cyber-green'}`}>
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Enhanced progress bar with data flow effect */}
      <div 
        className="w-full bg-cyber-black border border-cyber-green/30 h-2 overflow-hidden relative"
        style={{ boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5)' }}
      >
        <div 
          className={`h-full transition-all duration-300 ${isActive ? 'data-flow-animation' : 'bg-cyber-green'}`}
          style={{ 
            width: `${progress}%`,
            boxShadow: getGlowIntensity()
          }}
        ></div>
        
        {/* Highlight edge of progress bar for emphasis */}
        {progress > 0 && (
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-cyber-green/80"
            style={{ 
              left: `${progress}%`, 
              boxShadow: '0 0 3px rgba(0, 255, 65, 0.6)',
              transform: 'translateX(-1px)'
            }}
          ></div>
        )}
      </div>
      
      {/* Enhanced terminal blocks with better visual feedback */}
      <div className="font-terminal text-xs text-cyber-green/70 flex justify-between items-center">
        <div className="flex-1">
          {Array.from({ length: 10 }).map((_, i) => {
            // Calculate if this block should be filled based on progress
            const isFilled = (i + 1) * 10 <= progress;
            const isPartial = !isFilled && i * 10 < progress && (i + 1) * 10 > progress;
            
            return (
              <span 
                key={i} 
                className={`inline-block ${isFilled ? 'text-cyber-green' : 'text-cyber-green/20'} ${
                  isFilled && i === Math.floor(progress / 10) - 1 ? 'terminal-flicker' : ''
                }`}
              >
                {isFilled ? '█' : isPartial ? '▓' : '░'}
              </span>
            );
          })}
        </div>
        
        {/* Random binary data to show "activity" */}
        {isActive && (
          <div className="text-[10px] text-cyber-green/40 font-mono ml-2">
            {randomNumbers}
          </div>
        )}
      </div>
    </div>
  );
};